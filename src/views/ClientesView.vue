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
        <AppButton variant="outline-secondary" customClass="me-2" :class="{ active: filtroTipo === 'Contado' }" @click="setFiltro('Contado')">Contado</AppButton>
        <AppButton variant="outline-secondary" customClass="me-2" :class="{ active: filtroTipo === 'credito' }" @click="setFiltro('credito')">Crédito</AppButton>
      </AppFilter>

  
      <!-- Tabla de Clientes -->
      <h2>Lista de Clientes</h2>
      <AppTable :headers="['Nombre Completo', 'RUC', 'Teléfono', 'Email', 'Condiciones de Pago', 'Acciones']">
        <tr v-for="cliente in clientesFiltradosPaginados" :key="cliente.id">
          <td>{{ cliente.nombre_completo }}</td>
          <td>{{ cliente.ruc }}</td>
          <td>{{ cliente.telefono }}</td>
          <td>{{ cliente.email }}</td>
          <td>{{ cliente.condiciones_pago }}</td>
          <td>
            <button class="btn btn-primary btn-sm" @click="editarCliente(cliente)">✏️</button>
            <button class="btn btn-danger btn-sm" @click="eliminarCliente(cliente.cliente_id)">🗑️</button>
          </td>
        </tr>
      </AppTable>

      <AppPagination :currentPage="paginaActual" :totalPages="totalPaginas" @page-changed="cambiarPagina" />


      <!-- Modal para Registrar / Editar Cliente -->
      <div class="modal fade" id="clienteModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">{{ modalTitle }}</h5>
              <button type="button" class="btn-close" @click="cerrarModal"></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="guardarCliente">
                <div class="container-fluid">
                  <div class="row mb-3">
                    <div class="col-md-6">
                      <label for="nombreCompleto" class="form-label">Nombre Completo</label>
                      <input type="text" id="nombreCompleto" v-model="cliente.nombre_completo" class="form-control" required />
                    </div>
                    <div class="col-md-6">
                      <label for="cedula" class="form-label">Cédula</label>
                      <input type="text" id="cedula" v-model="cliente.cedula" class="form-control" required />
                    </div>
                  </div>
                  <div class="row mb-3">
                    <div class="col-md-6">
                      <label for="nroDocumento" class="form-label">Nro. Documento</label>
                      <input type="text" id="nroDocumento" v-model="cliente.nro_documento" class="form-control" required />
                    </div>
                    <div class="col-md-6">
                      <label for="ruc" class="form-label">RUC</label>
                      <input type="text" id="ruc" v-model="cliente.ruc" class="form-control" required />
                    </div>
                  </div>
                  <div class="row mb-3">
                    <div class="col-md-6">
                      <label for="direccion" class="form-label">Dirección</label>
                      <input type="text" id="direccion" v-model="cliente.direccion" class="form-control" />
                    </div>
                    <div class="col-md-6">
                      <label for="telefono" class="form-label">Teléfono</label>
                      <input type="tel" id="telefono" v-model="cliente.telefono" class="form-control" />
                    </div>
                  </div>
                  <div class="row mb-3">
                    <div class="col-md-6">
                      <label for="email" class="form-label">Email</label>
                      <input type="email" id="email" v-model="cliente.email" class="form-control" />
                    </div>
                    <div class="col-md-6">
                      <label for="nombreFantasia" class="form-label">Nombre Fantasía</label>
                      <input type="text" id="nombreFantasia" v-model="cliente.nombre_fantasia" class="form-control" />
                    </div>
                  </div>
                  <div class="row mb-3">
                    <div class="col-md-6">
                      <label for="condicionesPago" class="form-label">Condiciones de Pago</label>
                      <select id="condicionesPago" v-model="cliente.condiciones_pago" class="form-select">
                        <option value="Contado">Contado</option>
                        <option value="Crédito">Crédito</option>
                      </select>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col text-end">
                      <button type="submit" class="btn btn-primary">Guardar Cliente</button>
                    </div>
                  </div>
                </div>
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
import AppNavbar from '../components/AppNavbar.vue';
import AppHeader from '../components/AppHeader.vue';
import AppTable from '../components/AppTable.vue';
import AppFilter from '../components/AppFilter.vue';
import AppButton from '../components//AppButton.vue';
import AppPagination from '../components/AppPagination.vue';
import apiService from '../services/apiService.js'; 
export default {
  name: 'ClientesView',
  components: {
    AppNavbar,
    AppHeader,
    AppTable,
    AppFilter,
    AppButton,
    AppPagination
  },
  data() {
    return {
      clientes: [], // Lista de clientes
      cliente: {
        nombre_completo: '',
        cedula: '',
        nro_documento: '',
        ruc: '',
        direccion: '',
        telefono: '',
        email: '',
        nombre_fantasia: '',
        condiciones_pago: 'Contado'
      },
      clienteActual: null,
      modalTitle: 'Registrar Cliente',
      searchInput: '',
      filtroTipo: 'all',
      paginaActual: 1,
      itemsPorPagina: 5,
      creditoMonto: null // Monto de línea de crédito
    };  
  },
  computed: {
    clientesFiltrados() {
      return this.clientes.filter(cliente => {
        const search = this.searchInput.toLowerCase();
        const nombre = (cliente.nombre_completo || '').toLowerCase();
        const ruc = (cliente.ruc || '').toLowerCase();
        // Si quieres seguir filtrando por un campo de tipo, asegúrate de usar la propiedad actual, por ejemplo, "condiciones_pago"
        const filtroCoincide = this.filtroTipo === 'all' || (cliente.condiciones_pago || '').toLowerCase() === this.filtroTipo.toLowerCase();
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
    async cargarClientes() {
      try {
        const response = await apiService.get(`${process.env.VUE_APP_API_BASE_URL}/api/clients`);
        this.clientes = response.data;
      } catch (error) {
        console.error('Error al cargar los clientes:', error);
      }
    },
    abrirModal() {
      this.modalTitle = this.clienteActual ? 'Editar Cliente' : 'Registrar Cliente';
      this.cliente = this.clienteActual ? Object.assign({}, this.clienteActual) : {
        nombre_completo: '',
        cedula: '',
        nro_documento: '',
        ruc: '',
        direccion: '',
        telefono: '',
        email: '',
        nombre_fantasia: '',
        condiciones_pago: 'Contado'
      };
      const modalInstance = new Modal(document.getElementById('clienteModal'));
      modalInstance.show();
    },
    cambiarPagina(page) {
      this.paginaActual = page;
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
      this.cliente = {
        nombre_completo: '',
        cedula: '',
        nro_documento: '',
        ruc: '',
        direccion: '',
        telefono: '',
        email: '',
        nombre_fantasia: '',
        condiciones_pago: 'Contado'
      };
      this.clienteActual = null; // Reiniciar clienteActual al cerrar
    },
    setFiltro(tipo) {
      this.filtroTipo = tipo;
    },
    async guardarCliente() {
      try {
        if (this.clienteActual && this.clienteActual.id) {
          // Actualizar cliente existente
          Object.assign(this.clienteActual, this.cliente);
          await apiService.put(`${process.env.VUE_APP_API_BASE_URL}/api/clients`, this.clienteActual);
          console.log('Cliente actualizado:', this.clienteActual);
        } else {
          // Crear un nuevo cliente
          console.log('Cliente a registrar:', this.cliente);
          const response = await apiService.post(`${process.env.VUE_APP_API_BASE_URL}/api/clients`, this.cliente);
          this.clientes.push(response.data);
        }
        this.cerrarModal();
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