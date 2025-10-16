<template>
  <div class="container-xl px-4">
    <!-- Título y botón «Nuevo» (oculto en modo selector) -->
    <div class="row" v-if="!hideHeader">
      <div class="col-12">
        <div class="d-flex justify-content-between align-items-center mb-4 mt-2">
          <h2 class="fw-bold mb-0">{{ selectorMode ? 'Seleccionar Producto' : 'Gestión Precios de Productos' }}</h2>
          <button v-if="!selectorMode" class="btn btn-dark d-flex align-items-center" @click="openProductModal()">
            <i class="bi bi-plus-lg me-2"></i> Nuevo Producto
          </button>
        </div>
      </div>
    </div>

    <!-- Búsqueda + filtros -->
    <div class="row g-3 mb-3">
      <div class="col-md-4">
        <input
          v-model="searchTerm"
          type="text"
          class="form-control"
          placeholder="Buscar por nombre de producto"
        />
      </div>

      <div class="col-md-2">
        <select v-model="categoryFilter" @change="onCategoryChange" class="form-select">
          <option value="all">All</option>
          <option v-for="cat in uniqueCategories" :key="cat" :value="cat">{{ cat }}</option>
        </select>
      </div>

      <div class="col-md-auto d-flex gap-2">
        <button
          class="btn"
          :class="priceFilter === 'zero' ? 'btn-success' : 'btn-outline-success'"
          @click="priceFilter = 'zero'"
        >
          Sin Precio
        </button>
        <button
          class="btn"
          :class="priceFilter === 'nonzero' ? 'btn-success' : 'btn-outline-success'"
          @click="priceFilter = 'nonzero'"
        >
          Con Precio
        </button>
      </div>

      <div class="col-md-auto">
        <button class="btn btn-outline-secondary" @click="
          priceFilter = 'all';
          categoryFilter = 'all';
          searchTerm = '';
        ">
          Reset
        </button>
      </div>
    </div>

    <!-- Tabla -->
    <div class="bg-white rounded shadow-sm p-3">
      <div class="table-responsive">
        <table class="table align-middle">
          <thead class="table-light">
            <tr>
              <th class="col-nombre">Nombre</th>
              <th class="text-end col-price">Precio Actual</th>
              <th class="col-categoria">Categoría</th>
              <th class="text-end col-price-compra">Precio última compra</th>
              <th v-if="!selectorMode" class="text-end col-actions">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="prod in pagedProducts"
              :key="prod.producto_id"
              :class="{ 'selectable-row': selectorMode }"
              @click="selectorMode && seleccionarProducto(prod)"
            >
              <td class="col-nombre">{{ prod.nombre }}</td>
              <td class="text-end col-price">{{ prod.precio_venta ? formateaNumero(prod.precio_venta) : 'Sin precio' }}</td>
              <td class="col-categoria">{{ prod.categoria }}</td>
              <td class="text-end col-price-compra">{{ prod.precio_ultima_compra ? formateaNumero(prod.precio_ultima_compra) : 'Sin precio' }}</td>
              <td v-if="!selectorMode" class="text-end col-actions">
                <div class="d-inline-flex flex-nowrap gap-1 actions-wrapper">
                  <button class="btn btn-success btn-sm" @click="openPriceModal(prod)">$ Precio Venta</button>
                  <button class="btn btn-warning btn-sm" @click="openProductModal(prod)"><i class="bi bi-pencil-fill"></i> Editar</button>
                  <button class="btn btn-danger btn-sm" @click="deleteProduct(prod)"><i class="bi bi-trash-fill"></i> Eliminar</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- paginación -->
      <AppPagination
        class="mt-3"
        :total-pages="totalPages"
        :current-page="currentPage"
        @page-changed="changePage"
      />
    </div>

    <RegistrarProducto
      v-model:showModal="showProductModal"     
      :title="editingProduct ? 'Editar producto' : 'Registrar producto'"
      :initial-code="editingProduct?.codigo_barras ?? ''"
      :product="editingProduct"               
      @product-registered="handleProductSaved" 
    />

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
  </div>
</template>


<script>
import AppPagination  from '../../components/AppPagination.vue'; // Importa la paginación
import RegistrarProducto from '../../components/RegistrarProductoModal.vue';
          // 
import apiService        from '../../services/apiService.js'; // Importa el servicio API
                  // 
import * as bootstrap    from 'bootstrap';                                    // 

export default {
  name: 'ProductosView',                                                      // 
  components: {
    AppPagination,
    RegistrarProducto                                                         // 
  },

  props: {
    selectorMode: { type: Boolean, default: false },
    hideHeader:   { type: Boolean, default: false }
  },

  data() {
    return {
      // ≡ SIN CAMBIOS
      products: [],
      allProducts: [], // Cache de todos los productos para filtrar
      currentPage: 1,
      itemsPerPage: 10,
      priceFilter: 'all',
      searchTerm: '',
      categoryFilter: 'all',
      showProductModal: false,
      editingProduct: null,
      productModalInstance: null,
      priceModalInstance: null,
      loading: false,
      totalPagesBackend: 1,

      // ≡ (estructura de datos para precio)
      modalData: {
        productId:    null,
        nuevoPrecio:  0,
        fechaVigencia: this.formatDate(new Date())
      }
    };
  },

  computed: {
    // Filtro unificado (nombre / descripción / categoría / unidad) + categoría + estado de precio
    filteredProducts() {
      // Usar allProducts en lugar de products para tener todos los datos cargados
      let filtered = Array.isArray(this.allProducts) ? this.allProducts : [];

      // Normalizar término de búsqueda
      const term = (this.searchTerm || '').trim().toLowerCase();
      if (term) {
        filtered = filtered.filter(p => {
          const nombre      = (p.nombre || '').toLowerCase();
            const desc        = (p.descripcion || '').toLowerCase();
            const categoria   = (p.categoria || p.categoria_nombre || '').toLowerCase();
            const unidad      = (p.unidad_medida || p.unidad_medida_nombre || '').toLowerCase();
            return (
              nombre.includes(term) ||
              desc.includes(term) ||
              categoria.includes(term) ||
              unidad.includes(term)
            );
        });
      }

      // Filtro por categoría (case-insensitive)
      if (this.categoryFilter && this.categoryFilter !== 'all') {
        const catNeedle = this.categoryFilter.trim().toLowerCase();
        filtered = filtered.filter(p => (p.categoria || p.categoria_nombre || '').trim().toLowerCase() === catNeedle);
      }

      // Filtro por estado de precio
      if (this.priceFilter === 'zero') {
        // Sin precio: no hay precio vigente (precio_venta null/undefined/NaN)
        filtered = filtered.filter(p => !Number(p.precio_venta));
      } else if (this.priceFilter === 'nonzero') {
        // Con precio: precio numérico > 0
        filtered = filtered.filter(p => Number(p.precio_venta) > 0);
      }

      return filtered;
    },

    // 🆕 paginación cliente
    pagedProducts() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      return this.filteredProducts.slice(start, start + this.itemsPerPage);
    },

    uniqueCategories() {
      const set = new Set();
      this.allProducts.forEach(p => {
        const cat = p.categoria || p.categoria_nombre;
        if (cat) set.add(cat);
      });
      return Array.from(set).sort();
    },
    

    // 🔄 total páginas calcula sobre filteredProducts
    totalPages() {
      return Math.ceil(this.filteredProducts.length / this.itemsPerPage);
    }
  },

  methods: {
    seleccionarProducto(prod) {
      // Emitir el producto seleccionado (id y nombre son suficientes para buscar detalles fuera)
      this.$emit('producto-seleccionado', prod);
    },
    /* ---------- Utilidades ---------- */
    // 🆕 Helper para construir urls
    api(path) { return `${process.env.VUE_APP_API_BASE_URL}${path}`; },

    /* ---------- CRUD Productos ---------- */
    async fetchProducts() {                                                   
      this.loading = true;
      try {
        this.allProducts = [];
        
        // Primero obtenemos la primera página para saber cuántas páginas hay
        const firstResponse = await apiService.get(this.api('/api/prices?page=1'));
        const firstData = Array.isArray(firstResponse.data) 
          ? firstResponse.data 
          : (Array.isArray(firstResponse.data?.data) ? firstResponse.data.data : []);
        
        this.totalPagesBackend = firstResponse.data?.pagination?.totalPages || 1;
        
        // Mapear la primera página
        const mappedFirstPage = this.mapProducts(firstData);
        this.allProducts.push(...mappedFirstPage);
        
        // Cargar todas las demás páginas
        if (this.totalPagesBackend > 1) {
          const pagePromises = [];
          for (let page = 2; page <= this.totalPagesBackend; page++) {
            pagePromises.push(
              apiService.get(this.api(`/api/prices?page=${page}`))
                .then(response => {
                  const data = Array.isArray(response.data) 
                    ? response.data 
                    : (Array.isArray(response.data?.data) ? response.data.data : []);
                  return this.mapProducts(data);
                })
            );
          }
          
          const allPages = await Promise.all(pagePromises);
          for (const pageProducts of allPages) {
            this.allProducts.push(...pageProducts);
          }
        }
        
        this.products = [...this.allProducts];
        console.log('[ProductosPrecioView] Total de productos cargados:', this.allProducts.length);
      } catch (err) {
        console.error('Error fetching products:', err);
        this.products = [];
        this.allProducts = [];
      } finally {
        this.loading = false;
      }
    },
    
    mapProducts(list) {
      // Helper para seleccionar el precio vigente principal
      const pickCurrentPrice = (arr = []) => {
        if (!Array.isArray(arr) || !arr.length) return null;
        const now = new Date();
        const qty = 1; // Vista lista asume cantidad 1
        let candidates = arr.filter(p => {
          const desde = p?.vigencia_desde ? new Date(p.vigencia_desde) : null;
          if (!desde || isNaN(desde.getTime())) return false;
          const hasta = p?.vigencia_hasta ? new Date(p.vigencia_hasta) : null;
          const inDate = desde <= now && (!hasta || hasta >= now);
          const cantidadOK = (p.cantidad_desde == null || p.cantidad_desde <= qty) && (p.cantidad_hasta == null || p.cantidad_hasta >= qty);
          return inDate && cantidadOK;
        });
        if (!candidates.length) candidates = [...arr];
        candidates.sort((a,b) => new Date(b.vigencia_desde) - new Date(a.vigencia_desde));
        return candidates[0] || null;
      };

      return list.map(item => {
        const priceRec = pickCurrentPrice(item.precios_vigentes || []);
        const precioVentaNum = priceRec ? Number(priceRec.precio_venta) : null;
        return {
          producto_id: item.producto_id,
          codigo_barras: item.codigo_barras || '',
          nombre: item.nombre || '',
          descripcion: item.descripcion || '',
          stock_disponible: item.stock_disponible ?? 0,
          categoria: item.categoria || item.categoria_nombre || '',
          unidad_medida: item.unidad_medida || item.unidad_medida_nombre || '',
          precio_venta: (Number.isFinite(precioVentaNum) && precioVentaNum > 0) ? precioVentaNum : null,
          precio_ultima_compra: item.precio_ultima_compra ?? null,
          vigencia_desde: priceRec?.vigencia_desde || null,
          vigencia_hasta: priceRec?.vigencia_hasta || null,
          _precios_vigentes: item.precios_vigentes || []
        };
      });
    },

    async openProductModal(product = null) {                                   
      // Para editar, cargamos los datos completos del producto desde /api/products/:id
      if (product && product.producto_id) {
        try {
          const { data } = await apiService.get(`/api/products/${product.producto_id}`);
          // Mapear respuesta del backend al formato esperado por RegistrarProductoModal
          this.editingProduct = {
            id: data.producto_id ?? data.id ?? product.producto_id,
            code: data.codigo_barras || '',
            codigo_barras: data.codigo_barras || '', // usado por initial-code
            name: data.nombre || product.nombre || '',
            descripcion: data.descripcion || product.descripcion || '',
            url_imagen: data.url_imagen || '',
            categoria_id: data.categoria_id ?? null,
            unidad_medida_id: data.unidad_medida_id ?? null,
            activo: (data.activo !== undefined) ? data.activo : true,
            tipo_iva: data.tipo_iva ?? 1
          };
        } catch (err) {
          console.error('Error cargando producto para edición:', err);
          // Fallback mínimo para no bloquear la edición
          this.editingProduct = {
            id: product.producto_id,
            code: '',
            codigo_barras: '',
            name: product.nombre || '',
            descripcion: product.descripcion || '',
            url_imagen: '',
            categoria_id: null,
            unidad_medida_id: null,
            activo: true,
            tipo_iva: 1
          };
        }
      } else {
        // Alta
        this.editingProduct = null;
      }
      this.showProductModal = true;                                          
    },
    closeProductModal() {                                                     
      this.showProductModal = false;
    },
    onCategoryChange() {
      // Si elige "all", reseteamos priceFilter a "all"
      if (this.categoryFilter === 'all') {
        this.priceFilter = 'all';
      }
  this.currentPage = 1;
    },

    async handleProductSaved() {                                              
      // Cerrar modal y refrescar la lista desde el backend para mantener consistencia
      this.closeProductModal();
      this.editingProduct = null;
      try {
        await this.fetchProducts();
      } catch (err) {
        console.error('Error refrescando productos tras guardar:', err);
      }
    },

    async deleteProduct(product) {                                             
      if (!confirm(`¿Eliminar “${product.nombre}”?`)) return;
      try {
        await apiService.delete(`/api/products/${product.producto_id}`);
        // Volver a cargar para asegurar estado consistente (precios, etc.)
        await this.fetchProducts();
      } catch (err) {
        console.error('Error eliminando producto:', err);
        alert('Error al eliminar el producto. Revise la consola.');
      }
    },

    /* ---------- Precio ---------- */
    openPriceModal(product) {                                                 
      this.modalData.productId      = product.producto_id;
      this.modalData.nuevoPrecio    = product.precio_venta ?? 0;
      this.modalData.fechaVigencia  = this.formatDate(new Date());

      const el = document.getElementById('updatePriceModal');
      this.priceModalInstance ??= new bootstrap.Modal(el);
      this.priceModalInstance.show();
    },
    closePriceModal() { this.priceModalInstance?.hide(); },                   

    updatePrice() {                                                           
        const { productId, nuevoPrecio, fechaVigencia } = this.modalData;
        if (!productId) {
          console.error('No productId for price update');
          return;
        }
        const payload = {
          cantidad_desde: 1, // Por ahora fijo según requerimiento
          vigencia_desde: fechaVigencia, // YYYY-MM-DD
          precio_venta: Number(nuevoPrecio)
        };
        apiService.post(
          this.api(`/api/prices/${productId}/prices/schedule`),
          payload
        )
        .then(({ data }) => {
          // Si el backend responde { ok: true } asumimos éxito
          if (data?.ok) {
            // Actualizar cache local (si la vigencia es hoy o pasada adoptamos como precio actual)
            const today = this.formatDate(new Date());
            const prod = this.products.find(p => p.producto_id === productId);
            if (prod) {
              if (fechaVigencia <= today) {
                prod.precio_venta = Number(nuevoPrecio);
                prod.vigencia_desde = fechaVigencia;
                prod.vigencia_hasta = null;
              }
              // Agregar al historial local
              if (Array.isArray(prod._precios_vigentes)) {
                prod._precios_vigentes.unshift({
                  precio_venta: String(nuevoPrecio),
                  vigencia_desde: fechaVigencia + 'T00:00:00.000Z',
                  vigencia_hasta: null,
                  cantidad_desde: 1,
                  cantidad_hasta: null
                });
              }
            }
            this.closePriceModal();
          } else {
            console.warn('Respuesta inesperada al programar precio', data);
          }
        })
        .catch(err => {
          console.error('Error scheduling price:', err);
          alert('Error al programar el precio.');
        });
    },

    /* ---------- Otros ---------- */
    changePage(page) { this.currentPage = page; },                            // ≡

    formatDate(date) {                                                        // ≡
      const d = new Date(date);
      const yyyy = d.getFullYear();
      const mm   = (`0${d.getMonth()+1}`).slice(-2);
      const dd   = (`0${d.getDate()}`).slice(-2);
      return `${yyyy}-${mm}-${dd}`;
    },
    formateaNumero(n) {
      if (n === null || n === undefined) return '';
      return Number(Math.round(n)).toLocaleString('es-PY', { minimumFractionDigits: 0 });
    }
  },

  watch: {
    // Reset page when filters change
    searchTerm() { this.currentPage = 1; },
    categoryFilter() { this.currentPage = 1; },
    priceFilter() { this.currentPage = 1; },
    // Asegurar que currentPage nunca exceda totalPages después de aplicar filtros
    filteredProducts() {
      const total = this.totalPages;
      if (this.currentPage > total && total > 0) {
        this.currentPage = total; // Ajustar a última página disponible
      }
      if (total === 0) {
        this.currentPage = 1; // Evitar página 0 visualmente
      }
    }
  },

  mounted() { this.fetchProducts(); }                                         // ≡
};
</script>

<style scoped>
.selectable-row {
  cursor: pointer;
}
.selectable-row:hover {
  background-color: #f8f9fa;
}
</style>
/*    {
        "producto_id": 22,
        "nombre": "prueba",
        "descripcion": "des",
        "stock_disponible": 641,
        "categoria": "Confitería",
        "unidad_medida": "g",
        "precio_venta": 44000,
        "precio_ultima_compra": 70000
    }, */

<style scoped>
.btn-success {
  background-color: #28a745;
  border-color: #28a745;
}

.header-buttons {
  display: flex;
  justify-content: flex-end;
}

/* Column width control to keep layout stable between filter states */
.col-nombre { width: 26%; min-width: 200px; }
.col-price { width: 12%; min-width: 110px; }
.col-categoria { width: 18%; min-width: 140px; }
.col-price-compra { width: 15%; min-width: 130px; }
.col-actions { width: 29%; min-width: 260px; }

/* Ensure action buttons stay on one line and wrap gracefully if very narrow */
.actions-wrapper { white-space: nowrap; }
@media (max-width: 1200px) {
  .col-actions { width: 34%; }
}
@media (max-width: 992px) {
  .actions-wrapper { flex-wrap: wrap; white-space: normal; }
  .col-actions { width: 100%; }
}
</style>
