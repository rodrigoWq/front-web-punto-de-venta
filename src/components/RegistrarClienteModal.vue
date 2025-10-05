<template>
  <div class="modal fade" ref="modalEl" tabindex="-1">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Registrar Cliente</h5>
          <button type="button" class="btn-close" @click="close"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submit">
            <div class="container-fluid">
              <div class="row mb-3">
                <div class="col-md-12">
                  <label class="form-label">Nombre Completo</label>
                  <input type="text" v-model="form.nombre_completo" class="form-control" required />
                </div>
              </div>
              <div class="row mb-3">
                <div class="col-md-6">
                  <label class="form-label">Nro. Documento</label>
                  <input type="text" v-model="form.nro_documento" class="form-control" required />
                </div>
                <div class="col-md-6">
                  <label class="form-label">RUC</label>
                  <input type="text" v-model="form.ruc" class="form-control" required />
                </div>
              </div>
              <div class="row mb-3">
                <div class="col-md-6">
                  <label class="form-label">Dirección</label>
                  <input type="text" v-model="form.direccion" class="form-control" />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Teléfono</label>
                  <input type="tel" v-model="form.telefono" class="form-control" />
                </div>
              </div>
              <div class="row mb-3">
                <div class="col-md-6">
                  <label class="form-label">Email</label>
                  <input type="email" v-model="form.email" class="form-control" />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Nombre Fantasía</label>
                  <input type="text" v-model="form.nombre_fantasia" class="form-control" />
                </div>
              </div>
              <div class="row mb-3">
                <div class="col-md-6">
                  <label class="form-label">Condiciones de Pago</label>
                  <select v-model="form.condiciones_pago" class="form-select">
                    <option value="CONTADO">Contado</option>
                    <option value="CREDITO">Crédito</option>
                  </select>
                </div>
              </div>
              <div class="row">
                <div class="col text-end">
                  <button type="submit" class="btn btn-primary">Guardar Cliente</button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Modal } from 'bootstrap';
import apiService from '@/services/apiService.js';

export default {
  name: 'RegistrarClienteModal',
  props: {
    open: { type: Boolean, default: false },
    prefillRuc: { type: String, default: '' },
    prefillDocumento: { type: String, default: '' }
  },
  emits: ['saved', 'close'],
  data() {
    return {
      bsModal: null,
      form: {
        nombre_completo: '',
        nro_documento: '',
        ruc: '',
        direccion: '',
        telefono: '',
        email: '',
        nombre_fantasia: '',
        condiciones_pago: 'CONTADO'
      }
    };
  },
  watch: {
    open(val) {
      if (val) this.show(); else this.hide();
    }
  },
  methods: {
    show() {
      if (!this.bsModal) this.bsModal = new Modal(this.$refs.modalEl);
      // Prefill
      this.form = {
        nombre_completo: '',
        nro_documento: this.prefillDocumento || this.prefillRuc || '',
        ruc: this.prefillRuc || this.prefillDocumento || '',
        direccion: '',
        telefono: '',
        email: '',
        nombre_fantasia: '',
        condiciones_pago: 'CONTADO'
      };
      this.bsModal.show();
    },
    hide() {
      this.bsModal?.hide();
    },
    close() {
      this.hide();
      this.$emit('close');
    },
    async submit() {
      try {
        const { data } = await apiService.post(`${process.env.VUE_APP_API_BASE_URL}/api/clients`, this.form);
        this.$emit('saved', data);
        this.close();
      } catch (e) {
        console.error('Error al guardar el cliente:', e);
        alert('Error al guardar el cliente');
      }
    }
  },
  mounted() {
    this.bsModal = new Modal(this.$refs.modalEl);
    if (this.open) this.show();
  },
  beforeUnmount() {
    this.bsModal?.hide();
    this.bsModal = null;
  }
};
</script>

<style scoped>
/* optional: keep modal defaults */
</style>
