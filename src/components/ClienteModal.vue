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
                <div class="mb-3">
                  <label for="nombreCliente" class="form-label">Nombre y Apellido</label>
                  <input type="text" v-model="cliente.nombre" class="form-control" required />
                </div>
                <div class="mb-3">
                  <label for="rucCliente" class="form-label">RUC / CI</label>
                  <input type="text" v-model="cliente.ruc" class="form-control" required />
                </div>
                <div class="mb-3">
                  <label for="telefonoCliente" class="form-label">Teléfono</label>
                  <input type="tel" v-model="cliente.telefono" class="form-control" />
                </div>
                <div class="mb-3">
                  <label for="tipoCliente" class="form-label">Tipo de Cliente</label>
                  <select v-model="cliente.tipo" class="form-select">
                    <option value="normal">Normal</option>
                    <option value="credito">Crédito</option>
                  </select>
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
          nombre: "",
          ruc: "",
          telefono: "",
          tipo: "normal"
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
  