<template>
  <AppNavbar />
  <div class="container mt-4">
    <AppHeader
      title="Cobro de Venta"
      subtitle="Registrar cobro de la venta recién generada"
    >
      <template #buttons>
        <router-link class="btn btn-outline-secondary" :to="{ name: 'Inicio' }">
          <i class="bi bi-arrow-left me-1"></i>Volver
        </router-link>
      </template>
    </AppHeader>

    <div class="row mt-4">
      <!-- 1) Factura Seleccionada -->
      <div class="col-12 col-md-6">
        <div class="card p-3 h-100">
          <h5><i class="bi bi-check2-square me-2"></i>Factura Seleccionada</h5>
          <p class="text-muted">Factura a cobrar</p>
          <div class="list-group list-group-flush mb-3">
            <div
              v-for="inv in selectedInvoices"
              :key="inv.id"
              class="list-group-item d-flex justify-content-between align-items-center"
            >
              <div>
                <div>{{ inv.number || 'Comprobante' }}</div>
                <div><small class="text-muted">{{ inv.client || '' }}</small></div>
                <div><small class="text-muted">{{ inv.date }}</small></div>
              </div>
              <div class="fw-bold">{{ formatCurrency(inv.total) }}</div>
            </div>
          </div>
          <div class="d-flex justify-content-end fw-bold">
            Total a Cobrar:
            <span class="text-success ms-2">{{ formatCurrency(totalToCharge) }}</span>
          </div>
        </div>
      </div>

      <!-- 2) Formas de Pago -->
      <div class="col-12 col-md-6">
        <PaymentForms :total="totalToCharge" v-model:payments="payments" />
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
import { useRoute } from 'vue-router'
import AppNavbar from '@/components/AppNavbar.vue'
import AppHeader from '@/components/AppHeader.vue'
import PaymentForms from '@/components/PaymentForms.vue'
import apiService from '@/services/apiService.js'

const route = useRoute()

// Selected invoice passed from previous screen
const selectedInvoices = reactive([])
const payments = ref([])

// Initialize from route query ?invoice=...
function safeParseInvoice(q) {
  try {
    if (!q) return null
    const obj = typeof q === 'string' ? JSON.parse(decodeURIComponent(q)) : q
    if (!obj) return null
    return {
      // Usar movimiento_cobro_id como id principal para el cobro
      id: obj.id ?? obj.movimiento_cobro_id ?? obj.movimiento_id ?? obj.movId ?? null,
      // Preferir nro_factura si está presente
      number: obj.number ?? obj.nro_factura ?? obj.nro_comprobante ?? '',
      // Intentar obtener el nombre del cliente desde varias fuentes
  client: (obj.client ?? obj.nombre_razon_social ?? (obj.cabecera && obj.cabecera.nombre_razon_social)) || '',
      // Fecha: usar la que venga o derivar de cabecera/fecha_movimiento
      date: obj.date
        ? obj.date
        : (obj.cabecera && obj.cabecera.fecha_emision)
          ? new Date(obj.cabecera.fecha_emision).toLocaleString()
          : (obj.fecha_emision)
            ? new Date(obj.fecha_emision).toLocaleString()
            : (obj.fecha_movimiento)
              ? new Date(obj.fecha_movimiento).toLocaleString()
              : new Date().toLocaleString(),
      // Total: usar total enviado o alternativas razonables
      total: Number(obj.total ?? obj.monto_total ?? (obj.cabecera && obj.cabecera.total_iva_incluido) ?? 0)
    }
  } catch (e) {
    console.warn('No se pudo parsear la factura desde la ruta:', e)
    return null
  }
}

onMounted(() => {
  console.log('[CobroVentaRapida] route.query:', route.query)
  const inv = safeParseInvoice(route.query.invoice)
  console.log('[CobroVentaRapida] parsed invoice:', inv)
  if (inv && inv.id) {
    selectedInvoices.splice(0, selectedInvoices.length, inv)
  } else {
    alert('No se recibió una factura válida para cobrar.')
  }
})

const totalToCharge = computed(() => selectedInvoices.reduce((sum, inv) => sum + (Number(inv.total) || 0), 0))
const canAddPayment = computed(() => (payments.value || []).length > 0)

function submitCobro() {
  if (selectedInvoices.length === 0) {
    alert('No hay factura para cobrar.')
    return
  }
  const movId = selectedInvoices[0].id
  if (!movId) {
    alert('Falta movimiento_id de la factura para registrar el cobro.')
    return
  }

  const pagos = (payments.value || []).map(p => {
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
    movimiento_id: movId,
    forma_operacion: 'CONTADO',
    pagos
  }

  console.log('Payload -> /api/cashbox/collect-sale', payload)
  apiService.post('/api/cashbox/collect-sale', payload)
    .then(resp => {
      console.log('Respuesta collect-sale:', resp && resp.data)
      alert('Cobro registrado correctamente.')
      payments.value = []
    })
    .catch(err => {
      console.error('Error enviando collect-sale:', err)
      alert('Error al registrar el cobro. Revisa la consola para más detalles.')
    })
}

function formatCurrency(value) {
  return new Intl.NumberFormat('es-PY', {
    style: 'currency',
    currency: 'PYG'
  }).format(value)
}
</script>

<style scoped>
.list-group {
  max-height: 400px;
  overflow-y: auto;
}
</style>
