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

    <!-- Listado horizontal de cobros pendientes -->
    <div class="card p-3 mt-4">
      <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-3 gap-2">
        <div class="d-flex align-items-center gap-2">
          <i class="bi bi-receipt fs-5"></i>
          <h5 class="mb-0">Facturas Pendientes</h5>
        </div>
        <div class="ms-md-auto" style="max-width: 360px; width: 100%;">
          <input
            v-model="searchTerm"
            type="text"
            class="form-control"
            placeholder="Buscar por número o cliente..."
          />
        </div>
      </div>

      <div class="table-responsive">
        <table class="table table-hover align-middle">
          <thead class="table-light">
            <tr>
              <th style="min-width: 160px;">N° de Comprobante</th>
              <th>Cliente</th>
              <th style="min-width: 160px;">Fecha</th>
              <th class="text-end" style="min-width: 120px;">Monto Total</th>
              <th class="text-center" style="min-width: 120px;">Estado</th>
              <th class="text-end" style="min-width: 340px;">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="inv in filteredInvoices" :key="inv.id">
              <td class="fw-semibold">{{ inv.number }}</td>
              <td>
                <div>{{ inv.client }}</div>
              </td>
              <td><small class="text-muted">{{ inv.date }}</small></td>
              <td class="text-end fw-bold">{{ formatCurrency(inv.total) }}</td>
              <td class="text-center">
                <span class="badge bg-danger">Pendiente</span>
              </td>
              <td class="text-end">
                <div class="d-inline-flex gap-2">
                  <button
                    class="btn btn-outline-primary btn-sm"
                    title="Ver detalle"
                    @click="openDetalle(inv)"
                  >
                    <i class="bi bi-eye me-1"></i>Ver detalle
                  </button>
                  <button
                    class="btn btn-success btn-sm"
                    title="Confirmar cobro"
                    @click="openPaymentModal(inv)"
                  >
                    <i class="bi bi-check2-circle me-1"></i>Confirmar
                  </button>
                  <button
                    class="btn btn-outline-danger btn-sm"
                    title="Cancelar factura"
                    @click="cancelarFactura(inv)"
                  >
                    <i class="bi bi-x-circle me-1"></i>Cancelar
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredInvoices.length === 0">
              <td colspan="6" class="text-center text-muted py-4">No hay facturas pendientes</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- Modal de Detalle -->
  <FacturaDetalleModal
    :show="showDetalle"
    :nroFactura="detalleNroFactura"
    :movimientoId="detalleMovimientoId"
    @close="closeDetalle"
    @pedido-convertido="handlePedidoConvertido"
  />

  <!-- Modal para Confirmar Cobro (sin AppModal) -->
  <teleport to="body">
    <div
      v-if="showPaymentModal"
      class="modal fade show"
      style="display: block;"
      id="paymentModal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="paymentModalLabel"
      @keydown.esc.prevent="closePaymentModal"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="paymentModalLabel">Confirmar Cobro</h5>
            <button type="button" class="btn-close" aria-label="Close" @click="closePaymentModal"></button>
          </div>
          <div class="modal-body">
            <PaymentForms
              :total="totalToCharge"
              :types="paymentTypes"
              v-model:payments="payments"
            />
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline-secondary" @click="closePaymentModal">Cancelar</button>
            <button class="btn btn-success" :disabled="!canAddPayment" @click="submitCobro">
              <i class="bi bi-check2-circle me-1"></i>Registrar Cobro
            </button>
          </div>
        </div>
      </div>
    </div>
    <div
      v-if="showPaymentModal"
      class="modal-backdrop fade show"
      @click="closePaymentModal"
    ></div>
  </teleport>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import AppNavbar from '@/components/AppNavbar.vue'
import AppHeader from '@/components/AppHeader.vue'
import PaymentForms from '@/components/PaymentForms.vue'
import FacturaDetalleModal from '@/components/FacturaDetalleModal.vue'
// Nota: Modal inline via <teleport>, no usamos AppModal
import apiService from '@/services/apiService.js'
import { useCashboxStore } from '@/stores/cashbox'


// Search term and invoices (populated from backend)
const searchTerm = ref('')
const invoices = reactive([])
const selectedInvoices = reactive([])


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



// Cálculo de totales
const totalToCharge = computed(() =>
  selectedInvoices.reduce((sum, inv) => sum + inv.total, 0)
)






const canAddPayment = computed(() =>
  payments.value.length > 0
)

// Verificar si se seleccionó Crédito
const hasCredito = computed(() =>
  payments.value.some(p => (p.type || '').toUpperCase() === 'CREDITO')
)

const cashboxStore = useCashboxStore()

// Modal de pago
const showPaymentModal = ref(false)
function openPaymentModal(inv) {
  // asegurar que solo haya una factura seleccionada
  selectedInvoices.splice(0, selectedInvoices.length, inv)
  showPaymentModal.value = true
}
function closePaymentModal() {
  showPaymentModal.value = false
}

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
        number: item.nro_comprobante_origen, // este es el nro_factura que usaremos para ver detalle
        client: item.nombre_razon_social,
        date: new Date(item.fecha_movimiento).toLocaleString(),
        total: Number(item.monto_total)
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

// ---------------- Ver detalle (modal) -----------------
const showDetalle = ref(false)
const detalleNroFactura = ref(null)
const detalleMovimientoId = ref(null)
function openDetalle(inv) {
  // inv.number contiene el nro_comprobante_origen -> nro_factura
  detalleNroFactura.value = inv?.number ?? null
  detalleMovimientoId.value = inv?.id ?? null
  if (detalleNroFactura.value) showDetalle.value = true
}
function closeDetalle() {
  showDetalle.value = false
}

// Handler para cuando se convierte a pedido
async function handlePedidoConvertido() {
  // Recargar la lista de facturas pendientes
  await fetchPendingCollections()
  // Actualizar el estado de la caja si es necesario
  if (cashboxStore && typeof cashboxStore.fetchCurrentOpen === 'function') {
    await cashboxStore.fetchCurrentOpen()
  }
}

// Función para cancelar factura
async function cancelarFactura(inv) {
  const confirmacion = confirm(`¿Está seguro que desea CANCELAR la factura ${inv.number}?\n\nEsta acción no se puede deshacer.`)
  
  if (!confirmacion) return

  try {
    const payload = {
      movimiento_id: inv.id,
      accion: 'CANCELAR'
    }

    console.log('Payload -> /api/cashbox/collect-sale (Cancelar):', payload)

    const response = await apiService.post('/api/cashbox/collect-sale', payload)
    
    console.log('Respuesta cancelar factura:', response?.data)

    if (response?.data?.ok) {
      alert(`Factura ${inv.number} cancelada exitosamente.`)
      // Recargar la lista de facturas pendientes
      await fetchPendingCollections()
      // Actualizar el estado de la caja
      if (cashboxStore && typeof cashboxStore.fetchCurrentOpen === 'function') {
        await cashboxStore.fetchCurrentOpen()
      }
    } else {
      alert('Error: No se pudo cancelar la factura.')
    }
  } catch (err) {
    console.error('Error al cancelar factura:', err)
    alert('Error al cancelar la factura. Revisa la consola para más detalles.')
  }
}
</script>
<style scoped>
/* Tabla responsive con filas cómodas */
.table td, .table th {
  vertical-align: middle;
}
.table-responsive {
  overflow-x: auto;
}
</style>

