<template>
  <AppNavbar />
  <div class="container mt-5" id="productos-view">
    <AppHeader title="Precios de Productos">
      <template #buttons></template>
    </AppHeader>

    <AppFilter v-model="searchTerm" placeholder="Buscar por nombre de producto" customClasses="mt-4 mb-4">
      <button type="button" class="btn btn-success me-2" :class="{ active: priceFilter==='all' }" @click="priceFilter='all'">Todos</button>
      <button type="button" class="btn btn-success me-2" :class="{ active: priceFilter==='zero' }" @click="priceFilter='zero'">Sin Precio</button>
      <button type="button" class="btn btn-success" :class="{ active: priceFilter==='nonzero' }" @click="priceFilter='nonzero'">Con Precio</button>
    </AppFilter>

    <!-- Tabla de Productos -->
    <AppTable :headers="['Nombre','Precio','Categoría','Acciones']">
      <tr v-for="product in filteredProducts" :key="product.producto_id">
        <td>{{product.nombre}}</td><td>{{product.precio_venta||'Sin precio'}}</td><td>{{product.categoria_nombre}}</td><td><button class="btn btn-primary btn-sm" @click="openModal(product)">Actualizar Precio</button></td>
      </tr>
    </AppTable>

    <!-- Paginación -->
    <AppPagination :currentPage="currentPage" :totalPages="totalPages" @page-changed="changePage" />

    <!-- Modal de Actualización de Precio unificado -->
    <div class="modal fade" id="updatePriceModal" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header"><h5 class="modal-title">Actualizar Precio</h5><button type="button" class="btn-close" @click="closeModal"></button></div>
          <div class="modal-body">
            <form @submit.prevent="updatePrice">
              <div class="container-fluid"><div class="row mb-3"><div class="col-md-6"><label for="newPrice" class="form-label">Nuevo Precio</label><input type="number" id="newPrice" class="form-control" v-model.number="modalData.nuevoPrecio" required /></div><div class="col-md-6"><label for="vigencia" class="form-label">Fecha de Vigencia</label><input type="date" id="vigencia" class="form-control" v-model="modalData.fechaVigencia" required /></div></div><div class="row"><div class="col text-end"><button type="submit" class="btn btn-success">Guardar Cambios</button></div></div></div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
  
<script>
import AppHeader from '../components/AppHeader.vue';
import AppFilter from '../components/AppFilter.vue';
import AppTable from '../components/AppTable.vue';
import AppPagination from '../components/AppPagination.vue';
import apiService from '../services/apiService.js';
import * as bootstrap from 'bootstrap';
import AppNavbar from '../components/AppNavbar.vue';

export default {
  name: "ProductosView",
  components: { AppTable, AppPagination, AppHeader, AppFilter, AppNavbar },
  data() {
    return {
      products: [],
      currentPage: 1,
      itemsPerPage: 10,
      priceFilter: 'all', // Opciones: 'all', 'zero', 'nonzero'
      searchTerm: '', 
      modalData: {
        productId: null,
        nuevoPrecio: 0,
        fechaVigencia: this.formatDate(new Date())
      }
    };
  },
  computed: {
    filteredProducts() {
      let filtered = this.products;

      // Filtrado por término de búsqueda
      if (this.searchTerm && this.searchTerm.trim() !== '') {
        filtered = filtered.filter(product =>
          product.nombre.toLowerCase().includes(this.searchTerm.toLowerCase())
        );
      }

      if (this.priceFilter === 'zero') {
        filtered = filtered.filter(p => !p.precio_venta || Number(p.precio_venta) === 0);
      } else if (this.priceFilter === 'nonzero') {
        filtered = filtered.filter(p => p.precio_venta && Number(p.precio_venta) > 0);
      }
      return filtered.slice((this.currentPage - 1) * this.itemsPerPage, this.currentPage * this.itemsPerPage);
    },
    totalPages() {
      let filtered = this.products;

      if (this.searchTerm && this.searchTerm.trim() !== '') {
        filtered = filtered.filter(product =>
          product.nombre.toLowerCase().includes(this.searchTerm.toLowerCase())
        );
      }

      if (this.priceFilter === 'zero') {
        filtered  = this.products.filter(p => !p.precio || Number(p.precio) === 0).length;
      } else if (this.priceFilter === 'nonzero') {
        filtered  = this.products.filter(p => p.precio && Number(p.precio) > 0).length;
      }
      return Math.ceil(filtered.length / this.itemsPerPage);
    }
  },
  methods: {
    fetchProducts() {
      const url = `${process.env.VUE_APP_API_BASE_URL}/api/sales/price?limit=10&offset=0`;
      apiService.get(url)
        .then(response => { this.products = response.data; })
        .catch(error => { console.error("Error fetching products:", error); });
    },
    openModal(product) {
      this.modalData.productId = product.producto_id;
      this.modalData.nuevoPrecio = product.precio_venta || 0;
      this.modalData.fechaVigencia = this.formatDate(new Date());
      const modalEl = document.getElementById("updatePriceModal");
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
    },
    updatePrice() {
      const url = `${process.env.VUE_APP_API_BASE_URL}/api/products/updatePrice`;
      const data = {
        id: this.modalData.productId,
        precio: this.modalData.nuevoPrecio,
        fechaVigencia: this.modalData.fechaVigencia
      };
      apiService.post(url, data)
        .then(() => {
          const index = this.products.findIndex(p => p.producto_id === this.modalData.productId);
          if (index !== -1) {
            this.products[index].precio = this.modalData.nuevoPrecio;
          }
          const modalEl = document.getElementById("updatePriceModal");
          const modal = bootstrap.Modal.getInstance(modalEl);
          modal.hide();
        })
        .catch(error => { console.error("Error updating price:", error); });
    },
    changePage(page) {
      this.currentPage = page;
    },
    formatDate(date) {
      const d = new Date(date);
      let month = '' + (d.getMonth() + 1);
      let day = '' + d.getDate();
      const year = d.getFullYear();
      if (month.length < 2) month = '0' + month;
      if (day.length < 2) day = '0' + day;
      return [year, month, day].join('-');
    }
  },
  mounted() {
    this.fetchProducts();
  }
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
