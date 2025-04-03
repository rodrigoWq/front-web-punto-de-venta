<template>
    <div>
      <!-- Backdrop -->
      <div class="modal-backdrop fade show"></div>
      <!-- Modal -->
      <div class="modal fade show" id="clienteModal" tabindex="-1" style="display: block;">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">{{ modalTitle }}</h5>
              <button type="button" class="btn-close" @click="cerrarModal"></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="guardarCliente">
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="nombreCompleto" class="form-label">Nombre Completo</label>
                    <input type="text" v-model="cliente.nombre_completo" id="nombreCompleto" class="form-control" required>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label for="cedula" class="form-label">Cédula</label>
                    <input type="text" v-model="cliente.cedula" id="cedula" class="form-control" required>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label for="nroDocumento" class="form-label">Nro Documento</label>
                    <input type="text" v-model="cliente.nro_documento" id="nroDocumento" class="form-control" required>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label for="ruc" class="form-label">RUC</label>
                    <input type="text" v-model="cliente.ruc" id="ruc" class="form-control" required>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label for="direccion" class="form-label">Dirección</label>
                    <input type="text" v-model="cliente.direccion" id="direccion" class="form-control" required>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label for="telefono" class="form-label">Teléfono</label>
                    <input type="tel" v-model="cliente.telefono" id="telefono" class="form-control" required>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label for="email" class="form-label">Email</label>
                    <input type="email" v-model="cliente.email" id="email" class="form-control" required>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label for="nombreFantasia" class="form-label">Nombre Fantasía</label>
                    <input type="text" v-model="cliente.nombre_fantasia" id="nombreFantasia" class="form-control" required>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label for="condicionesPago" class="form-label">Condiciones de Pago</label>
                    <select v-model="cliente.condiciones_pago" id="condicionesPago" class="form-select" required>
                      <option value="Contado">Contado</option>
                      <option value="Crédito">Crédito</option>
                    </select>
                  </div>
                </div>
                <button type="submit" class="btn btn-primary">Guardar Cliente</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
</template>
  
  
  <script>
  import apiService from '../services/apiService.js';
  
  export default {
    name: "ClienteModal",
    data() {
      return {
        modalTitle: "Registrar Cliente",
        cliente: {
          nombre_completo: "",
          cedula: "",
          nro_documento: "",
          ruc: "",
          direccion: "",
          telefono: "",
          email: "",
          nombre_fantasia: "",
          condiciones_pago: "Contado"
        }
      };
    },
    methods: {
      cerrarModal() {
        this.$emit("close");
      },
      async guardarCliente() {
        try {
          const url = `${process.env.VUE_APP_API_BASE_URL}/api/clients`;
          const response = await apiService.post(url, this.cliente);
          if (response.data) {
            alert("Cliente guardado correctamente.");
            this.$emit("close");
          } else {
            alert("Error al guardar el cliente.");
          }
        } catch (error) {
          console.error("Error al guardar el cliente:", error);
          alert("Error al guardar el cliente.");
        }
      }
    }
  };
  </script>
  
  <style scoped>
  /* Puedes agregar estilos personalizados aquí si es necesario */
  </style>
  