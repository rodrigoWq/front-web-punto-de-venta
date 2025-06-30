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
      <!-- 1) Clientes con Crédito -->
      <div class="col-12 col-md-4">
        <div class="card p-3">
          <h5><i class="bi bi-person-circle me-2"></i>Clientes con Crédito</h5>
          <p class="text-muted">Seleccione el cliente para cobrar</p>
          <input
            v-model="clientFilter"
            type="text"
            class="form-control mb-3"
            placeholder="Buscar cliente..."
          />
          <div class="list-group" style="max-height: 400px; overflow-y: auto;">
            <button
              v-for="c in filteredClients"
              :key="c.id"
              @click="selectClient(c)"
              :class="['list-group-item list-group-item-action', selectedClient?.id === c.id ? 'active' : '']"
            >
              <div class="d-flex justify-content-between">
                <div>
                  <div>{{ c.name }}</div>
                  <small class="text-muted">{{ c.document }}</small>
                </div>
                <div class="text-danger fw-bold">{{ formatCurrency(c.debt) }}</div>
              </div>
              <small class="badge bg-danger">Deuda Total</small>
            </button>
          </div>
        </div>
      </div>

      <!-- 2) Facturas Pendientes del Cliente -->
      <div class="col-12 col-md-4">
        <div class="card p-3 h-100">
          <h5><i class="bi bi-receipt me-2"></i>Facturas Pendientes</h5>
          <p class="text-muted">
            {{ selectedClient
              ? `Cliente: ${selectedClient.name} – ${selectedClient.document}`
              : 'Seleccione un cliente para ver sus facturas pendientes' }}
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

// 1) Datos dummy de clientes
const clients = reactive([
  { id: 1, name: 'Juan Pérez', document: '12345678-9', debt: 450000 },
  { id: 2, name: 'María González', document: '98765432-1', debt: 300000 },
  { id: 3, name: 'Pedro López', document: '12345678-0', debt: 500000 },
  { id: 4, name: 'Ana Martínez', document: '87654321-2', debt: 150000 },
  { id: 5, name: 'Luis Fernández', document: '11223344-5', debt: 600000 },
    { id: 6, name: 'Carla Ramírez', document: '55667788-3', debt: 200000 },
    { id: 7, name: 'Sofía Torres', document: '99887766-4', debt: 350000 },
    { id: 8, name: 'Diego Ruiz', document: '44332211-6', debt: 100000 },
    { id: 9, name: 'Laura Díaz', document: '66778899-7', debt: 400000 },
    { id: 10, name: 'Andrés Castro', document: '22334455-8', debt: 250000 }
])
const clientFilter = ref('')
const selectedClient = ref(null)

// 2) Facturas dummy (ligadas a clientId)
const allInvoices = reactive([
  { id: 101, clientId: 1, number: '001-001-0000120', total: 200000, date: '4/1/2024', due: '19/1/2024' },
  { id: 102, clientId: 1, number: '001-001-0000125', total: 250000, date: '14/1/2024', due: '29/1/2024' },
  { id: 103, clientId: 1, number: '001-001-0000128', total: 150000, date: '24/1/2024', due: '8/2/2024' },
  { id: 104, clientId: 2, number: '001-001-0000121', total: 100000, date: '5/1/2024', due: '20/1/2024' },
  { id: 105, clientId: 2, number: '001-001-0000126', total: 200000, date: '15/1/2024', due: '30/1/2024' },
  { id: 103, clientId: 2, number: '001-001-0000130', total: 300000, date: '10/1/2024', due: '25/1/2024' },
  { id: 106, clientId: 3, number: '001-001-0000122', total: 400000, date: '6/1/2024', due: '21/1/2024' },
  { id: 107, clientId: 3, number: '001-001-0000127', total: 350000, date: '16/1/2024', due: '31/1/2024' },
  { id: 108, clientId: 4, number: '001-001-0000123', total: 50000, date: '7/1/2024', due: '22/1/2024' },
  { id: 109, clientId: 5, number: '001-001-0000124', total: 600000, date: '8/1/2024', due: '23/1/2024' }
])
const selectedInvoices = reactive([])

// 3) Formas de pago
const paymentTypes = ['Efectivo', 'Tarjeta', 'Cheque', 'Transferencia']
const payments = ref([])

// Computeds
const filteredClients = computed(() =>
  clients.filter(c =>
    c.name.toLowerCase().includes(clientFilter.value.toLowerCase()) ||
    c.document.includes(clientFilter.value)
  )
)
function selectClient(c) {
  selectedClient.value = c
  selectedInvoices.splice(0, selectedInvoices.length)
  payments.value = []
}
const clientInvoices = computed(() =>
  selectedClient.value
    ? allInvoices.filter(inv => inv.clientId === selectedClient.value.id)
    : []
)
function isInvoiceSelected(inv) {
  return selectedInvoices.some(i => i.id === inv.id)
}
function toggleInvoice(inv) {
  const idx = selectedInvoices.findIndex(i => i.id === inv.id)
  if (idx === -1) selectedInvoices.push(inv)
  else selectedInvoices.splice(idx, 1)
}
const totalToCharge = computed(() =>
  selectedInvoices.reduce((sum, inv) => sum + inv.total, 0)
)
const canSubmit = computed(() =>
  selectedInvoices.length > 0 && payments.value.reduce((s,p) => s + p.amount, 0) === totalToCharge.value
)

// Métodos
function formatCurrency(val) {
  return new Intl.NumberFormat('es-PY',{ style:'currency', currency:'PYG' }).format(val)
}
function submitCobro() {
  const payload = {
    clientId: selectedClient.value.id,
    invoices: selectedInvoices.map(i => i.id),
    payments: payments.value
  }
  console.log('Enviar cobro:', payload)
  // Aquí llamada al backend...
}
</script>
