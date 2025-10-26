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
const categorySearchTerm = ref('')
const showCategoryDropdown = ref(false)
const products = ref([])
const categories = ref([])
const allCategories = ref([]) // Todas las categorías cargadas
const selectedCategory = ref('') // ID de la categoría seleccionada
const selectedCategoryName = ref('') // Nombre de la categoría seleccionada (para mostrar)
const loading = ref(false)
const loadingCategories = ref(false)
const currentPage = ref(1)
const totalPages = ref(1)
const pagination = ref({})
const itemsPerPage = 10 // Para paginación local cuando usamos búsqueda o filtro de categoría

// Función para mapear productos del backend
function mapProduct(item) {
  return {
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
  }
}

// Cargar categorías desde el backend (todas las páginas)
async function loadCategories() {
  loadingCategories.value = true
  try {
    const allCategoriesData = []
    let currentPage = 1
    let hasMorePages = true
    
    // Cargar todas las páginas de categorías
    while (hasMorePages) {
      const response = await apiService.get(`/api/categories?page=${currentPage}&limit=50`)
      
      // Manejar diferentes formatos de respuesta
      let list = []
      let paginationInfo = null
      const data = response.data
      
      if (Array.isArray(data)) {
        list = data
        hasMorePages = false // No hay paginación
      } else if (data?.data) {
        if (Array.isArray(data.data)) {
          list = data.data
          hasMorePages = false
        } else if (Array.isArray(data.data.data)) {
          list = data.data.data
          paginationInfo = data.data.pagination
          hasMorePages = paginationInfo?.hasNextPage || false
        }
      }
      
      // Agregar categorías de esta página
      allCategoriesData.push(...list)
      
      // Si no hay más páginas, salir del loop
      if (!hasMorePages) break
      
      currentPage++
      
      // Protección contra loops infinitos
      if (currentPage > 10) {
        console.warn('[ProductosView] Se alcanzó el límite de 10 páginas al cargar categorías')
        break
      }
    }
    
    // Guardar todas las categorías
    allCategories.value = allCategoriesData.map(cat => ({
      id: cat.categoria_id ?? cat.id,
      name: cat.nombre
    }))
    
    // Inicializar categories con todas para el filtrado
    categories.value = [...allCategories.value]
    
    console.log('[ProductosView] Total de categorías cargadas:', allCategories.value.length)
  } catch (error) {
    console.error('Error cargando categorías:', error)
    allCategories.value = []
    categories.value = []
  } finally {
    loadingCategories.value = false
  }
}

// Filtrar categorías según el término de búsqueda
const filteredCategories = computed(() => {
  if (!categorySearchTerm.value.trim()) {
    return allCategories.value
  }
  
  const term = categorySearchTerm.value.toLowerCase()
  return allCategories.value.filter(cat => 
    cat.name.toLowerCase().includes(term)
  )
})

// Seleccionar una categoría del dropdown
function selectCategory(categoryId, categoryName = '') {
  console.log('[ProductosView] Seleccionando categoría:', { categoryId, categoryName })
  selectedCategory.value = categoryId
  selectedCategoryName.value = categoryName
  categorySearchTerm.value = categoryName
  showCategoryDropdown.value = false
}


// Manejar blur del input de categoría
function handleCategoryBlur() {
  // Pequeño delay para permitir el click en el dropdown
  setTimeout(() => {
    showCategoryDropdown.value = false
  }, 200)
}

// Cargar productos desde el backend (con opción para silenciar alertas)
async function loadProducts(options = {}) {
  const { suppressAlert = false, page = 1 } = options || {}
  loading.value = true
  try {
    let response
    let data
    let usePaginacionLocal = false
    
    // Determinar qué endpoint usar según los filtros activos
    if (searchTerm.value.trim()) {
      // 1. Si hay término de búsqueda, usar el endpoint de búsqueda
      response = await apiService.get(`/api/products/search?query=${encodeURIComponent(searchTerm.value)}`)
      data = Array.isArray(response.data) ? response.data : []
      usePaginacionLocal = true
      
      console.log('[ProductosView] Búsqueda realizada:', data.length, 'resultados')
    } else if (selectedCategory.value) {
      // 2. Si hay categoría seleccionada (sin búsqueda), usar endpoint de categoría con paginación
      response = await apiService.get(`/api/products?category_id=${selectedCategory.value}&page=${page}`)
      
      // Manejar la respuesta (similar al endpoint normal)
      if (Array.isArray(response.data)) {
        data = response.data
        usePaginacionLocal = true // Si viene como array simple, usar paginación local
      } else if (response.data?.data) {
        data = Array.isArray(response.data.data) ? response.data.data : []
        // Si tiene paginación del servidor, usarla
        if (response.data.pagination) {
          usePaginacionLocal = false
        } else {
          usePaginacionLocal = true
        }
      } else {
        data = []
        usePaginacionLocal = true
      }
      
      console.log('[ProductosView] Filtro por categoría ID:', selectedCategory.value, '- Página:', page, '-', data.length, 'resultados')
      console.log('[ProductosView] Paginación:', response.data?.pagination)
    } else {
      // 3. Sin filtros, usar el endpoint normal con paginación del servidor
      response = await apiService.get(`/api/products?page=${page}`)
      
      // La respuesta tiene estructura { data: [...], pagination: {...} }
      data = Array.isArray(response.data) 
        ? response.data 
        : (Array.isArray(response.data?.data) ? response.data.data : [])
      
      usePaginacionLocal = false
      
      console.log('[ProductosView] Productos cargados:', data.length, 'Página:', page)
    }
    
    // Mapear productos
    products.value = data.map(mapProduct)
    
    // Configurar paginación
    if (usePaginacionLocal) {
      // Paginación local para búsqueda o filtro de categoría
      const totalItems = products.value.length
      totalPages.value = Math.ceil(totalItems / itemsPerPage) || 1
      currentPage.value = Math.min(page, totalPages.value)
    } else {
      // Paginación del servidor
      if (response.data?.pagination) {
        pagination.value = response.data.pagination
        totalPages.value = response.data.pagination.totalPages || 1
        currentPage.value = response.data.pagination.page || 1
      } else {
        totalPages.value = 1
        currentPage.value = 1
      }
    }
    
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
  const confirmed = await confirm({
    message: '¿Está seguro de que desea eliminar este producto?',
    title: 'Eliminar producto',
    confirmText: 'Eliminar',
    cancelText: 'Cancelar'
  })
  if (!confirmed) return
  
  try {
    await apiService.delete(`/api/products/${id}`)
    console.log('Producto eliminado:', id)
    await loadProducts() // Recargar lista
  alert.success('Producto eliminado correctamente.')
  } catch (error) {
    console.error('Error eliminando producto:', error)
  alert.error('Error al eliminar el producto. Revise la consola.')
  }
}

const filteredProducts = computed(() => {
  const productsArray = Array.isArray(products.value) ? products.value : []
  
  // Si hay filtro de categoría Y búsqueda, aplicar filtro de categoría localmente
  // (porque el endpoint de búsqueda no acepta parámetro de categoría)
  if (searchTerm.value.trim() && selectedCategory.value) {
    return productsArray.filter(p => p.categoria_id == selectedCategory.value)
  }
  
  // En otros casos, los productos ya vienen filtrados del backend
  return productsArray
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
  currentPage.value = page
  
  // Si estamos usando búsqueda, no recargamos (paginación local)
  // Si hay filtro de categoría o sin filtros, recargamos del servidor
  if (!searchTerm.value.trim()) {
    loadProducts({ suppressAlert: true, page })
  }
}

// Limpiar todos los filtros
function clearFilters() {
  searchTerm.value = ''
  selectedCategory.value = ''
  selectedCategoryName.value = ''
  categorySearchTerm.value = ''
  currentPage.value = 1
  // Recargar productos sin filtros
  loadProducts({ suppressAlert: true })
}

// Aplicar paginación a los productos filtrados
const pagedProducts = computed(() => {
  const filtered = filteredProducts.value
  
  // Solo usamos paginación local si hay búsqueda (que no tiene paginación del servidor)
  if (searchTerm.value.trim()) {
    const start = (currentPage.value - 1) * itemsPerPage
    const end = start + itemsPerPage
    return filtered.slice(start, end)
  }
  
  // En otros casos (categoría o sin filtros), los productos ya vienen paginados del backend
  return filtered
})

// Debounce para la búsqueda
let searchTimeout = null
watch(searchTerm, (newValue, oldValue) => {
  // Limpiar timeout anterior
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  
  // Si cambia el término de búsqueda, resetear página
  if (newValue !== oldValue) {
    currentPage.value = 1
  }
  
  // Esperar 500ms antes de ejecutar la búsqueda
  searchTimeout = setTimeout(() => {
    loadProducts({ suppressAlert: true, page: 1 })
  }, 500)
})

// Cuando cambia la categoría, recargar productos
watch(selectedCategory, (newValue, oldValue) => {
  if (newValue !== oldValue) {
    currentPage.value = 1
    loadProducts({ suppressAlert: true, page: 1 })
  }
})

 // Cargar datos al montar el componente
 onMounted(() => {
   loadProducts()
   loadCategories()
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

/* Estilos para el dropdown de categorías */
.category-dropdown {
  background: white;
  border: 1px solid #dee2e6;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}

.dropdown-item {
  transition: background-color 0.15s ease-in-out;
  border-bottom: 1px solid #f8f9fa;
}

.dropdown-item:last-child {
  border-bottom: none;
}

.dropdown-item:hover,
.hover-bg-light:hover {
  background-color: #f8f9fa;
}

.cursor-pointer {
  cursor: pointer;
}

/* Estilos para el scrollbar del dropdown */
.category-dropdown::-webkit-scrollbar {
  width: 8px;
}

.category-dropdown::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.category-dropdown::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.category-dropdown::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
