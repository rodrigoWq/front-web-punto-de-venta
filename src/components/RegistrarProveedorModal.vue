<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-8">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">{{ title }}</h5>
            <button type="button" class="btn-close" @click="$emit('close')"></button>
          </div>
          <div class="card-body">
            <div class="mb-3">
              <label class="form-label">RUC</label>
              <input
                type="text"
                class="form-control"
                v-model="providerData.ruc"
                placeholder="RUC del proveedor"
              />
            </div>
            <div class="mb-3">
              <label class="form-label">Nombre o Razón Social</label>
              <input
                type="text"
                class="form-control"
                v-model="providerData.razonSocial"
                placeholder="Nombre o Razón Social"
              />
            </div>
            <div class="mb-3">
              <label class="form-label">Teléfono</label>
              <input
                type="text"
                class="form-control"
                v-model="providerData.telefono"
                placeholder="Teléfono"
              />
            </div>
          </div>
          <div class="card-footer text-end">
            <button type="button" class="btn btn-primary me-2" @click="handleSave">
              Guardar Proveedor
            </button>
            <button type="button" class="btn btn-secondary" @click="$emit('close')">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RegistrarProveedor',
  props: {
    
    title: { type: String, default: 'Registrar Proveedor' },
    initialRuc: { type: String, default: '' }
  },
  data() {
    return {
      providerData: {
        ruc: '',
        razonSocial: '',
        telefono: ''
      }
    };
  },
  watch: {
    showModal(newVal) {
      if (newVal && this.initialRuc) {
        this.providerData.ruc = this.initialRuc;
      }
    }
  },
  methods: {
    handleSave() {
      this.$emit('proveedor-registered', { ...this.providerData });
      this.providerData = { ruc: '', razonSocial: '', telefono: '' };
      this.$router.push('registrar-proveedor');
    }
  },
  close() {
      this.$router.go(-1);
  }
};
</script>


<style scoped>
/* Full-screen container centering */

</style>
