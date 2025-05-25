<template>
  <AppNavbar />
  <div class="container mt-5" id="roles-view">
    <AppHeader title="Gestión de Roles">
      <template #buttons>
        <router-link class="btn btn-success me-2" :to="{ name: 'Permisos' }">
          Permisos
        </router-link>
      </template>
    </AppHeader>

    <div class="row g-4">
      <div
        class="col-12 col-md-6 col-lg-4"
        v-for="rol in roles"
        :key="rol.rol_id"
      >
        <RoleCard
          :rol="rol"
          :all-permissions="allPermissions"
          class="mt-3" 
          @update-permissions="onPermisosSaved"
        />
      </div>
    </div>
  </div>
</template>

<script>
import AppNavbar from '@/components/AppNavbar.vue'
import AppHeader from '@/components/AppHeader.vue'
import RoleCard from '@/components/RoleCard.vue'
import apiService from '@/services/apiService.js'

export default {
  components: { AppNavbar, AppHeader, RoleCard },
  data() {
    return {
      roles: [],
      allPermissions: []
    }
  },
  methods: {
    async fetchRoles() {
      try {
        const res = await apiService.get('/api/roles')
        this.roles = res.data || []
      } catch (err) {
        console.error('Error cargando roles:', err)
      }
    },
    async fetchAllPermissions() {
      try {
        const res = await apiService.get('/api/permissions')
        const lista =
          res.data?.data?.data ||
          res.data?.data ||
          res.data ||
          []
        this.allPermissions = Array.isArray(lista)
          ? lista.map(p => ({
              permiso_id:    p.permiso_id ?? p.id_permiso,
              nombre_permiso: p.nombre_permiso,
              descripcion:    p.descripcion
            }))
          : []
      } catch (err) {
        console.error('Error cargando permisos globales:', err)
      }
    },

    onPermisosSaved({ rolId, permisos }) {
      const idx = this.roles.findIndex(r => r.rol_id === rolId)
      if (idx !== -1) {
        this.roles[idx].permisos = permisos.map(id => ({ id_permiso: id }))
      }
    }
  },
  mounted() {
    this.fetchRoles()
    this.fetchAllPermissions()
  }
}
</script>