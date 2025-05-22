<template>
  <div class="modal fade" tabindex="-1" ref="modalEl">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Permisos para “{{ rol.nombre_rol }}”</h5>
          <button type="button" class="btn-close" @click="close()" data-bs-dismiss="modal"/>
        </div>
        <div class="modal-body">
          <div class="row">
            <div
              v-for="perm in permisos"
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
</template>

<script>
import { Modal }     from 'bootstrap';
import apiService    from '@/services/apiService.js';

export default {
  name: 'AssignPermisosModal',
  props: {
    showModal: Boolean,
    rol:       Object
  },
  data() {
    return {
      permisos: [],
      selected: [],
      modalInstance: null
    };
  },
  watch: {
    showModal(val) {
      if (val) {
        this.loadPermisos();
        this.modalInstance = new Modal(this.$refs.modalEl, {});
        this.modalInstance.show();
      } else {
        this.modalInstance?.hide();
      }
    }
  },
  methods: {
    loadPermisos() {
      // cargo todos los permisos
      apiService.get('/api/permissions?page=1&limit=1000')
        .then(({ data }) => {
          this.permisos = data.data.data;
          return apiService.get(`/api/roles/${this.rol.rol_id}/permissions`);
        })
        .then(({ data }) => {
          // marcamos los ya asignados
          this.selected = data.assignedIds; 
        });
    },
    close() {
      this.$emit('update:showModal', false);
      this.selected = [];
    },
    save() {
      apiService.post('/api/roles', {
        rol_id:   this.rol.rol_id,
        permisos: this.selected
      })
      .then(() => {
        this.$emit('saved', this.selected);
        this.close();
      });
    }
  }
};
</script>
