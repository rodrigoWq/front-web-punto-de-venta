<template>
  <div>
    <div class="card h-100 shadow-sm">
      <div class="card-body d-flex flex-column">
        <h5 class="card-title text-uppercase">{{ rol.nombre_rol }}</h5>
        <p class="card-text">{{ rol.descripcion }}</p>

        <div class="mb-3">
          <h6 class="card-subtitle mb-2 text-muted">Permisos:</h6>
          <div class="d-flex flex-wrap gap-2">
            <span
              v-for="perm in displayedPermisos"
              :key="perm.id_permiso || perm.id"
              class="badge bg-secondary"
            >
              {{ perm.nombre_permiso || perm.name }}
            </span>
            <!-- indicador de que hay más permisos -->
            <span
            v-if="permisos.length > maxToShow"
            class="badge bg-info"
            >
             {{ permisos.length - maxToShow }} más
            </span>
          </div>
        </div>

        <button
          class="btn btn-outline-primary mt-auto"
          @click="openModal"
        >
          Gestionar Permisos
        </button>
      </div>
    </div>

    <!-- Modal teleported al <body> -->
    <teleport to="body">
      <AssignPermisosModal
        v-model:showModal="showModal"
        :rol="rol"
        :all-permissions="allPermissions"
        @saved="onModalSaved"
      />
    </teleport>
  </div>
</template>

<script>
import AssignPermisosModal from '@/components/AssignPermisosModal.vue'
import apiService from '@/services/apiService.js'

export default {
  name: 'RoleCard',
  components: { AssignPermisosModal },
  props: {
    rol: { type: Object, required: true },
    allPermissions: { type: Array, default: () => [] }
  },
  data() {
    return {
      permisos: [],
      showModal: false,
      maxToShow: 10
    }
  },
  async mounted() {
    // obtener permisos detallados para mostrar en el card
    try {
      const res = await apiService.get(`/api/roles/${this.rol.rol_id}`)
      this.permisos = res.data.permisos || []
    } catch (err) {
      console.error('Error cargando permisos del rol:', err)
    }
  },
  methods: {
    openModal() {
    console.log('Abriendo modal para', this.rol.nombre_rol)
      this.showModal = true
    },
    onModalSaved(newPermIds) {
      // actualizar la lista de permisos mostrada en el card
      this.permisos = this.allPermissions.filter(p =>
        newPermIds.includes(p.id_permiso || p.id)
      )
      // notificar al padre si es necesario
      this.$emit('update-permissions', { rolId: this.rol.rol_id, permisos: newPermIds })
      this.showModal = false
    }
  },
  computed: {
   displayedPermisos() {
    return this.permisos.slice(0, this.maxToShow)
   }
  },
}
</script> 