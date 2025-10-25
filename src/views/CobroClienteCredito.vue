<template>
  <AppNavbar />
  <div class="container mt-4">
    <AppHeader title="Cobro a Cliente Crédito" subtitle="Registrar cobros de facturas a crédito">
      <template #buttons>
        <router-link class="btn btn-outline-secondary" :to="{ name: 'Caja' }">
          <i class="bi bi-arrow-left me-1"></i>Volver
        </router-link>
      </template>
    </AppHeader>

    <div class="row g-4 mt-3">
      <!-- 1) Buscar Cliente Crédito -->
      <div class="col-12 col-md-4">
        <div class="card p-3">
          <h5><i class="bi bi-person-circle me-2"></i>Buscar Cliente</h5>
          <p class="text-muted">Ingrese el Nro. de Documento y presione Enter</p>
          <input
            v-model="clientDoc"
            @keyup.enter="searchClient"
            type="text"
            class="form-control mb-3"
            placeholder="Ej: 5510"
          />
          <button class="btn btn-dark w-100" @click="searchClient">
            <i class="bi bi-search me-1"></i>Buscar
          </button>
        </div>
      </div>

      <!-- 2) Facturas Pendientes del Cliente -->
      <div class="col-12 col-md-4">
        <div class="card p-3 h-100">
          <h5><i class="bi bi-receipt me-2"></i>Facturas Pendientes</h5>
          <p class="text-muted">
            {{ selectedClient
              ? `Cliente: ${selectedClient.name} – ${selectedClient.document}`
              : 'Busque por documento para ver las facturas pendientes' }}
          </p>

          <div
            v-if="selectedClient"
            class="list-group mb-3"
            style="max-height: 350px; overflow-y: auto;"
          >
            <div
              v-for="inv in clientInvoices"
              :key="inv.id"
              @click="toggleInvoice(inv)"
              style="cursor: pointer;"
              :class="['list-group-item', isInvoiceSelected(inv) ? 'bg-success bg-opacity-10' : '']"
            >
              <div class="d-flex justify-content-between">
                <div>
                  <div>{{ inv.number }}</div>
                  <small class="text-muted">Últ. pago: {{ inv.lastPayment || '—' }}</small>
                </div>
                <div class="fw-bold">{{ formatCurrency(inv.total) }}</div>
              </div>
            </div>
          </div>

          <div v-if="selectedInvoices.length" class="d-flex justify-content-between fw-bold">
            Total Seleccionado:
            <span class="text-success">{{ formatCurrency(totalToCharge) }}</span>
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
        <button class="btn btn-dark w-100 mt-2" :disabled="!canSubmit" @click="submitCobro">
          <i class="bi bi-save me-1"></i>Registrar Cobro
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import AppNavbar from '@/components/AppNavbar.vue'
import AppHeader from '@/components/AppHeader.vue'
import PaymentForms from '@/components/PaymentForms.vue'
import apiService from '@/services/apiService.js'

// 1) Estado de búsqueda y resultados
const clientDoc = ref('')
const selectedClient = ref(null)
const allInvoices = reactive([])
const selectedInvoices = reactive([])
const payments = ref([])
const paymentTypes = ['Efectivo', 'Tarjeta', 'Cheque', 'Transferencia']

// Buscar facturas crédito por documento
async function searchClient() {
  const doc = clientDoc.value.trim()
  if (!doc) return
  try {
    const url = `/api/clients/credit/invoices/${encodeURIComponent(doc)}`
    const resp = await apiService.get(url)
    const data = resp?.data || {}
    const facturas = Array.isArray(data.facturas) ? data.facturas : []
    if (!facturas.length) {
      selectedClient.value = null
      allInvoices.splice(0, allInvoices.length)
      selectedInvoices.splice(0, selectedInvoices.length)
      payments.value = []
      alert('No se encontraron facturas a crédito para el documento ingresado.')
      return
    }

    selectedClient.value = {
      id: data.cliente_id || doc,
      name: facturas[0]?.nombre_entidad || 'Cliente',
      document: facturas[0]?.documento_entidad || doc
    }

    const mapped = facturas.map(f => ({
      id: f.nro_factura || `${f.tipo_factura}-${f.documento_entidad}`,
      number: f.nro_factura || 'Factura',
      lastPayment: f.ultima_fecha_pago ? new Date(f.ultima_fecha_pago).toLocaleDateString() : '',
      total: Number(f.saldo_restante ?? f.monto_total ?? 0)
    }))

    allInvoices.splice(0, allInvoices.length, ...mapped)
    selectedInvoices.splice(0, selectedInvoices.length)
    payments.value = []
    console.log('[CobroClienteCredito] Facturas recibidas:', mapped)
  } catch (err) {
    console.error('Error al buscar facturas a crédito:', err)
    alert('Ocurrió un error al consultar. Revise la consola.')
  }
}

// 2) Facturas a mostrar
const clientInvoices = computed(() => selectedClient.value ? allInvoices : [])
function isInvoiceSelected(inv) {
  return selectedInvoices.some(i => i.id === inv.id)
}
function toggleInvoice(inv) {
  const idx = selectedInvoices.findIndex(i => i.id === inv.id)
  if (idx === -1) selectedInvoices.push(inv)
  else selectedInvoices.splice(idx, 1)
}
const totalToCharge = computed(() =>
  selectedInvoices.reduce((sum, inv) => sum + Number(inv.total || 0), 0)
)
const canSubmit = computed(() => {
  const assigned = payments.value.reduce((s,p) => s + Number(p.amount || 0), 0)
  return selectedInvoices.length > 0 && assigned > 0 && assigned <= totalToCharge.value
})

// Métodos
function formatCurrency(val) {
  return new Intl.NumberFormat('es-PY',{ style:'currency', currency:'PYG' }).format(val)
}
async function submitCobro() {
  if (!selectedClient.value) return
  const payload = {
    documento: selectedClient.value.document || clientDoc.value,
    pagos: payments.value.map(p => ({
      metodo_pago: String(p.type || '').toUpperCase(),
      monto: Number(p.amount || 0),
      referencia_externa: null
    })),
    observacion: 'Pago de facturas crédito'
  }
  console.log('Payload -> /api/cashbox/collect-debt', payload)
  try {
    const resp = await apiService.post('/api/cashbox/collect-debt', payload)
    console.log('Respuesta collect-debt:', resp?.data)
    alert('Cobro registrado correctamente.')
  // Reset pagos y deseleccionar facturas (limpiar columna 2)
  payments.value = []
  selectedInvoices.splice(0, selectedInvoices.length)
  // Refrescar facturas del cliente para reflejar saldos/pendientes actualizados
  await searchClient()
  } catch (err) {
    console.error('Error registrando cobro:', err)
    alert('Error al registrar el cobro. Revise la consola para más detalles.')
  }
}
</script>
