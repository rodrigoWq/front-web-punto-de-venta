<template>
  <div>
    <AppNavbar />
    <div class="container mt-5">
      <AppHeader title="Ventas Facturas">
        <template #buttons>
          <button
            type="button"
            class="btn btn-outline-secondary"
            :disabled="cargando"
            @click="cargarVentas()"
          >
            <i class="bi bi-arrow-repeat me-1"></i>
            Recargar
          </button>
        </template>
      </AppHeader>

      <div class="table-responsive mt-4 card p-3">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <h2 class="mb-0">Listado de ventas</h2>
          <small class="text-muted">
            Página {{ paginaActual }} de {{ totalPaginas }} · {{ totalRegistros }} registros
          </small>
        </div>
        <table class="table table-striped align-middle">
          <thead>
            <tr>
              <th>N° factura</th>
              <th>Cliente</th>
              <th>Documento</th>
              <th>Fecha</th>
              <th class="text-end">Total IVA inc.</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="cargando">
              <td colspan="7" class="text-center py-4">Cargando ventas...</td>
            </tr>
            <tr v-else-if="!ventas.length">
              <td colspan="7" class="text-center py-4">No hay ventas para mostrar.</td>
            </tr>
            <tr v-else v-for="venta in ventas" :key="venta.id_venta">
              <td>{{ venta.nro_factura || '—' }}</td>
              <td>{{ venta.nombre_razon_social || '—' }}</td>
              <td>{{ venta.nro_documento || '—' }}</td>
              <td>{{ formatearFecha(venta.fecha_emision) }}</td>
              <td class="text-end">{{ formatearMonto(venta.total_iva_incluido || venta.total_sin_iva) }}</td>
              <td>
                <span :class="['badge', badgeClass(venta.estado)]">
                  {{ (venta.estado || '—').toUpperCase() }}
                </span>
              </td>
              <td>
                <button
                  type="button"
                  class="btn btn-outline-primary btn-sm"
                  @click="abrirDetalle(venta.id_venta)"
                >
                  <i class="bi bi-eye me-1"></i>
                  Ver detalle
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <AppPagination
        class="mt-3"
        :currentPage="paginaActual"
        :totalPages="totalPaginas"
        @page-changed="cambiarPagina"
      />
    </div>

    <div
      v-if="detalleModalAbierto"
      class="modal fade show d-block"
      tabindex="-1"
      role="dialog"
      aria-modal="true"
    >
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              Detalle de la venta
              <template v-if="detalleVenta?.cabecera?.nro_factura">
                #{{ detalleVenta.cabecera.nro_factura }}
              </template>
            </h5>
            <button type="button" class="btn-close" aria-label="Close" @click="cerrarDetalle"></button>
          </div>
          <div class="modal-body">
            <div v-if="detalleCargando" class="text-center py-4">Cargando detalle...</div>
            <div v-else-if="detalleError" class="alert alert-danger mb-0">
              {{ detalleError }}
            </div>
            <template v-else-if="detalleVenta">
              <section class="mb-3">
                <h6 class="fw-bold">Cabecera</h6>
                <div class="row g-2">
                  <div class="col-md-3"><strong>Comprobante:</strong> {{ detalleVenta.cabecera.nro_comprobante }}</div>
                  <div class="col-md-3"><strong>Timbrado:</strong> {{ detalleVenta.cabecera.timbrado }}</div>
                  <div class="col-md-3"><strong>Fecha emisión:</strong> {{ formatearFecha(detalleVenta.cabecera.fecha_emision) }}</div>
                  <div class="col-md-3"><strong>Moneda:</strong> {{ detalleVenta.cabecera.tipo_moneda }}</div>
                  <div class="col-md-3"><strong>Condición:</strong> {{ detalleVenta.cabecera.credito_contado }}</div>
                  <div class="col-md-3"><strong>Documento:</strong> {{ detalleVenta.cabecera.tipo_documento }} {{ detalleVenta.cabecera.nro_documento }}</div>
                  <div class="col-md-3"><strong>Cliente:</strong> {{ detalleVenta.cabecera.nombre_razon_social }}</div>
                  <div class="col-md-3"><strong>Teléfono:</strong> {{ detalleVenta.cabecera.telefono_celular || '—' }}</div>
                  <div class="col-md-6"><strong>Dirección:</strong> {{ detalleVenta.cabecera.direccion || '—' }}</div>
                  <div class="col-md-3"><strong>Estado:</strong> {{ detalleVenta.cabecera.estado }}</div>
                  <div class="col-md-3"><strong>Pendiente:</strong> {{ detalleVenta.cabecera.pendiente ? 'Sí' : 'No' }}</div>
                </div>
              </section>

              <section class="mb-3">
                <div class="d-flex justify-content-between align-items-center">
                  <h6 class="fw-bold mb-2">Productos</h6>
                  <small class="text-muted">IVA incl. y cantidades según detalle</small>
                </div>
                <div class="table-responsive">
                  <table class="table table-sm table-bordered align-middle">
                    <thead class="table-light">
                      <tr>
                        <th>Código</th>
                        <th>Descripción</th>
                        <th class="text-end">Cant.</th>
                        <th>UM</th>
                        <th class="text-end">Precio unit.</th>
                        <th class="text-end">Descuento</th>
                        <th class="text-end">IVA</th>
                        <th class="text-end">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="producto in detalleVenta.detalles_productos" :key="producto.id_detalle">
                        <td>{{ producto.codigo_producto || producto.codigo_barras || '—' }}</td>
                        <td>{{ producto.nombre_producto || producto.descripcion || '—' }}</td>
                        <td class="text-end">{{ producto.cantidad }}</td>
                        <td>{{ producto.unidad_medida || '—' }}</td>
                        <td class="text-end">{{ formatearMonto(producto.precio_unitario_bruto) }}</td>
                        <td class="text-end">{{ formatearMonto(producto.descuento) }}</td>
                        <td class="text-end">{{ formatearMonto(producto.iva) }}</td>
                        <td class="text-end">
                          {{ formatearMonto(producto.precio_unitario_neto * producto.cantidad) }}
                        </td>
                      </tr>
                      <tr v-if="!detalleVenta.detalles_productos?.length">
                        <td colspan="8" class="text-center">Sin productos registrados.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <section class="mb-2">
                <h6 class="fw-bold mb-2">Totales por IVA</h6>
                <div class="table-responsive">
                  <table class="table table-sm table-bordered align-middle">
                    <thead class="table-light">
                      <tr>
                        <th>Tipo IVA</th>
                        <th class="text-end">Gravado</th>
                        <th class="text-end">IVA</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="iva in detalleVenta.detalles_ivas" :key="iva.id_venta_iva">
                        <td>{{ iva.tipo_iva_id }}</td>
                        <td class="text-end">{{ formatearMonto(iva.gravado) }}</td>
                        <td class="text-end">{{ formatearMonto(iva.iva) }}</td>
                      </tr>
                      <tr v-if="!detalleVenta.detalles_ivas?.length">
                        <td colspan="3" class="text-center">Sin totales de IVA.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <section class="d-flex justify-content-end gap-3">
                <div class="text-end">
                  <div class="small text-muted">Total sin IVA</div>
                  <div class="fw-bold">{{ formatearMonto(detalleVenta.cabecera.total_sin_iva) }}</div>
                </div>
                <div class="text-end">
                  <div class="small text-muted">Total IVA</div>
                  <div class="fw-bold">{{ formatearMonto(detalleVenta.cabecera.total_iva) }}</div>
                </div>
                <div class="text-end">
                  <div class="small text-muted">Total IVA incluido</div>
                  <div class="fw-bold fs-5">{{ formatearMonto(detalleVenta.cabecera.total_iva_incluido) }}</div>
                </div>
              </section>
            </template>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="cerrarDetalle">Cerrar</button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="detalleModalAbierto" class="modal-backdrop fade show"></div>
  </div>
</template>

<script>
import AppNavbar from '@/components/AppNavbar.vue';
import AppHeader from '@/components/AppHeader.vue';
import AppPagination from '@/components/AppPagination.vue';
import apiService from '@/services/apiService.js';

export default {
  name: 'VentasFacturasView',
  components: {
    AppNavbar,
    AppHeader,
    AppPagination
  },
  data() {
    return {
      ventas: [],
      paginaActual: 1,
      pageSize: 5,
      totalPaginas: 1,
      totalRegistros: 0,
      cargando: false,
      sortBy: 'nro_comprobante',
      sortDir: 'asc',
      detalleModalAbierto: false,
      detalleCargando: false,
      detalleVenta: null,
      detalleError: ''
    };
  },
  mounted() {
    this.cargarVentas();
  },
  methods: {
    async cargarVentas(page = this.paginaActual) {
      this.cargando = true;
      try {
        const params = {
          pagina: page,
          pageSize: this.pageSize,
          sortBy: this.sortBy,
          sortDir: this.sortDir
        };

        const { data } = await apiService.get('/api/sales', params);
        const payload = data?.data || {};

        this.ventas = Array.isArray(payload.items) ? payload.items : [];
        this.paginaActual = Number(payload.pagina || page) || 1;
        this.totalPaginas = Number(payload.totalPages || 1) || 1;
        this.totalRegistros = Number(payload.total || this.ventas.length) || this.ventas.length;
      } catch (error) {
        console.error('Error al cargar ventas:', error);
        this.ventas = [];
        this.totalPaginas = 1;
        this.totalRegistros = 0;
      } finally {
        this.cargando = false;
      }
    },
    cambiarPagina(page) {
      if (page === this.paginaActual) return;
      this.paginaActual = page;
      this.cargarVentas(page);
    },
    abrirDetalle(idVenta) {
      this.detalleModalAbierto = true;
      this.detalleVenta = null;
      this.detalleError = '';
      this.obtenerDetalle(idVenta);
    },
    async obtenerDetalle(idVenta) {
      this.detalleCargando = true;
      try {
        const { data } = await apiService.get('/api/sales/detail', { id_venta: idVenta });
        const detalle = data?.data;

        if (!detalle) {
          throw new Error('No se obtuvo información del detalle.');
        }

        this.detalleVenta = detalle;
      } catch (error) {
        console.error('Error al cargar detalle de venta:', error);
        this.detalleVenta = null;
        this.detalleError = 'No se pudo cargar el detalle de la venta. Intente nuevamente.';
      } finally {
        this.detalleCargando = false;
      }
    },
    cerrarDetalle() {
      this.detalleModalAbierto = false;
      this.detalleVenta = null;
      this.detalleError = '';
    },
    formatearMonto(valor) {
      const numero = Number(valor);
      if (!Number.isFinite(numero)) return '0';
      return Number(Math.round(numero)).toLocaleString('es-PY', { minimumFractionDigits: 0 });
    },
    formatearFecha(valor) {
      if (!valor) return '—';
      const fecha = new Date(valor);
      if (Number.isNaN(fecha.getTime())) return '—';
      const fechaStr = fecha.toLocaleDateString('es-PY');
      const horaStr = fecha.toLocaleTimeString('es-PY', { hour: '2-digit', minute: '2-digit' });
      return `${fechaStr} ${horaStr}`;
    },
    badgeClass(estado) {
      const normalized = (estado || '').toLowerCase();
      if (normalized === 'vigente') return 'bg-success';
      if (normalized === 'pendiente') return 'bg-warning text-dark';
      if (normalized === 'anulado' || normalized === 'cancelado') return 'bg-danger';
      return 'bg-secondary';
    }
  }
};
</script>

<style scoped>
.card {
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
}

.modal-backdrop {
  z-index: 1040;
}

.modal {
  z-index: 1050;
}
</style>
