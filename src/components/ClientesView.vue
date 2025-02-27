/* eslint-disable no-undef */
<template>
    <AppNavbar />
    <div class="container mt-5">
      <AppHeader title="Gestión de Clientes">
        <template #buttons>
          <button class="btn btn-success" @click="abrirModal">Registrar Cliente</button>
        </template>
      </AppHeader>

  
      <!-- Barra de Filtros -->
      <AppFilter v-model="searchInput" placeholder="Buscar por nombre..." customClasses="mt-4 mb-4">
        <AppButton variant="outline-secondary" customClass="me-2" :class="{ active: filtroTipo === 'all' }" @click="setFiltro('all')">Todos los Tipos</AppButton>
        <AppButton variant="outline-secondary" customClass="me-2" :class="{ active: filtroTipo === 'normal' }" @click="setFiltro('normal')">Normal</AppButton>
        <AppButton variant="outline-secondary" customClass="me-2" :class="{ active: filtroTipo === 'credito' }" @click="setFiltro('credito')">Crédito</AppButton>
      </AppFilter>

  
      <!-- Tabla de Clientes -->
      <h2>Lista de Clientes</h2>
      <AppTable :headers="['Nombre y Apellido', 'RUC / CI', 'Teléfono', 'Tipo', 'Saldo', 'Acciones']">
        <tr v-for="cliente in clientesFiltrados" :key="cliente.id">
          <td>{{ cliente.nombre }}</td>
          <td>{{ cliente.ruc }}</td>
          <td>{{ cliente.telefono }}</td>
          <td>{{ cliente.tipo }}</td>
          <td>{{ cliente.tipo === 'credito' ? cliente.saldo : '-' }}</td>
          <td>
            <button class="btn btn-primary btn-sm" @click="editarCliente(cliente)">✏️</button>
            <button class="btn btn-danger btn-sm" @click="eliminarCliente(cliente.id)">🗑️</button>
            <button v-if="cliente.tipo === 'credito'" class="btn btn-warning btn-sm" @click="abrirModalCredito(cliente)">Línea de Crédito</button>
          </td>
        </tr>
      </AppTable>

      <!-- Modal para Registrar / Editar Cliente -->
      <div class="modal fade" id="clienteModal" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">{{ modalTitle }}</h5>
              <button type="button" class="btn-close" @click="cerrarModal"></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="guardarCliente">
                <div class="mb-3">
                  <label for="nombreCliente" class="form-label">Nombre y Apellido</label>
                  <input type="text" v-model="cliente.nombre" class="form-control" required />
                </div>
                <div class="mb-3">
                  <label for="rucCliente" class="form-label">RUC / CI</label>
                  <input type="text" v-model="cliente.ruc" class="form-control" required />
                </div>
                <div class="mb-3">
                  <label for="telefonoCliente" class="form-label">Teléfono</label>
                  <input type="tel" v-model="cliente.telefono" class="form-control" />
                </div>
                <div class="mb-3">
                  <label for="tipoCliente" class="form-label">Tipo de Cliente</label>
                  <select v-model="cliente.tipo" class="form-select">
                    <option value="normal">Normal</option>
                    <option value="credito">Crédito</option>
                  </select>
                </div>
                <button type="submit" class="btn btn-primary">Guardar Cliente</button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <!-- Modal para Línea de Crédito -->
      <div class="modal fade" id="creditoModal" tabindex="-1">
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
import Cliente from '@/models/Cliente'; // Importa la clase Cliente
import ClienteService from '@/services/ClienteServiceMock'; // Importa el servicio ClienteService
import AppNavbar from './common/AppNavbar.vue';
import AppHeader from './common/AppHeader.vue';
import AppTable from './common/AppTable.vue';
import AppFilter from './common/AppFilter.vue';
import AppButton from './common/AppButton.vue';
export default {
  name: 'ClientesView',
  components: {
    AppNavbar,
    AppHeader,
    AppTable,
    AppFilter,
    AppButton
  },
  data() {
    return {
      clientes: [], // Lista de clientes
      cliente: new Cliente('', '', '', 'normal'), // Cliente actual
      clienteActual: null,
      modalTitle: 'Registrar Cliente',
      searchInput: '',
      filtroTipo: 'all',
      creditoMonto: null // Monto de línea de crédito
    };  
  },
  computed: {
    clientesFiltrados() {
      return [...this.clientes].filter(cliente => {
        const search = this.searchInput.toLowerCase();
        const nombreCoincide = cliente.nombre.toLowerCase().includes(search);
        const rucCoincide = cliente.ruc.toLowerCase().includes(search);
        const tipoCoincide = this.filtroTipo === 'all' || cliente.tipo === this.filtroTipo;
        return tipoCoincide && (nombreCoincide || rucCoincide);
      });
    }
  },
  methods: {
    async cargarClientes() {
      try {
        this.clientes = await ClienteService.obtenerClientes();
      } catch (error) {
        console.error('Error al cargar los clientes:', error);
      }
    },
    abrirModal() {
      this.modalTitle = this.clienteActual ? 'Editar Cliente' : 'Registrar Cliente';
      this.cliente = this.clienteActual ? Object.assign({}, this.clienteActual) : new Cliente('', '', '', 'normal');
      const modalInstance = new Modal(document.getElementById('clienteModal'));
      modalInstance.show();
    },
    editarCliente(cliente) {
      this.clienteActual = cliente; // Almacena la referencia del cliente actual
      this.cliente = { ...cliente }; // Crea una copia para edición sin afectar el original
      this.modalTitle = 'Editar Cliente';
      this.abrirModal();
    },
    cerrarModal() {
      const modalInstance = Modal.getInstance(document.getElementById('clienteModal'));
      if (modalInstance) {
        modalInstance.hide();
      }
      this.cliente = new Cliente('', '', '', 'normal'); // Limpiar el formulario al cerrar
      this.clienteActual = null; // Reiniciar clienteActual al cerrar
    },
    setFiltro(tipo) {
      this.filtroTipo = tipo;
    },
    async guardarCliente() {
      try {
        if (this.clienteActual && this.clienteActual.id) {
          // Actualiza el cliente existente en la lista
          Object.assign(this.clienteActual, this.cliente); // Actualiza los datos en la referencia del cliente actual
          await ClienteService.actualizarCliente(this.clienteActual); // Llama al servicio para guardar cambios
        } else {
          // Crea un nuevo cliente si no existe clienteActual
          const listaActualizada = await ClienteService.crearCliente(this.cliente);
          this.clientes = [...listaActualizada]; // Actualiza la lista completa
        }
        console.log('Cliente actualizado o agregado:', this.clienteActual || this.cliente);
        this.cerrarModal();
      } catch (error) {
        console.error('Error al guardar el cliente:', error);
      }
    },
    async eliminarCliente(clienteId) {
      if (confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
        try {
          const listaActualizada = await ClienteService.eliminarCliente(clienteId);
          this.clientes = [...listaActualizada]; // Actualiza la lista con la versión más reciente
          console.log('Lista de clientes después de eliminar:', this.clientes);
        } catch (error) {
          console.error('Error al eliminar el cliente:', error);
        }
      }
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
</style>