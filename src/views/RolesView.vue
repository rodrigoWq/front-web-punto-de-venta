<!-- src/views/RolesView.vue -->

<template>
  <AppNavbar />
  <div class="container mt-5" id="roles-view">
    <AppHeader title="Gestión de Roles" />
    <AppTable :headers="['Rol','Descripción','Acciones']">
      <tr v-for="rol in roles" :key="rol.rol_id">
        <td>{{ rol.nombre_rol }}</td>
        <td>{{ rol.descripcion }}</td>
        <td class="d-flex gap-1">
          <button
            class="btn btn-secondary btn-sm"
            @click="openAssignModal(rol)"
          >🗝️ Asignar Permisos</button>
        </td>
      </tr>
    </AppTable>

   <AppPagination
     :currentPage="page"
     :totalPages="totalPages"
     @page-changed="changePage"
   />
    
    <AssignPermisosModal
      v-model:showModal="showAssignModal"
      :rol="selectedRol"
      @saved="onPermisosSaved"
    />
  </div>
</template>

<script>
 import AppNavbar      from '@/components/AppNavbar.vue';
 import AppHeader      from '@/components/AppHeader.vue';
 import AppTable       from '@/components/AppTable.vue';
 import AppPagination  from '@/components/AppPagination.vue';
  import AssignPermisosModal from '@/components/AssignPermisosModal.vue';
  import apiService          from '@/services/apiService.js';

  export default {
   components: {
     AppNavbar,
     AppHeader,
     AppTable,
     AppPagination,
     AssignPermisosModal
   },
    data() {
      return {
        roles: [],
        page: 1,
        limit: 10,
        totalPages: 0,
        showAssignModal: false,
        selectedRol: null,
      };
    },
    methods: {
     fetchRoles() {
       apiService.get(`/api/roles?page=${this.page}&limit=${this.limit}`)
        .then(({ data }) => {
         this.roles      = data.data.data;
         this.totalPages = data.data.pagination.totalPages;
        });
      },
      changePage(p) {
        this.page = p;
       this.fetchRoles();
      },
      openAssignModal(rol) {
        this.selectedRol     = rol;
        this.showAssignModal = true;
      },
      onPermisosSaved() {
        this.showAssignModal = false;
      }
    },
    mounted() {

     this.fetchRoles();
    }
  };
</script>
