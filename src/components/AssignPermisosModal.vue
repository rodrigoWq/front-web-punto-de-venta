<template>
  <div>
    <div
      v-if="showModal && rol"
      class="modal fade show d-block"
      tabindex="-1"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Permisos para “{{ rol.nombre_rol }}”</h5>
            <button type="button" class="btn-close" @click="close()"></button>
          </div>
          <div class="modal-body">
            <div class="row">
             <div
               v-for="perm in allPermissions"
               :key="perm.permiso_id"
               class="col-md-4 mb-2"
             >
               <label class="form-check">
                 <input
                   class="form-check-input"
                   type="checkbox"
                   :value="perm.permiso_id"
                   v-model="selected"
                 />
                 <span class="form-check-label">
                   {{ perm.nombre_permiso }}
                 </span>
               </label>
             </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="close()">Cancelar</button>
            <button class="btn btn-primary" @click="save()">Guardar</button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="showModal && rol" class="modal-backdrop fade show"></div>
  </div>
</template>

<script>
import apiService from '@/services/apiService.js'

export default {
  name: 'AssignPermisosModal',
  props: {
    showModal: { type: Boolean, default: false },
    rol: { type: Object, default: null },
    allPermissions: { type: Array, default: () => [] }
  },
  data() {
    return {
      selected: [],
      // Track the originally assigned permissions to compute only new ones
      originalAssigned: []
    }
  },
  watch: {
    showModal(val) {
      if (val && this.rol) {
        // volver a cargar asignados al abrir modal
        this.loadAssigned()
      }
    }
  },
  methods: {
    async loadAssigned() {
      try {
        const res = await apiService.get(`/api/roles/${this.rol.rol_id}`)
        const assigned = res.data.permisos || []
        const ids = assigned.map(p => p.id_permiso)
        this.selected = ids.slice()
        this.originalAssigned = ids.slice()
      } catch (err) {
        console.error('Error cargando permisos asignados:', err)
      }
    },
    close() {
      this.$emit('update:showModal', false)
    },
    async save() {
      try {
        // Calcular solo los nuevos permisos a asignar
        const nuevos = this.selected.filter(
          id => !this.originalAssigned.includes(id)
        )

        // Si no hay nuevos, simplemente devolver el conjunto final (no quitamos permisos aquí)
        if (nuevos.length === 0) {
          const finalIds = Array.from(new Set([...this.originalAssigned]))
          this.$emit('saved', finalIds)
          this.close()
          return
        }

        // Llamar API para asignar los nuevos permisos
        const payload = {
          rol_id: this.rol.rol_id,
          permisos: nuevos
        }
        await apiService.post('/api/roles/assignPermissions', payload)

        // Unir originales + nuevos para reflejar el estado final en el UI (no se manejan removidos aquí)
        const finalIds = Array.from(new Set([...this.originalAssigned, ...nuevos]))
        this.originalAssigned = finalIds.slice()
        this.$emit('saved', finalIds)
        this.close()
      } catch (err) {
        console.error('Error asignando permisos al rol:', err)
      }
    }
  }
}
</script>