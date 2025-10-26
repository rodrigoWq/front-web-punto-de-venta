<template>
  <AppNavbar />

  <div class="container mt-5" id="permisos-view">
    <AppHeader title="Gestión de Permisos">
      <template #buttons>
        <!-- 🆕 abrir alta -->
        <button class="btn btn-primary" @click="openPermissionModal()">
          <i class="bi bi-plus-lg me-1"></i> Nuevo Permiso
        </button>
      </template>
    </AppHeader>

    <!-- filtro por nombre de permiso -->
    <AppFilter
      v-model="searchTerm"
      placeholder="Buscar por permiso"
      customClasses="mt-4 mb-4"
    />

    <!-- tabla de permisos -->
    <AppTable :headers="['Nombre', 'Descripción', 'Acciones']">
      <tr v-for="perm in filteredPermissions" :key="perm.permiso_id">
        <td>{{ perm.nombre_permiso }}</td>
        <td>{{ perm.descripcion }}</td>
        <td class="d-flex gap-1">
          <button
            class="btn btn-danger btn-sm"
            @click="deletePermission(perm.permiso_id)"
          >🗑 Eliminar</button>
        </td>
      </tr>
    </AppTable>

    <!-- paginación -->
    <AppPagination
      :currentPage="page"
      :totalPages="totalPages"
      @page-changed="changePage"
    />

    <!-- modal registrar permiso -->
    <RegistrarPermisoModal
      v-model:showModal="showModal"
      @permission-registered="handlePermissionSaved"
    />
  </div>
</template>

<script>
import AppNavbar           from '@/components/AppNavbar.vue';
import AppHeader           from '@/components/AppHeader.vue';
import AppFilter           from '@/components/AppFilter.vue';
import AppTable            from '@/components/AppTable.vue';
import AppPagination       from '@/components/AppPagination.vue';
import RegistrarPermisoModal from '@/components/RegistrarPermisoModal.vue';
import apiService          from '@/services/apiService.js';

export default {
  name: 'PermisosView',
  components: {
    AppNavbar,
    AppHeader,
    AppFilter,
    AppTable,
    AppPagination,
    RegistrarPermisoModal
  },
  data() {
    return {
      permissions: [],
      page: 1,
      limit: 5,
      totalPages: 0,
      searchTerm: '',
      showModal: false,
    };
  },
  computed: {
    filteredPermissions() {
      if (!this.searchTerm) return this.permissions
      return this.permissions.filter(p =>
        p.nombre_permiso
          .toLowerCase()
          .includes(this.searchTerm.toLowerCase())
      )
    },
    pagedPermissions() {
      const start = (this.page - 1) * this.limit;
      return this.filteredPermissions.slice(start, start + this.limit);
    }
  },
  methods: {
    fetchPermissions() {
      apiService
        .get(`/api/permissions?page=${this.page}&limit=${this.limit}`)
        .then(({ data }) => {
          this.permissions = data.data.data;
          this.totalPages  = data.data.pagination.totalPages;
        });
    },
    changePage(newPage) {
      this.page = newPage;
      this.fetchPermissions();
    },
    openPermissionModal() {
      this.showModal = true;
    },
    handlePermissionSaved() {
      this.page = 1;               // vuelvo a la página 1
      this.fetchPermissions()
      this.showModal = false;
    },
    async deletePermission(id) {
      const confirmed = await confirm({
        message: '¿Eliminar este permiso?',
        title: 'Eliminar permiso',
        confirmText: 'Eliminar',
        cancelText: 'Cancelar'
      });
      if (!confirmed) return;
      try {
        await apiService.delete(`/api/permissions/${id}`);
        this.permissions = this.permissions.filter(p => p.permiso_id !== id);
        alert.success('Permiso eliminado correctamente.');
      } catch (error) {
        console.error('Error al eliminar permiso:', error);
        alert.error('No se pudo eliminar el permiso. Intente nuevamente.');
      }
    }
  },
  mounted() {
    this.fetchPermissions();
  },
  watch: {
    // Cuando cambie el término de búsqueda, reiniciamos la página y recargamos
    searchTerm() {
      this.page = 1
      this.fetchPermissions()
    }
  },
};
</script>
