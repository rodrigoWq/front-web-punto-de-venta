<template>
  <AppNavbar />
  <div class="container mt-4" id="caja-view">
    <AppHeader title="Sistema de Caja" subtitle="Gestión de Tesorería">
      <template #buttons>
        <template v-if="cajaAbierta">
          <span class="badge bg-dark me-2">Caja Abierta</span>
          <div class="btn-group" ref="dropdownGroup">
            <button
              type="button"
              class="btn btn-primary dropdown-toggle"
              :aria-expanded="isOpen"
              @click="toggleDropdown"
            >
              + Nuevo Movimiento
            </button>
            <ul class="dropdown-menu" :class="{ show: isOpen }">
              <li>
                <a class="dropdown-item" href="#">
                  <router-link class="nav-link" to="/cobro-factura-venta">
                    <i class="bi bi-graph-up text-success me-2"></i>Cobro de Factura de Venta
                  </router-link>
                  
                </a>
              </li>
              <li>
                <a class="dropdown-item" href="#">
                  <router-link class="nav-link" to="/pago-factura">
                    <i class="bi bi-graph-down text-danger me-2"></i>Pago de Factura
                  </router-link>
                </a>
              </li>
              <li>
                <a class="dropdown-item" href="#">
                  <router-link class="nav-link" to="/ingreso-varios">
                    <i class="bi bi-plus-lg text-primary me-2"></i>Ingreso Varios
                  </router-link>               
                </a>
              </li>
              <li>
                <a class="dropdown-item" href="#">
                  <router-link class="nav-link" to="/egreso-varios">
                    <i class="bi bi-dash-lg text-warning me-2"></i>Egreso Varios
                  </router-link>
                </a>
              </li>
              <li>
                <a class="dropdown-item" href="#">
                  <router-link class="nav-link" to="/cobro-cliente-credito">
                    <i class="bi bi-credit-card text-purple me-2"></i>Cobro a Cliente Crédito
                  </router-link>
                </a>
              </li>
            </ul>
          </div>
        </template>
      </template>
    </AppHeader>

    <!-- Se ve únicamente si la caja está CERRADA -->
    <div v-if="!cajaAbierta" class="text-center my-5">
      <button class="btn btn-success btn-lg" @click="openModalCaja">
        Abrir Caja
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
          <h5 class="text-success">Gs. 150.000</h5>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card text-center p-3">
          <div class="text-danger">Egresos del Día</div>
          <h5 class="text-danger">Gs. 75.000</h5>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card text-center p-3">
          <div class="text-primary">Saldo en Caja</div>
          <h5 class="text-primary">Gs. 575.000</h5>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card text-center p-3">
          <div class="text-warning">Facturas Pendientes</div>
          <h5 class="text-warning">5</h5>
        </div>
      </div>
    </div>

    <ul class="nav nav-tabs">
      <li class="nav-item">
        <a class="nav-link active" href="#">Movimientos</a>
      </li>
      <li class="nav-item">
        <a class="nav-link" href="#">Recibos</a>
      </li>
      <li class="nav-item">
        <a class="nav-link" href="#">Reportes</a>
      </li>
      <li class="nav-item">
        <a class="nav-link" href="#">Configuración</a>
      </li>
    </ul>

    <div class="mt-3">
      <!-- Aquí luego agregaremos la tabla de movimientos -->
      <p class="text-muted">Seleccione una pestaña para visualizar el contenido.</p>
    </div>

    <!-- Modal de Apertura de Caja -->
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




const cashboxStore = useCashboxStore()
const cajaAbierta = computed(() => cashboxStore.isOpen)
const cajaData    = computed(() => ({
  user        : cashboxStore.nombreUsuario,
  apertura    : cashboxStore.fechaApertura,
  montoInicial: cashboxStore.montoInicial
}))
onMounted(() => {
  cashboxStore.fetchCurrentOpen()
})

const modalOpen   = ref(false)
const isOpen      = ref(false)

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




function toggleDropdown() {
  isOpen.value = !isOpen.value
}

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


</script>

<style scoped>
#caja-view .card {
  border-radius: 0.5rem;
}
#caja-view .nav-link.active {
  font-weight: bold;
}
.dropdown-menu.show {
  display: block;
  position: absolute;
  z-index: 1050;
}
/* Asegúrate de que el contenedor btn-group sea relativo */
.btn-group {
  position: relative;
}

/* Ubica el dropdown 100% abajo del botón */
.dropdown-menu {
  top: 100%;
  left: 0;
  margin-top: 0.25rem; /* espaciado pequeño */
}
</style>
