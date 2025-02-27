<template>
    <AppNavbar />
    <div class="container">
      <AppHeader title="User Management">
        <template #buttons>
          <button class="admin-only create-user-btn" @click="abrirModalCrearUsuario">Create User</button>
          <button id="goToInicio" @click="volverAPantallaInicio">Volver a Pantalla Inicio</button>
        </template>
      </AppHeader>

  
      <AppFilter v-model="filtroNombre" placeholder="Search by name..." customClasses="filter-section">
        <AppButton variant="outline-secondary" customClass="me-2" @click="filtrarRol('all')">All Roles</AppButton>
        <AppButton variant="outline-secondary" customClass="me-2" @click="filtrarRol('Admin')">Admin</AppButton>
        <AppButton variant="outline-secondary" customClass="me-2" @click="filtrarRol('Manager')">Manager</AppButton>
        <AppButton variant="outline-secondary" customClass="me-2" @click="filtrarRol('User')">User</AppButton>
        <AppButton variant="outline-secondary" customClass="me-2" @click="filtrarEstado('active')">Active</AppButton>
        <AppButton variant="outline-secondary" @click="filtrarEstado('inactive')">Inactive</AppButton>
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
            <AppButton variant="primary" customClass="admin-only" @click="abrirModalEditarUsuario(usuario)">✏️</AppButton>
            <AppButton variant="danger" customClass="admin-only" @click="eliminarUsuario(usuario.id)">🗑️</AppButton>
          </td>
        </tr>
      </AppTable>

  
      <!-- Modal Crear Usuario -->
      <div v-if="mostrarModalCrear" class="modal">
        <div class="modal-body">
          <div class="modal-header">
            <h2>Crear Usuario</h2>
            <button class="close-button" @click="cerrarModalCrearUsuario">&times;</button>
          </div>
          <form @submit.prevent="crearUsuario">
            <!-- Formulario de creación de usuario -->
            <div class="form-group">
              <label for="nombre">Nombre</label>
              <input type="text" v-model="nuevoUsuario.nombre" required />
            </div>
            <!-- Agrega más campos del formulario aquí -->
            <button type="submit" class="submit-button">Crear</button>
          </form>
        </div>
      </div>
  
      <!-- Modal Editar Usuario -->
      <div v-if="mostrarModalEditar" class="modal">
        <div class="modal-body">
          <div class="modal-header">
            <h2>Editar Usuario</h2>
            <button class="close-button" @click="cerrarModalEditarUsuario">&times;</button>
          </div>
          <form @submit.prevent="editarUsuario">
            <!-- Formulario de edición de usuario -->
            <div class="form-group">
              <label for="nombre">Nombre</label>
              <input type="text" v-model="usuarioActual.nombre" required />
            </div>
            <!-- Agrega más campos del formulario aquí -->
            <button type="submit" class="submit-button">Guardar</button>
          </form>
        </div>
      </div>
    </div>
</template>
  
<script>
  import AppNavbar from './common/AppNavbar.vue';
  import AppHeader from './common/AppHeader.vue';
  import AppFilter from './common/AppFilter.vue';
  import AppTable from './common/AppTable.vue';
  import AppButton from './common/AppButton.vue';

  export default {
    name: 'UserManagement',
    components: {
    AppNavbar,
    AppHeader,
    AppFilter,
    AppTable,
    AppButton
    },
    data() {
      return {
        filtroNombre: '',
        filtroRol: 'all',
        filtroEstado: 'all',
        usuarios: [], // Datos de usuarios
        mostrarModalCrear: false,
        mostrarModalEditar: false,
        nuevoUsuario: {},
        usuarioActual: null,
      };
    },
    computed: {
      usuariosFiltrados() {
        // Filtra usuarios por nombre, rol y estado
        return this.usuarios.filter(usuario => {
          const cumpleRol = this.filtroRol === 'all' || usuario.rol === this.filtroRol;
          const cumpleEstado = this.filtroEstado === 'all' || usuario.status === this.filtroEstado;
          const cumpleNombre = usuario.nombre.toLowerCase().includes(this.filtroNombre.toLowerCase());
          return cumpleRol && cumpleEstado && cumpleNombre;
        });
      }
    },
    methods: {
      abrirModalCrearUsuario() {
        this.mostrarModalCrear = true;
      },
      cerrarModalCrearUsuario() {
        this.mostrarModalCrear = false;
      },
      abrirModalEditarUsuario(usuario) {
        this.usuarioActual = { ...usuario };
        this.mostrarModalEditar = true;
      },
      cerrarModalEditarUsuario() {
        this.mostrarModalEditar = false;
      },
      filtrarRol(rol) {
        this.filtroRol = rol;
      },
      filtrarEstado(estado) {
        this.filtroEstado = estado;
      },
      crearUsuario() {
        // Lógica para crear usuario
        this.cerrarModalCrearUsuario();
      },
      editarUsuario() {
        // Lógica para editar usuario
        this.cerrarModalEditarUsuario();
      },
      eliminarUsuario() {
        if (confirm('¿Estás seguro de eliminar este usuario?')) {
          // Lógica para eliminar usuario
        }
      },
      volverAPantallaInicio() {
        this.$router.push('/pantalla-inicio');
      }
    },
    mounted() {
      // Simulación de carga de usuarios (cargar desde API real si es necesario)
      this.usuarios = [
        { id: 1, nombre: 'John Doe', telefono: '123-456-7890', rol: 'Admin', status: 'active' },
        { id: 2, nombre: 'Jane Smith', telefono: '098-765-4321', rol: 'User', status: 'inactive' },
      ];
    }
  };
</script>
  
<style scoped>
  /* Reset y estilos generales */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: Arial, sans-serif;
    background-color: #f7f7f7;
    padding: 20px;
}

/* Contenedor principal */
.container {
    max-width: 1200px;
    margin: 0 auto;
    background-color: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

/* Encabezado: Alineamos los botones más juntos */
header {
    display: grid;
    grid-template-columns: 1fr auto; /* Título a la izquierda y botones a la derecha */
    align-items: center;
    margin-bottom: 20px;
}
h1 {
    font-size: 24px;
    font-weight: bold;
}

/* Contenedor de los botones en el header */
.header-buttons {
    display: flex;
    gap: 10px; /* Espacio entre los botones */
    margin-left: auto; /* Alinear los botones a la derecha */
}


/* Botón de Crear Usuario */
.create-user-btn {
    padding: 10px 20px;
    background-color: black;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
}

.create-user-btn:hover {
    background-color: #333;
}

/* Sección de filtros */
.filter-section {
    margin-bottom: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.filter-section input {
    padding: 10px;
    width: 300px;
    border: 1px solid #ddd;
    border-radius: 4px;
}

.filters button {
    padding: 8px 16px;
    margin-right: 10px;
    border: 1px solid #ddd;
    background-color: white;
    border-radius: 4px;
    cursor: pointer;
}

.filters button:hover {
    background-color: #f0f0f0;
}

/* Estilos de la tabla de usuarios */
table {
    width: 100%;
    border-collapse: collapse;
}

table th, table td {
    text-align: left;
    padding: 12px 15px;
}

table thead {
    background-color: #f9f9f9;
}

table tbody tr {
    border-bottom: 1px solid #ddd;
}

table tbody tr:hover {
    background-color: #f1f1f1;
}

/* Estilos del estado */
.status {
    padding: 5px 10px;
    border-radius: 20px;
    font-size: 14px;
    color: white;
}

.status.active {
    background-color: #28a745;
}

.status.inactive {
    background-color: #dc3545;
}

/* Botones de edición y eliminación */
.edit-btn, .delete-btn {
    border: none;
    background: none;
    cursor: pointer;
    font-size: 18px;
}

.edit-btn:hover, .delete-btn:hover {
    color: #007bff;
}

/* Estilo del fondo que oscurece la pantalla cuando el modal está activo */
.modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5); /* Fondo oscuro con opacidad */
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

/* Ocultar el modal cuando tiene la clase 'hidden' */
.hidden {
    display: none;
}

/* Contenedor del contenido del modal */
.modal .modal-body {
    background-color: white;
    padding: 20px;
    width: 500px;
    max-width: 90%; /* Para pantallas más pequeñas */
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    position: relative; /* Para que el botón de cerrar se posicione correctamente */
    animation: fadeIn 0.3s ease-in-out; /* Animación al aparecer */
}

/* Encabezado del modal */
.modal-header {
    display: flex;
    justify-content: space-between; /* El título y el botón se alinean a los lados */
    align-items: center;
    padding-bottom: 10px;
    border-bottom: 1px solid #ccc;
}

.modal-header h2 {
    margin: 0;
    font-size: 1.5rem;
    flex-grow: 1; /* Hace que el título ocupe todo el espacio disponible */
    text-align: left; /* Alinea el título a la izquierda */
}

.close-button {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    margin-left: 10px; /* Da espacio entre el botón y el título */
    color: #333; /* Cambia el color del botón de cierre */
    position: absolute; /* Alinea el botón en la esquina superior derecha */
    right: 20px;
    top: 20px;
}

/* Estilos para el formulario */
.form-group {
    margin-bottom: 15px;
}

.form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
}

.form-group input,
.form-group select {
    width: 100%;
    padding: 8px;
    box-sizing: border-box;
    border: 1px solid #ccc;
    border-radius: 4px;
}

/* Botones de estado */
.estado-buttons {
    display: flex;
    gap: 10px;
    margin-bottom: 15px; /* Añade margen inferior a los botones de estado */
}

.estado {
    padding: 8px 15px;
    cursor: pointer;
    border: 1px solid #ccc;
    border-radius: 4px;
    background-color: #f5f5f5;
}

.modal.hidden {
    display: none;
}


.estado.active {
    background-color: #4CAF50;
    color: white;
    border-color: #4CAF50;
}

/* Nueva clase para el botón "Inactivo" cuando esté activo */
.estado.inactivo.active {
    background-color: #dc3545; /* Rojo para el botón inactivo */
    color: white;
    border-color: #dc3545;
}

/* Botón para crear el usuario */
.submit-button {
    width: 100%;
    padding: 10px;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
}

.submit-button:hover {
    background-color: #45a049;
}

/* Animación para que el modal aparezca suavemente */
@keyframes fadeIn {
    from {
        opacity: 0;
        transform: scale(0.9);
    }
    to {
        opacity: 1;
        transform: scale(1);
    }
}

/* Responsive: ajustar el modal en pantallas pequeñas */
@media (max-width: 600px) {
    .modal .modal-body {
        width: 90%;
    }
}
/* Botón de Volver a Pantalla Inicio */
#goToInicio {
    padding: 10px 20px;
    background-color: black;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
}

#goToInicio:hover {
    background-color: #333;
}
</style>
  