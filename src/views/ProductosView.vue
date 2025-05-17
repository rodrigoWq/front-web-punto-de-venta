<template>
  <!-- ≡ SIN CAMBIOS -->
  <AppNavbar />

  <div class="container mt-5" id="productos-view">

    <!-- 🔄 MODIFICADO – agrego botón “Nuevo” -->
    <AppHeader title="Gestión de Productos">
      <template #buttons>
        <!-- 🆕 abrir alta -->
        <button class="btn btn-primary" @click="openProductModal()">
          <i class="bi bi-plus-lg me-1"></i> Nuevo
        </button>
      </template>
    </AppHeader>

    <!-- ≡ SIN CAMBIOS (filtro de precio + búsqueda) -->
    <AppFilter
      v-model="searchTerm"
      placeholder="Buscar por nombre de producto"
      customClasses="mt-4 mb-4"
    >
      <button
        type="button"
        class="btn btn-success me-2"
        :class="{ active: priceFilter==='zero' }"
        @click="priceFilter='zero'"
      >Sin Precio</button>
      <button
        type="button"
        class="btn btn-success"
        :class="{ active: priceFilter==='nonzero' }"
        @click="priceFilter='nonzero'"
      >Con Precio</button>
      <select v-model="categoryFilter"  class="form-select float-start me-3" style="width:auto">
        <option value="all">Todas Categorías</option>
        <option v-for="cat in uniqueCategories" :key="cat" :value="cat">{{ cat }}</option>
      </select>
    </AppFilter>

    <!-- 🔄 MODIFICADO – cabeceras y columnas -->
    <AppTable :headers="['Nombre','Precio Actual','Categoría','Precio última compra','Acciones']">
      <tr
        v-for="product in pagedProducts"
        :key="product.producto_id"
      >
        <td>{{ product.nombre }}</td>
        <td>{{ String(product.precio_venta_actual).split('.')[0] }}</td>
        <td>{{ product.categoria_nombre }}</td>
        <td>{{ product.precio_venta_anterior ?? 'Sin precio' }}</td>

        <!-- 🆕 acciones ABM -->
        <td class="d-flex gap-1">
          <button
            class="btn btn-success btn-sm"
            @click="openPriceModal(product)"
          >$ Precio Venta</button>

          <button
            class="btn btn-warning btn-sm"
            @click="openProductModal(product)"
          >✏️ Editar</button>

          <button
            class="btn btn-danger btn-sm"
            @click="deleteProduct(product)"
          >🗑 Eliminar</button>
        </td>
      </tr>
    </AppTable>

    <!-- 🔄 MODIFICADO – paginador usa computed totalPages -->
    <AppPagination
      :currentPage="currentPage"
      :totalPages="totalPages"
      @page-changed="changePage"
    />


    <RegistrarProducto
      v-model:showModal="showProductModal"     
      :title="editingProduct ? 'Editar producto' : 'Registrar producto'"
      :initial-code="editingProduct?.codigo_barras ?? ''"
      :product="editingProduct"               
      @product-registered="handleProductSaved" 
    />


    <!-- =========== Modal de Precio (sin cambios relevantes) =========== -->
    <div class="modal fade" id="updatePriceModal" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Actualizar Precio</h5>
            <button type="button" class="btn-close" @click="closePriceModal"/>
          </div>
          <div class="modal-body">
            <form @submit.prevent="updatePrice">
              <div class="container-fluid">
                <div class="row mb-3">
                  <div class="col-md-6">
                    <label for="newPrice" class="form-label">Nuevo Precio</label>
                    <input
                      type="number"
                      id="newPrice"
                      class="form-control"
                      v-model.number="modalData.nuevoPrecio"
                      required
                    />
                  </div>
                  <div class="col-md-6">
                    <label for="vigencia" class="form-label">Fecha de Vigencia</label>
                    <input
                      type="date"
                      id="vigencia"
                      class="form-control"
                      v-model="modalData.fechaVigencia"
                      required
                    />
                  </div>
                </div>
                <div class="row">
                  <div class="col text-end">
                    <button type="submit" class="btn btn-success">
                      Guardar Cambios
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

  </div><!-- /container -->
</template>

<script>
// ≡ SIN CAMBIOS (import originales) + nuevos
import AppHeader      from '../components/AppHeader.vue';
import AppFilter      from '../components/AppFilter.vue';
import AppTable       from '../components/AppTable.vue';
import AppPagination  from '../components/AppPagination.vue';
import AppNavbar      from '../components/AppNavbar.vue';

import RegistrarProducto from '../components/RegistrarProductoModal.vue';          // 
import apiService        from '../services/apiService.js';                    // 
import * as bootstrap    from 'bootstrap';                                    // 

export default {
  name: 'ProductosView',                                                      // 
  components: {
    AppTable, AppPagination, AppHeader, AppFilter, AppNavbar,
    RegistrarProducto                                                         // 
  },

  data() {
    return {
      // ≡ SIN CAMBIOS
      products: [],
      currentPage: 1,
      itemsPerPage: 10,
      priceFilter: 'all',
      searchTerm: '',
      categoryFilter: 'all',
      showProductModal: false,
      editingProduct: null,
      productModalInstance: null,
      priceModalInstance: null,

      // ≡ (estructura de datos para precio)
      modalData: {
        productId:    null,
        nuevoPrecio:  0,
        fechaVigencia: this.formatDate(new Date())
      }
    };
  },

  computed: {
    // 🔄 MODIFICADO – filtrado sólo por precio + search
    filteredProducts() {
      let filtered = this.products;

      if (this.searchTerm?.trim()) {
        filtered = filtered.filter(p =>
          p.nombre?.toLowerCase().includes(this.searchTerm.toLowerCase())
        );
      }

      if (this.categoryFilter !== 'all') {
        filtered = filtered.filter(p =>
          p.categoria_nombre === this.categoryFilter
        );
      }

      if (this.priceFilter === 'zero') {
        filtered = filtered.filter(p =>
          !p.precio_venta_actual || Number(p.precio_venta_actual) === 0
        );
      } else if (this.priceFilter === 'nonzero') {
        filtered = filtered.filter(p =>
          p.precio_venta_actual && Number(p.precio_venta_actual) > 0
        );
      }
      return filtered;
    },

    // 🆕 paginación cliente
    pagedProducts() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      return this.filteredProducts.slice(start, start + this.itemsPerPage);
    },

    uniqueCategories() {
      return [...new Set(
        this.products.map(p => p.categoria_nombre).filter(Boolean)
      )].sort();
    },
    

    // 🔄 total páginas calcula sobre filteredProducts
    totalPages() {
      return Math.ceil(this.filteredProducts.length / this.itemsPerPage);
    }
  },

  methods: {
    /* ---------- Utilidades ---------- */
    // 🆕 Helper para construir urls
    api(path) { return `${process.env.VUE_APP_API_BASE_URL}${path}`; },

    /* ---------- CRUD Productos ---------- */
    fetchProducts() {                                                         
      apiService.get(this.api('/api/products'))
        .then(({ data }) => { this.products = data; })
        .catch(err   => { console.error('Error fetching products:', err); });
    },

    openProductModal(product = null) {                                        
      this.editingProduct = product;
      this.showProductModal = true;                                          
    },
    closeProductModal() {                                                     
      this.showProductModal = false;
    },

    handleProductSaved(saved) {                                               
      const idx = this.products.findIndex(p => p.producto_id === saved.producto_id);
      if (idx !== -1) this.products.splice(idx, 1, saved); // edición
      else            this.products.unshift(saved);         // alta
      this.closeProductModal();
      this.fetchProducts();
    },

    deleteProduct(product) {                                                  
      if (!confirm(`¿Eliminar “${product.nombre}”?`)) return;
      apiService.delete(this.api(`/api/products/${product.producto_id}`))
        .then(() => {
          this.products = this.products.filter(p => p.producto_id !== product.producto_id);
        })
        .catch(err => console.error('Error eliminando', err));
      //this.fetchProducts();
    },

    /* ---------- Precio ---------- */
    openPriceModal(product) {                                                 
      this.modalData.productId      = product.producto_id;
      this.modalData.nuevoPrecio    = product.precio_venta_actual ?? 0;
      this.modalData.fechaVigencia  = this.formatDate(new Date());

      const el = document.getElementById('updatePriceModal');
      this.priceModalInstance ??= new bootstrap.Modal(el);
      this.priceModalInstance.show();
    },
    closePriceModal() { this.priceModalInstance?.hide(); },                   

    updatePrice() {                                                           
        const { productId, nuevoPrecio, fechaVigencia } = this.modalData;
        apiService.post(
          this.api(`/api/sales/price/${productId}`),
          {
            precio_venta: nuevoPrecio,
            vigencia_desde: fechaVigencia
          }
        )
        .then(() => {
          const prod = this.products.find(p => p.producto_id === productId);
          if (prod) prod.precio_venta_actual = nuevoPrecio;
          this.closePriceModal();
        })
        .catch(err => console.error('Error updating price:', err));
    },

    /* ---------- Otros ---------- */
    changePage(page) { this.currentPage = page; },                            // ≡

    formatDate(date) {                                                        // ≡
      const d = new Date(date);
      const yyyy = d.getFullYear();
      const mm   = (`0${d.getMonth()+1}`).slice(-2);
      const dd   = (`0${d.getDate()}`).slice(-2);
      return `${yyyy}-${mm}-${dd}`;
    }
  },

  mounted() { this.fetchProducts(); }                                         // ≡
};
</script>


<style scoped>
.btn-success {
  background-color: #28a745;
  border-color: #28a745;
}

.header-buttons {
  display: flex;
  justify-content: flex-end;
}
</style>
