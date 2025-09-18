<template>
  <AppNavbar />
  <div class="container-xl px-4" style="margin-top: 20px;">
    <div class="d-flex justify-content-between align-items-start mb-3">
      <div>
        <h2 class="fw-bold">Movimientos de Caja</h2>
        <div class="text-muted">Gestión de ingresos, egresos y transferencias</div>
      </div>
      <router-link class="btn btn-outline-dark" :to="{ name: 'Caja' }">← Volver a Caja</router-link>
    </div>

    <div class="card mb-4 p-3">
      <h5>Filtros</h5>
      <div class="row g-2 align-items-center">
        <div class="col-md-4">
          <input v-model="searchTerm" type="search" class="form-control" placeholder="Buscar por descripción, recibo o cliente" />
        </div>
        <div class="col-md-3">
          <select v-model="typeFilter" class="form-select">
            <option value="all">Todos los tipos</option>
            <option value="COBRO">COBRO</option>
            <option value="PAGO">PAGO A PROVEEDORES</option>
            <option value="INGRESO_VARIO">INGRESO_VARIO</option>
            <option value="EGRESO_VARIO">EGRESO_VARIO</option>
            <option value="APERTURA">APERTURA</option>
          </select>
        </div>
        <div class="col-md-3">
          <select v-model="stateFilter" class="form-select">
            <option value="all">Todos los estados</option>
            <option value="PENDIENTE">PENDIENTE</option>
            <option value="ATENDIDO">ATENDIDO</option>
          </select>
        </div>
        <div class="col-md-auto">
          <button class="btn btn-outline-secondary" @click="clearFilters">Limpiar Filtros</button>
        </div>
      </div>
    </div>

    <div class="card mb-4 p-3">
      <h5>Lista de Movimientos <small class="text-muted">{{ total }} movimiento(s) encontrado(s)</small></h5>
      <div class="table-responsive">
        <table class="table align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th>ID</th>
              <th>Tipo Movimiento</th>
              <th>Tipo Operación</th>
              <th>Forma</th>
              <th class="text-end">Monto</th>
              <th>Descripción</th>
              <th>Comprobante</th>
              <th>Módulo</th>
              <th>Usuario</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="mov in displayedMovements" :key="mov.id">
              <td>{{ mov.id }}</td>
              <td>
                <span :class="['badge', getBadgeClass(mov.tipo_movimiento)]">{{ getDisplayMovementType(mov.tipo_movimiento) }}</span>
              </td>
              <td>{{ mov.tipo_operacion }}</td>
              <td>{{ mov.forma || '-' }}</td>
              <td class="text-end" :class="getMontoClass(mov)">{{ getMontoPrefix(mov) }}Gs. {{ formateaNumero(mov.monto) }}</td>
              <td>{{ mov.descripcion }}</td>
              <td><span v-if="mov.comprobante" class="badge bg-light text-dark">{{ mov.comprobante }}</span></td>
              <td>{{ mov.modulo }}</td>
              <td>{{ mov.nombre }}</td>
              <td>{{ formatFechaHora(mov.fecha) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <AppPagination :current-page="page" :total-pages="pages" @page-changed="onPageChanged" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AppPagination from '@/components/AppPagination.vue'
import apiService from '@/services/apiService.js'
import AppNavbar from '@/components/AppNavbar.vue'

const searchTerm = ref('')
const typeFilter = ref('all')
const stateFilter = ref('all')
const page = ref(1)
const limit = ref(10)
const pages = ref(1)
const total = ref(0)
const movements = ref([])

async function fetchMovements() {
  try {
    const res = await apiService.get(`/api/cashbox/user-operations?page=${page.value}&limit=${limit.value}`)
    if (res.data && res.data.success) {
      movements.value = res.data.data.map(m => ({ ...m, monto: Number(m.monto) }))
      pages.value = res.data.pagination?.pages || 1
      total.value = res.data.pagination?.total || movements.value.length
    }
  } catch (err) {
    console.error('Error fetching movimientos:', err)
  }
}

onMounted(fetchMovements)

function onPageChanged(p) {
  page.value = p
  fetchMovements()
}

function clearFilters() {
  searchTerm.value = ''
  typeFilter.value = 'all'
  stateFilter.value = 'all'
}

const displayedMovements = computed(() => {
  return movements.value.filter(m => {
    const term = (searchTerm.value || '').toLowerCase()
    if (term) {
      const hay = (m.descripcion || '').toLowerCase().includes(term) || (m.comprobante || '').toLowerCase().includes(term) || (m.nombre || '').toLowerCase().includes(term)
      if (!hay) return false
    }
    if (typeFilter.value !== 'all' && m.tipo_movimiento !== typeFilter.value) return false
    if (stateFilter.value !== 'all' && m.estado !== stateFilter.value) return false
    return true
  })
})

function isPositive(mov) {
  return mov.tipo_movimiento === 'COBRO' || mov.tipo_movimiento === 'INGRESO_VARIO'
}

function isNegative(mov) {
  return mov.tipo_movimiento === 'PAGO' || mov.tipo_movimiento === 'EGRESO_VARIO'
}


function getMontoClass(mov) {
  if (isPositive(mov)) return 'text-success'
  if (isNegative(mov)) return 'text-danger'
  return 'text-secondary' // neutral for APERTURA
}

function getMontoPrefix(mov) {
  if (isPositive(mov)) return '+'
  if (isNegative(mov)) return '-'
  return '' // no prefix for APERTURA
}

function getBadgeClass(tipoMovimiento) {
  switch (tipoMovimiento) {
    case 'COBRO':
    case 'INGRESO_VARIO':
      return 'bg-success'
    case 'PAGO':
    case 'EGRESO_VARIO':
      return 'bg-danger'
    case 'APERTURA':
      return 'bg-secondary'
    default:
      return 'bg-secondary'
  }
}

function getDisplayMovementType(tipoMovimiento) {
  switch (tipoMovimiento) {
    case 'PAGO':
      return 'PAGO A PROVEEDORES'
    default:
      return tipoMovimiento
  }
}

function formateaNumero(n) {
  if (n === null || n === undefined) return ''
  return Number(n).toLocaleString('es-PY', { minimumFractionDigits: 0 })
}

function formatFechaHora(val) {
  if (!val) return ''
  return new Date(val).toLocaleString('es-PY')
}
</script>

<style scoped>
.table td, .table th { vertical-align: middle; }
</style>
