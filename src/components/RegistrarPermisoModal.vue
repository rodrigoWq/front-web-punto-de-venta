<template>
  <div class="modal fade" id="permissionModal" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Crear Permiso</h5>
          <button type="button" class="btn-close" @click="close()" aria-label="Close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="createPermission">
            <div class="mb-3">
              <label for="nombre_permiso" class="form-label">Nombre Permiso</label>
              <input
                type="text"
                id="nombre_permiso"
                v-model="form.nombre_permiso"
                class="form-control"
                required
              />
            </div>
            <div class="mb-3">
              <label for="descripcion" class="form-label">Descripción</label>
              <textarea
                id="descripcion"
                v-model="form.descripcion"
                class="form-control"
                required
              ></textarea>
            </div>
            <button type="submit" class="btn btn-primary">Crear</button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Modal }    from 'bootstrap';
import apiService   from '@/services/apiService.js';

export default {
  name: 'RegistrarPermisoModal',
  props: {
    showModal: Boolean
  },
  data() {
    return {
      form: {
        nombre_permiso: '',
        descripcion: ''
      },
      modalInstance: null
    };
  },
  watch: {
    showModal(val) {
      if (val) {
        this.modalInstance = new Modal(this.$el, {}).show();
      } else {
        this.modalInstance?.hide();
      }
    }
  },
  methods: {
    close() {
      this.$emit('update:showModal', false);
      this.resetForm();
    },
    createPermission() {
      apiService
        .post('/api/permissions', this.form)
        .then(({ data }) => {
          this.$emit('permission-registered', data);
          this.close();
        });
    },
    resetForm() {
      this.form.nombre_permiso = '';
      this.form.descripcion    = '';
    }
  }
};
</script>
