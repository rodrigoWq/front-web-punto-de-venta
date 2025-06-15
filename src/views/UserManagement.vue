<template>
    <AppNavbar />
    <div class="container">
      <AppHeader title="User Management" style="margin-top: 15px;">
        <template #buttons>
          <button class="ms-2 permissions-btn" @click="irARoles">Roles</button>
          <button class="create-user-btn" @click="abrirModalCrearUsuario">Create User</button>
        </template>
      </AppHeader>

  
      <AppFilter v-model="filtroNombre" placeholder="Search by name..." customClasses="filter-section">
        <button :class="['me-2', { active: filtroRol === 'all' }]" @click="filtrarRol('all')">All Roles</button>
        <button :class="['me-2', { active: filtroEstado === 'active' }]" @click="filtrarEstado('active')">Active</button>
        <button :class="{ active: filtroEstado === 'inactive'   }" @click="filtrarEstado('inactive')">Inactive</button>
      </AppFilter>

  
      <!-- Tabla de Usuarios -->
      <AppTable :headers="['Name', 'Role', 'Status', 'Actions']">
        <tr v-for="usuario in usuariosFiltrados" :key="usuario.id">
          <td>{{ usuario.nombre }}</td>
         <!-- <td>{{ usuario.telefono }}</td> -->
          <td>{{ usuario.rol }}</td>
          <td>
            <span :class="['status', usuario.status]">{{ usuario.status }}</span>
          </td>
          <td style="display: flex; align-items: center; gap: 0.5rem;">
            <button  @click="abrirModalEditarUsuario(usuario)">✏️</button>
            <button  @click="eliminarUsuario(usuario.id)">🗑️</button>
            <button  @click="abrirModalResetPassword(usuario)">🔒 Reset</button>
          </td>
        </tr>
      </AppTable>

      <AppPagination :currentPage="currentPage" :totalPages="totalPages" @page-changed="changePage" />

      <!-- Modal Crear Usuario -->
      <div class="modal fade" id="crearUsuarioModal" tabindex="-1" aria-labelledby="crearUsuarioModalLabel">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="crearUsuarioModalLabel">Crear Usuario</h5>
              <button type="button" class="btn-close" @click="cerrarModalCrearUsuario"></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="crearUsuario">
                <!-- Row 1: Usuario + Password -->
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="usuario" class="form-label">Usuario</label>
                    <input type="text" id="usuario" v-model="nuevoUsuario.usuario" class="form-control" required>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label for="password" class="form-label">Password</label>
                    <input type="password" id="password" v-model="nuevoUsuario.password" class="form-control" required>
                  </div>
                </div>

                <!-- Row 2: Nombre + Apellido -->
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="nombre" class="form-label">Nombre</label>
                    <input type="text" id="nombre" v-model="nuevoUsuario.nombre" class="form-control" required>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label for="apellido" class="form-label">Apellido</label>
                    <input type="text" id="apellido" v-model="nuevoUsuario.apellido" class="form-control" required>
                  </div>
                </div>

                <!-- Row 3: Email + Teléfono -->
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="email" class="form-label">Email</label>
                    <input type="email" id="email" v-model="nuevoUsuario.email" class="form-control" required>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label for="telefono" class="form-label">Teléfono</label>
                    <input type="text" id="telefono" v-model="nuevoUsuario.telefono" class="form-control" placeholder="(opcional)">
                  </div>
                </div>

                <!-- Row 4: Rol + Dirección -->
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="rolId" class="form-label">Rol</label>
                    <select id="rolId" v-model="nuevoUsuario.rol_id" class="form-select" required>
                      <option disabled value="">Seleccione un rol</option>
                      <option v-for="r in roles" :key="r.rol_id" :value="r.rol_id">
                        {{ r.nombre_rol }}
                      </option>
                    </select>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label for="direccion" class="form-label">Dirección</label>
                    <input type="text" id="direccion" v-model="nuevoUsuario.direccion" class="form-control">
                  </div>
                </div>

                <!-- Row 5: Fecha de Nacimiento -->
                <div class="row">
                  <div class="col-12 mb-3">
                    <label for="fechaNacimiento" class="form-label">Fecha de Nacimiento</label>
                    <input type="date" id="fechaNacimiento" v-model="nuevoUsuario.fecha_nacimiento" class="form-control">
                  </div>
                </div>

                <button type="submit" class="btn btn-primary">Crear</button>
              </form>
            </div>
          </div>
        </div>
      </div>


      <!-- Modal Editar Usuario -->
      <div class="modal fade" id="editarUsuarioModal" tabindex="-1" aria-labelledby="editarUsuarioModalLabel">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="editarUsuarioModalLabel">Editar Usuario</h5>
              <button type="button" class="btn-close" @click="cerrarModalEditarUsuario"></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="editarUsuario">
                <!-- Row 1: Usuario + Rol -->
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="usuarioEdit" class="form-label">Usuario</label>
                    <input type="text" id="usuarioEdit" v-model="usuarioActual.usuario" class="form-control" required>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label for="rolIdEdit" class="form-label">Rol</label>
                    <select id="rolIdEdit" v-model="usuarioActual.rol_id" class="form-select" required>
                      <option disabled value="">Seleccione un rol</option>
                      <option v-for="r in roles" :key="r.rol_id" :value="r.rol_id">
                        {{ r.nombre_rol }}
                      </option>
                    </select>
                  </div>
                </div>

                <!-- Row 2: Nombre + Apellido -->
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="nombreEdit" class="form-label">Nombre</label>
                    <input type="text" id="nombreEdit" v-model="usuarioActual.nombre" class="form-control" required>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label for="apellidoEdit" class="form-label">Apellido</label>
                    <input type="text" id="apellidoEdit" v-model="usuarioActual.apellido" class="form-control" required>
                  </div>
                </div>

                <!-- Row 3: Email + Teléfono -->
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="emailEdit" class="form-label">Email</label>
                    <input type="email" id="emailEdit" v-model="usuarioActual.email" class="form-control" required>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label for="telefonoEdit" class="form-label">Teléfono</label>
                    <input type="text" id="telefonoEdit" v-model="usuarioActual.telefono" class="form-control" placeholder="(opcional)">
                  </div>
                </div>

                <!-- Row 4: Dirección + Fecha de Nacimiento -->
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="direccionEdit" class="form-label">Dirección</label>
                    <input type="text" id="direccionEdit" v-model="usuarioActual.direccion" class="form-control">
                  </div>
                  <div class="col-md-6 mb-3">
                    <label for="fechaNacimientoEdit" class="form-label">Fecha de Nacimiento</label>
                    <input type="date" id="fechaNacimientoEdit" v-model="usuarioActual.fecha_nacimiento" class="form-control">
                  </div>
                </div>

                <button type="submit" class="btn btn-primary">Guardar</button>
              </form>
            </div>
          </div>
        </div>
      </div>


      <!-- Modal Reset Password -->
      <div class="modal fade" id="resetPasswordModal" tabindex="-1" aria-labelledby="resetPasswordModalLabel">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="resetPasswordModalLabel">Reset Password</h5>
              <button type="button" class="btn-close" @click="cerrarModalResetPassword" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="resetPasswordAPI">
                <div class="mb-3">
                  <label for="newPassword" class="form-label">New Password</label>
                  <input 
                    type="password" 
                    id="newPassword" 
                    v-model="resetPassword.newPassword" 
                    class="form-control" 
                    required 
                  />
                </div>
                <button type="submit" class="btn btn-primary">Reset</button>
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
        roles: [],
        currentPage: 1,
        itemsPerPage: 10,
        nuevoUsuario: {
          usuario: '',
          password: '',
          rol_id: null,
          nombre: '',
          apellido: '',
          email: '',
          telefono: '',          // puedes conservarlo si más adelante lo vas a utilizar
          direccion: '',
          fecha_nacimiento: ''
        },
        usuarioActual: {
          id: null,              // almacenará usuario_id
          usuario: '',
          password: '',         // opcional, si vas a permitir cambiar contraseña
          rol_id: null,
          nombre: '',
          apellido: '',
          email: '',
          telefono: '',
          direccion: '',
          fecha_nacimiento: '',
          activo: true           // para saber el estado actual del usuario
        },
        resetPassword: {
          userId: null,
          newPassword: ''
        }
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
        let filtered = this.usuarios;
        if (this.filtroNombre.trim()) {
          filtered = filtered.filter(u => u.nombre.toLowerCase().includes(this.filtroNombre.toLowerCase()));
        }
        if (this.filtroRol !== 'all') {
          filtered = filtered.filter(u => u.rol === this.filtroRol);
        }
        if (this.filtroEstado !== 'all') {
          filtered = filtered.filter(u => u.status === this.filtroEstado);
        }
        return Math.ceil(filtered.length / this.itemsPerPage);
      }
    },
    methods: {
      abrirModalCrearUsuario() {
        this.nuevoUsuario = {
          usuario: '',
          password: '',
          rol_id: null,
          nombre: '',
          apellido: '',
          email: '',
          telefono: '',
          direccion: '',
          fecha_nacimiento: ''
        };
        const modalElement = document.getElementById('crearUsuarioModal');
        const bsModal = new Modal(modalElement, {});
        bsModal.show();
      },
      getRoles() {
        apiService.get('/api/roles')
          .then(response => {
            this.roles = response.data;
          })
          .catch(err => console.error('Error al cargar roles:', err));
      },
      obtenerUsuarioPorId(id) {
        return apiService.get(`/api/auth/users/${id}`)
          .then(response => {
            const u = response.data;
            return {
              id: u.usuario_id,
              usuario: u.usuario,
              rol_id: u.rol_id,
              nombre: u.nombre,
              apellido: u.apellido,
              email: u.email,
              telefono: u.telefono,
              direccion: u.direccion,
              // Convertimos la fecha ISO a “YYYY-MM-DD” para que funcione en el <input type="date">
              fecha_nacimiento: u.fecha_nacimiento.split('T')[0],
              activo: u.activo
            };
          });
        },

      cerrarModalCrearUsuario() {
        const modalElement = document.getElementById('crearUsuarioModal');
        const bsModal = Modal.getInstance(modalElement);
        bsModal.hide();
      },
      irARoles() {
        this.$router.push({ name: 'Roles' });
      },
      getUsuarios() {
        apiService.get('/api/auth/users')
          .then(response => {
            // Mapear cada objeto recibido al formato que espera la interfaz
            this.usuarios = response.data.map(u => ({
              id: u.usuario_id,
              nombre: u.nombre,
              rol: u.nombre_rol,
              status: u.activo ? 'active' : 'inactive'
              // (si más adelante necesitas teléfono, lo agregas con u.telefono)
            }));
          })
          .catch(error => {
            console.error('Error al cargar usuarios:', error);
          });
      },
      abrirModalResetPassword(usuario) {
        this.resetPassword.userId = usuario.id;
        this.resetPassword.newPassword = '';
        const modalEl = document.getElementById('resetPasswordModal');
        new Modal(modalEl).show();
      },

       cerrarModalResetPassword() {
        const modalEl = document.getElementById('resetPasswordModal');
        Modal.getInstance(modalEl).hide();
      },

      resetPasswordAPI() {
        apiService
          .put(`/api/auth/${this.resetPassword.userId}/resetPassword`, {
            password: this.resetPassword.newPassword
          })
          .then(() => {
            this.cerrarModalResetPassword();
            // Opcional: notificar éxito al usuario
          })
          .catch(error => {
            console.error('Error al resetear contraseña:', error);
            // Opcional: mostrar alerta de error
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
      abrirModalEditarUsuario(usuarioListado) {
        this.obtenerUsuarioPorId(usuarioListado.id)
          .then(usuarioCompleto => {
            this.usuarioActual = usuarioCompleto;
            const modalEl = document.getElementById('editarUsuarioModal');
            const bsModal = new Modal(modalEl, {});
            bsModal.show();
          })
          .catch(err => {
            console.error('Error al cargar datos del usuario:', err);
            // Opcional: mostrar un mensaje de error al usuario
          });
      },
      cerrarModalEditarUsuario() {
        const modalElement = document.getElementById('editarUsuarioModal');
        const bsModal = Modal.getInstance(modalElement);
        bsModal.hide();
      },

      crearUsuario() {
        const payload = {
          usuario: this.nuevoUsuario.usuario,
          password: this.nuevoUsuario.password,
          rol_id: this.nuevoUsuario.rol_id,
          nombre: this.nuevoUsuario.nombre,
          apellido: this.nuevoUsuario.apellido,
          email: this.nuevoUsuario.email,
          telefono: this.nuevoUsuario.telefono,
          direccion: this.nuevoUsuario.direccion,
          fecha_nacimiento: this.nuevoUsuario.fecha_nacimiento
        };
        apiService.post('/api/auth/register', payload)
          .then(() => {
            this.getUsuarios();   // recargamos la lista
            this.cerrarModalCrearUsuario();
            // resetear el modelo
            this.nuevoUsuario = {
              usuario: '',
              password: '',
              rol_id: null,
              nombre: '',
              apellido: '',
              email: '',
              telefono: '',
              direccion: '',
              fecha_nacimiento: ''
            };
          })
          .catch(error => {
            console.error('Error al crear usuario:', error);
          });
      },
      editarUsuario() {
        const payload = {
          usuario: this.usuarioActual.usuario,
          // si permites cambiar password, inclúyelo aquí; de lo contrario elimínalo:
          password: this.usuarioActual.password,
          rol_id: this.usuarioActual.rol_id,
          nombre: this.usuarioActual.nombre,
          apellido: this.usuarioActual.apellido,
          email: this.usuarioActual.email,
          telefono: this.usuarioActual.telefono,
          direccion: this.usuarioActual.direccion,
          fecha_nacimiento: this.usuarioActual.fecha_nacimiento
        };
        apiService.put(`/api/auth/users/${this.usuarioActual.id}`, payload)
          .then(() => {
            this.getUsuarios();       // recargamos la lista completa
            this.cerrarModalEditarUsuario();
          })
          .catch(error => {
            console.error('Error al editar usuario:', error);
          });
      },
      eliminarUsuario(id) {
        if (confirm('¿Estás seguro de cambiar el estado de este usuario a inactivo?')) {
          apiService.put('/api/auth/desactivate', { id })
            .then(() => {
              this.getUsuarios();  // recargamos la lista actualizada
            })
            .catch(error => {
              console.error('Error al desactivar usuario:', error);
            });
        }
      }

    },
    mounted() {
      this.getRoles();
      this.getUsuarios();
    }
  };
</script>

<style scoped>


</style>