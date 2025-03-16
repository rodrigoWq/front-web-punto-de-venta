<template>
    <!-- NUEVO contenedor general para el modal y su backdrop -->
    <div v-if="showModal">
      <!-- NUEVA capa de fondo (backdrop) -->
      <div class="modal-backdrop fade show"></div>
  
      <!-- El modal en sí -->
      <div class="modal fade show" style="display: block;" tabindex="-1" role="dialog">
        <div class="modal-dialog">
          <div class="modal-content">
            <!-- Encabezado del modal -->
            <div class="modal-header">
              <h5 class="modal-title">{{ title }}</h5>
              <button type="button" class="btn-close" @click="$emit('close')"></button>
            </div>
  
            <!-- Cuerpo del modal -->
            <div class="modal-body">
              <div class="mb-3">
                <label class="form-label">RUC</label>
                <input type="text" class="form-control" v-model="providerData.ruc" placeholder="RUC del proveedor" />
              </div>
              <div class="mb-3">
                <label class="form-label">Nombre o Razón Social</label>
                <input type="text" class="form-control" v-model="providerData.razonSocial" placeholder="Nombre o Razón Social" />
              </div>
              <div class="mb-3">
                <label class="form-label">Teléfono</label>
                <input type="text" class="form-control" v-model="providerData.telefono" placeholder="Teléfono" />
              </div>
            </div>
  
            <!-- Pie de modal -->
            <div class="modal-footer">
              <button type="button" class="btn btn-primary" @click="handleSave">Guardar Proveedor</button>
              <button type="button" class="btn btn-secondary" @click="$emit('close')">Cerrar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
</template>
  
  
  <script>
  export default {
    name: 'RegistrarProveedorModal',
    props: {
      showModal: { type: Boolean, default: false },
      title: { type: String, default: 'Registrar Proveedor' },
      initialRuc: { type: String, default: '' } // por si deseas precargar el RUC
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
      // Si abren el modal y tenemos un RUC inicial, lo asignamos
      showModal(newVal) {
        if (newVal && this.initialRuc) {
          this.providerData.ruc = this.initialRuc;
        }
      }
    },
    methods: {
      handleSave() {
        // Emitimos un evento para que el componente padre reciba los datos
        this.$emit('proveedor-registered', { ...this.providerData });
        // Limpiamos campos y cerramos
        this.providerData = { ruc: '', razonSocial: '', telefono: '' };
        this.$emit('close');
      }
    }
  };
  </script>
  
  <style scoped>
  /* Estilos propios del modal si los requieres */
  </style>
  