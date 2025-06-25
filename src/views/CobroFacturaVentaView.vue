<template>
  <AppNavbar />
  <div class="container mt-4">
    <AppHeader title="Cobro de Factura de Venta" subtitle="Registrar cobro de facturas emitidas">
      <template #buttons>
        <router-link class="btn btn-outline-secondary" :to="{ name: 'Caja' }">
          <i class="bi bi-arrow-left me-1"></i>Volver
        </router-link>
      </template>
    </AppHeader>

    <div class="row mt-4">
      <!-- Facturas Pendientes -->
      <div class="col-md-7">
        <div class="card p-3">
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
                :disabled="isInvoiceSelected(inv)"
                @click="addInvoice(inv)"
              >
                {{ isInvoiceSelected(inv) ? 'Agregada' : 'Agregar' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Formas de Pago -->
      <div class="col-md-5">
        <div class="card p-3 mb-3">
          <h5><i class="bi bi-credit-card-2-front me-2"></i>Formas de Pago</h5>
          <p class="text-muted">Configure cómo se realizará el cobro</p>
          <div class="d-flex justify-content-between">
            <div>Total a Cobrar:</div>
            <div>{{ formatCurrency(totalToCharge) }}</div>
          </div>
          <div class="d-flex justify-content-between">
            <div>Total Asignado:</div>
            <div>{{ formatCurrency(totalAssigned) }}</div>
          </div>
          <div class="d-flex justify-content-between">
            <div>Restante:</div>
            <div :class="remaining > 0 ? 'text-danger' : 'text-success'">
              {{ formatCurrency(remaining) }}
            </div>
          </div>

          <hr />

          <div class="row g-2 align-items-center mb-2">
            <div class="col-6">
              <select v-model="paymentType" class="form-select">
                <option disabled value="">Tipo</option>
                <option v-for="type in paymentTypes" :key="type" :value="type">
                  {{ type }}
                </option>
              </select>
            </div>
            <div class="col-6">
              <input
                v-model.number="paymentAmount"
                type="number"
                class="form-control"
                placeholder="Monto"
              />
            </div>
          </div>
          <button
            class="btn btn-dark w-100"
            :disabled="!canAddPayment"
            @click="addPayment"
          >
            <i class="bi bi-plus-lg me-1"></i>Agregar
          </button>

          <ul class="list-group list-group-flush mt-3">
            <li
              v-for="(p, i) in payments"
              :key="i"
              class="list-group-item d-flex justify-content-between align-items-center"
            >
              <div>{{ p.type }}</div>
              <div>{{ formatCurrency(p.amount) }}</div>
            </li>
          </ul>
          <button 
            class="btn btn-dark w-100 mt-3" 
            @click="submitCobro"
          >
            <i class="bi bi-check2-circle me-1"></i>Registrar Cobro
          </button>
        </div>
        <!-- Template: “Facturas Seleccionadas” -->
        <div class="card p-3 mb-4">
            <h5>Facturas Seleccionadas</h5>
            <div
                class="list-group mb-3"
                style="max-height: 200px; overflow-y: auto;"
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


    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import AppNavbar from '@/components/AppNavbar.vue'
import AppHeader from '@/components/AppHeader.vue'


// Facturas dummy
const searchTerm = ref('')
const invoices = reactive([
  { id: 1, number: '001-001-0000123', client: 'Juan Pérez', date: '9/1/2024', total: 150000, status: 'Pendiente' },
  { id: 2, number: '001-001-0000124', client: 'María González', date: '11/1/2024', total: 100000, status: 'Parcial' },
  { id: 3, number: '001-001-0000125', client: 'Carlos López', date: '14/1/2024', total: 300000, status: 'Pendiente' },
  { id: 4, number: '001-001-0000126', client: 'Ana Torres', date: '16/1/2024', total: 200000, status: 'Pendiente' },
  { id: 5, number: '001-001-0000127', client: 'Luis Fernández', date: '18/1/2024', total: 250000, status: 'Pendiente' },
  { id: 6, number: '001-001-0000128', client: 'Sofía Martínez', date: '20/1/2024', total: 180000, status: 'Pendiente' },
  { id: 7, number: '001-001-0000129', client: 'Pedro Ramírez', date: '22/1/2024', total: 220000, status: 'Pendiente' },
  { id: 8, number: '001-001-0000130', client: 'Lucía Díaz', date: '24/1/2024', total: 170000, status: 'Pendiente' }
])
const selectedInvoices = reactive([])

// Formas de pago
const paymentTypes = ['Efectivo', 'Tarjeta', 'Cheque', 'Transferencia']
const paymentType = ref('')
const paymentAmount = ref(0)
const payments = reactive([])

// Filtrado de facturas
const filteredInvoices = computed(() =>
  invoices.filter(inv => {
    const term = searchTerm.value.toLowerCase()
    return inv.number.includes(term) || inv.client.toLowerCase().includes(term)
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
const totalAssigned = computed(() =>
  payments.reduce((sum, p) => sum + p.amount, 0)
)
const remaining = computed(() => totalToCharge.value - totalAssigned.value)

// Lógica para agregar pagos
const canAddPayment = computed(() =>
  paymentType.value && paymentAmount.value > 0 && paymentAmount.value <= remaining.value
)
function addPayment() {
  if (canAddPayment.value) {
    payments.push({ type: paymentType.value, amount: paymentAmount.value })
    paymentType.value = ''
    paymentAmount.value = 0
  }
}
function removeInvoice(inv) {
  const idx = selectedInvoices.findIndex(i => i.id === inv.id)
  if (idx !== -1) selectedInvoices.splice(idx, 1)
}

function submitCobro() {
  // TODO: llamar a tu API con los datos de selectedInvoices y payments
  console.log('Registrar cobro:', selectedInvoices, payments)
}

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
