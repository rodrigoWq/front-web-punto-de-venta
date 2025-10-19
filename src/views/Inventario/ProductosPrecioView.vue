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

    <!-- Buscador y filtro por categoría (como en ProductosView.vue) -->
    <div class="row">
      <div class="col-12">
        <div class="card p-4">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <div class="d-flex gap-3 flex-grow-1">
              <input
                v-model="searchTerm"
                type="text"
                class="form-control"
                style="max-width: 350px"
                placeholder="Buscar por nombre..."
              />

              <!-- Select con búsqueda para categorías -->
              <div class="position-relative" style="max-width: 250px; width: 250px;">
                <input
                  v-model="categorySearchTerm"
                  type="text"
                  class="form-control"
                  placeholder="Filtrar por categoría..."
                  @focus="showCategoryDropdown = true"
                  @blur="handleCategoryBlur"
                  :disabled="loadingCategories"
                />

                <!-- Dropdown de categorías -->
                <div
                  v-if="showCategoryDropdown && filteredCategories.length > 0"
                  class="category-dropdown position-absolute w-100 mt-1 bg-white border rounded shadow-sm"
                  style="max-height: 300px; overflow-y: auto; z-index: 1000;"
                >
                  <div
                    class="dropdown-item cursor-pointer px-3 py-2 hover-bg-light"
                    @mousedown.prevent="selectCategory('', 'Todas las categorías')"
                  >
                    <strong>Todas las categorías</strong>
                  </div>
                  <div
                    v-for="cat in filteredCategories"
                    :key="cat.id"
                    class="dropdown-item cursor-pointer px-3 py-2 hover-bg-light"
                    @mousedown.prevent="selectCategory(cat.id, cat.name)"
                  >
                    {{ cat.name }}
                  </div>
                </div>
              </div>
              <!-- Filtro: Con precio / Sin precio (oculto en modo selector) -->
              <div v-if="!selectorMode" class="d-flex align-items-center gap-2">
                <button
                  type="button"
                  class="btn"
                  :class="priceFilter === 'true' ? 'btn-success' : 'btn-outline-success'"
                  @click="setPriceFilter('true')"
                >
                  Con precio
                </button>
                <button
                  type="button"
                  class="btn"
                  :class="priceFilter === 'false' ? 'btn-danger' : 'btn-outline-danger'"
                  @click="setPriceFilter('false')"
                >
                  Sin precio
                </button>
              </div>
            </div>
            <button 
              class="btn btn-outline-danger d-flex align-items-center"
              @click="clearFilters"
              :disabled="!searchTerm && !selectedCategory && (!selectorMode && priceFilter === 'all')"
            >
              <i class="bi bi-arrow-counterclockwise me-2"></i> 
              Limpiar Filtros
            </button>
          </div>
        </div>
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
      // Productos y paginación
      products: [],
      currentPage: 1,
      totalPages: 1,
      pagination: {},
      itemsPerPage: 10,
      loading: false,

      // Filtros
      searchTerm: '',
      categorySearchTerm: '',
      showCategoryDropdown: false,
      selectedCategory: '', // ID
      selectedCategoryName: '',
      categories: [],
      allCategories: [],
      loadingCategories: false,

  // Filtro por precio (all | 'true' | 'false')
  priceFilter: 'all',

      // Modal de producto y precio
      showProductModal: false,
      editingProduct: null,
      productModalInstance: null,
      priceModalInstance: null,

      // Estructura de datos para precio
      modalData: {
        productId:    null,
        nuevoPrecio:  0,
        fechaVigencia: this.formatDate(new Date())
      }
    };
  },

  computed: {
    // Filtra categorías por texto
    filteredCategories() {
      if (!this.categorySearchTerm.trim()) return this.allCategories
      const term = this.categorySearchTerm.toLowerCase()
      return this.allCategories.filter(cat => cat.name.toLowerCase().includes(term))
    },

    // La lista a mostrar (paginada por el servidor)
    pagedProducts() {
      return Array.isArray(this.products) ? this.products : []
    }
  },

  methods: {
    seleccionarProducto(prod) {
      this.$emit('producto-seleccionado', prod)
    },

    // Mapea un producto del backend al formato de la vista
    mapProduct(item) {
      const pickCurrentPrice = (arr = []) => {
        if (!Array.isArray(arr) || !arr.length) return null
        const now = new Date()
        const qty = 1
        let candidates = arr.filter(p => {
          const desde = p?.vigencia_desde ? new Date(p.vigencia_desde) : null
          if (!desde || isNaN(desde.getTime())) return false
          const hasta = p?.vigencia_hasta ? new Date(p.vigencia_hasta) : null
          const inDate = desde <= now && (!hasta || hasta >= now)
          const cantidadOK = (p.cantidad_desde == null || p.cantidad_desde <= qty) && (p.cantidad_hasta == null || p.cantidad_hasta >= qty)
          return inDate && cantidadOK
        })
        if (!candidates.length) candidates = [...arr]
        candidates.sort((a,b) => new Date(b.vigencia_desde) - new Date(a.vigencia_desde))
        return candidates[0] || null
      }

      const priceRec = pickCurrentPrice(item.precios_vigentes || [])
      const precioVentaNum = priceRec ? Number(priceRec.precio_venta) : null

      return {
        producto_id: item.producto_id,
        codigo_barras: item.codigo_barras || '',
        nombre: item.nombre || '',
        descripcion: item.descripcion || '',
        stock_disponible: item.stock_disponible ?? 0,
        categoria: item.categoria || item.categoria_nombre || '',
        categoria_id: item.categoria_id,
        unidad_medida: item.unidad_medida || item.unidad_medida_nombre || '',
        unidad_medida_id: item.unidad_medida_id,
        precio_venta: (Number.isFinite(precioVentaNum) && precioVentaNum > 0) ? precioVentaNum : null,
        precio_ultima_compra: item.precio_ultima_compra ?? null,
        vigencia_desde: priceRec?.vigencia_desde || null,
        vigencia_hasta: priceRec?.vigencia_hasta || null,
        _precios_vigentes: item.precios_vigentes || [],
        activo: item.activo,
        tipo_iva: item.tipo_iva,
        url_imagen: item.url_imagen || ''
      }
    },

    // Cargar categorías (todas las páginas)
    async loadCategories() {
      this.loadingCategories = true
      try {
        const all = []
        let page = 1
        let hasMore = true
        while (hasMore) {
          const resp = await apiService.get(`/api/categories?page=${page}&limit=50`)
          const payload = resp.data
          let list = []
          let pagination = null
          if (Array.isArray(payload)) {
            list = payload
            hasMore = false
          } else if (payload?.data) {
            if (Array.isArray(payload.data)) {
              list = payload.data
              hasMore = false
            } else if (Array.isArray(payload.data.data)) {
              list = payload.data.data
              pagination = payload.data.pagination
              hasMore = !!pagination?.hasNextPage
            }
          }
          all.push(...list)
          if (!hasMore) break
          page++
          if (page > 10) {
            console.warn('[ProductosPrecioView] Límite de páginas de categorías alcanzado')
            break
          }
        }
        this.allCategories = all.map(c => ({ id: c.categoria_id ?? c.id, name: c.nombre }))
        this.categories = [...this.allCategories]
      } catch (e) {
        console.error('Error cargando categorías:', e)
        this.allCategories = []
        this.categories = []
      } finally {
        this.loadingCategories = false
      }
    },

    selectCategory(categoryId, categoryName = '') {
      this.selectedCategory = categoryId
      this.selectedCategoryName = categoryName
      this.categorySearchTerm = categoryName
      this.showCategoryDropdown = false
      // Reiniciar a la primera página y cargar
      this.currentPage = 1
      this.loadProducts({ suppressAlert: true, page: 1 })
    },

    handleCategoryBlur() {
      setTimeout(() => { this.showCategoryDropdown = false }, 200)
    },

    // Establecer filtro de precio (toggle entre 'true' | 'false' | 'all')
    setPriceFilter(val) {
      this.priceFilter = (this.priceFilter === val) ? 'all' : val
    },

    // Cargar productos con filtros desde el backend
    async loadProducts(options = {}) {
      const { suppressAlert = false, page = 1 } = options || {}
      this.loading = true
      try {
        let url = `/api/prices?page=${page}`
        if (this.searchTerm.trim()) {
          url += `&search=${encodeURIComponent(this.searchTerm)}`
        }
        if (this.selectedCategory) {
          url += `&category_id=${this.selectedCategory}`
        }
        if (this.priceFilter !== 'all') {
          url += `&hasPrices=${this.priceFilter}`
        }

        const response = await apiService.get(url)

        // Manejar ambos formatos: array directo o { data, pagination }
        const raw = response.data
        const list = Array.isArray(raw) ? raw : (Array.isArray(raw?.data) ? raw.data : [])
        this.products = list.map(this.mapProduct)

        if (raw?.pagination) {
          this.pagination = raw.pagination
          this.totalPages = raw.pagination.totalPages || 1
          this.currentPage = raw.pagination.page || 1
        } else {
          // Sin paginación desde el servidor: una sola página
          this.totalPages = 1
          this.currentPage = 1
        }
      } catch (error) {
        console.error('Error cargando productos:', error)
        if (!suppressAlert) alert('Error al cargar los productos. Revise la consola.')
        this.products = []
        this.totalPages = 1
        this.currentPage = 1
      } finally {
        this.loading = false
      }
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
    closeProductModal() { this.showProductModal = false; },

    async handleProductSaved() {
      this.closeProductModal();
      this.editingProduct = null;
      try { await this.loadProducts({ suppressAlert: true }) } catch (e) { /* noop */ }
    },

    async deleteProduct(product) {                                             
      if (!confirm(`¿Eliminar “${product.nombre}”?`)) return;
      try {
        await apiService.delete(`/api/products/${product.producto_id}`);
        await this.loadProducts({ suppressAlert: true, page: this.currentPage });
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
        apiService.post(`/api/prices/${productId}/prices/schedule`, payload)
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
    changePage(page) {
      if (page < 1 || page > this.totalPages) return
      this.currentPage = page
      this.loadProducts({ suppressAlert: true, page })
    },

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
    },

    clearFilters() {
      this.searchTerm = ''
      this.selectedCategory = ''
      this.selectedCategoryName = ''
      this.categorySearchTerm = ''
      // En modo selector, mantener el filtro de precio en 'true' (solo con precio)
      this.priceFilter = this.selectorMode ? 'true' : 'all'
      this.currentPage = 1
      this.loadProducts({ suppressAlert: true, page: 1 })
    }
  },

  watch: {
    // Debounce para búsqueda
    searchTerm: {
      handler(newVal, oldVal) {
        if (this._searchTimeout) clearTimeout(this._searchTimeout)
        if (newVal !== oldVal) this.currentPage = 1
        this._searchTimeout = setTimeout(() => {
          this.loadProducts({ suppressAlert: true, page: 1 })
        }, 500)
      }
    },
    // Cuando cambia la categoría
    selectedCategory(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.currentPage = 1
        this.loadProducts({ suppressAlert: true, page: 1 })
      }
    },
    priceFilter(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.currentPage = 1
        this.loadProducts({ suppressAlert: true, page: 1 })
      }
    }
  },

  mounted() {
    // Si está en modo selector, solo mostrar productos con precio
    if (this.selectorMode) {
      this.priceFilter = 'true';
    }
    this.loadProducts()
    this.loadCategories()
  }
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
/* Estilos para el dropdown de categorías */
<style scoped>
.category-dropdown { background: white; }
.dropdown-item {
  transition: background-color 0.15s ease-in-out;
  border-bottom: 1px solid #f8f9fa;
}
.dropdown-item:last-child { border-bottom: none; }
.dropdown-item:hover,
.hover-bg-light:hover { background-color: #f8f9fa; }
.cursor-pointer { cursor: pointer; }

/* Scrollbar */
.category-dropdown::-webkit-scrollbar { width: 8px; }
.category-dropdown::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 4px; }
.category-dropdown::-webkit-scrollbar-thumb { background: #888; border-radius: 4px; }
.category-dropdown::-webkit-scrollbar-thumb:hover { background: #555; }
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
