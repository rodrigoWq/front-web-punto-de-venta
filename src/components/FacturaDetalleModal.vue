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
      <button 
        class="btn btn-outline-warning" 
        @click="volverAPedido"
        :disabled="loadingVolverPedido"
      >
        <span v-if="loadingVolverPedido" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
        <i v-else class="bi bi-arrow-counterclockwise me-1"></i>
        Volver a Pedido
      </button>
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
  nroFactura: { type: String, default: null },
  movimientoId: { type: Number, default: null }
})
const emit = defineEmits(['close', 'pedido-convertido'])

const loading = ref(false)
const error = ref('')
const factura = ref(null)
const loadingVolverPedido = ref(false)

watch(
  () => [props.show, props.nroFactura],
  async ([open, nro]) => {
    if (!open || !nro) return
    loading.value = true
    error.value = ''
    factura.value = null
    try {
      // Usar el nuevo endpoint con nro_comprobante_origen
      const { data } = await apiService.get(`/api/orders/pending/${nro}`)
      
      console.log('Respuesta detalle pedido/factura:', data)
      
      if (!data) throw new Error('Respuesta vacía')
      
      // Mapear la respuesta del nuevo endpoint al formato esperado por el modal
      factura.value = {
        nro_factura: nro, // Usamos el nro_comprobante_origen como nro_factura
        cabecera: {
          fecha_emision: data.fecha_hora || data.creado_en,
          nombre_razon_social: data.nombre_cliente,
          tipo_documento: 'RUC/CI',
          nro_documento: data.nro_documento,
          credito_contado: 'CONTADO', // Asumimos contado por defecto
          total_sin_iva: data.total_sin_iva,
          total_iva: data.iva,
          total_iva_incluido: data.total_neto
        },
        detalles: (data.detalles || []).map(detalle => ({
          codigo_producto: detalle.codigo_barras,
          codigo_barras: detalle.codigo_barras,
          nombre_producto: detalle.producto_nombre || detalle.nombre_producto,
          descripcion: '', // No viene en la respuesta
          cantidad: detalle.cantidad,
          unidad_medida: detalle.unidad_medida_nombre || '',
          precio_unitario_bruto: detalle.precio,
          iva: 0, // Calcular si es necesario
          descuento: 0
        }))
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

// Función para volver a pedido
async function volverAPedido() {
  if (!props.movimientoId) {
    alert('No se puede determinar el ID de movimiento')
    return
  }
  
  const confirmacion = confirm('¿Está seguro que desea volver esta factura a pedido?')
  if (!confirmacion) return

  loadingVolverPedido.value = true
  
  try {
    const payload = {
      movimiento_id: props.movimientoId,
      accion: 'EDITAR'
    }
    
    console.log('Payload -> /api/cashbox/collect-sale (Volver a Pedido):', payload)
    
    const response = await apiService.post('/api/cashbox/collect-sale', payload)
    
    console.log('Respuesta volver a pedido:', response?.data)
    
    if (response?.data?.ok) {
      const { pedido_id, status, subestado } = response.data.data
      alert(`Factura convertida a pedido exitosamente.\nPedido ID: ${pedido_id}\nEstado: ${status}\nSubestado: ${subestado}`)
      emit('pedido-convertido') // Notificar al padre para recargar la lista
      emit('close')
    } else {
      alert('Error: La operación no se completó correctamente')
    }
  } catch (err) {
    console.error('Error al volver a pedido:', err)
    alert('Error al procesar la solicitud. Revisa la consola para más detalles.')
  } finally {
    loadingVolverPedido.value = false
  }
}
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
