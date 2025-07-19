<template>
  <div class="container-xl px-4">
    <!-- Título y botón -->
    <div class="row">
      <div class="col-12">
        <!-- Título y botón alineados como en Dashboard -->
        <div class="d-flex justify-content-between align-items-center mb-4 mt-2">
          <h2 class="fw-bold mb-0">Movimientos de Inventario</h2>
          <button class="btn btn-dark d-flex align-items-center">
            <i class="bi bi-plus-lg me-2"></i> Nuevo Movimiento
          </button>
        </div>
      </div>
    </div>

    <!-- Filtros por tipo -->
    <div class="mb-3">
      <button class="btn btn-sm btn-light me-2">Todos</button>
      <button class="btn btn-sm btn-outline-secondary me-2">Entradas</button>
      <button class="btn btn-sm btn-outline-secondary me-2">Salidas</button>
      <button class="btn btn-sm btn-outline-secondary">Ajustes</button>
    </div>

    <!-- Tabla de movimientos -->
    <div class="bg-white rounded shadow-sm p-4">
      <div class="table-responsive">
        <table class="table align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th>Fecha</th>
              <th>Tipo</th>
              <th>Producto</th>
              <th>Lote</th>
              <th>Cantidad</th>
              <th>Depósito</th>
              <th>Usuario</th>
              <th>Motivo</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="mov in pagedMovements" :key="mov.id">
              <td>{{ mov.date }}</td>
              <td>
                <span
                  :class="[
                    'badge rounded-pill px-3 py-2',
                    mov.type === 'ENTRADA'
                      ? 'bg-dark text-white fw-bold'
                      : mov.type === 'SALIDA'
                        ? 'bg-danger text-white fw-bold'
                        : 'bg-light text-dark fw-bold'
                  ]"
                >
                  {{ mov.type }}
                </span>
              </td>
              <td>{{ mov.product }}</td>
              <td>{{ mov.lot }}</td>
              <td :class="mov.qty > 0 ? 'text-success' : 'text-danger'">
                {{ mov.qty > 0 ? '+' + mov.qty : mov.qty }}
              </td>
              <td>{{ mov.deposit }}</td>
              <td>{{ mov.user }}</td>
              <td>{{ mov.reason }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <AppPagination
        class="mt-3"
        :current-page="currentPage"
        :total-pages="totalPages"
        @page-changed="changePage"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import AppPagination from '@/components/AppPagination.vue'



const movements = ref([
  { id: 1, date: '2024-01-15 10:30', type: 'ENTRADA', product: 'Laptop Dell XPS 13', lot: 'LOTO001', qty: 10, deposit: 'Almacén Central', user: 'Juan Pérez', reason: 'Compra #001' },
  { id: 2, date: '2024-01-15 14:15', type: 'SALIDA',  product: 'Mouse Logitech MX',   lot: 'LOTO002', qty: -5, deposit: 'Sucursal Norte',  user: 'María García', reason: 'Venta #045' },
  { id: 3, date: '2024-01-14 16:45', type: 'AJUSTE',  product: 'Teclado Mecánico',   lot: 'LOTO003', qty: 2, deposit: 'Almacén Central', user: 'Carlos López', reason: 'Diferencia inventario' },

])
// Por ahora mostramos todos, sin filtro por tipo
const filteredMovements = computed(() => movements.value)

// ─── paginación ───
const currentPage     = ref(1)
const itemsPerPage    = ref(5)  // filas por página
const totalPages      = computed(() =>
  Math.ceil(filteredMovements.value.length / itemsPerPage.value)
)
const pagedMovements  = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filteredMovements.value.slice(start, start + itemsPerPage.value)
})

// si en el futuro añades filtros, resetea la página:
watch(filteredMovements, () => { currentPage.value = 1 })

function changePage(page) {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
}


</script>
