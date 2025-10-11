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
            </tr>
          </thead>
          <tbody>
            <tr v-if="!pedidosFiltrados.length">
              <td colspan="6" class="text-center py-4">
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
  </div>
</template>

<script>
import AppNavbar from '../components/AppNavbar.vue';
import AppHeader from '../components/AppHeader.vue';
import AppFilter from '../components/AppFilter.vue';
import AppPagination from '../components/AppPagination.vue';
import apiService from '../services/apiService.js';

export default {
  name: 'GestionPedidos',
  components: {
    AppNavbar,
    AppHeader,
    AppFilter,
    AppPagination
  },
  data() {
    return {
      pedidos: [],
      searchInput: '',
      paginaActual: 1,
      itemsPorPagina: 10,
      cargando: false
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
</style>
