<template>
  <AppNavbar />
  <div class="container mt-4">
    <AppHeader
      title="Pago de Factura"
      subtitle="Registrar pago a proveedores"
    >
      <template #buttons>
        <router-link class="btn btn-outline-secondary" :to="{ name: 'Caja' }">
          <i class="bi bi-arrow-left me-1"></i>Volver
        </router-link>
      </template>
    </AppHeader>

    <div class="row g-4 mt-3">
      <!-- 1) Buscar Proveedor -->
      <div class="col-12 col-md-4">
        <div class="card p-3 h-100">
          <h5><i class="bi bi-building me-2"></i>Buscar Proveedor</h5>
          <p class="text-muted">Ingrese el RUC/CI del proveedor y presione Enter</p>
          <div class="position-relative">
            <input
              v-model="providerDoc"
              @keyup.enter="searchInvoices"
              @focus="openProviderSuggestions"
              @input="onProviderInput"
              @blur="closeProviderSuggestions"
              type="text"
              class="form-control mb-3"
              placeholder="Ej: 80012345-7 o Nombre"
            />
            <div
              v-if="showSuggestions && filteredSuggestions.length"
              class="list-group suggestions-dropdown"
            >
              <button
                v-for="sug in filteredSuggestions"
                :key="sug.key"
                type="button"
                class="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                @mousedown.prevent="selectProviderFromSuggestion(sug)"
              >
                <div>
                  <div class="fw-semibold">{{ sug.nombre }}</div>
                  <small class="text-muted">{{ sug.documento }}</small>
                </div>
                <span class="badge bg-light text-dark">{{ formatCurrency(Number(sug.total || 0)) }}</span>
              </button>
            </div>
          </div>
          <button class="btn btn-dark w-100" @click="searchInvoices">
            <i class="bi bi-search me-1"></i>Buscar
          </button>
        </div>
      </div>

      <!-- 2) Facturas del Proveedor -->
      <div class="col-12 col-md-4">
        <div class="card p-3 h-100">
          <h5><i class="bi bi-receipt-cutoff me-2"></i>Facturas del Proveedor</h5>
          <p class="text-muted">
            {{ selectedProvider
              ? `${selectedProvider.name} – ${selectedProvider.ruc}`
              : 'Seleccione un proveedor para ver sus facturas' }}
          </p>

          <div
            v-if="selectedProvider"
            class="list-group mb-3"
            style="max-height:350px; overflow-y:auto"
          >
            <div
              v-for="inv in providerInvoices"
              :key="inv.id"
              @click="toggleInvoice(inv)"
              :class="[
                'list-group-item',
                isInvoiceSelected(inv)
                  ? 'bg-success bg-opacity-10 border-success'
                  : 'border'
              ]"
              style="cursor:pointer"
            >
              <div class="d-flex justify-content-between">
                <div>
                  <div>{{ inv.number }}</div>
                  <small class="text-muted">
                    Emisión: {{ inv.date }}
                  </small>
                </div>
                <div class="fw-bold">{{ formatCurrency(inv.total) }}</div>
              </div>
            </div>
          </div>

          <div v-if="selectedInvoices.length" class="d-flex justify-content-between fw-bold">
            Total Seleccionado:
            <span class="text-danger ms-2">{{ formatCurrency(totalToPay) }}</span>
          </div>
        </div>
      </div>

      <!-- 3) Formas de Pago -->
      <div class="col-12 col-md-4">
        <PaymentForms
          :total="totalToPay"
          variant="expense"
          v-model:payments="payments"
        />
        <button
          class="btn btn-dark w-100 mt-3"
          :disabled="!canSubmit"
          @click="submitPago"
        >
          <i class="bi bi-check2-circle me-1"></i>Registrar Pago
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

// Estado de búsqueda y resultados
const providerDoc = ref('')
const selectedProvider = ref(null)
const allInvoices = reactive([])
const selectedInvoices = reactive([])
const payments = ref([])

// Sugerencias de proveedores desde /api/cashbox/pending-payments
const providerSuggestions = reactive([]) // { key, nombre, documento, total }
const showSuggestions = ref(false)

function openProviderSuggestions() {
  showSuggestions.value = true
  if (!providerSuggestions.length) {
    fetchProviderSuggestions()
  }
}

function closeProviderSuggestions() {
  // Permite seleccionar con click sin perder el focus inmediato
  setTimeout(() => { showSuggestions.value = false }, 150)
}

function onProviderInput() {
  if (!showSuggestions.value) showSuggestions.value = true
}

const filteredSuggestions = computed(() => {
  const term = (providerDoc.value || '').toLowerCase()
  if (!term) return providerSuggestions
  return providerSuggestions.filter(s =>
    (s.nombre || '').toLowerCase().includes(term) ||
    (s.documento || '').toLowerCase().includes(term)
  )
})

// Buscar facturas/pendientes del proveedor por nombre o documento
async function searchInvoices() {
  const term = providerDoc.value.trim()
  if (!term) return
  try {
    const url = `/api/cashbox/pending-payments?search=${encodeURIComponent(term)}`
    const resp = await apiService.get(url)
    const arr = Array.isArray(resp?.data?.data) ? resp.data.data : []
    if (!arr.length) {
      selectedProvider.value = null
      allInvoices.splice(0, allInvoices.length)
      selectedInvoices.splice(0, selectedInvoices.length)
      payments.value = []
      alert('No se encontraron facturas pendientes para el proveedor ingresado.')
      return
    }

    const first = arr[0]
    selectedProvider.value = {
      id: first.nro_documento,
      name: first.nombre_razon_social || 'Proveedor',
      ruc: first.nro_documento || term
    }

    const mapped = arr.map(it => ({
      id: it.movimiento_id, // importante para enviar al backend
      number: it.nro_comprobante_origen || 'Comprobante',
      date: it.fecha_movimiento ? new Date(it.fecha_movimiento).toLocaleString() : '',
      total: Number(it.monto_total || 0),
      status: 'Pendiente'
    }))

    allInvoices.splice(0, allInvoices.length, ...mapped)
    selectedInvoices.splice(0, selectedInvoices.length)
    payments.value = []
    console.log('[PagoFactura] Pendientes del proveedor:', mapped)
  } catch (err) {
    console.error('Error al buscar pendientes de pago del proveedor:', err)
    alert('Ocurrió un error al consultar los pendientes. Revise la consola.')
  }
}

// Cargar sugerencias iniciales de proveedores con pendientes
async function fetchProviderSuggestions() {
  try {
    const resp = await apiService.get('/api/cashbox/pending-payments')
    const arr = Array.isArray(resp?.data?.data) ? resp.data.data : []
    const map = new Map()
    for (const it of arr) {
      const key = `${it.nro_documento}__${it.nombre_razon_social}`
      const cur = map.get(key) || { key, documento: it.nro_documento, nombre: it.nombre_razon_social, total: 0 }
      cur.total = Number(cur.total) + Number(it.monto_total || 0)
      map.set(key, cur)
    }
    providerSuggestions.splice(0, providerSuggestions.length, ...Array.from(map.values()))
  } catch (err) {
    console.error('Error al obtener sugerencias de proveedores:', err)
  }
}

function selectProviderFromSuggestion(sug) {
  providerDoc.value = sug.documento || sug.nombre || ''
  if (sug.documento) providerDoc.value = sug.documento
  selectedProvider.value = { id: sug.documento, name: sug.nombre, ruc: sug.documento }
  showSuggestions.value = false
  searchInvoices()
}

// Lista de facturas para la columna central
const providerInvoices = computed(() => selectedProvider.value ? allInvoices : [])

function isInvoiceSelected(inv) {
  return selectedInvoices.some(i => i.id === inv.id)
}

function toggleInvoice(inv) {
  // Selección única: si no está seleccionado, reemplaza; si está, deselecciona
  const idx = selectedInvoices.findIndex(i => i.id === inv.id)
  if (idx === -1) {
    selectedInvoices.splice(0, selectedInvoices.length, inv)
  } else {
    selectedInvoices.splice(0, selectedInvoices.length)
  }
}

// Totales
const totalToPay = computed(() =>
  selectedInvoices.reduce((sum, inv) => sum + Number(inv.total || 0), 0)
)

const canSubmit = computed(() =>
  selectedInvoices.length === 1 &&
  payments.value.reduce((sum,p) => sum + Number(p.amount || 0), 0) === totalToPay.value
)

function formatCurrency(v) {
  return new Intl.NumberFormat('es-PY',{ style:'currency', currency:'PYG' }).format(v)
}

function submitPago() {
  if (!canSubmit.value) return
  const movimientoId = selectedInvoices[0]?.id
  const pagos = (payments.value || []).map(p => ({
    metodo_pago: (p.type || '').toString().toUpperCase(),
    monto: Number(p.amount || 0)
  }))

  const payload = {
    movimiento_id: movimientoId,
    forma_operacion: 'CONTADO',
    pagos
  }
  console.log('Payload -> /api/cashbox/pay-supplier', payload)
  apiService.post('/api/cashbox/pay-supplier', payload)
    .then(resp => {
      console.log('Respuesta pay-supplier:', resp && resp.data)
      alert('Pago registrado correctamente.')
      const idx = allInvoices.findIndex(i => i.id === movimientoId)
      if (idx !== -1) allInvoices.splice(idx, 1)
      selectedInvoices.splice(0, selectedInvoices.length)
      payments.value = []
      if (allInvoices.length === 0) {
        selectedProvider.value = null
      }
    })
    .catch(err => {
      console.error('Error enviando pay-supplier:', err)
      alert('Error al registrar el pago. Revisa la consola para más detalles.')
    })
}
</script>

<style scoped>
.suggestions-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 1050;
  max-height: 260px;
  overflow-y: auto;
}
</style>
