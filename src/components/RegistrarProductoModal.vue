<template>
  <div class="register-product-container">
    <header class="header">
      <h1 class="title">{{ title }}</h1>
      <button type="button" class="btn-close" @click="$emit('close')">×</button>
    </header>
    <main class="content">
      <div class="mb-3">
        <label class="form-label">Código</label>
        <input type="text" class="form-control" v-model="productData.codigo" placeholder="Código" @keydown.enter.prevent />
      </div>
      <div class="mb-3">
        <label class="form-label">Descripción</label>
        <input type="text" class="form-control" v-model="productData.descripcion" placeholder="Descripción del Producto" @keydown.enter.prevent />
      </div>
      <div class="mb-3">
        <label class="form-label">Valor Unitario</label>
        <input type="number" class="form-control" v-model="productData.valorUnitario" placeholder="Valor Unitario" @keydown.enter.prevent/>
      </div>
      <div class="mb-3 d-flex align-items-center">
        <label class="form-label me-3 mb-0">Tipo de Impuesto</label>
        <div class="btn-group" role="group">
          <input type="radio" class="btn-check" id="exenta" value="exenta" v-model="productData.tipoImpuesto" />
          <label class="btn btn-outline-primary" for="exenta">Exenta</label>

          <input type="radio" class="btn-check" id="iva5" value="iva5" v-model="productData.tipoImpuesto" />
          <label class="btn btn-outline-primary" for="iva5">IVA 5%</label>

          <input type="radio" class="btn-check" id="iva10" value="iva10" v-model="productData.tipoImpuesto" />
          <label class="btn btn-outline-primary" for="iva10">IVA 10%</label>
        </div>
      </div>
    </main>
    <footer class="footer">
      <button type="button" class="btn btn-primary" @click="handleSave">Guardar Producto</button>
      <button type="button" class="btn btn-secondary" @click="$emit('close')">Cerrar</button>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'RegisterProductModal',
  props: {
    showModal: { type: Boolean, default: false },
    title: { type: String, default: 'Registrar Producto' },
    initialCode: { type: String, default: '' }
  },
  data() {
    return {
      productData: {
        codigo: '',
        descripcion: '',
        valorUnitario: 0,
        tipoImpuesto: 'exenta'
      }
    };
  },
  watch: {
    showModal(newVal) {
      if (newVal && this.initialCode) {
        this.productData.codigo = this.initialCode;
      }
    }
  },
  methods: {
    handleSave() {
      this.$emit('product-registered', { ...this.productData });
      this.productData = { codigo: '', descripcion: '', valorUnitario: 0, tipoImpuesto: 'exenta' };
      this.$emit('close');
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

.title {
  color: red;
  margin: 0;
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
