<template>
    <AppNavbar />
    <div class="container">
      <AppHeader title="User Management" style="margin-top: 15px;">
        <template #buttons>
          <button class="create-user-btn" @click="abrirModalCrearUsuario">Create User</button>
        </template>
      </AppHeader>

  
      <AppFilter v-model="filtroNombre" placeholder="Search by name..." customClasses="filter-section">
        <button :class="['me-2', { active: filtroRol === 'all' }]" @click="filtrarRol('all')">All Roles</button>
        <button :class="['me-2', { active: filtroRol === 'Admin' }]" @click="filtrarRol('Admin')">Admin</button>
        <button :class="['me-2', { active: filtroRol === 'Manager' }]" @click="filtrarRol('Manager')">Manager</button>
        <button :class="['me-2', { active: filtroRol === 'User' }]" @click="filtrarRol('User')">User</button>
        <button :class="['me-2', { active: filtroEstado === 'active' }]" @click="filtrarEstado('active')">Active</button>
        <button :class="{ active: filtroEstado === 'inactive'   }" @click="filtrarEstado('inactive')">Inactive</button>
      </AppFilter>

  
      <!-- Tabla de Usuarios -->
      <AppTable :headers="['Name', 'Teléfono', 'Role', 'Status', 'Actions']">
        <tr v-for="usuario in usuariosFiltrados" :key="usuario.id">
          <td>{{ usuario.nombre }}</td>
          <td>{{ usuario.telefono }}</td>
          <td>{{ usuario.rol }}</td>
          <td>
            <span :class="['status', usuario.status]">{{ usuario.status }}</span>
          </td>
          <td>
            <button  @click="abrirModalEditarUsuario(usuario)">✏️</button>
            <button  @click="eliminarUsuario(usuario.id)">🗑️</button>
          </td>
        </tr>
      </AppTable>

      <AppPagination :currentPage="currentPage" :totalPages="totalPages" @page-changed="changePage" />

      <!-- Modal Crear Usuario -->
      <div class="modal fade" id="crearUsuarioModal" tabindex="-1" aria-labelledby="crearUsuarioModalLabel"  >
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="crearUsuarioModalLabel">Crear Usuario</h5>
              <button type="button" class="btn-close" @click="cerrarModalCrearUsuario" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="crearUsuario">
                <div class="mb-3">
                  <label for="nombreUsuario" class="form-label">Nombre</label>
                  <input type="text" id="nombreUsuario" v-model="nuevoUsuario.nombre" class="form-control" required>
                </div>
                <div class="mb-3">
                  <label for="telefonoUsuario" class="form-label">Teléfono</label>
                  <input type="text" id="telefonoUsuario" v-model="nuevoUsuario.telefono" class="form-control" required>
                </div>
                <div class="mb-3">
                  <label for="rolUsuario" class="form-label">Rol</label>
                  <select id="rolUsuario" v-model="nuevoUsuario.rol" class="form-select" required>
                    <option disabled value="">Seleccione un rol</option>
                    <option>Admin</option>
                    <option>Manager</option>
                    <option>User</option>
                  </select>
                </div>
                <div class="mb-3">
                  <label for="statusUsuario" class="form-label">Estado</label>
                  <select id="statusUsuario" v-model="nuevoUsuario.status" class="form-select" required>
                    <option disabled value="">Seleccione un estado</option>
                    <option value="active">Activo</option>
                    <option value="inactive">Inactivo</option>
                  </select>
                </div>
                <button type="submit" class="btn btn-primary">Crear</button>
              </form>
            </div>
          </div>
        </div>
      </div>


      <!-- Modal Editar Usuario -->
      <div class="modal fade" id="editarUsuarioModal" tabindex="-1" aria-labelledby="editarUsuarioModalLabel"  >
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="editarUsuarioModalLabel">Editar Usuario</h5>
              <button type="button" class="btn-close" @click="cerrarModalEditarUsuario" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="editarUsuario">
                <div class="mb-3">
                  <label for="nombreUsuarioEdit" class="form-label">Nombre</label>
                  <input type="text" id="nombreUsuarioEdit" v-model="usuarioActual.nombre" class="form-control" required>
                </div>
                <div class="mb-3">
                  <label for="telefonoUsuarioEdit" class="form-label">Teléfono</label>
                  <input type="text" id="telefonoUsuarioEdit" v-model="usuarioActual.telefono" class="form-control" required>
                </div>
                <div class="mb-3">
                  <label for="rolUsuarioEdit" class="form-label">Rol</label>
                  <select id="rolUsuarioEdit" v-model="usuarioActual.rol" class="form-select" required>
                    <option>Admin</option>
                    <option>Manager</option>
                    <option>User</option>
                  </select>
                </div>
                <div class="mb-3">
                  <label for="statusUsuarioEdit" class="form-label">Estado</label>
                  <select id="statusUsuarioEdit" v-model="usuarioActual.status" class="form-select" required>
                    <option value="active">Activo</option>
                    <option value="inactive">Inactivo</option>
                  </select>
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
  import AppNavbar from '../components/AppNavbar.vue';
  import AppHeader from '../components/AppHeader.vue';
  import AppFilter from '../components/AppFilter.vue';
  import AppTable from '../components/AppTable.vue';
  import AppPagination from '../components/AppPagination.vue';
  import apiService from '../services/apiService';
  import { Modal } from 'bootstrap';



  export default {
    name: 'UserManagement',
    components: {
    AppNavbar,
    AppHeader,
    AppFilter,
    AppTable,
    AppPagination,
    },
    data() {
      return {
        filtroNombre: '',
        filtroRol: 'all',
        filtroEstado: 'all',
        usuarios: [], // Datos de usuarios
        currentPage: 1,
        itemsPerPage: 10,
        mostrarModalCrear: false,
        mostrarModalEditar: false,
        nuevoUsuario: {
          nombre: '',
          telefono: '',
          rol: '',
          status: ''
        },
        usuarioActual: {},
      };
    },
    computed: {
      usuariosFiltrados() {
        let filtered = this.usuarios;
        if (this.filtroNombre && this.filtroNombre.trim() !== '') {
          filtered = filtered.filter(user => user.nombre.toLowerCase().includes(this.filtroNombre.toLowerCase()));
        }
        if (this.filtroRol !== 'all') {
          filtered = filtered.filter(user => user.rol === this.filtroRol);
        }
        if (this.filtroEstado !== 'all') {
          filtered = filtered.filter(user => user.status === this.filtroEstado);
        }
        return filtered.slice((this.currentPage - 1) * this.itemsPerPage, this.currentPage * this.itemsPerPage);
      },
      totalPages() {
        let filtered = this.usuarios.filter(this.applyFilters);
        return Math.ceil(filtered.length / this.itemsPerPage);
  }
    },
    methods: {
      abrirModalCrearUsuario() {
        const modalElement = document.getElementById('crearUsuarioModal');
        const bsModal = new Modal(modalElement, {});
        bsModal.show();
      },
      applyFilters(usuario) {
        const nombreMatch = !this.filtroNombre || (usuario.nombre || '').toLowerCase().includes(this.filtroNombre.toLowerCase());
        const rolMatch = this.filtroRol === 'all' ? true : usuario.rol === this.filtroRol;
        const estadoMatch = this.filtroEstado === 'all' ? true : usuario.status === this.filtroEstado;
        return nombreMatch && rolMatch && estadoMatch;
      },
      cerrarModalCrearUsuario() {
        const modalElement = document.getElementById('crearUsuarioModal');
        const bsModal = Modal.getInstance(modalElement);
        bsModal.hide();
      },
      getUsuarios() {
        apiService.get('/users')
          .then(response => {
            this.usuarios = response.data;
          })
          .catch(error => {
            console.error('Error al cargar usuarios:', error);
          });
      },

      changePage(page) {
        this.currentPage = page;
      },
      filtrarRol(rol) {
        this.filtroRol = rol;
        this.filtroEstado = 'all';
      },
      filtrarEstado(estado) {
        this.filtroEstado = estado;
        this.filtroRol = 'all'; // Resetear filtro de rol al seleccionar estado
      },
      abrirModalEditarUsuario(usuario) {
        this.usuarioActual = { ...usuario };
        const modalElement = document.getElementById('editarUsuarioModal');
        const bsModal = new Modal(modalElement, {});
        bsModal.show();
      },
      cerrarModalEditarUsuario() {
        const modalElement = document.getElementById('editarUsuarioModal');
        const bsModal = Modal.getInstance(modalElement);
        bsModal.hide();
      },

      crearUsuario() {
        apiService.post('/users', this.nuevoUsuario)
         .then(response => {
           this.usuarios.push(response.data);
           this.nuevoUsuario = { nombre: '', telefono: '', rol: '', status: '' };
           this.cerrarModalCrearUsuario();
         })
         .catch(error => {
           console.error('Error al crear usuario:', error);
         });
      },
      editarUsuario() {
        apiService.put(`/users/${this.usuarioActual.id}`, this.usuarioActual)
          .then(response => {
            const index = this.usuarios.findIndex(user => user.id === this.usuarioActual.id);
            if (index !== -1) {
              this.usuarios.splice(index, 1, response.data);
            }
            this.cerrarModalEditarUsuario();
          })
          .catch(error => {
            console.error('Error al editar usuario:', error);
          });
      },
      eliminarUsuario(id) {
        if (confirm('¿Estás seguro de eliminar este usuario?')) {
         apiService.delete(`/users/${id}`)
           .then(() => {
             this.usuarios = this.usuarios.filter(user => user.id !== id);
           })
           .catch(error => {
             console.error('Error al eliminar usuario:', error);
           });
       }
      }

    },
    mounted() {
      // Simulación de carga de usuarios (cargar desde API real si es necesario)
      this.usuarios = [
        { id: 1, nombre: 'John Doe', telefono: '123-456-7890', rol: 'Admin', status: 'active' },
        { id: 2, nombre: 'Jane Smith', telefono: '098-765-4321', rol: 'User', status: 'inactive' },
        { id: 3, nombre: 'kAPE Smith', telefono: '098-765-4321', rol: 'Manager', status: 'inactive' },
      ];

      //this.getUsuarios();
    }
  };
</script>

<style scoped>


</style>