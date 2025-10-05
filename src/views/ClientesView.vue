/* eslint-disable no-undef */
<template>
    <AppNavbar v-if="!selectorMode" />
  <div :class="['container', (selectorMode && hideHeader) ? 'mt-2' : 'mt-5']">
      <AppHeader v-if="!hideHeader" :title="selectorMode ? 'Seleccionar Cliente' : 'Gestión de Clientes'">
        <template #buttons>
          <button v-if="!selectorMode" class="btn btn-success" @click="abrirModalCrear">Registrar Cliente</button>
        </template>
      </AppHeader>

  
      <!-- Barra de Filtros -->
      <AppFilter v-model="searchInput" placeholder="Buscar por nombre..." :customClasses="filterClasses">
        <AppButton variant="outline-secondary" customClass="me-2" :class="{ active: filtroTipo === 'all' }" @click="setFiltro('all')">Todos los Tipos</AppButton>
        <AppButton variant="outline-secondary" customClass="me-2" :class="{ active: filtroTipo === 'CONTADO' }" @click="setFiltro('CONTADO')">Contado</AppButton>
        <AppButton variant="outline-secondary" customClass="me-2" :class="{ active: filtroTipo === 'CREDITO' }" @click="setFiltro('CREDITO')">Crédito</AppButton>
      </AppFilter>

  
      <!-- Tabla de Clientes -->
      <h2>Lista de Clientes</h2>
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
            <button class="btn btn-primary btn-sm" @click.stop="editarCliente(cliente)">✏️</button>
            <button class="btn btn-danger btn-sm" @click.stop="eliminarCliente(cliente.cliente_id)">🗑️</button>
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


      <!-- Modal para Editar Cliente -->
  <div v-if="!selectorMode" class="modal fade" id="editarClienteModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Editar Cliente</h5>
              <button type="button" class="btn-close" @click="cerrarModal('editarClienteModal')"></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="editarClienteSubmit">
                <div class="container-fluid">
                  <div class="row mb-3">
                    <div class="col-md-12">
                      <label for="nombreCompletoEditar" class="form-label">Nombre Completo</label>
                      <input type="text" id="nombreCompletoEditar" v-model="cliente.nombre_completo" class="form-control" required />
                    </div>
                  </div>
                  <div class="row mb-3">
                    <div class="col-md-6">
                      <label for="nroDocumentoEditar" class="form-label">Nro. Documento</label>
                      <input type="text" id="nroDocumentoEditar" v-model="cliente.nro_documento" class="form-control" required />
                    </div>
                    <div class="col-md-6">
                      <label for="rucEditar" class="form-label">RUC</label>
                      <input type="text" id="rucEditar" v-model="cliente.ruc" class="form-control" required />
                    </div>
                  </div>
                  <div class="row mb-3">
                    <div class="col-md-6">
                      <label for="direccionEditar" class="form-label">Dirección</label>
                      <input type="text" id="direccionEditar" v-model="cliente.direccion" class="form-control" />
                    </div>
                    <div class="col-md-6">
                      <label for="telefonoEditar" class="form-label">Teléfono</label>
                      <input type="tel" id="telefonoEditar" v-model="cliente.telefono" class="form-control" />
                    </div>
                  </div>
                  <div class="row mb-3">
                    <div class="col-md-6">
                      <label for="emailEditar" class="form-label">Email</label>
                      <input type="email" id="emailEditar" v-model="cliente.email" class="form-control" />
                    </div>
                    <div class="col-md-6">
                      <label for="nombreFantasiaEditar" class="form-label">Nombre Fantasía</label>
                      <input type="text" id="nombreFantasiaEditar" v-model="cliente.nombre_fantasia" class="form-control" />
                    </div>
                  </div>
                  <div class="row mb-3">
                    <div class="col-md-6">
                      <label for="condicionesPagoEditar" class="form-label">Condiciones de Pago</label>
                      <select id="condicionesPagoEditar" v-model="cliente.condiciones_pago" class="form-select">
                        <option value="CONTADO">Contado</option>
                        <option value="CREDITO">Crédito</option>
                      </select>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col text-end">
                      <button type="submit" class="btn btn-primary">Actualizar Cliente</button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>


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
      cliente: {
        nombre_completo: '',
        nro_documento: '',
        ruc: '',
        direccion: '',
        telefono: '',
        email: '',
        nombre_fantasia: '',
        condiciones_pago: 'Contado'
      },
      clienteActual: null,
      searchInput: '',
      filtroTipo: 'all',
      paginaActual: 1,
      itemsPorPagina: 5,
      creditoMonto: null, // Monto de línea de crédito
      showCrearClienteModal: false
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
      return this.clientes.filter(cliente => {
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
        this.clientes = response.data;
      } catch (error) {
        console.error('Error al cargar los clientes:', error);
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
    abrirModalEditar(cliente) {
      this.clienteActual = cliente;
      this.cliente = { ...cliente };
      const modalInstance = new Modal(document.getElementById('editarClienteModal'));
      modalInstance.show();
    },
    cerrarModal(modalId) {
      const modalInstance = Modal.getInstance(document.getElementById(modalId));
      if (modalInstance) {
        modalInstance.hide();
      }
      // Reset cliente data
      this.cliente = {
        nombre_completo: '',
        nro_documento: '',
        ruc: '',
        direccion: '',
        telefono: '',
        email: '',
        nombre_fantasia: '',
        condiciones_pago: 'Contado'
      };
      this.clienteActual = null;
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
    async editarClienteSubmit() {
      try {
        // Crear un nuevo objeto solo con los campos necesarios
        const clienteActualizado = {
          nombre_completo: this.cliente.nombre_completo,
          nro_documento: this.cliente.nro_documento,
          ruc: this.cliente.ruc,
          direccion: this.cliente.direccion,
          telefono: this.cliente.telefono,
          email: this.cliente.email,
          nombre_fantasia: this.cliente.nombre_fantasia,
          condiciones_pago: this.cliente.condiciones_pago
        };
        
        console.log('Payload a enviar:', clienteActualizado);
        
        // Se usa el endpoint con el valor de cliente_id
        await apiService.put(`${process.env.VUE_APP_API_BASE_URL}/api/clients/${this.clienteActual.cliente_id}`, clienteActualizado);
        
        console.log('Cliente actualizado correctamente');
        await this.cargarClientes();
        this.cerrarModal('editarClienteModal');
      } catch (error) {
        console.error('Error al actualizar el cliente:', error);
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
/* Estilos de clientes.css */
body {
  font-family: Arial, sans-serif;
}

h1 {
  text-align: center;
}

.filter-section {
  margin-bottom: 20px;
}

.filters .btn {
  margin-right: 10px;
}

.table {
  margin-top: 20px;
}

.modal-header {
  background-color: #007bff;
  color: white;
}

.header-buttons {
  display: flex;
  justify-content: flex-end;
}

/* Alineación del campo de búsqueda a la izquierda */
.d-flex.justify-content-start {
  justify-content: flex-start !important;
}

/* Color verde para el botón de registrar cliente */
.btn-success {
  background-color: #28a745;
  border-color: #28a745;
}

.selectable-row { cursor: pointer; }
.selectable-row:hover { background-color: #f5f5f5; }
</style>