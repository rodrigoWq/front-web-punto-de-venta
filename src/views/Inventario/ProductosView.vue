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
            <input
              v-model="searchTerm"
              type="text"
              class="form-control me-3"
              style="max-width: 350px"
              placeholder="Buscar productos..."
            />
            <button class="btn btn-outline-secondary d-flex align-items-center">
              <i class="bi bi-funnel me-2"></i> Filtros
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
                <tr v-for="prod in pagedProducts" :key="prod.id">
                  <td>{{ prod.code }}</td>
                  <td>{{ prod.name }}</td>
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
                     <button
                        class="btn btn-outline-secondary btn-sm"
                        @click="openProductModal(prod)">Editar
                    </button>
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
import { ref, computed, watch } from 'vue'
import RegistrarProductoModal from '@/components/RegistrarProductoModal.vue'
import AppPagination           from '@/components/AppPagination.vue'

const searchTerm = ref('')

const products = ref([
  {
    id: 1,
    code: '7891234567890',
    name: 'Laptop Dell XPS 13',
    category: 'Electrónicos',
    stock: 15,
    minStock: 20,
    unit: 'Unidad',
    iva: '21%',
  },
  {
    id: 2,
    code: '7891234567891',
    name: 'Mouse Logitech MX',
    category: 'Accesorios',
    stock: 45,
    minStock: 10,
    unit: 'Unidad',
    iva: '21%',
  },
  {
    id: 3,
    code: '7891234567892',
    name: 'Teclado Mecánico',
    category: 'Accesorios',
    stock: 30,
    minStock: 5,
    unit: 'Unidad',
    iva: '21%',
  },
  {
    id: 4,
    code: '7891234567893',
    name: 'Monitor LG 27"',
    category: 'Electrónicos',
    stock: 10,
    minStock: 5,
    unit: 'Unidad',
    iva: '21%',
  },
  {
    id: 5,
    code: '7891234567894',
    name: 'Impresora HP LaserJet',
    category: 'Electrónicos',
    stock: 8,
    minStock: 3,
    unit: 'Unidad',
    iva: '21%',
  }
  
])

const filteredProducts = computed(() => {
  if (!searchTerm.value) return products.value
  return products.value.filter(
    p =>
      p.name.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      p.code.includes(searchTerm.value)
  )
})

const showProductModal = ref(false)
const editingProduct  = ref(null)

function openProductModal(prod = null) {
  editingProduct.value = prod
  showProductModal.value = true
}

function onProductRegistered(saved) {
  const idx = products.value.findIndex(p => p.id === saved.id)
  if (idx !== -1) products.value.splice(idx, 1, saved)
  else            products.value.unshift(saved)
  showProductModal.value = false
}

 const currentPage  = ref(1)
 const itemsPerPage = ref(4)       // 10 filas por página

 // recalcular total de páginas
 const totalPages = computed(() =>
   Math.ceil(filteredProducts.value.length / itemsPerPage.value)
 )

 function changePage(page) {
   if (page < 1 || page > totalPages.value) return
   currentPage.value = page
}


 // slice de productos mostrados en la página actual
 const pagedProducts = computed(() => {
   const start = (currentPage.value - 1) * itemsPerPage.value
   return filteredProducts.value.slice(start, start + itemsPerPage.value)
 })

 // reset de página al cambiar filtro/búsqueda
 watch(searchTerm, () => { currentPage.value = 1 })
</script>
