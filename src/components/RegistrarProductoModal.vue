<template>
  <div class="register-product-container">
    <header class="header d-flex justify-content-between align-items-center">
      <h1 class="title">{{ title }}</h1>
      <button type="button" class="btn-close" @click="$emit('close')">×</button>
    </header>
    <main class="content">
      <div class="row g-3">
        <div class="col-md-6">
          <label class="form-label">Código de Barras</label>
          <input type="text" class="form-control" v-model="productData.codigo_barras" placeholder="Código de Barras" @keydown.enter.prevent />
        </div>
        <div class="col-md-6">
          <label class="form-label">Nombre</label>
          <input type="text" class="form-control" v-model="productData.nombre" placeholder="Nombre del Producto" @keydown.enter.prevent />
        </div>
      </div>
      <div class="row g-3 mt-3">
        <div class="col-md-6">
          <label class="form-label">Descripción</label>
          <input type="text" class="form-control" v-model="productData.descripcion" placeholder="Descripción del Producto" @keydown.enter.prevent />
        </div>
        <div class="col-md-6">
          <label class="form-label">URL de Imagen</label>
          <input type="text" class="form-control" v-model="productData.url_imagen" placeholder="imagen.jpg" @keydown.enter.prevent />
        </div>
      </div>
      <div class="row g-3 mt-3">
        <div class="col-md-6">
          <label class="form-label">Categoría ID</label>
          <input type="number" class="form-control" v-model.number="productData.categoria_id" placeholder="ID de categoría" />
        </div>
        <div class="col-md-6">
          <label class="form-label">Unidad Medida ID</label>
          <input type="number" class="form-control" v-model.number="productData.unidad_medida_id" placeholder="ID de unidad de medida" />
        </div>
      </div>
      <div class="row g-3 mt-3 align-items-center">
        <div class="col-md-6">
          <label class="form-label">Tipo de IVA</label>
          <select class="form-select" v-model.number="productData.tipo_iva">
            <option :value="1">IVA 10%</option>
            <option :value="2">IVA 5%</option>
            <option :value="3">Exenta</option>
          </select>
        </div>

        <div class="col-md-6">
          <div class="form-check mt-4">
            <input class="form-check-input" type="checkbox" id="activo" v-model="productData.activo" />
            <label class="form-check-label" for="activo">Activo</label>
          </div>
        </div>
      </div>
    </main>
    <div class="card-footer text-end">
      <button type="button" class="btn btn-primary me-2" @click="handleSave">Guardar Proveedor</button>
      <button type="button" class="btn btn-secondary" @click="handleVolver">Volver</button>
    </div>
  </div>
</template>


<script>
import apiService from '../services/apiService.js';

export default {
  name: 'RegisterProductModal',
  props: {
    showModal: { type: Boolean, default: false },
    title: { type: String, default: 'Registrar Producto' },
    initialCode: { type: String, default: '' },
  },
  data() {
    return {
      productData: {
        codigo_barras: '',
        nombre: '',
        descripcion: '',
        url_imagen: '',
        categoria_id: null,
        unidad_medida_id: null,
        activo: true,
        tipo_iva: 1
      }
    };
  },
  watch: {
    showModal(newVal) {
      if (newVal && this.initialCode) {
        this.productData.codigo_barras  = this.initialCode;
      }
    }
  },
  methods: {
    handleSave() {
      const url = process.env.VUE_APP_API_BASE_URL + '/api/products/';
      apiService.post(url, this.productData)
        .then(response => {
          // Emite el evento con la respuesta recibida si es necesario
          this.$emit('product-registered', response.data);
          // Reinicia los datos del formulario
          this.productData = {
            codigo_barras: '',
            nombre: '',
            descripcion: '',
            url_imagen: '',
            categoria_id: null,
            unidad_medida_id: null,
            activo: true,
            tipo_iva: 1
          };
          this.$emit('close');
          this.$router.back();
        })
        .catch(error => {
          console.error("Error registrando producto:", error);
          // Opcional: muestra un mensaje de error al usuario
        });
    },
    handleVolver() {
      this.$router.back();
    }
  }
};
</script>

<style scoped>
.register-product-container {
  width: 100%;
  min-height: 100vh;
  background: #fff;
  padding: 20px;
  box-sizing: border-box;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #ccc;
  padding-bottom: 10px;
}



.btn-close {
  font-size: 1.5rem;
  background: transparent;
  border: none;
  cursor: pointer;
}

.content {
  margin-top: 20px;
}

.footer {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 30px;
}
</style>
