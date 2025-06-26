<template>
  <AppNavbar />
  <div class="container mt-4">
    <AppHeader
      title="Ingreso Varios"
      subtitle="Registrar ingresos diversos no relacionados a ventas"
    >
      <template #buttons>
        <router-link class="btn btn-outline-secondary" :to="{ name: 'Caja' }">
          <i class="bi bi-arrow-left me-1"></i>Volver
        </router-link>
      </template>
    </AppHeader>

    <div class="row mt-2">
        <!-- Información del Ingreso (full width) -->
        <div class="card p-4 mb-4">
        <h5><i class="bi bi-graph-up me-2"></i>Información del Ingreso</h5>
        <p class="text-muted">Datos del ingreso varios</p>
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
            <div class="col-12">
            <input
                type="text"
                v-model="form.reference"
                class="form-control"
                placeholder="Número de documento, referencia, etc."
            />
            </div>
            <div class="col-12">
            <textarea
                v-model="form.description"
                class="form-control"
                rows="3"
                placeholder="Descripción detallada del ingreso..."
            ></textarea>
            </div>
        </div>
        </div>

        <!-- Formas de Ingreso (stacked debajo) -->
        <div class="card p-3 mb-4">
        <PaymentForms
            :total="form.amount"
            :types="paymentTypes"
            v-model:payments="payments"
        />
        </div>

        <!-- Botón Registrar -->
        <div class="d-flex justify-content-end">
        <button class="btn btn-dark w-100" @click="submitIngreso">
            <i class="bi bi-save me-1"></i>Registrar Ingreso
        </button>
        </div>
    </div>
  </div>
</template>


<script setup>
import { reactive, ref } from 'vue'
//import { useRouter } from 'vue-router'
import AppNavbar from '@/components/AppNavbar.vue'
import AppHeader from '@/components/AppHeader.vue'
import PaymentForms from '@/components/PaymentForms.vue'

//const router = useRouter()
const categories = ['Ventas Varios', 'Donaciones', 'Devoluciones','Otros Ingresos']
const paymentTypes = ['Efectivo', 'Tarjeta', 'Cheque', 'Transferencia']

const form = reactive({
  category: '',
  amount: 0,
  reference: '',
  description: ''
})

const payments = ref([])

function submitIngreso() {
  console.log('Enviar ingreso form:', form)
  console.log('Pagos:', payments.value)
  // Aquí la llamada APIconsole.log('Pagos:', payments.value)
  //router.push({ name: 'Caja' })
}
</script>
