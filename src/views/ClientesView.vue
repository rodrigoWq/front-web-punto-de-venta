/* eslint-disable no-undef */
<template>
    <AppNavbar v-if="!selectorMode" />
  <div :class="['container clientes-module', (selectorMode && hideHeader) ? 'mt-2' : 'mt-5']">
      <AppHeader v-if="!hideHeader" :title="selectorMode ? 'Seleccionar Cliente' : 'Gestión de Clientes'">
        <template #buttons>
          <router-link v-if="!selectorMode" class="btn btn-outline-primary me-2" :to="{ name: 'ClientesCredito' }">
            Gestión Crédito
          </router-link>
          <button v-if="!selectorMode" class="btn btn-success" @click="abrirModalCrear">Registrar Cliente</button>
        </template>
      </AppHeader>

  
      <!-- Barra de Filtros -->
      <AppFilter v-model="searchInput" placeholder="Buscar por nombre..." :customClasses="filterClasses">
        <AppButton variant="outline-secondary" customClass="me-2" :class="{ active: filtroTipo === 'all' }" @click="setFiltro('all')">Todos los Tipos</AppButton>
        <AppButton variant="outline-secondary" customClass="me-2" :class="{ active: filtroTipo === 'CONTADO' }" @click="setFiltro('CONTADO')">Contado</AppButton>
        <AppButton variant="outline-secondary" customClass="me-2" :class="{ active: filtroTipo === 'CREDITO' }" @click="setFiltro('CREDITO')">Crédito</AppButton>
      </AppFilter>

      <div class="d-flex justify-content-between align-items-center mb-3">
        <h2 class="fw-bold mb-0">Lista de Clientes</h2>
        <span class="badge bg-secondary-subtle text-dark" v-if="clientesFiltrados.length">
          {{ clientesFiltrados.length }} registros
        </span>
      </div>

      <AppTable :headers="tableHeaders">
        <tr
          v-for="cliente in clientesFiltradosPaginados"
          :key="cliente.id"
          :class="{ 'selectable-row': selectorMode }"
          @click="selectorMode && seleccionarCliente(cliente)"
        >
          <td>{{ cliente.nombre_completo }}</td>
          <td>{{ cliente.ruc }}</td>
          <td>{{ cliente.telefono }}</td>
          <td>{{ cliente.email }}</td>
          <td>{{ cliente.condiciones_pago }}</td>
          <td v-if="!selectorMode">
            <div class="actions-wrapper">
              <button class="btn btn-primary btn-sm me-1" @click.stop="editarCliente(cliente)">
                ✏️ Editar
              </button>
              <button class="btn btn-danger btn-sm me-1" @click.stop="eliminarCliente(cliente.cliente_id)">
                🗑️ Eliminar
              </button>
            </div>
          </td>
        </tr>
      </AppTable>

      <AppPagination :currentPage="paginaActual" :totalPages="totalPaginas" @page-changed="cambiarPagina" />


  <!-- Modal para Registrar Cliente (reutilizable) -->
  <RegistrarClienteModal
    v-if="!selectorMode"
    :open="showCrearClienteModal"
    @saved="onClienteCreado"
    @close="showCrearClienteModal = false"
  />

  <!-- Modal para Editar Cliente (reutilizable) -->
  <RegistrarClienteModal
    v-if="!selectorMode"
    :open="showEditarClienteModal"
    :editMode="true"
    :clienteData="clienteAEditar"
    @saved="onClienteEditado"
    @close="showEditarClienteModal = false"
  />



      <!-- Modal para Línea de Crédito -->
  <div v-if="!selectorMode" class="modal fade" id="creditoModal" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Cargar Línea de Crédito</h5>
              <button type="button" class="btn-close" @click="cerrarModalCredito"></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="guardarCredito">
                <div class="mb-3">
                  <label for="creditoMonto" class="form-label">Monto de Línea de Crédito</label>
                  <input type="number" v-model="creditoMonto" class="form-control" required />
                </div>
                <button type="submit" class="btn btn-primary">Guardar</button>
              </form>
            </div>
          </div>
        </div>
      </div>

    </div>
</template>
  
<script>
import { Modal } from 'bootstrap';
import AppNavbar from '../components/AppNavbar.vue';
import AppHeader from '../components/AppHeader.vue';
import AppTable from '../components/AppTable.vue';
import AppFilter from '../components/AppFilter.vue';
import AppButton from '../components//AppButton.vue';
import AppPagination from '../components/AppPagination.vue';
import apiService from '../services/apiService.js'; 
import RegistrarClienteModal from '@/components/RegistrarClienteModal.vue';
export default {
  name: 'ClientesView',
  props: {
    selectorMode: { type: Boolean, default: false },
    hideHeader: { type: Boolean, default: false }
  },
  components: {
    AppNavbar,
    AppHeader,
    AppTable,
    AppFilter,
    AppButton,
    AppPagination,
    RegistrarClienteModal
  },
  data() {
    return {
      clientes: [], // Lista de clientes
      searchInput: '',
      filtroTipo: 'all',
      paginaActual: 1,
      itemsPorPagina: 5,
      creditoMonto: null, // Monto de línea de crédito
      showCrearClienteModal: false,
      showEditarClienteModal: false,
      clienteAEditar: null
    };  
  },
  computed: {
    filterClasses() {
      return (this.selectorMode && this.hideHeader) ? 'mt-2 mb-3' : 'mt-4 mb-4';
    },
    tableHeaders() {
      return this.selectorMode
        ? ['Nombre Completo', 'RUC', 'Teléfono', 'Email', 'Condiciones de Pago']
        : ['Nombre Completo', 'RUC', 'Teléfono', 'Email', 'Condiciones de Pago', 'Acciones'];
    },
    clientesFiltrados() {
      // Asegúrate de que clientes sea un array
      const clientesArray = Array.isArray(this.clientes) ? this.clientes : [];
      return clientesArray.filter(cliente => {
        const search = this.searchInput.toLowerCase();
        const nombre = (cliente.nombre_completo || '').toLowerCase();
        const ruc = (cliente.ruc || '').toLowerCase();
        
        // Normalizar strings para comparación (eliminar tildes)
        const normalizeStr = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        
        const condicionesPago = (cliente.condiciones_pago || '');
        const filtroTipoNormalizado = normalizeStr(this.filtroTipo.toLowerCase());
        const condicionesPagoNormalizado = normalizeStr(condicionesPago.toLowerCase());
        
        const filtroCoincide = this.filtroTipo === 'all' || condicionesPagoNormalizado === filtroTipoNormalizado;
        return filtroCoincide && (nombre.includes(search) || ruc.includes(search));
      });
    },
    totalPaginas() {
    return Math.ceil(this.clientesFiltrados.length / this.itemsPorPagina);
    },
    clientesFiltradosPaginados() {
      const start = (this.paginaActual - 1) * this.itemsPorPagina;
      const end = start + this.itemsPorPagina;
      return this.clientesFiltrados.slice(start, end);
    }
  },
  methods: {
    seleccionarCliente(cliente) {
      this.$emit('cliente-seleccionado', cliente);
    },
    async cargarClientes() {
      try {
        const response = await apiService.get(`${process.env.VUE_APP_API_BASE_URL}/api/clients`);
        // Asegúrate de que siempre asignes un array
        this.clientes = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      } catch (error) {
        console.error('Error al cargar los clientes:', error);
        this.clientes = []; // Asigna un array vacío en caso de error
      }
    },
    abrirModalCrear() {
      // Abrir componente reutilizable de registro
      this.clienteActual = null;
      this.showCrearClienteModal = true;
    },
    onClienteCreado() {
      // Cerrar y refrescar listado al crear
      this.showCrearClienteModal = false;
      this.cargarClientes();
    },
    onClienteEditado() {
      // Cerrar y refrescar listado al editar
      this.showEditarClienteModal = false;
      this.clienteAEditar = null;
      this.cargarClientes();
    },
    abrirModalEditar(cliente) {
      // Usar el modal reutilizable en modo edición
      this.clienteAEditar = cliente;
      this.showEditarClienteModal = true;
    },

    cambiarPagina(page) {
      this.paginaActual = page;
    },
    editarCliente(cliente) {
      // Instead of editing directly, open the edit modal
      this.abrirModalEditar(cliente);
    },
    async guardarCliente() {
      try {
        // Crear un nuevo cliente
        const response = await apiService.post(`${process.env.VUE_APP_API_BASE_URL}/api/clients`, this.cliente);
        this.clientes.push(response.data);
        this.cargarClientes();
        this.cerrarModal('crearClienteModal');
      } catch (error) {
        console.error('Error al guardar el cliente:', error);
      }
    },

    async eliminarCliente(clienteId) {
      if (confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
        try {
          await apiService.delete(`${process.env.VUE_APP_API_BASE_URL}/api/clients/${clienteId}`);
          // Actualiza la lista local eliminando el cliente borrado
          this.clientes = this.clientes.filter(cliente => cliente.id !== clienteId);
        } catch (error) {
          console.error('Error al eliminar el cliente:', error);
        }
        this.cargarClientes();
      }
    },
    setFiltro(tipo) {
      this.filtroTipo = tipo;
      this.paginaActual = 1; // Reset a la primera página cuando se cambia el filtro
    },
    
    aplicarFiltros() {
      // Método para aplicar los filtros en el input y botones
    },
    toggleSaldo() {
      if (this.cliente.tipo !== 'credito') {
        this.cliente.saldo = null;
      }
    },
    abrirModalCredito(cliente) {
      this.clienteActual = cliente;
      this.creditoMonto = cliente.saldo || 0; // Cargar el saldo existente o inicializar en 0
      const modalInstance = new Modal(document.getElementById('creditoModal'));
      modalInstance.show();
    },
    cerrarModalCredito() {
      const modalInstance = Modal.getInstance(document.getElementById('creditoModal'));
      if (modalInstance) {
        modalInstance.hide();
      }
    },
    guardarCredito() {
      if (this.clienteActual) {
        this.clienteActual.saldo = this.creditoMonto; // Asigna el nuevo monto de crédito al cliente actual
        console.log(`Línea de crédito actualizada para ${this.clienteActual.nombre}: ${this.creditoMonto}`);
        this.cerrarModalCredito();
      }
    },
    formateaNumero(n) {
      if (n === null || n === undefined) return '';
      return Number(Math.round(n)).toLocaleString('es-PY', { minimumFractionDigits: 0 });
    },
    redondearHaciaArriba(valor) {
      if (valor === null || valor === undefined || isNaN(valor)) return 0;
      return Math.round(Number(valor));
    }
  },

  async mounted() {
    await this.cargarClientes(); // Carga los clientes al montar el componente
  }
};
</script>

  

<style scoped>
.clientes-module {
  background-color: #ffffff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.clientes-module h1,
.clientes-module h2 {
  color: #343a40;
}

.actions-wrapper {
  display: flex;
  gap: 0.5rem;
}

.actions-wrapper .btn {
  min-width: 90px;
}

.selectable-row {
  cursor: pointer;
}

.selectable-row:hover {
  background-color: #f8f9fa;
}
</style>
