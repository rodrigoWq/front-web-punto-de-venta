<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <!-- Usamos un ancho mayor, por ejemplo col-md-10 -->
      <div class="col-md-10">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">{{ title }}</h5>
          </div>
          <div class="card-body">
            <!-- Agrupamos los inputs en filas (rows) con dos columnas cada una -->
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label">Nombre</label>
                <input type="text" class="form-control" v-model="providerData.nombre" placeholder="Nombre del proveedor" />
              </div>
              <div class="col-md-6">
                <label class="form-label">Contacto</label>
                <input type="text" class="form-control" v-model="providerData.contacto" placeholder="Nombre del contacto" />
              </div>
            </div>
            <div class="row g-3 mt-3">
              <div class="col-md-6">
                <label class="form-label">Identificación Fiscal</label>
                <input type="text" class="form-control" v-model="providerData.identificacion_fiscal" placeholder="Identificación fiscal" />
              </div>
              <div class="col-md-6">
                <label class="form-label">Dirección</label>
                <input type="text" class="form-control" v-model="providerData.direccion" placeholder="Dirección" />
              </div>
            </div>
            <div class="row g-3 mt-3">
              <div class="col-md-6">
                <label class="form-label">Teléfono Celular</label>
                <input type="text" class="form-control" v-model="providerData.telefono_celular" placeholder="Teléfono celular" />
              </div>
              <div class="col-md-6">
                <label class="form-label">Email</label>
                <input type="email" class="form-control" v-model="providerData.email" placeholder="Email" />
              </div>
            </div>
            <div class="row g-3 mt-3">
              <div class="col-md-6">
                <label class="form-label">Nombre Fantasía</label>
                <input type="text" class="form-control" v-model="providerData.nombre_fantasia" placeholder="Nombre Fantasía" />
              </div>
              <div class="col-md-6">
                <label class="form-label">Condiciones de Pago</label>
                <input type="text" class="form-control" v-model="providerData.condiciones_pago" placeholder="Condiciones de pago" />
              </div>
            </div>
          </div>
          <div class="card-footer text-end">
            <button type="button" class="btn btn-primary me-2" @click="handleSave">Guardar Proveedor</button>
            <button type="button" class="btn btn-secondary" @click="handleVolver">Volver</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
import apiService from '../services/apiService.js';


export default {
  name: 'RegistrarProveedor',
  props: {
    
    title: { type: String, default: 'Registrar Proveedor' },
    initialRuc: { type: String, default: '' },

  },
  data() {
    return {
      providerData: {
        nombre: '',
        contacto: '',
        identificacion_fiscal: '',
        direccion: '',
        telefono_celular: '',
        email: '',
        nombre_fantasia: '',
        condiciones_pago: ''
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
      const url = `${process.env.VUE_APP_API_BASE_URL}/api/providers/`;
      apiService.post(url, this.providerData)
        .then(() => {
          // Reiniciar el formulario
          this.providerData = {
            nombre: '',
            contacto: '',
            identificacion_fiscal: '',
            direccion: '',
            telefono_celular: '',
            email: '',
            nombre_fantasia: '',
            condiciones_pago: ''
          };
          // Redirigir a la pantalla correspondiente (factura, nota de remisión, etc.)
          this.$router.back();
        })
        .catch(error => {
          console.error("Error registrando proveedor:", error);
          // Puedes agregar una notificación de error aquí
        });
    },
    handleVolver() {
      this.$router.back();
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
