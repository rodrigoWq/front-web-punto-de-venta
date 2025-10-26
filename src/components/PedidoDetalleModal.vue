<template>
  <div
    v-if="open"
  class="modal fade show d-block"
  tabindex="-1"
  role="dialog"
  aria-modal="true"
  >
    <div class="modal-dialog modal-xl modal-dialog-scrollable" role="document">
      <div class="modal-content">
        <!-- Header -->
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="bi bi-receipt me-2"></i>
            Detalle del Pedido #{{ pedido?.pedido_id || '—' }}
            <span v-if="pedido" :class="['badge', 'ms-3', badgeClass(pedido.estado)]">
              {{ pedido.estado || '—' }}
            </span>
          </h5>
          <button
            type="button"
            class="btn-close"
            aria-label="Cerrar"
            @click="cerrar"
          ></button>
        </div>

        <!-- Body -->
        <div class="modal-body">
          <div v-if="cargando" class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Cargando...</span>
            </div>
            <p class="mt-3 text-muted">Cargando detalles del pedido...</p>
          </div>

          <div v-else-if="error" class="alert alert-danger">
            <i class="bi bi-exclamation-triangle me-2"></i>
            {{ error }}
          </div>

          <div v-else-if="pedido">
            <!-- Información del Cliente -->
            <div class="card mb-3">
              <div class="card-header bg-primary text-white">
                <i class="bi bi-person-circle me-2"></i>
                Información del Cliente
              </div>
              <div class="card-body">
                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label fw-bold">Nombre del Cliente</label>
                    <p class="form-control-plaintext">{{ pedido.nombre_cliente || '—' }}</p>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-bold">Nro. Documento</label>
                    <p class="form-control-plaintext">{{ pedido.nro_documento || '—' }}</p>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-bold">Teléfono</label>
                    <p class="form-control-plaintext">{{ pedido.telefono || '—' }}</p>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-bold">Email</label>
                    <p class="form-control-plaintext">{{ pedido.email || '—' }}</p>
                  </div>
                  <div class="col-12">
                    <label class="form-label fw-bold">Dirección</label>
                    <p class="form-control-plaintext">{{ pedido.direccion || '—' }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Detalles de Productos -->
            <div class="card mb-3">
              <div class="card-header bg-success text-white">
                <i class="bi bi-box-seam me-2"></i>
                Productos del Pedido
              </div>
              <div class="card-body">
                <div class="table-responsive">
                  <table class="table table-sm table-hover">
                    <thead class="table-light">
                      <tr>
                        <th>#</th>
                        <th>Código de Barras</th>
                        <th>Producto</th>
                        <th>Cantidad</th>
                        <th>Unidad</th>
                        <th class="text-end">Precio Unit.</th>
                        <th class="text-end">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-if="!pedido.detalles || !pedido.detalles.length">
                        <td colspan="7" class="text-center text-muted py-3">
                          No hay productos en este pedido
                        </td>
                      </tr>
                      <tr
                        v-for="(detalle, index) in pedido.detalles"
                        :key="detalle.detalle_id"
                      >
                        <td>{{ index + 1 }}</td>
                        <td>{{ detalle.codigo_barras || '—' }}</td>
                        <td>{{ detalle.producto_nombre || '—' }}</td>
                        <td>{{ detalle.cantidad }}</td>
                        <td>{{ detalle.unidad_medida_nombre || '—' }}</td>
                        <td class="text-end">{{ formatearMonto(detalle.precio) }}</td>
                        <td class="text-end">{{ formatearMonto(detalle.cantidad * detalle.precio) }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <!-- Totales -->
            <div class="card">
              <div class="card-header bg-dark text-white">
                <i class="bi bi-calculator me-2"></i>
                Resumen de Totales
              </div>
              <div class="card-body">
                <div class="row g-2">
                  <div class="col-md-4">
                    <div class="d-flex justify-content-between">
                      <span class="fw-bold">Total sin IVA:</span>
                      <span>{{ formatearMonto(pedido.total_sin_iva) }} ₲</span>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="d-flex justify-content-between">
                      <span class="fw-bold">IVA:</span>
                      <span>{{ formatearMonto(pedido.iva) }} ₲</span>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="d-flex justify-content-between align-items-center bg-light p-2 rounded">
                      <span class="fw-bold fs-5">Total Neto:</span>
                      <span class="text-success fw-bold fs-5">{{ formatearMonto(pedido.total_neto) }} ₲</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-secondary"
            @click="cerrar"
          >
            <i class="bi bi-x-circle me-1"></i>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </div>
  <div v-if="open" class="modal-backdrop fade show"></div>
</template>

<script>
import apiService from '../services/apiService.js';

export default {
  name: 'PedidoDetalleModal',
  props: {
    open: {
      type: Boolean,
      default: false
    },
    pedidoId: {
      type: [Number, String],
      default: null
    }
  },
  emits: ['close'],
  data() {
    return {
      pedido: null,
      cargando: false,
      error: null
    };
  },
  watch: {
    open(newVal) {
      if (newVal && this.pedidoId) {
        this.cargarDetalle();
      } else if (!newVal) {
        this.limpiar();
      }
      // Controlar overflow del body
      if (newVal) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    }
  },
  methods: {
    async cargarDetalle() {
      this.cargando = true;
      this.error = null;
      this.pedido = null;
      try {
        const { data } = await apiService.get(
          `${process.env.VUE_APP_API_BASE_URL}/api/orders/pending/${this.pedidoId}`
        );
        this.pedido = data;
      } catch (err) {
        console.error('Error al cargar detalle del pedido:', err);
        this.error = 'No se pudo cargar la información del pedido. Por favor, intente nuevamente.';
      } finally {
        this.cargando = false;
      }
    },
    cerrar() {
      this.$emit('close');
    },
    limpiar() {
      this.pedido = null;
      this.error = null;
      this.cargando = false;
    },
    formatearMonto(monto) {
      const numero = Number(monto);
      if (!Number.isFinite(numero)) return '0';
      return Number(Math.round(numero)).toLocaleString('es-PY', { minimumFractionDigits: 0 });
    },
    formatearFecha(valor) {
      if (!valor) return '—';
      const fecha = new Date(valor);
      if (Number.isNaN(fecha.getTime())) return '—';
      return `${fecha.toLocaleDateString('es-PY')} ${fecha.toLocaleTimeString('es-PY', {
        hour: '2-digit',
        minute: '2-digit'
      })}`;
    },
    formatearFechaSolo(valor) {
      if (!valor) return '—';
      const fecha = new Date(valor);
      if (Number.isNaN(fecha.getTime())) return '—';
      return fecha.toLocaleDateString('es-PY');
    },
    badgeClass(estado) {
      const normalized = (estado || '').toLowerCase();
      if (normalized === 'pendiente') return 'bg-warning text-dark';
      if (normalized === 'completado' || normalized === 'finalizado') return 'bg-success';
      if (normalized === 'cancelado' || normalized === 'anulado') return 'bg-danger';
      return 'bg-secondary';
    }
  },
  beforeUnmount() {
    document.body.style.overflow = '';
  }
};
</script>

<style scoped>
.modal {
  background-color: rgba(0, 0, 0, 0.5);
}

.form-control-plaintext {
  padding: 0.375rem 0;
  margin-bottom: 0;
  color: #495057;
}

.card-header {
  font-weight: 600;
}

.table th {
  font-weight: 600;
  font-size: 0.9rem;
}

.badge {
  font-size: 0.9rem;
  padding: 0.5rem 0.75rem;
}
</style>
