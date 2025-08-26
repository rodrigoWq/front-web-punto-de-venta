<template>
  <AppNavbar />
  <div class="container mt-4">
    <AppHeader
      title="Cobro de Factura de Venta"
      subtitle="Registrar cobro de facturas emitidas"
    >
      <template #buttons>
        <router-link class="btn btn-outline-secondary" :to="{ name: 'Caja' }">
          <i class="bi bi-arrow-left me-1"></i>Volver
        </router-link>
      </template>
    </AppHeader>

    <div class="row mt-4">
      <!-- 1) Facturas Pendientes -->
      <div class="col-12 col-md-4">
        <div class="card p-3 h-100">
          <h5><i class="bi bi-receipt me-2"></i>Facturas Pendientes</h5>
          <p class="text-muted">Seleccione las facturas a cobrar</p>
          <input
            v-model="searchTerm"
            type="text"
            class="form-control mb-3"
            placeholder="Buscar por número o cliente..."
          />
          <div
            class="list-group list-group-flush"
            style="max-height: 400px; overflow-y: auto;"
          >
            <div
              v-for="inv in filteredInvoices"
              :key="inv.id"
              class="list-group-item"
            >
              <div class="d-flex justify-content-between align-items-start">
                <div>
                  <div>{{ inv.number }}</div>
                  <div><small>{{ inv.client }}</small></div>
                  <div><small class="text-muted">{{ inv.date }}</small></div>
                </div>
                <div class="text-end">
                  <div class="fw-bold">{{ formatCurrency(inv.total) }}</div>
                  <span
                    class="badge"
                    :class="inv.status === 'Pendiente' ? 'bg-danger' : 'bg-secondary'"
                    >{{ inv.status }}</span
                  >
                </div>
              </div>
              <button
                class="btn btn-dark w-100 mt-2"
                :disabled="isInvoiceSelected(inv) || hasSelection"
                @click="addInvoice(inv)"
              >
                {{ isInvoiceSelected(inv) ? 'Agregada' : 'Agregar' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 2) Facturas Seleccionadas -->
      <div class="col-12 col-md-4">
        <div class="card p-3 h-100">
          <h5><i class="bi bi-check2-square me-2"></i>Facturas Seleccionadas</h5>
          <p class="text-muted">Facturas que va a cobrar</p>
          <div
            class="list-group list-group-flush mb-3"
            style="max-height: 400px; overflow-y: auto;"
          >
            <div
              v-for="inv in selectedInvoices"
              :key="inv.id"
              class="list-group-item d-flex justify-content-between align-items-center"
            >
              <div>
                <div>{{ inv.number }}</div>
                <div><small class="text-muted">{{ inv.client }}</small></div>
              </div>
              <div class="d-flex align-items-center">
                <div class="me-3 fw-bold">{{ formatCurrency(inv.total) }}</div>
                <button
                  class="btn btn-outline-danger btn-sm"
                  @click="removeInvoice(inv)"
                >
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </div>
          </div>
          <div class="d-flex justify-content-end fw-bold">
            Total a Cobrar:
            <span class="text-success ms-2">{{ formatCurrency(totalToCharge) }}</span>
          </div>
        </div>
      </div>

      <!-- 3) Formas de Pago -->
      <div class="col-12 col-md-4">
        <PaymentForms
          :total="totalToCharge"
          :types="paymentTypes"
          v-model:payments="payments"
        />
        <button 
          class="btn btn-dark w-100 mt-3"
          :disabled="!canAddPayment"
          @click="submitCobro"
        >
          <i class="bi bi-check2-circle me-1"></i>Registrar Cobro
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import AppNavbar from '@/components/AppNavbar.vue'
import AppHeader from '@/components/AppHeader.vue'
import PaymentForms from '@/components/PaymentForms.vue'
import apiService from '@/services/apiService.js'
import { useCashboxStore } from '@/stores/cashbox'


// Search term and invoices (populated from backend)
const searchTerm = ref('')
const invoices = reactive([])
const selectedInvoices = reactive([])

//  ➕ Esto indica si ya hay al menos 1 factura seleccionada
const hasSelection = computed(() => selectedInvoices.length > 0)

// Formas de pago
const payments = ref([])
const paymentTypes = ['Efectivo', 'Tarjeta', 'Cheque', 'Transferencia', 'Credito']

// Filtrado de facturas
const filteredInvoices = computed(() =>
  invoices.filter(inv => {
    const term = (searchTerm.value || '').toLowerCase()
    return (inv.number || '').toLowerCase().includes(term) || (inv.client || '').toLowerCase().includes(term)
  })
)

// Selección de facturas
function isInvoiceSelected(inv) {
  return selectedInvoices.some(i => i.id === inv.id)
}
function addInvoice(inv) {
  if (!isInvoiceSelected(inv)) {
    selectedInvoices.push(inv)
  }
}

// Cálculo de totales
const totalToCharge = computed(() =>
  selectedInvoices.reduce((sum, inv) => sum + inv.total, 0)
)





function removeInvoice(inv) {
  const idx = selectedInvoices.findIndex(i => i.id === inv.id)
  if (idx !== -1) selectedInvoices.splice(idx, 1)
}

const canAddPayment = computed(() =>
  payments.value.length > 0
)

// Verificar si se seleccionó Crédito
const hasCredito = computed(() =>
  payments.value.some(p => (p.type || '').toUpperCase() === 'CREDITO')
)

const cashboxStore = useCashboxStore()

async function submitCobro() {
  if (selectedInvoices.length === 0) {
    alert('Selecciona una factura para cobrar.');
    return;
  }

  // Determinar forma de operación según si hay Crédito seleccionado
  const formaOperacion = hasCredito.value ? 'CREDITO' : 'CONTADO'

  // Usamos la primera factura seleccionada (UI restringe a 1)
  const movimientoId = selectedInvoices[0].id

  // Si es crédito, enviar pagos vacío; si no, mapear pagos normalmente
  const pagos = hasCredito.value ? [] : (payments.value || []).map(p => {
    // soportar varias formas de nombrar campos según el componente
    const metodo = (p.metodo_pago || p.metodo || p.type || p.name || '').toString().toUpperCase()
    const monto = Number(p.monto ?? p.amount ?? p.value ?? 0)
    const referencia = p.referencia_externa ?? p.referencia ?? p.reference ?? p.ref ?? null
    return {
      metodo_pago: metodo,
      monto: monto,
      referencia_externa: referencia === undefined ? null : referencia
    }
  })

  const payload = {
    movimiento_id: movimientoId,
    forma_operacion: formaOperacion,
    pagos: pagos
  }

  // Loguear payload antes de enviar (como pidió)
  console.log('Payload -> /api/cashbox/collect-sale', payload)

  try {
    const resp = await apiService.post('/api/cashbox/collect-sale', payload)
    console.log('Respuesta collect-sale:', resp && resp.data)
    alert('Cobro registrado correctamente.')

    // limpiar estado: quitar factura seleccionada y pagos
    selectedInvoices.splice(0, selectedInvoices.length)
    payments.value = []

    // Refresh: actualizar lista de pendientes y estado global de caja
    await fetchPendingCollections()
    if (cashboxStore && typeof cashboxStore.fetchCurrentOpen === 'function') {
      await cashboxStore.fetchCurrentOpen()
    }
  } catch (err) {
    console.error('Error enviando collect-sale:', err)
    alert('Error al registrar el cobro. Revisa la consola para más detalles.')
  }
}

// Fetch pending collections from backend and populate invoices
async function fetchPendingCollections() {
  try {
    const res = await apiService.get('/api/cashbox/pending-collections')
    const payload = res.data
    if (payload && payload.success && Array.isArray(payload.data)) {
      const mapped = payload.data.map(item => ({
        id: item.movimiento_id,
        number: item.nro_comprobante_origen,
        client: item.nombre_razon_social,
        date: new Date(item.fecha_movimiento).toLocaleString(),
        total: Number(item.monto_total)
        // note: status removed because backend doesn't provide it
      }))
      // replace contents of reactive array
      invoices.splice(0, invoices.length, ...mapped)
    } else {
      console.warn('Unexpected response from pending-collections', payload)
    }
  } catch (err) {
    console.error('Error fetching pending collections:', err)
  }
}

onMounted(() => { fetchPendingCollections() })

// Formateo de moneda
function formatCurrency(value) {
  return new Intl.NumberFormat('es-PY', {
    style: 'currency',
    currency: 'PYG'
  }).format(value)
}
</script>
<style scoped>
/* Asegura que la lista sea scrollable y no crezca demasiado */
.list-group {
  /* max-height ya definido inline, opcional moverlo aquí */
  max-height: 200px;
  overflow-y: auto;
}
</style>
