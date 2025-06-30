<template>
  <AppNavbar />
  <div class="container mt-4">
    <AppHeader
      title="Egreso Varios"
      subtitle="Registrar gastos diversos o pagos varios"
    >
      <template #buttons>
        <router-link class="btn btn-outline-secondary" :to="{ name: 'Caja' }">
          <i class="bi bi-arrow-left me-1"></i>Volver
        </router-link>
      </template>
    </AppHeader>

    <div class="row mt-4">
      <!-- Columna izquierda: Información del Egreso -->
      <div class="col-12 col-md-7">
        <div class="card p-4 mb-4 h-100">
          <h5><i class="bi bi-graph-down me-2"></i>Información del Egreso</h5>
          <p class="text-muted">Datos del gasto o egreso varios</p>
          <div class="row g-3 mt-3">
            <div class="col-md-4">
              <select v-model="form.category" class="form-select">
                <option disabled value="">Seleccionar categoría</option>
                <option v-for="c in categories" :key="c" :value="c">
                  {{ c }}
                </option>
              </select>
            </div>
            <div class="col-md-4">
              <input
                type="number"
                v-model.number="form.amount"
                class="form-control"
                placeholder="0"
              />
            </div>
            <div class="col-md-4">
              <input
                type="text"
                v-model="form.beneficiary"
                class="form-control"
                placeholder="Beneficiario"
              />
            </div>
            <div class="col-12">
              <input
                type="text"
                v-model="form.reference"
                class="form-control"
                placeholder="Referencia/Documento"
              />
            </div>
            <div class="col-12">
              <textarea
                v-model="form.description"
                class="form-control"
                rows="6"
                placeholder="Descripción detallada del egreso..."
              ></textarea>
            </div>
          </div>
        </div>
      </div>

      <!-- Columna derecha: Formas de Pago -->
      <div class="col-12 col-md-5">
        <div class="card p-3 mb-4 h-100">
          <PaymentForms
            :total="form.amount"
            :types="paymentTypes"
            variant="expense"
            v-model:payments="payments"
          />
          <button 
            class="btn btn-dark w-100 mt-3"
            @click="submitEgreso"
          >
            <i class="bi bi-save me-1"></i>Registrar Egreso
          </button>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup>
import { reactive, ref } from 'vue'
import AppNavbar from '@/components/AppNavbar.vue'
import AppHeader from '@/components/AppHeader.vue'
import PaymentForms from '@/components/PaymentForms.vue'

const categories = [
  'Gastos Operativos',
  'Pago a Proveedores',
  'Otros Egresos'
]
const paymentTypes = ['Efectivo', 'Tarjeta', 'Cheque', 'Transferencia']

const form = reactive({
  category: '',
  amount: 0,
  beneficiary: '',
  reference: '',
  description: ''
})

const payments = ref([])

function submitEgreso() {
  const payload = {
    egreso: {
      ...form,
      amount: -Math.abs(form.amount) // si tu API espera monto negativo
    },
    pagos: payments.value
  }

  console.log('Enviar egreso al backend:', payload)
  // Aquí harías:
  // await api.post('/egresos-varios', payload)
}
</script>
