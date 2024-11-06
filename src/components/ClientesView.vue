/* eslint-disable no-undef */
<template>
    <div class="container mt-5">
      <header class="d-flex justify-content-between align-items-center">
        <h1>Gestión de Clientes</h1>
        <div class="header-buttons">
          <button class="btn btn-success" @click="abrirModal">Registrar Cliente</button>
        </div>
      </header>
  
      <!-- Barra de Filtros -->
      <div class="filter-section mt-4 mb-4">
        <div class="d-flex justify-content-start mb-3">
          <input type="text" v-model="searchInput" class="form-control w-25" placeholder="Buscar por nombre..." @input="aplicarFiltros" />
        </div>
        <div class="filters d-flex justify-content-end">
          <button class="btn btn-outline-secondary me-2" :class="{ active: filtroTipo === 'all' }" @click="setFiltro('all')">Todos los Tipos</button>
          <button class="btn btn-outline-secondary me-2" :class="{ active: filtroTipo === 'normal' }" @click="setFiltro('normal')">Normal</button>
          <button class="btn btn-outline-secondary me-2" :class="{ active: filtroTipo === 'credito' }" @click="setFiltro('credito')">Crédito</button>
        </div>
      </div>
  
      <!-- Tabla de Clientes -->
      <h2>Lista de Clientes</h2>
      <table class="table table-striped">
        <thead>
          <tr>
            <th>Nombre y Apellido</th>
            <th>RUC / CI</th>
            <th>Teléfono</th>
            <th>Tipo</th>
            <th>Saldo</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(cliente, index) in clientesFiltrados" :key="index">
            <td>{{ cliente.nombre }}</td>
            <td>{{ cliente.ruc }}</td>
            <td>{{ cliente.telefono }}</td>
            <td>{{ cliente.tipo }}</td>
            <td>{{ cliente.tipo === 'credito' ? cliente.saldo : '-' }}</td>
            <td>
              <button class="btn btn-primary btn-sm" @click="editarCliente(index)">✏️</button>
              <button class="btn btn-danger btn-sm" @click="eliminarCliente(index)">🗑️</button>
            </td>
          </tr>
        </tbody>
      </table>
  
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
                  <select v-model="cliente.tipo" class="form-select" @change="toggleSaldo">
                    <option value="normal">Normal</option>
                    <option value="credito">Crédito</option>
                  </select>
                </div>
                <div class="mb-3" v-if="cliente.tipo === 'credito'">
                  <label for="saldoCliente" class="form-label">Saldo</label>
                  <input type="number" v-model="cliente.saldo" class="form-control" />
                </div>
                <button type="submit" class="btn btn-primary">Guardar Cliente</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
</template>
  
<script>
  import { Modal } from 'bootstrap';
  export default {
    name: 'ClientesView',
    data() {
      return {
        clientes: [
          { nombre: 'Juan Pérez', ruc: '12345678', telefono: '0987654321', tipo: 'normal', saldo: null },
          { nombre: 'María López', ruc: '87654321', telefono: '0987654322', tipo: 'credito', saldo: 5000 },
          { nombre: 'Carlos García', ruc: '65432123', telefono: '0987654323', tipo: 'normal', saldo: null },
          { nombre: 'Ana Torres', ruc: '43218765', telefono: '0987654324', tipo: 'credito', saldo: 3000 }
        ],
        cliente: { nombre: '', ruc: '', telefono: '', tipo: 'normal', saldo: null },
        clienteActual: null,
        modalTitle: 'Registrar Cliente',
        searchInput: '',
        filtroTipo: 'all'
      };
    },
    computed: {
      clientesFiltrados() {
        return this.clientes.filter(cliente => {
          const search = this.searchInput.toLowerCase();
          const nombreCoincide = cliente.nombre.toLowerCase().includes(search);
          const rucCoincide = cliente.ruc.toLowerCase().includes(search);
          const tipoCoincide = this.filtroTipo === 'all' || cliente.tipo === this.filtroTipo;
          return tipoCoincide && (nombreCoincide || rucCoincide);
        });
      }
    },
    methods: {
      abrirModal() {
        this.modalTitle = 'Registrar Cliente';
        this.cliente = { nombre: '', ruc: '', telefono: '', tipo: 'normal', saldo: null };
        this.clienteActual = null;

         // Usa el Modal importado
        const modalInstance = new Modal(document.getElementById('clienteModal'));
        modalInstance.show();

      },
      cerrarModal() {
        const modalInstance = Modal.getInstance(document.getElementById('clienteModal'));
        if (modalInstance) {
          modalInstance.hide();
        } else {
          console.error('Bootstrap modal no está disponible.');
        }
      },
      setFiltro(tipo) {
        this.filtroTipo = tipo;
      },
      guardarCliente() {
        if (this.clienteActual !== null) {
          this.clientes.splice(this.clienteActual, 1, { ...this.cliente });
        } else {
          this.clientes.push({ ...this.cliente });
        }
        this.cerrarModal();
      },
      editarCliente(index) {
        this.clienteActual = index;
        this.cliente = { ...this.clientes[index] };
        this.modalTitle = 'Editar Cliente';
        this.abrirModal();
      },
      eliminarCliente(index) {
        if (confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
          this.clientes.splice(index, 1);
        }
      },
      aplicarFiltros() {
        // Método para aplicar los filtros en el input y botones
      },
      toggleSaldo() {
        if (this.cliente.tipo !== 'credito') this.cliente.saldo = null;
      }
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