<template>
  <div>
    <div class="row">
      <div class="col-12">
        <!-- Título y botón alineados como en Dashboard -->
        <div class="d-flex justify-content-between align-items-center mb-4 mt-2">
          <h2 class="fw-bold mb-0">Gestión de Productos</h2>
           <button
             class="btn btn-dark d-flex align-items-center"
             @click="openProductModal()"
           >
             <i class="bi bi-plus-lg me-2"></i> Nuevo Producto
           </button>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="col-12">
        <div class="card p-4">
          <!-- Buscador y Filtros -->
          <div class="d-flex justify-content-between align-items-center mb-3">
            <div class="d-flex gap-3 flex-grow-1">
              <input
                v-model="searchTerm"
                type="text"
                class="form-control"
                style="max-width: 350px"
                placeholder="Buscar por nombre..."
              />
              <select 
                v-model="selectedCategory"
                class="form-select"
                style="max-width: 200px"
              >
                <option value="">Todas las categorías</option>
                <option 
                  v-for="cat in categories" 
                  :key="cat.name" 
                  :value="cat.name"
                >
                  {{ cat.name }}
                </option>
              </select>
            </div>
            <button 
              class="btn btn-outline-danger d-flex align-items-center"
              @click="clearFilters"
              :disabled="!searchTerm && !selectedCategory"
            >
              <i class="bi bi-arrow-counterclockwise me-2"></i> 
              Limpiar Filtros
            </button>
          </div>

          <!-- Tabla de productos -->
          <div class="table-responsive">
            <table class="table align-middle mb-0">
              <thead class="table-light">
                <tr>
                  <th>Código</th>
                  <th>Nombre</th>
                  <th>Categoría</th>
                  <th>Stock Total</th>
                  <th>Unidad</th>
                  <th>IVA</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="loading">
                  <td colspan="8" class="text-center py-4">
                    <i class="bi bi-arrow-clockwise spin me-2"></i>Cargando productos...
                  </td>
                </tr>
                <tr v-else-if="pagedProducts.length === 0">
                  <td colspan="8" class="text-center py-4 text-muted">
                    No se encontraron productos
                  </td>
                </tr>
                <tr v-else v-for="prod in pagedProducts" :key="prod.id">
                  <td>{{ prod.code }}</td>
                  <td>
                    <div>{{ prod.name }}</div>
                    <small class="text-muted" v-if="!prod.tiene_precio">
                      {{ prod.estado_producto }}
                    </small>
                  </td>
                  <td>{{ prod.category }}</td>
                  <td>{{ prod.stock }}</td>
                  <td>{{ prod.unit }}</td>
                  <td>{{ prod.iva }}</td>
                  <td>
                    <span
                      :class="[
                        'badge rounded-pill px-3 py-2',
                        prod.stock < prod.minStock
                          ? 'bg-light text-dark fw-bold border border-secondary'
                          : 'bg-dark text-white fw-bold'
                      ]"
                    >
                      {{ prod.stock < prod.minStock ? 'Bajo Stock' : 'Normal' }}
                    </span>
                  </td>
                  <td>
                    <div class="d-flex gap-1">
                      <button
                        class="btn btn-outline-secondary btn-sm"
                        @click="openProductModal(prod)"
                        title="Editar producto"
                      >
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button
                        class="btn btn-outline-danger btn-sm"
                        @click="deleteProduct(prod.id)"
                        title="Eliminar producto"
                      >
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>

    <RegistrarProductoModal
      v-model:showModal="showProductModal"
      :title="editingProduct ? 'Editar producto' : 'Registrar producto'"
      :initial-code="editingProduct?.code ?? ''"
      :product="editingProduct"
      @product-registered="onProductRegistered"
    />
    <!-- ─── paginador ─── -->
    <AppPagination
      class="mt-3"
      :total-pages="totalPages"
      :current-page="currentPage"
      @page-changed="changePage"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import RegistrarProductoModal from '@/components/RegistrarProductoModal.vue'
import AppPagination           from '@/components/AppPagination.vue'
import apiService from '@/services/apiService.js'

const searchTerm = ref('')
const products = ref([])
const categories = ref([])
const selectedCategory = ref('')
const loading = ref(false)
const currentPage = ref(1)
const totalPages = ref(1)
const pagination = ref({})
//const itemsPerPage = ref(10)

// Cargar productos desde el backend (con opción para silenciar alertas)
async function loadProducts(options = {}) {
  const { suppressAlert = false, page = 1 } = options || {}
  loading.value = true
  try {
    const response = await apiService.get(`/api/products?page=${page}`)
    // La respuesta tiene estructura { data: [...], pagination: {...} }
    const data = Array.isArray(response.data) 
      ? response.data 
      : (Array.isArray(response.data?.data) ? response.data.data : [])
    
    // Capturar información de paginación del backend
    if (response.data?.pagination) {
      pagination.value = response.data.pagination
      totalPages.value = response.data.pagination.totalPages || 1
      currentPage.value = response.data.pagination.page || 1
    }
    
    // Mapear respuesta del backend a formato del template
    products.value = data.map(item => ({
      id: item.producto_id,
      code: item.codigo_barras || item.codigo_producto || '',
      name: item.nombre || '',
      category: item.categoria_nombre || '',
      stock: item.stock_disponible || 0,
      minStock: 5, // valor por defecto ya que no viene del backend
      unit: item.unidad_medida_nombre || '',
      iva: item.tipo_iva_descripcion || '',
      activo: item.activo,
      categoria_id: item.categoria_id,
      unidad_medida_id: item.unidad_medida_id,
      tipo_iva: item.tipo_iva,
      descripcion: item.descripcion || '',
      url_imagen: item.url_imagen || '',
      precio_venta_actual: item.precio_venta_actual,
      tiene_precio: item.disponibilidad?.tiene_precio || false,
      estado_producto: item.estado_producto || ''
    }))

    // Extraer categorías únicas para el filtro
    const uniqueCategories = [...new Set(data.map(item => item.categoria_nombre).filter(Boolean))]
    categories.value = uniqueCategories.map(name => ({ name }))
    
    console.log('[ProductosView] Productos cargados:', products.value.length, 'Página:', currentPage.value, 'Total de páginas:', totalPages.value)
  } catch (error) {
    console.error('Error cargando productos:', error)
    if (!suppressAlert) {
      alert('Error al cargar los productos. Revise la consola.')
    }
  } finally {
    loading.value = false
  }
}

// Las operaciones de crear/editar se realizan en el modal y aquí solo se refresca la lista.

// Eliminar producto
async function deleteProduct(id) {
  if (!confirm('¿Está seguro de que desea eliminar este producto?')) return
  
  try {
    await apiService.delete(`/api/products/${id}`)
    console.log('Producto eliminado:', id)
    await loadProducts() // Recargar lista
    alert('Producto eliminado correctamente.')
  } catch (error) {
    console.error('Error eliminando producto:', error)
    alert('Error al eliminar el producto. Revise la consola.')
  }
}

const filteredProducts = computed(() => {
  const productsArray = Array.isArray(products.value) ? products.value : []
  let filtered = productsArray
  
  // Filtrar por término de búsqueda
  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase()
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(term) ||
      p.code.includes(term) ||
      p.category.toLowerCase().includes(term)
    )
  }
  
  // Filtrar por categoría
  if (selectedCategory.value) {
    filtered = filtered.filter(p => p.category === selectedCategory.value)
  }
  
  return filtered
})

const showProductModal = ref(false)
const editingProduct  = ref(null)

function openProductModal(prod = null) {
  editingProduct.value = prod
  showProductModal.value = true
}

async function onProductRegistered() {
  // El modal ya realizó el POST/PUT correctamente.
  // Sólo recargar lista en silencio y cerrar modal.
  try {
    await loadProducts({ suppressAlert: true })
  } catch (e) {
    console.warn('Producto guardado, pero falló la recarga de productos:', e)
  }
  showProductModal.value = false
  editingProduct.value = null
}

function changePage(page) {
  if (page < 1 || page > totalPages.value) return
  loadProducts({ suppressAlert: true, page })
}

// Limpiar todos los filtros
function clearFilters() {
  searchTerm.value = ''
  selectedCategory.value = ''
  currentPage.value = 1
}

// Los productos ya vienen paginados del backend, pero aplicamos filtros locales
const pagedProducts = computed(() => {
  return filteredProducts.value
})

// reset de página al cambiar filtro/búsqueda
watch([searchTerm, selectedCategory], () => { 
  currentPage.value = 1
  // Nota: Los filtros se aplican localmente en el computed filteredProducts
  // La paginación del backend es independiente
})

 // Cargar datos al montar el componente
 onMounted(() => {
   loadProducts()
 })
</script>

<style scoped>
.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
