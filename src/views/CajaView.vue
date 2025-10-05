<template>
  <AppNavbar />
  <div class="container mt-4" id="caja-view">
    <AppHeader title="Sistema de Caja" subtitle="Gestión de Tesorería">
      <template #buttons>
        <template v-if="cajaAbierta">
          <span class="badge bg-dark">Caja Abierta</span>
        </template>
      </template>
    </AppHeader>

    <!-- Acciones rápidas: siempre visibles cuando la caja está abierta -->
  <div v-if="cajaAbierta" class="quick-actions mt-3 mb-4">
      <router-link class="action-tile tile-success" to="/cobro-factura-venta" title="Registrar cobro de factura de venta">
        <div class="icon-circle"><i class="bi bi-graph-up"></i></div>
        <div class="tile-text">Cobro de Factura de Venta</div>
      </router-link>
      <router-link class="action-tile tile-danger" to="/pago-factura" title="Registrar pago a proveedores">
        <div class="icon-circle"><i class="bi bi-graph-down"></i></div>
        <div class="tile-text">Pago a Proveedores</div>
      </router-link>
      <router-link class="action-tile tile-primary" to="/ingreso-varios" title="Registrar ingreso varios">
        <div class="icon-circle"><i class="bi bi-plus-lg"></i></div>
        <div class="tile-text">Ingreso Varios</div>
      </router-link>
      <router-link class="action-tile tile-warning" to="/egreso-varios" title="Registrar egreso varios">
        <div class="icon-circle"><i class="bi bi-dash-lg"></i></div>
        <div class="tile-text">Egreso Varios</div>
      </router-link>
      <router-link class="action-tile tile-purple" to="/cobro-cliente-credito" title="Cobro a cliente con crédito">
        <div class="icon-circle"><i class="bi bi-credit-card"></i></div>
        <div class="tile-text">Cobro a Cliente Crédito</div>
      </router-link>
    </div>

    <!-- Se ve únicamente si la caja está CERRADA -->
    <div v-if="!cajaAbierta" class="text-center my-5">
      <div class="alert alert-info mx-auto" style="max-width: 500px;">
        <i class="bi bi-info-circle me-2"></i>
        <strong>Caja Cerrada</strong>
        <p class="mb-3 mt-2">No hay una caja abierta para el usuario actual. Debe abrir una caja para comenzar a realizar operaciones de tesorería.</p>
      </div>
      <button class="btn btn-success btn-lg" @click="openModalCaja">
        <i class="bi bi-unlock me-2"></i>Abrir Caja
      </button>
    </div>


    <div v-if="cajaAbierta" class="card p-3 mb-3">
      <h5><i class="bi bi-clock me-2"></i>Sesión Actual</h5>
      <div class="row mt-2">
        <div class="col-md-3"><strong>Usuario</strong><br>{{ cajaData.user }}</div>
        <div class="col-md-3"><strong>Apertura</strong><br>{{ formatoFecha(cajaData.apertura) }}</div>
        <div class="col-md-3"><strong>Monto Inicial</strong><br>{{ formateaNumero(cajaData.montoInicial) }}</div>
        <div class="col-md-3 text-end">
            <router-link
                class="btn btn-outline-secondary"
                :to="{ name: 'CerrarCaja' }"
                >
                Cerrar Caja
            </router-link>
        </div>
      </div>
    </div>

    <div v-if="cajaAbierta" class="row mb-4">
      <div class="col-md-3">
        <div class="card text-center p-3">
          <div class="text-success">Ingresos del Día</div>
          <h5 class="text-success">{{ formateaNumero(cajaData.ingresos_dia) }}</h5>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card text-center p-3">
          <div class="text-danger">Egresos del Día</div>
          <h5 class="text-danger">{{ formateaNumero(cajaData.egresos_dia) }}</h5>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card text-center p-3">
          <div class="text-primary">Saldo en Caja</div>
          <h5 class="text-primary">{{ formateaNumero(cajaData.saldo_en_caja) }}</h5>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card text-center p-3">
          <div class="text-warning">Facturas Pendientes</div>
          <h5 class="text-warning">{{ cajaData.facturas_pendientes }}</h5>
        </div>
      </div>
    </div>
    <!-- Movimientos Recientes -->
    <div v-if="cajaAbierta" class="mb-4">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <h5 class="fw-bold mb-0">Movimientos Recientes</h5>
        <router-link class="btn btn-dark" :to="{ name: 'MovimientosCaja' }">Ver Todos</router-link>
      </div>
      <div v-for="mov in movimientosRecientes" :key="mov.id" class="recent-mov-card mb-2 p-3 d-flex align-items-center justify-content-between rounded border">
        <div class="d-flex align-items-center">
            <span v-if="isPositive(mov)" class="me-2 fs-4" :class="getMovementIconClass(mov)"><i class="bi bi-graph-up"></i></span>
            <span v-else-if="isNegative(mov)" class="me-2 fs-4" :class="getMovementIconClass(mov)"><i class="bi bi-graph-down"></i></span>
            <span v-else class="me-2 fs-4" :class="getMovementIconClass(mov)"></span>
          <div>
              <span class="fw-bold" :class="getMovementIconClass(mov)">
                {{ movLabel(mov) }}
                <span v-if="mov.comprobante">#{{ mov.comprobante }}</span>
              </span>
            <span v-if="mov.comprobante" class="badge bg-light text-dark ms-2">Recibo: {{ mov.comprobante }}</span>
            <div class="text-muted small">{{ mov.descripcion }}</div>
          </div>
        </div>
        <div class="text-end">
          <div :class="getMovementIconClass(mov) + ' fw-bold'">
            {{ isPositive(mov) ? '+' : (isNegative(mov) ? '-' : '') }}Gs. {{ formateaNumero(mov.monto) }}
          </div>
          <div class="text-muted small">{{ formatFechaHora(mov.fecha) }}</div>
        </div>
      </div>
    </div>
    <div class="modal fade"
        :class="{ show: modalOpen }"
        :style="{ display: modalOpen ? 'block' : 'none' }"
        tabindex="-1" role="dialog" aria-modal="true">
      <div class="modal-dialog">
        
        <div class="modal-content">
          <form @submit.prevent="abrirCaja">
            <!-- Cabecera -->
            <div class="modal-header">
              <h5 class="modal-title">Apertura de Caja</h5>
              <button type="button" class="btn-close" @click="closeModalCaja" />
            </div>

            <!-- Cuerpo -->
            <div class="modal-body">
              <div class="mb-3">
                <label class="form-label">Fecha y hora</label>
                <input type="datetime-local"
                      class="form-control"
                      v-model="openForm.fechaApertura"
                      required />
              </div>

              <div class="mb-3">
                <label class="form-label">Monto inicial</label>
                <input type="number"
                      step="0.01"
                      class="form-control"
                      v-model.number="openForm.montoInicial"
                      required />
              </div>

              <div class="mb-3">
                <label class="form-label">Observación (opcional)</label>
                <input type="text"
                      class="form-control"
                      v-model="openForm.observacion" />
              </div>
            </div>

            <!-- Pie -->
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="closeModalCaja">
                Cancelar
              </button>
              <button type="submit" class="btn btn-primary">
                Abrir Caja
              </button>
            </div>
          </form>
        </div>
        
      </div>
    </div>
    <div v-if="modalOpen" class="modal-backdrop fade show"></div>

    
  </div>
</template>

<script setup>
import { ref,reactive } from 'vue'
import AppNavbar from '@/components/AppNavbar.vue'
import AppHeader from '@/components/AppHeader.vue'
import apiService from '@/services/apiService'
import { onMounted, computed } from 'vue'
import { useCashboxStore } from '@/stores/cashbox'

// Movimientos recientes
const movimientosRecientes = ref([])

async function fetchMovimientosRecientes() {
  try {
    const res = await apiService.get('/api/cashbox/user-operations?page=1&limit=5')
    if (res.data && res.data.success && Array.isArray(res.data.data)) {
      movimientosRecientes.value = res.data.data.map(mov => ({
        ...mov,
        monto: Number(mov.monto),
        fecha: mov.fecha
      }))
    }
  } catch (err) {
    console.error('Error al obtener movimientos recientes:', err)
  }
}




const cashboxStore = useCashboxStore()
const cajaAbierta = computed(() => cashboxStore.isOpen)
const cajaData    = computed(() => ({
  user        : cashboxStore.nombreUsuario,
  apertura    : cashboxStore.fechaApertura,
  montoInicial: cashboxStore.montoInicial,
  ingresos_dia: cashboxStore.igresos_dia,
  egresos_dia : cashboxStore.egresos_dia,
  saldo_en_caja: cashboxStore.saldo_en_caja,
  facturas_pendientes: cashboxStore.facturas_pendientes
}))
onMounted(() => {
  cashboxStore.fetchCurrentOpen()
  fetchMovimientosRecientes()
})

const modalOpen   = ref(false)

const openForm = reactive({
  fechaApertura: '',
  montoInicial : null,
  moneda       : 'PYG',
  observacion  : ''
})




function openModalCaja () {
  openForm.fechaApertura = nowLocalISO() // yyyy-MM-ddTHH:mm
  openForm.montoInicial  = null
  openForm.observacion   = ''
  modalOpen.value        = true
}

function closeModalCaja () {
  modalOpen.value = false
}




async function abrirCaja () {
  try {
    await apiService.post('/api/cashbox/open', {
      fecha_apertura: openForm.fechaApertura,
      monto_inicial : openForm.montoInicial,
      moneda        : openForm.moneda,
      observacion   : openForm.observacion
    })
    // refrescar estado global
    await cashboxStore.fetchCurrentOpen()
    modalOpen.value = false
  } catch (err) {
    console.error(err)
    alert('Error al abrir caja')
  }
}


// (Se removió el dropdown; acciones ahora están siempre visibles)

/* ---------- helpers de formato ---------- */
function formatoFecha (val) {
  if (!val) return ''
  return new Date(val).toLocaleString('es-PY')   // hora local – formato PY
}
function nowLocalISO () {
  const now    = new Date()
  const offset = now.getTimezoneOffset() * 60000 // min → ms
  const local  = new Date(now - offset)
  return local.toISOString().slice(0, 16)        // YYYY-MM-DDTHH:mm
}

function formateaNumero (n) {
  if (n === null || n === undefined) return ''
  return Number(n).toLocaleString('es-PY', { minimumFractionDigits: 0 })
}

function formatFechaHora(val) {
  if (!val) return ''
  const d = new Date(val)
  return d.toLocaleString('es-PY')
}

// helpers for movement display
function isPositive(mov) {
  // COBRO and INGRESO_VARIO are considered positive (green)
  return mov.tipo_movimiento === 'COBRO' || mov.tipo_movimiento === 'INGRESO_VARIO'
}

function isNegative(mov) {
  // PAGO and EGRESO_VARIO are considered negative (red)
  return mov.tipo_movimiento === 'PAGO' || mov.tipo_movimiento === 'EGRESO_VARIO'
}

/*function isNeutral(mov) {
  // APERTURA is considered neutral
  return mov.tipo_movimiento === 'APERTURA'
}*/

function getMovementIconClass(mov) {
  switch (mov.tipo_movimiento) {
    case 'COBRO':
    case 'INGRESO_VARIO':
      return 'text-success'
    case 'PAGO':
    case 'EGRESO_VARIO':
      return 'text-danger'
    case 'APERTURA':
      return 'text-secondary'
    default:
      return isPositive(mov) ? 'text-success' : 'text-danger'
  }
}

function movLabel(mov) {
  if (mov.tipo_movimiento === 'COBRO') return mov.tipo_operacion === 'VENTA' ? 'Cobro Factura' : 'Cobro'
  if (mov.tipo_movimiento === 'INGRESO_VARIO') return 'Ingreso Varios'
  if (mov.tipo_movimiento === 'PAGO') return 'Pago a Proveedores'
  if (mov.tipo_movimiento === 'EGRESO_VARIO') return 'Egreso Varios'
  if (mov.tipo_movimiento === 'APERTURA') return 'Apertura de Caja'
  return mov.tipo_movimiento
}


</script>

<style scoped>
.recent-mov-card {
  background: #fff;
  border: 1px solid #e5e5e5;
  box-shadow: 0 1px 2px rgba(0,0,0,0.03);
  transition: box-shadow 0.2s;
}
.recent-mov-card:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}
</style>

<style scoped>
#caja-view .card {
  border-radius: 0.5rem;
}
#caja-view .nav-link.active {
  font-weight: bold;
}

/* Acciones rápidas como “tarjetas/botones” */
.quick-actions {
  display: grid;
  gap: 14px;
  grid-template-columns: 1fr;
}
@media (min-width: 576px) {
  .quick-actions { grid-template-columns: repeat(2, 1fr); }
}
@media (min-width: 768px) {
  .quick-actions { grid-template-columns: repeat(3, 1fr); }
}
@media (min-width: 992px) {
  .quick-actions { grid-template-columns: repeat(4, 1fr); }
}
@media (min-width: 1200px) {
  .quick-actions { grid-template-columns: repeat(5, 1fr); }
}

.action-tile {
  /* variables por defecto */
  --tile-bg: #f8f9fa;
  --tile-border: #e5e5e5;
  --tile-text: #212529;
  --tile-icon-bg: #eef1f4;

  background: var(--tile-bg);
  border: 1px solid var(--tile-border);
  border-radius: 10px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.03);
  padding: 18px 16px;
  height: 96px;
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: var(--tile-text);
  transition: transform .15s ease, box-shadow .15s ease, border-color .15s ease;
}
.action-tile:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  text-decoration: none;
  border-color: rgba(0,0,0,0.08);
}
.action-tile:focus-visible {
  outline: 3px solid rgba(13,110,253,.35);
  outline-offset: 2px;
}

.icon-circle {
  width: 40px;
  height: 40px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--tile-icon-bg);
  font-size: 1.1rem;
}

.tile-text {
  font-weight: 600;
  line-height: 1.2;
}

/* Variantes “soft” */
.tile-success {
  --tile-bg: #f3fcf5;
  --tile-border: #d7f0dc;
  --tile-text: #146c43;
  --tile-icon-bg: #e7f8ea;
}
.tile-danger {
  --tile-bg: #fff4f4;
  --tile-border: #f5d6d6;
  --tile-text: #b02a37;
  --tile-icon-bg: #ffe9e9;
}
.tile-primary {
  --tile-bg: #f2f6ff;
  --tile-border: #d7e3ff;
  --tile-text: #0d6efd;
  --tile-icon-bg: #e7efff;
}
.tile-warning {
  --tile-bg: #fff9ed;
  --tile-border: #ffe4b8;
  --tile-text: #b68200;
  --tile-icon-bg: #fff0cc;
}
.tile-purple {
  --tile-bg: #f7f2ff;
  --tile-border: #e4d6ff;
  --tile-text: #6f42c1;
  --tile-icon-bg: #eee4ff;
}

.text-purple { color: #6f42c1; }
</style>
