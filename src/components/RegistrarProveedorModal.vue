<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <!-- Usamos un ancho mayor, por ejemplo col-md-10 -->
      <div class="col-md-10">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">{{ isEditMode ? 'Editar Proveedor' : title }}</h5>
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
    id: { type: [String, Number], default: null }

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
    id(newVal) {
    if (newVal) {
      this.loadProvider();
    }
  }
  },
  methods: {
    handleSave() {
      if (this.isEditMode) {
        const url = `${process.env.VUE_APP_API_BASE_URL}/api/providers/${this.id}`;
        apiService.put(url, this.providerData)
          .then(() => {
            this.$router.back();
          })
          .catch(error => {
            console.error("Error actualizando proveedor:", error);
          });
      } else {
        const url = `${process.env.VUE_APP_API_BASE_URL}/api/providers/`;
        apiService.post(url, this.providerData)
          .then(() => {
            // Reiniciar el formulario si es necesario
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
            this.$router.back();
          })
          .catch(error => {
            console.error("Error registrando proveedor:", error);
          });
      }
    },
    handleVolver() {
      this.$router.back();
    },
    loadProvider() {
      const url = `${process.env.VUE_APP_API_BASE_URL}/api/providers/${this.id}`;
      apiService.get(url)
        .then(response => {
          // Mapear campos de la respuesta a providerData
          this.providerData = {
            nombre: response.data.nombre || '',
            contacto: response.data.contacto || '',
            identificacion_fiscal: response.data.nro_documento || '',
            direccion: response.data.direccion || '',
            telefono_celular: response.data.telefono_celular || '',
            email: response.data.email || '',
            nombre_fantasia: response.data.nombre_fantasia || '',
            condiciones_pago: response.data.condiciones_pago || ''
          };
        })
        .catch(error => {
          console.error("Error al cargar proveedor:", error);
        });
    }
  },
  computed: {
    isEditMode() {
      return !!this.id;
    }
  },
  mounted() {
    if (this.isEditMode) {
      this.loadProvider();
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
