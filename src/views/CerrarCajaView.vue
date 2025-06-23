<template>
  <AppNavbar />
  <div class="container mt-4" id="cerrar-caja-view">
    <AppHeader title="Cierre de Caja" subtitle="Arqueo y cierre de sesión">
      <template #buttons>
        <button class="btn btn-outline-secondary" @click="goBack">
          <i class="bi bi-arrow-left me-1"></i>Volver al Dashboard
        </button>
      </template>
    </AppHeader>

    <div class="card p-4 mb-4">
      <h5><i class="bi bi-clock me-2"></i>Resumen de la Sesión</h5>
      <p class="text-muted">Movimientos registrados durante la sesión actual</p>

      <div class="row mt-3">
        <div class="col-md-3 mb-3">
          <div class="card p-3 text-center bg-primary bg-opacity-10">
            <div><i class="bi bi-currency-dollar fs-3 text-primary"></i></div>
            <div class="mt-2">Monto Inicial</div>
            <h5 class="text-primary mt-1">{{ formatCurrency(resumen.initial) }}</h5>
          </div>
        </div>
        <div class="col-md-3 mb-3">
          <div class="card p-3 text-center bg-success bg-opacity-10">
            <div><i class="bi bi-graph-up fs-3 text-success"></i></div>
            <div class="mt-2">Total Ingresos</div>
            <h5 class="text-success mt-1">{{ formatCurrency(resumen.ingresos) }}</h5>
          </div>
        </div>
        <div class="col-md-3 mb-3">
          <div class="card p-3 text-center bg-danger bg-opacity-10">
            <div><i class="bi bi-graph-down fs-3 text-danger"></i></div>
            <div class="mt-2">Total Egresos</div>
            <h5 class="text-danger mt-1">{{ formatCurrency(resumen.egresos) }}</h5>
          </div>
        </div>
        <div class="col-md-3 mb-3">
          <div class="card p-3 text-center bg-purple-light">
            <div><i class="bi bi-calculator fs-3 text-purple"></i></div>
            <div class="mt-2">Saldo Esperado</div>
            <h5 class="text-purple mt-1">{{ formatCurrency(expected) }}</h5>
          </div>
        </div>
      </div>
    </div>

    <!-- Template: sección de conteo físico de efectivo -->
    <div class="card p-3 mb-4">
    <h5><i class="bi bi-calculator me-2"></i>Conteo Físico de Efectivo</h5>
    <p class="text-muted">Registre la cantidad de billetes y monedas en caja</p>

    <div class="list-group">
        <div
        class="list-group-item d-flex align-items-center"
        v-for="den in denominaciones"
        :key="den.valor"
        >
        <div class="flex-grow-1">
            <div class="fw-bold">{{ formatCurrency(den.valor) }}</div>
        </div>
        <div class="flex-shrink-0 mx-3 input-col">
            <input
            type="number"
            class="form-control"
            v-model.number="den.cantidad"
            min="0"
            style="width: 180px;"
            />
        </div>
        <div class="flex-grow-1 text-end">
            <div class="fw-bold">{{ formatCurrency(den.subtotal) }}</div>
            <small>{{ den.cantidad }} unidad(es)</small>
        </div>
        </div>

        <div class="list-group-item d-flex justify-content-between fw-bold">
        <div>TOTAL CONTADO</div>
        <div>{{ formatCurrency(totalContado) }}</div>
        </div>
    </div>
    </div>

    <!-- Comparación de Saldos -->
    <div class="card p-4 mb-4">
    <h5><i class="bi bi-clipboard-check me-2"></i>Comparación de Saldos</h5>
    <p class="text-muted">Verificación entre el saldo esperado y el conteo físico</p>

    <div class="row g-3 mt-3">
        <!-- Saldo Esperado -->
        <div class="col-md-4">
        <div class="card border p-3 text-center">
            <div>Saldo Esperado</div>
            <h5 class="mt-2">{{ formatCurrency(expected) }}</h5>
        </div>
        </div>
        <!-- Saldo Contado -->
        <div class="col-md-4">
        <div class="card border p-3 text-center">
            <div>Saldo Contado</div>
            <h5 class="mt-2">{{ formatCurrency(totalContado) }}</h5>
        </div>
        </div>
        <!-- Diferencia -->
        <div class="col-md-4">
        <div
            class="card p-3 text-center"
            :class="[
            'border',
            `bg-${differenceVariant} bg-opacity-10`,
            `text-${differenceVariant}`
            ]"
        >
            <div>Diferencia</div>
            <h5 class="mt-2">{{ differenceFormatted }}</h5>
        </div>
        </div>
    </div>

    <!-- Alerta solo si hay diferencia -->
    <div
        v-if="difference !== 0"
        class="alert alert-warning mt-4 d-flex align-items-start"
    >
        <i class="bi bi-exclamation-triangle-fill fs-4 me-2"></i>
        <div>
        <strong>Diferencia Detectada</strong>
        <p class="mb-0">
            {{ difference > 0
            ? 'Hay un sobrante en caja. Verifique el conteo.'
            : 'Hay un faltante en caja. Verifique el conteo.' }}
        </p>
        </div>
    </div>
    </div>

    <!-- Template: sección de Observaciones + botones -->
    <div class="card p-3 mb-4">
        <h5>Observaciones</h5>
        <p class="text-muted">Comentarios adicionales sobre el cierre de caja</p>
        <textarea
            v-model="observaciones"
            class="form-control"
            rows="3"
            placeholder="Ingrese cualquier observación sobre el cierre de caja..."
        ></textarea>
    </div>
    <div class="d-flex justify-content-end gap-2 mb-4">
        <button class="btn btn-outline-secondary" @click="goBack">Cancelar</button>
        <button class="btn btn-dark" @click="submitCerrarCaja">
            <i class="bi bi-save me-1"></i>Cerrar Caja
        </button>
    </div>



  </div>
</template>

<script setup>
import { reactive, computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppNavbar from '@/components/AppNavbar.vue'
import AppHeader from '@/components/AppHeader.vue'

const observaciones = ref('')

const router = useRouter()
function goBack() {
  router.push({ name: 'Caja' })
}

function submitCerrarCaja() {
  // Ejemplo: enviar { resumen, totalContado, observaciones: observaciones.value } a la API
  console.log('Cerrar caja con observaciones:', observaciones.value)
  // luego redirigir o mostrar confirmación...
}



const difference = computed(() => totalContado.value - expected.value)

const differenceFormatted = computed(() => {
  const abs = Math.abs(difference.value)
  const sign = difference.value > 0 ? '+' : difference.value < 0 ? '–' : '+'
  return `${sign}${formatCurrency(abs)}`
})

// Variante para clases: success si cero, danger si hay diferencia
const differenceVariant = computed(() =>
  difference.value === 0 ? 'success' : 'danger'
)

// Array reactivo de denominaciones
const denominaciones = reactive([
  { valor: 100000, cantidad: 0 },
  { valor: 50000,  cantidad: 0 },
  { valor: 20000,  cantidad: 0 },
  { valor: 10000,  cantidad: 0 },
  { valor: 5000,   cantidad: 0 },
  { valor: 2000,   cantidad: 0 },
  { valor: 1000,   cantidad: 0 },
  { valor: 500,    cantidad: 0 },
  { valor: 100,    cantidad: 0 },
  { valor: 50,     cantidad: 0 }
])

// Getter subtotal en cada objeto
denominaciones.forEach(den => {
  Object.defineProperty(den, 'subtotal', {
    get() { return den.valor * den.cantidad }
  })
})

// Cálculo del total contado
const totalContado = computed(() =>
  denominaciones.reduce((sum, den) => sum + den.subtotal, 0)
)

// Formateo de moneda
function formatCurrency(value) {
  return new Intl.NumberFormat('es-PY', {
    style: 'currency',
    currency: 'PYG'
  }).format(value)
}


// Datos dummy para el resumen; más tarde vendrán de la API
const resumen = reactive({
  initial: 500000,
  ingresos: 350000,
  egresos: 125000
})

const expected = computed(() => resumen.initial + resumen.ingresos - resumen.egresos)

</script>

<style scoped>
#cerrar-caja-view .card {
  border-radius: 0.5rem;
}
.bg-purple-light {
  background-color: rgba(111, 66, 193, 0.1);
}
.text-purple {
  color: #6f42c1;
}

.list-group-item {
  border: 1px solid #e9ecef;
  border-radius: 0.5rem;
  margin-bottom: 0.5rem;
}
.mb-4 {
  margin-bottom: 1.5rem;
}
</style>
