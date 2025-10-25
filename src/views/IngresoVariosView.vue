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

    <div class="row mt-4">
      <!-- Columna izquierda: Información del Ingreso -->
      <div class="col-12 col-md-7">
        <div class="card p-4 mb-4 h-100">
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
                rows="6"
                placeholder="Descripción detallada del ingreso..."
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
            v-model:payments="payments"
          />
          <button class="btn btn-dark w-100 mt-3" @click="submitIngreso">
            <i class="bi bi-save me-1"></i>Registrar Ingreso
          </button>
        </div>
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
import apiService from '@/services/apiService.js'

//const router = useRouter()
const categories = ['Reposición en caja para Pago a Proveedores', 'Reposición por diferencia en caja', 'Devoluciones','Otros Ingresos']
const paymentTypes = ['Efectivo', 'Tarjeta', 'Cheque', 'Transferencia']

const form = reactive({
  category: '',
  amount: 0,
  reference: '',
  description: ''
})

const payments = ref([])

function submitIngreso() {
  // Construir payload para el backend
  const payload = {
    concepto: form.category || 'Otros Ingresos',
    detalle: form.description || form.reference || '',
    pagos: (payments.value || []).map(p => ({
      metodo_pago: (p.type || p.metodo || '').toString().toUpperCase(),
      monto: Number(p.amount || 0),
      referencia_externa: p.reference ?? null
    }))
  }

  console.log('Payload registro ingreso varios:', payload)

  // Enviar al backend
  ;(async () => {
    try {
      const res = await apiService.post('/api/cashbox/register-vario-income', payload)
      console.log('Respuesta register-vario-income:', res.data)
      alert('Ingreso registrado correctamente')
      // limpiar formulario y pagos
      form.category = ''
      form.amount = 0
      form.reference = ''
      form.description = ''
      payments.value = []
      // opcional: navegar a caja
      // router.push({ name: 'Caja' })
    } catch (err) {
      console.error('Error registrando ingreso varios:', err)
      alert('Error al registrar el ingreso. Revisa la consola para más detalles.')
    }
  })()
}
</script>
