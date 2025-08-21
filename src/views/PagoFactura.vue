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
          <input
            v-model="providerDoc"
            @keyup.enter="searchInvoices"
            type="text"
            class="form-control mb-3"
            placeholder="Ej: 80012345-7"
          />
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

// Buscar facturas del proveedor por nro de documento
async function searchInvoices() {
  const doc = providerDoc.value.trim()
  if (!doc) return
  try {
    const url = `/api/purchases/invoices/proveedor/${encodeURIComponent(doc)}`
    const resp = await apiService.get(url)
    const arr = Array.isArray(resp?.data) ? resp.data : (resp?.data?.data || [])
    if (!arr.length) {
      selectedProvider.value = null
      allInvoices.splice(0, allInvoices.length)
      selectedInvoices.splice(0, selectedInvoices.length)
      payments.value = []
      alert('No se encontraron facturas para el proveedor ingresado.')
      return
    }

    // Tomar datos del proveedor del primer registro
    const first = arr[0]
    selectedProvider.value = {
      id: first.nro_documento,
      name: first.nombre_razon_social || 'Proveedor',
      ruc: first.nro_documento || doc
    }

    // Mapear facturas
    const mapped = arr.map(it => ({
      id: it.id_compra,
      number: it.nro_factura || it.nro_comprobante || 'Comprobante',
      date: it.fecha_emision ? new Date(it.fecha_emision).toLocaleDateString() : '',
      total: Number(it.total_iva_incluido ?? it.total_sin_iva ?? 0),
      status: it.estado || (it.pendiente ? 'Pendiente' : '')
    }))

    allInvoices.splice(0, allInvoices.length, ...mapped)
    selectedInvoices.splice(0, selectedInvoices.length)
    payments.value = []
    console.log('[PagoFactura] Facturas recibidas:', mapped)
  } catch (err) {
    console.error('Error al buscar facturas del proveedor:', err)
    alert('Ocurrió un error al consultar las facturas. Revise la consola.')
  }
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
  payments.value.reduce((sum,p) => sum + p.amount, 0) === totalToPay.value
)

function formatCurrency(v) {
  return new Intl.NumberFormat('es-PY',{ style:'currency', currency:'PYG' }).format(v)
}

function submitPago() {
  const payload = {
    proveedor_documento: selectedProvider.value?.ruc || providerDoc.value,
    facturas: selectedInvoices.map(i => ({ id_compra: i.id })),
    pagos: payments.value.map(p => ({ metodo_pago: p.type, monto: p.amount }))
  }
  console.log('Enviar pago al backend (pendiente endpoint definitivo):', payload)
}
</script>
