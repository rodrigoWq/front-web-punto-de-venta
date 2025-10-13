<template>
  <div>
    <AppNavbar />
    <div class="container mt-5">
      <AppHeader title="Gestión de Pedidos">
        <template #buttons>
          <router-link class="btn btn-success" :to="{ name: 'Inicio' }">
            Nuevo Pedido
          </router-link>
        </template>
      </AppHeader>

      <AppFilter
        v-model="searchInput"
        placeholder="Buscar por ID de pedido, nombre del cliente o estado..."
        customClasses="mt-4 mb-4"
      />

      <div class="table-responsive">
        <h2>Lista de Pedidos</h2>
        <table class="table table-striped">
          <thead>
            <tr>
              <th>ID Pedido</th>
              <th>Nombre del Cliente</th>
              <th>Total Neto</th>
              <th>Estado</th>
              <th>Creado en</th>
              <th>Actualizado en</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!pedidosFiltrados.length">
              <td colspan="7" class="text-center py-4">
                No se encontraron pedidos.
              </td>
            </tr>
            <tr
              v-for="pedido in pedidosFiltradosPaginados"
              :key="pedido.pedido_id"
            >
              <td>{{ pedido.pedido_id }}</td>
              <td>{{ pedido.nombre_cliente || '—' }}</td>
              <td>{{ formatearMonto(pedido.total_neto) }}</td>
              <td>
                <span :class="['badge', badgeClass(pedido.estado)]">
                  {{ pedido.estado || '—' }}
                </span>
              </td>
              <td>{{ formatearFecha(pedido.creado_en) }}</td>
              <td>{{ formatearFecha(pedido.actualizado_en) }}</td>
              <td>
                <button
                  type="button"
                  class="btn btn-outline-primary btn-sm me-2"
                  @click="verDetalle(pedido.pedido_id)"
                >
                  <i class="bi bi-eye me-1"></i>
                  Ver Detalle
                </button>
                
                <!-- Botón Retomar: deshabilitado si no es pendiente -->
                <button
                  type="button"
                  class="btn btn-outline-retomar btn-sm me-2"
                  :disabled="!esPendiente(pedido.estado)"
                  @click="retomarPedido(pedido.pedido_id)"
                >
                  <i class="bi bi-arrow-clockwise me-1"></i>
                  Retomar
                </button>
                
                <!-- Botón Editar: deshabilitado si no es pendiente -->
                <button
                  type="button"
                  class="btn btn-outline-warning btn-sm me-2"
                  :disabled="!esPendiente(pedido.estado)"
                  @click="editarPedido(pedido.pedido_id)"
                >
                  <i class="bi bi-pencil me-1"></i>
                  Editar
                </button>
                
                <!-- Botón Cancelar: deshabilitado si no es pendiente -->
                <button
                  type="button"
                  class="btn btn-outline-danger btn-sm"
                  :disabled="!esPendiente(pedido.estado)"
                  @click="cancelarPedido(pedido.pedido_id)"
                >
                  <i class="bi bi-x-circle me-1"></i>
                  Cancelar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <AppPagination
        :currentPage="paginaActual"
        :totalPages="totalPaginas"
        @page-changed="cambiarPagina"
      />
    </div>

    <!-- Modal de Detalle de Pedido -->
    <PedidoDetalleModal
      :open="modalDetalleAbierto"
      :pedidoId="pedidoSeleccionadoId"
      @close="cerrarModalDetalle"
    />
  </div>
</template>

<script>
import AppNavbar from '../components/AppNavbar.vue';
import AppHeader from '../components/AppHeader.vue';
import AppFilter from '../components/AppFilter.vue';
import AppPagination from '../components/AppPagination.vue';
import PedidoDetalleModal from '../components/PedidoDetalleModal.vue';
import apiService from '../services/apiService.js';

export default {
  name: 'GestionPedidos',
  components: {
    AppNavbar,
    AppHeader,
    AppFilter,
    AppPagination,
    PedidoDetalleModal
  },
  data() {
    return {
      pedidos: [],
      searchInput: '',
      paginaActual: 1,
      itemsPorPagina: 10,
      cargando: false,
      modalDetalleAbierto: false,
      pedidoSeleccionadoId: null
    };
  },
  computed: {
    pedidosFiltrados() {
      const term = (this.searchInput || '').trim().toLowerCase();
      if (!term) return this.pedidos;
      return this.pedidos.filter(pedido => {
        const id = String(pedido.pedido_id || '').toLowerCase();
        const nombre = (pedido.nombre_cliente || '').toLowerCase();
        const estado = (pedido.estado || '').toLowerCase();
        return (
          id.includes(term) ||
          nombre.includes(term) ||
          estado.includes(term)
        );
      });
    },
    pedidosFiltradosPaginados() {
      const start = (this.paginaActual - 1) * this.itemsPorPagina;
      return this.pedidosFiltrados.slice(start, start + this.itemsPorPagina);
    },
    totalPaginas() {
      return Math.max(1, Math.ceil(this.pedidosFiltrados.length / this.itemsPorPagina));
    }
  },
  watch: {
    searchInput() {
      this.paginaActual = 1;
    },
    pedidosFiltrados() {
      if (this.paginaActual > this.totalPaginas) {
        this.paginaActual = this.totalPaginas;
      }
    }
  },
  methods: {
    async cargarPedidos() {
      this.cargando = true;
      try {
        const { data } = await apiService.get(`${process.env.VUE_APP_API_BASE_URL}/api/orders/pending`);
        this.pedidos = Array.isArray(data?.pedidos) ? data.pedidos : [];
      } catch (error) {
        console.error('Error al cargar pedidos:', error);
        this.pedidos = [];
      } finally {
        this.cargando = false;
      }
    },
    cambiarPagina(page) {
      this.paginaActual = page;
    },
    verDetalle(pedidoId) {
      this.pedidoSeleccionadoId = pedidoId;
      this.modalDetalleAbierto = true;
    },
    cerrarModalDetalle() {
      this.modalDetalleAbierto = false;
      this.pedidoSeleccionadoId = null;
    },
    esPendiente(estado) {
      return (estado || '').toLowerCase() === 'pendiente';
    },
    async retomarPedido(pedidoId) {
      try {
        // Cargar los detalles completos del pedido
        const { data: pedido } = await apiService.get(
          `${process.env.VUE_APP_API_BASE_URL}/api/orders/pending/${pedidoId}`
        );
        
        // Navegar a PantallaInicio en modo retomar (como nueva venta)
        this.$router.push({
          name: 'Inicio',
          query: {
            modo: 'retomar',
            pedidoId: pedido.pedido_id,
            clienteNombre: pedido.nombre_cliente || '',
            clienteDocumento: pedido.nro_documento || '',
            clienteTelefono: pedido.telefono || '',
            clienteDireccion: pedido.direccion || '',
            clienteEmail: pedido.email || '',
            // Serializar productos como JSON en query
            productos: JSON.stringify(pedido.detalles || [])
          }
        });
      } catch (error) {
        console.error('Error al retomar pedido:', error);
        alert('No se pudo cargar el pedido. Por favor, intente nuevamente.');
      }
    },
    async editarPedido(pedidoId) {
      try {
        // Cargar los detalles completos del pedido
        const { data: pedido } = await apiService.get(
          `${process.env.VUE_APP_API_BASE_URL}/api/orders/pending/${pedidoId}`
        );
        
        // Navegar a PantallaInicio en modo edición
        this.$router.push({
          name: 'Inicio',
          query: {
            modo: 'edicion',
            pedidoId: pedido.pedido_id,
            clienteNombre: pedido.nombre_cliente || '',
            clienteDocumento: pedido.nro_documento || '',
            clienteTelefono: pedido.telefono || '',
            clienteDireccion: pedido.direccion || '',
            clienteEmail: pedido.email || '',
            // Serializar productos como JSON en query
            productos: JSON.stringify(pedido.detalles || [])
          }
        });
      } catch (error) {
        console.error('Error al cargar pedido para edición:', error);
        alert('No se pudo cargar el pedido. Por favor, intente nuevamente.');
      }
    },
    async cancelarPedido(pedidoId) {
      // Confirmación con advertencia
      const confirmado = window.confirm(
        `⚠️ ADVERTENCIA\n\n¿Estás seguro de que deseas CANCELAR el pedido #${pedidoId}?\n\nEsta acción cambiará el estado del pedido a "cancelado".`
      );
      
      if (!confirmado) return;

      try {
        // Realizar petición de cancelación
        const { data } = await apiService.post(
          `${process.env.VUE_APP_API_BASE_URL}/api/orders/pending/${pedidoId}/cancel`
        );
        
        if (data?.ok) {
          // Actualizar el estado del pedido en la lista local
          const pedidoIndex = this.pedidos.findIndex(p => p.pedido_id === pedidoId);
          if (pedidoIndex !== -1) {
            this.pedidos[pedidoIndex].estado = data.data.estado || 'cancelado';
          }
          
          alert(`✅ Pedido #${pedidoId} cancelado correctamente.`);
          
          // Recargar la lista completa para asegurar sincronización
          await this.cargarPedidos();
        } else {
          throw new Error('Respuesta inesperada del servidor');
        }
      } catch (error) {
        console.error('Error al cancelar pedido:', error);
        alert('❌ Error al cancelar el pedido. Por favor, intente nuevamente.');
      }
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
    badgeClass(estado) {
      const normalized = (estado || '').toLowerCase();
      if (normalized === 'pendiente') return 'bg-warning text-dark';
      if (normalized === 'completado' || normalized === 'finalizado') return 'bg-success';
      if (normalized === 'cancelado' || normalized === 'anulado') return 'bg-danger';
      return 'bg-secondary';
    }
  },
  mounted() {
    this.cargarPedidos();
  }
};
</script>

<style scoped>
.table-responsive {
  background-color: #ffffff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

h2 {
  color: #343a40;
  margin-bottom: 20px;
}

.badge {
  font-size: 0.9rem;
  padding: 0.5rem 0.75rem;
}

.btn-outline-retomar {
  background-color: transparent;
  color: #ff9800;
  border: 1px solid #ff9800;
  transition: all 0.2s ease;
}

.btn-outline-retomar:hover:not(:disabled) {
  background-color: #ff9800;
  border-color: #ff9800;
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 2px 5px rgba(255, 152, 0, 0.3);
}

.btn-outline-retomar:disabled {
  background-color: transparent;
  border-color: #ccc;
  color: #ccc;
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
