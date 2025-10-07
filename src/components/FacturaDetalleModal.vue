<template>
  <AppModal
    :modalId="'facturaDetalleModal'"
    :showModal="show"
    title="Detalle de Factura"
    :withBackdrop="true"
    :dialogClass="['modal-lg', 'modal-dialog-centered', 'modal-dialog-scrollable', 'modal-xl']"
    :contentClass="'shadow'"
    @close="emit('close')"
  >
    <template #body>
      <div v-if="loading" class="d-flex align-items-center justify-content-center py-4">
        <div class="spinner-border text-secondary me-2" role="status" />
        <span>Cargando detalle...</span>
      </div>

      <div v-else-if="error" class="alert alert-danger">
        {{ error }}
      </div>

      <div v-else-if="factura">
        <!-- Cabecera -->
        <div class="row g-3 mb-3">
          <div class="col-12 col-md-6">
            <div class="small text-muted">Nro. Factura</div>
            <div class="fw-bold">{{ factura.nro_factura }}</div>
          </div>
          <div class="col-12 col-md-6">
            <div class="small text-muted">Fecha de Emisión</div>
            <div class="fw-bold">{{ formatDate(factura.cabecera?.fecha_emision) }}</div>
          </div>
          <div class="col-12 col-md-6">
            <div class="small text-muted">Cliente</div>
            <div class="fw-bold">{{ factura.cabecera?.nombre_razon_social }}</div>
            <div class="text-muted small">{{ factura.cabecera?.tipo_documento }} {{ factura.cabecera?.nro_documento }}</div>
          </div>
          <div class="col-12 col-md-6">
            <div class="small text-muted">Condición</div>
            <span class="badge" :class="(factura.cabecera?.credito_contado || '').toUpperCase() === 'CREDITO' ? 'bg-warning text-dark' : 'bg-success'">
              {{ factura.cabecera?.credito_contado }}
            </span>
          </div>
        </div>

        <!-- Detalle -->
        <div class="table-responsive">
          <table class="table table-sm align-middle table-details">
            <thead class="table-light">
              <tr>
                <th class="text-nowrap">Código</th>
                <th>Producto</th>
                <th class="text-end">Cant.</th>
                <th class="text-end text-nowrap">P. Unit.</th>
                <th class="text-end">IVA</th>
                <th class="text-end">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(d, idx) in factura.detalles" :key="idx">
                <td class="text-nowrap">{{ d.codigo_producto || d.codigo_barras }}</td>
                <td>
                  <div class="fw-semibold">{{ d.nombre_producto }}</div>
                  <div class="text-muted small">{{ d.descripcion }}</div>
                </td>
                <td class="text-end">{{ d.cantidad }} {{ d.unidad_medida }}</td>
                <td class="text-end">{{ money(d.precio_unitario_bruto) }}</td>
                <td class="text-end">{{ money(d.iva) }}</td>
                <td class="text-end">{{ money(d.cantidad * d.precio_unitario_bruto - (d.descuento || 0)) }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colspan="5" class="text-end fw-semibold">Total sin IVA</td>
                <td class="text-end">{{ money(factura.cabecera?.total_sin_iva || totalSinIva) }}</td>
              </tr>
              <tr>
                <td colspan="5" class="text-end fw-semibold">Total IVA</td>
                <td class="text-end">{{ money(factura.cabecera?.total_iva || totalIva) }}</td>
              </tr>
              <tr class="table-light">
                <td colspan="5" class="text-end fw-bold">Total</td>
                <td class="text-end fw-bold">{{ money(factura.cabecera?.total_iva_incluido || totalConIva) }}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </template>

    <template #footer>
      <button class="btn btn-outline-secondary" @click="$emit('close')">
        Cerrar
      </button>
    </template>
  </AppModal>
</template>

<script setup>
/* global defineProps, defineEmits */
import { computed, watch, ref } from 'vue'
import AppModal from '@/components/AppModal.vue'
import apiService from '@/services/apiService'

const props = defineProps({
  show: { type: Boolean, default: false },
  nroFactura: { type: String, default: null }
})
const emit = defineEmits(['close'])

const loading = ref(false)
const error = ref('')
const factura = ref(null)

watch(
  () => [props.show, props.nroFactura],
  async ([open, nro]) => {
    if (!open || !nro) return
    loading.value = true
    error.value = ''
    factura.value = null
    try {
      const { data } = await apiService.get('/api/sales/detail', { nro_factura: nro })
      if (!data?.ok || !data?.data) throw new Error('Respuesta inválida')
      // Normalizar el shape para el modal
      const cab = data.data.cabecera || {}
      const detalles = data.data.detalles_productos || []
      factura.value = {
        nro_factura: cab.nro_factura,
        cabecera: cab,
        detalles
      }
    } catch (e) {
      error.value = 'No se pudo cargar el detalle de la factura.'
      console.error(e)
    } finally {
      loading.value = false
    }
  },
  { immediate: false }
)

const money = (v) => new Intl.NumberFormat('es-PY', { style: 'currency', currency: 'PYG' }).format(Number(v || 0))
const formatDate = (iso) => {
  if (!iso) return '-'
  try { return new Date(iso).toLocaleString() } catch { return iso }
}

const totalSinIva = computed(() => {
  if (!factura.value) return 0
  return factura.value.detalles.reduce((acc, d) => acc + (d.cantidad * d.precio_unitario_bruto - (d.descuento || 0) - (d.iva || 0)), 0)
})
const totalIva = computed(() => {
  if (!factura.value) return 0
  return factura.value.detalles.reduce((acc, d) => acc + (d.iva || 0), 0)
})
const totalConIva = computed(() => totalSinIva.value + totalIva.value)
</script>

<style scoped>
/* Compact table and spacing for better readability in modal */
.table {
  margin-bottom: 0;
}
.fw-semibold { font-weight: 600; }

.modal-body {
  max-height: 70vh;
  overflow: auto;
}

/* Más espacio horizontal entre columnas solo en esta tabla */
.table-details th,
.table-details td {
  padding-left: 1rem;
  padding-right: 1rem;
}
</style>
