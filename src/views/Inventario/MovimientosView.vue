<template>
  <div class="container-xl px-4">
    <!-- Header -->
    <div class="row">
      <div class="col-12">
        <div class="d-flex justify-content-between align-items-center mb-4 mt-2">
          <h2 class="fw-bold mb-0">Movimientos de Inventario</h2>
          <button class="btn btn-dark d-flex align-items-center" @click="openCreateModal">
            <i class="bi bi-plus-lg me-2"></i> Nuevo Movimiento
          </button>
        </div>
      </div>
    </div>

    <!-- Filtros básicos -->
    <div class="mb-3 d-flex flex-wrap align-items-end gap-2">
      <div class="btn-group me-2" role="group" aria-label="Filtro por tipo">
  <button class="btn btn-sm" :class="!filters.tipo ? 'btn-dark' : 'btn-outline-secondary'" @click="setTipo(null)">Todos</button>
  <button class="btn btn-sm" :class="filters.tipo==='ENTRADA' ? 'btn-dark' : 'btn-outline-secondary'" @click="setTipo('ENTRADA')">Entradas</button>
  <button class="btn btn-sm" :class="filters.tipo==='SALIDA' ? 'btn-dark' : 'btn-outline-secondary'" @click="setTipo('SALIDA')">Salidas</button>
  <button class="btn btn-sm" :class="filters.tipo==='AJUSTE' ? 'btn-dark' : 'btn-outline-secondary'" @click="setTipo('AJUSTE')">Ajustes</button>
      </div>

      <div class="row g-2 w-100">
  <div class="col-6 col-md-3 col-lg-2">
          <label class="form-label mb-1">Desde</label>
          <input type="text" class="form-control form-control-sm" v-model="filters.desde" placeholder="dd/mm/yyyy" pattern="\d{2}/\d{2}/\d{4}" />
        </div>
  <div class="col-6 col-md-3 col-lg-2">
          <label class="form-label mb-1">Hasta</label>
          <input type="text" class="form-control form-control-sm" v-model="filters.hasta" placeholder="dd/mm/yyyy" pattern="\d{2}/\d{2}/\d{4}" />
        </div>
        <div class="col-12 col-md-6 col-lg-4 d-flex align-items-end">
          <div class="d-flex gap-2 w-100">
            <button class="btn btn-sm btn-outline-secondary flex-fill" @click="applyFilters">Buscar</button>
            <button class="btn btn-sm btn-outline-danger" @click="clearFilters">Limpiar</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabla -->
    <div class="bg-white rounded shadow-sm p-4">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <div>
          <small class="text-muted">Total: {{ total }}</small>
        </div>
        <div class="d-flex align-items-center gap-2">
          <label class="form-label mb-0 me-2"><small>Filas</small></label>
          <select class="form-select form-select-sm" style="width:auto" v-model.number="itemsPerPage" @change="changePageSize">
            <option :value="10">10</option>
            <option :value="20">20</option>
            <option :value="50">50</option>
          </select>
        </div>
      </div>

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
            <tr v-if="loading">
              <td colspan="8" class="text-center py-4">
                <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Cargando...
              </td>
            </tr>
            <tr v-else-if="!movements.length">
              <td colspan="8" class="text-center py-4 text-muted">Sin resultados</td>
            </tr>
            <tr v-else v-for="mov in movements" :key="mov.movimiento_id">
              <td>{{ formatDate(mov.creado_en) }}</td>
              <td>
                <span :class="[
                    'badge rounded-pill px-3 py-2',
                    mov.tipo_movimiento === 'ENTRADA'
                      ? 'bg-success text-white fw-bold'
                      : mov.tipo_movimiento === 'SALIDA'
                        ? 'bg-danger text-white fw-bold'
                        : 'bg-light text-dark fw-bold'
                  ]">
                  {{ mov.tipo_movimiento }}
                </span>
              </td>
              <td>{{ mov.producto_nombre }}</td>
              <td>{{ mov.lote_id }}</td>
              <td :class="qtyClass(mov)">
                {{ qtyText(mov) }}
              </td>
              <td>{{ mov.deposito_nombre }}</td>
              <td>{{ mov.creado_por_nombre }}</td>
              <td>{{ mov.motivo }}</td>
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

    <!-- Modal: Nuevo Movimiento (custom) -->
    <div v-if="showCreateModal">
      <div class="mv-backdrop" @click="closeCreateModal"></div>
      <div class="mv-modal" role="dialog" @click.stop>
        <div class="mv-header d-flex justify-content-between align-items-center">
          <h5 class="mb-0">Mover producto entre depósitos</h5>
          <button type="button" class="btn btn-sm btn-outline-secondary" @click="closeCreateModal" aria-label="Close">✕</button>
        </div>
        <div class="mv-body">
          <form @submit.prevent>
            <div class="row g-2">
              <div class="col-12 col-md-6">
                <label class="form-label">Producto ID</label>
                <input type="number" class="form-control" v-model.number="newMovement.producto_id" required />
              </div>
              <div class="col-12 col-md-6">
                <label class="form-label">Lote ID</label>
                <input type="number" class="form-control" v-model.number="newMovement.lote_id" required />
              </div>
              <div class="col-12 col-md-6">
                <label class="form-label">Cantidad</label>
                <input type="number" min="1" class="form-control" v-model.number="newMovement.cantidad" required />
              </div>
              <div class="col-12 col-md-6">
                <label class="form-label">Motivo</label>
                <input type="text" class="form-control" v-model="newMovement.motivo" placeholder="Reabastecer Mostrador" />
              </div>
              <div class="col-12 col-md-6">
                <label class="form-label">Depósito Origen ID</label>
                <input type="number" class="form-control" v-model.number="newMovement.deposito_origen_id" required />
              </div>
              <div class="col-12 col-md-6">
                <label class="form-label">Depósito Destino ID</label>
                <input type="number" class="form-control" v-model.number="newMovement.deposito_destino_id" required />
              </div>
            </div>
          </form>
          <div v-if="createError" class="alert alert-danger mt-3">
            {{ createError }}
          </div>
        </div>
        <div class="mv-footer d-flex justify-content-end gap-2">
          <button class="btn btn-outline-secondary" :disabled="creating" @click="closeCreateModal">Cancelar</button>
          <button class="btn btn-dark" :disabled="creating" @click="submitCreate">
            <span v-if="creating" class="spinner-border spinner-border-sm me-2"></span>
            Guardar
          </button>
        </div>
      </div>
    </div>
  </div>
  
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import AppPagination from '@/components/AppPagination.vue'
import api from '@/services/apiService'

// Estado de lista y filtros
const movements = ref([])
const total = ref(0)
const loading = ref(false)

const currentPage = ref(1)
const itemsPerPage = ref(20)
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / itemsPerPage.value)))

const filters = reactive({
  tipo: null, // ENTRADA | SALIDA | AJUSTE | null
  desde: null,
  hasta: null,
})

function setTipo(value) {
  filters.tipo = value
  // Buscar inmediatamente al cambiar el tipo
  applyFilters()
}

const dtfPy = new Intl.DateTimeFormat('es-PY', {
  timeZone: 'America/Asuncion',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

function formatDate(iso) {
  if (!iso) return '-'
  try {
    const d = new Date(iso)
    return dtfPy.format(d)
  } catch {
    return iso
  }
}

function convertDateToISO(ddmmyyyy) {
  if (!ddmmyyyy || !ddmmyyyy.match(/^\d{2}\/\d{2}\/\d{4}$/)) return null
  const [day, month, year] = ddmmyyyy.split('/')
  return `${year}-${month}-${day}`
}

function qtyClass(mov) {
  const tipo = mov?.tipo_movimiento
  if (tipo === 'ENTRADA') return 'text-success'
  if (tipo === 'SALIDA') return 'text-danger'
  return 'text-secondary'
}

function qtyText(mov) {
  const tipo = mov?.tipo_movimiento
  const val = Math.abs(Number(mov?.cantidad || 0))
  if (tipo === 'ENTRADA') return `+${val}`
  if (tipo === 'SALIDA') return `-${val}`
  // AJUSTE u otros: sin signo
  return String(val)
}

async function fetchMovements() {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      pageSize: itemsPerPage.value,
    }
    if (filters.tipo) params.tipo = filters.tipo
    // Nota: el backend requiere 'desde' y 'hasta' en minúsculas
    const desdeISO = convertDateToISO(filters.desde)
    const hastaISO = convertDateToISO(filters.hasta)
    if (desdeISO) params.desde = desdeISO
    if (hastaISO) params.hasta = hastaISO

    const { data } = await api.get('/api/inventory/warehouse/movements', params)
    movements.value = Array.isArray(data?.items) ? data.items : []
    total.value = Number.isFinite(data?.total) ? data.total : movements.value.length
    // Opcional: alinear currentPage si backend lo devuelve
    if (data?.page) currentPage.value = data.page
  } catch (e) {
    // apiService ya muestra alert con mensaje del backend
    movements.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

function changePage(page) {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  fetchMovements()
}

function changePageSize() {
  currentPage.value = 1
  fetchMovements()
}

function applyFilters() {
  currentPage.value = 1
  fetchMovements()
}

function clearFilters() {
  // Limpiar fechas y tipo
  filters.desde = null
  filters.hasta = null
  filters.tipo = null
  currentPage.value = 1
  fetchMovements()
}

onMounted(fetchMovements)

// ─── Crear nuevo movimiento (mover producto entre depósitos) ───
const showCreateModal = ref(false)
const creating = ref(false)
const createError = ref('')
const newMovement = reactive({
  producto_id: null,
  lote_id: null,
  cantidad: 1,
  deposito_origen_id: null,
  deposito_destino_id: null,
  motivo: ''
})

function resetCreateForm() {
  newMovement.producto_id = null
  newMovement.lote_id = null
  newMovement.cantidad = 1
  newMovement.deposito_origen_id = null
  newMovement.deposito_destino_id = null
  newMovement.motivo = ''
  createError.value = ''
}

function openCreateModal() {
  resetCreateForm()
  showCreateModal.value = true
}

function closeCreateModal() {
  showCreateModal.value = false
}

function validateCreate() {
  if (!newMovement.producto_id) return 'Producto ID es requerido'
  if (!newMovement.lote_id) return 'Lote ID es requerido'
  if (!newMovement.deposito_origen_id) return 'Depósito origen es requerido'
  if (!newMovement.deposito_destino_id) return 'Depósito destino es requerido'
  if (newMovement.deposito_origen_id === newMovement.deposito_destino_id) return 'Origen y destino deben ser diferentes'
  if (!newMovement.cantidad || newMovement.cantidad <= 0) return 'Cantidad debe ser mayor a 0'
  return ''
}

async function submitCreate() {
  createError.value = validateCreate()
  if (createError.value) return
  creating.value = true
  try {
    const payload = {
      producto_id: newMovement.producto_id,
      lote_id: newMovement.lote_id,
      cantidad: newMovement.cantidad,
      deposito_origen_id: newMovement.deposito_origen_id,
      deposito_destino_id: newMovement.deposito_destino_id,
      motivo: newMovement.motivo || undefined,
    }
    await api.post('/api/inventory/warehouses/product/move', payload)
    closeCreateModal()
    // refrescar lista
    fetchMovements()
  } catch (e) {
    // apiService ya muestra alert; mantenemos un mensaje local por si acaso
    createError.value = e?.response?.data?.message || 'Error al crear el movimiento'
  } finally {
    creating.value = false
  }
}
</script>

<style scoped>
/* Ajustes suaves para este view */
.mv-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  z-index: 1040;
}
.mv-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #fff;
  width: min(720px, 95vw);
  max-height: 90vh;
  overflow: auto;
  border-radius: .5rem;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  z-index: 1050;
}
.mv-header { padding: 1rem 1rem 0 1rem; }
.mv-body { padding: 1rem; }
.mv-footer { padding: 0 1rem 1rem 1rem; }
</style>
