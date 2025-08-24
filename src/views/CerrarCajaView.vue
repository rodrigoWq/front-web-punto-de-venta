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

    <form @submit.prevent="cerrarCaja"></form>
    <div class="card p-4 mb-4">
      <h5><i class="bi bi-clock me-2"></i>Resumen de la Sesión</h5>
      <p class="text-muted">Movimientos registrados durante la sesión actual</p>

      <div class="row mt-3">
        <div class="col-md-3 mb-3">
          <div class="card p-3 text-center bg-primary bg-opacity-10">
            <div><i class="bi bi-currency-dollar fs-3 text-primary"></i></div>
            <div class="mt-2">Monto Inicial</div>
            <h5 class="text-primary mt-1">{{ formatCurrency(initialMonto) }}</h5>
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
          <div>TOTAL CONTADO (Efectivo)</div>
          <div>{{ formatCurrency(totalContadoEfectivo) }}</div>
        </div>
    </div>
    </div>

    <!-- Pagos no en efectivo: sección separada y entradas apiladas verticalmente -->
    <div class="card p-3 mb-4">
      <h5><i class="bi bi-credit-card me-2"></i>Pagos no en efectivo</h5>
      <p class="text-muted">Registre montos recibidos por transferencias, tarjetas o cheques</p>

      <div class="list-group mt-3">
        <!-- Transferencias -->
        <div class="list-group-item d-flex align-items-center">
          <div class="flex-shrink-0" style="width: 450px">
            <div class="fw-bold">Transferencias</div>
          </div>
          <div class="flex-shrink-0 mx-5 ps-4">
            <input
              type="number"
              class="form-control"
              v-model.number="closeForm.montoTransferencia"
              min="0"
              placeholder="0"
              style="width: 180px;"
            />
          </div>
          <div class="flex-grow-1 text-end">
            <div class="fw-bold">{{ formatCurrency(closeForm.montoTransferencia || 0) }}</div>
          </div>
        </div>
        
        <!-- Tarjetas -->
        <div class="list-group-item d-flex align-items-center">
          <div class="flex-shrink-0" style="width: 450px">
            <div class="fw-bold">Tarjetas (POS)</div>
          </div>
          <div class="flex-shrink-0 mx-5 ps-4">
            <input
              type="number"
              class="form-control"
              v-model.number="closeForm.montoPos"
              min="0"
              placeholder="0"
              style="width: 180px;"
            />
          </div>
          <div class="flex-grow-1 text-end">
            <div class="fw-bold">{{ formatCurrency(closeForm.montoPos || 0) }}</div>
          </div>
        </div>
        
        <!-- Cheques -->
        <div class="list-group-item d-flex align-items-center">
          <div class="flex-shrink-0" style="width: 450px">
            <div class="fw-bold">Cheques</div>
          </div>
          <div class="flex-shrink-0 mx-5 ps-4">
            <input
              type="number"
              class="form-control"
              v-model.number="closeForm.montoCheque"
              min="0"
              placeholder="0"
              style="width: 180px;"
            />
          </div>
          <div class="flex-grow-1 text-end">
            <div class="fw-bold">{{ formatCurrency(closeForm.montoCheque || 0) }}</div>
          </div>
        </div>
        
        <!-- Total no efectivo -->
        <div class="list-group-item d-flex justify-content-between fw-bold">
          <div>TOTAL NO EFECTIVO</div>
          <div>{{ formatCurrency(totalNoEfectivo) }}</div>
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
    <form @submit.prevent="cerrarCaja">
      <!-- Template: sección de Observaciones + botones -->
      <div class="card p-3 mb-4">
          <h5>Observaciones</h5>
          <p class="text-muted">Comentarios adicionales sobre el cierre de caja</p>
          <textarea
              v-model="closeForm.observacion"
              class="form-control"
              rows="3"
              placeholder="Ingrese cualquier observación sobre el cierre de caja..."
          ></textarea>
      </div>
      <div class="d-flex justify-content-end gap-2 mb-4">
          <button class="btn btn-outline-secondary" @click="goBack">Cancelar</button>
          <button class="btn btn-dark" type="submit">
              <i class="bi bi-save me-1"></i>Cerrar Caja
          </button>
      </div>
    </form>



  </div>
</template>

<script setup>
import { reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppNavbar from '@/components/AppNavbar.vue'
import AppHeader from '@/components/AppHeader.vue'
import { useCashboxStore } from '@/stores/cashbox'
import apiService from '@/services/apiService'

const cashboxStore = useCashboxStore()
const router = useRouter()


// cargar datos de la caja abierta y exponer valores
onMounted(() => {
  cashboxStore.fetchCurrentOpen()
})

const initialMonto = computed(() => cashboxStore.montoInicial)

function goBack() {
  router.push({ name: 'Caja' })
}

const closeForm = reactive({
  montoContado      : null,
  montoEfectivo     : null,
  montoCheque       : 0,
  montoTransferencia: 0,
  montoPos          : 0,
  observacion       : ''
})


async function cerrarCaja () {
  try {
    // Ajuste de mapeo:
    // - monto_contado debe ser la suma de todos los montos ingresados (efectivo + no efectivo)
    // - monto_efectivo es solo el total contado en efectivo
    closeForm.montoContado   = totalContado.value
    closeForm.montoEfectivo  = totalContadoEfectivo.value
    // 1️⃣ Prepara y loguea el payload
    const payload = {
      monto_contado      : closeForm.montoContado || 0,
      monto_efectivo     : closeForm.montoEfectivo || 0,
      monto_cheque       : closeForm.montoCheque || 0,
      monto_transferencia: closeForm.montoTransferencia || 0,
      monto_pos          : closeForm.montoPos || 0,  
      observacion        : closeForm.observacion || 'Cierre de caja sin observaciones'
    }
    console.log('Cerrar Caja payload:', payload)
    console.log('Apertura ID:', cashboxStore.aperturaId)

    // 2️⃣ Envía al backend
    const res = await apiService.put(
      `/api/cashbox/close/${cashboxStore.aperturaId}`,
      payload
    )

    // 3️⃣ Manejo de respuestas (success true/false en body)
    const body = res?.data || {}
    if (body.success) {
      const d = body.data || {}
      const totalEfe = d?.totales?.EFECTIVO ?? payload.monto_efectivo
      const totalPos = d?.totales?.TARJETA ?? payload.monto_pos
      const totalTrans = d?.totales?.TRANSFERENCIA ?? payload.monto_transferencia
      const totalChq = d?.totales?.CHEQUE ?? payload.monto_cheque
      window.alert(
        [`Caja cerrada correctamente`,
         `Monto final: ${formatCurrency(Number(d?.monto_final ?? payload.monto_contado))}`,
         `Diferencia: ${formatCurrency(Number(d?.diferencia ?? 0))}`,
         `Totales → Efectivo: ${formatCurrency(Number(totalEfe))}, POS: ${formatCurrency(Number(totalPos))}, Transf.: ${formatCurrency(Number(totalTrans))}, Cheque: ${formatCurrency(Number(totalChq))}`
        ].join('\n')
      )
      // refrescar estado global y volver a Caja
      await cashboxStore.fetchCurrentOpen()
      router.push({ name: 'Caja' })
      return
    }

    // success === false: mostrar detalle según estructura
    const msg = body.message || 'No se pudo cerrar la caja'
    const data = body.data

    // Caso 1: diferencias por medio de pago
    if (data && data.totales && data.diferencias) {
      const dif = data.diferencias
      const lines = [
        msg,
        '',
        `Totales del sistema:`,
        ` - Efectivo: ${formatCurrency(Number(data.totales.EFECTIVO || 0))}`,
        ` - Transferencia: ${formatCurrency(Number(data.totales.TRANSFERENCIA || 0))}`,
        ` - POS/Tarjeta: ${formatCurrency(Number(data.totales.TARJETA || 0))}`,
        ` - Cheque: ${formatCurrency(Number(data.totales.CHEQUE || 0))}`,
        '',
        `Diferencias detectadas:`,
        ` - efectivo: ${dif.efectivo}`,
        ` - transferencia: ${dif.transferencia}`,
        ` - pos: ${dif.pos}`,
        ` - cheque: ${dif.cheque}`
      ]
      window.alert(lines.join('\n'))
      return
    }

    // Caso 2: suma de montos no coincide con monto_contado
    if (data && (data.monto_contado !== undefined) && (data.suma_montos !== undefined)) {
      window.alert([
        msg,
        `Monto contado: ${formatCurrency(Number(data.monto_contado))}`,
        `Suma de montos ingresados: ${formatCurrency(Number(data.suma_montos))}`
      ].join('\n'))
      return
    }

    // Caso 3: ventas/movimientos pendientes
    if (Array.isArray(data)) {
      const count = data.length
      const preview = data.slice(0, 5).map((m, i) => `${i+1}. ${m.tipo_movimiento} ${m.tipo_operacion || ''} - ${m.descripcion || ''} (${formatCurrency(Number(m.monto_total || 0))})`).join('\n')
      window.alert([
        msg,
        `Pendientes: ${count}`,
        preview
      ].join('\n'))
      return
    }

    // Caso genérico
    window.alert(msg)
  } catch (err) {
    console.error(err)
    alert('Error al cerrar caja')
  }
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

// Totales separados: efectivo y no efectivo
const totalContadoEfectivo = computed(() =>
  denominaciones.reduce((sum, den) => sum + den.subtotal, 0)
)

const totalNoEfectivo = computed(() => {
  return (
    Number(closeForm.montoTransferencia || 0) +
    Number(closeForm.montoPos || 0) +
    Number(closeForm.montoCheque || 0)
  )
})

// Total combinado
const totalContado = computed(() => totalContadoEfectivo.value + totalNoEfectivo.value)

// Formateo de moneda
function formatCurrency(value) {
  return new Intl.NumberFormat('es-PY', {
    style: 'currency',
    currency: 'PYG'
  }).format(value)
}


// Resumen dinámico desde el store (alimentado por /api/cashbox/open/current/)
const resumen = computed(() => ({
  ingresos: Number(cashboxStore.igresos_dia || 0),
  egresos : Number(cashboxStore.egresos_dia || 0)
}))

// Saldo esperado reportado/calculado por backend
const expected = computed(() => Number(cashboxStore.saldo_en_caja || 0))

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
