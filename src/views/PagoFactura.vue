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
          <p class="text-muted">Seleccione el proveedor para pagar</p>
          <input
            v-model="providerFilter"
            type="text"
            class="form-control mb-3"
            placeholder="Buscar por nombre o RUC..."
          />
          <div class="list-group" style="max-height:400px; overflow-y:auto">
            <button
              v-for="prov in filteredProviders"
              :key="prov.id"
              @click="selectProvider(prov)"
              :class="[
                'list-group-item list-group-item-action',
                selectedProvider?.id === prov.id ? 'active' : ''
              ]"
            >
              <div class="d-flex justify-content-between">
                <div>
                  <div>{{ prov.name }}</div>
                  <small class="text-muted">{{ prov.ruc }}</small>
                </div>
                <div class="text-danger fw-bold">{{ formatCurrency(prov.debt) }}</div>
              </div>
              <small class="badge bg-danger">Deuda Total</small>
            </button>
          </div>
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
                    Emisión: {{ inv.date }}<br />
                    Venc.: {{ inv.due }}
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

// 1) Proveedores dummy
const providers = reactive([
  { id: 1, name: 'ABC Distribuidora S.A.', ruc: '80012345-7', debt: 750000 },
  { id: 2, name: 'XYZ Suministros S.R.L.', ruc: '80098765-4', debt: 400000 },
  { id: 3, name: 'Comercial López',      ruc: '12345678-9', debt: 300000 }
])
const providerFilter = ref('')
const selectedProvider = ref(null)

// 2) Facturas dummy por proveedor
const allInvoices = reactive([
  { id: 10, providerId: 1, number: '001-001-00001234', total: 500000, date: '9/1/2024', due: '24/1/2024', status: 'Pendiente' },
  { id: 11, providerId: 1, number: '001-001-00001235', total: 250000, date: '4/1/2024', due: '19/1/2024', status: 'Vencida' },
  { id: 12, providerId: 2, number: '001-001-00001236', total: 400000, date: '5/2/2024', due: '20/2/2024', status: 'Pendiente' },
  { id: 13, providerId: 3, number: '001-001-00001237', total: 300000, date: '2/3/2024', due: '17/3/2024', status: 'Pendiente' }
])
const selectedInvoices = reactive([])

// 3) Pagos
const payments = ref([])

// Filtrar proveedores
const filteredProviders = computed(() =>
  providers.filter(p =>
    p.name.toLowerCase().includes(providerFilter.value.toLowerCase()) ||
    p.ruc.includes(providerFilter.value)
  )
)

function selectProvider(p) {
  selectedProvider.value = p
  selectedInvoices.splice(0, selectedInvoices.length)
  payments.value = []
}

// Facturas por proveedor
const providerInvoices = computed(() =>
  selectedProvider.value
    ? allInvoices.filter(i => i.providerId === selectedProvider.value.id)
    : []
)

function isInvoiceSelected(inv) {
  return selectedInvoices.some(i => i.id === inv.id)
}

function toggleInvoice(inv) {
  const idx = selectedInvoices.findIndex(i => i.id === inv.id)
  if (idx === -1) selectedInvoices.push(inv)
  else selectedInvoices.splice(idx,1)
}

// Totales
const totalToPay = computed(() =>
  selectedInvoices.reduce((sum, inv) => sum + inv.total, 0)
)

const canSubmit = computed(() =>
  selectedInvoices.length > 0 &&
  payments.value.reduce((sum,p) => sum + p.amount, 0) === totalToPay.value
)

function formatCurrency(v) {
  return new Intl.NumberFormat('es-PY',{ style:'currency', currency:'PYG' }).format(v)
}

function submitPago() {
  const payload = {
    providerId: selectedProvider.value.id,
    invoices: selectedInvoices.map(i => i.id),
    payments: payments.value
  }
  console.log('Enviar pago al backend:', payload)
  // await api.post('/pagos-proveedor', payload)
}
</script>
