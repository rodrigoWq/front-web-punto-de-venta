<!-- RegisterProductModal.vue -->
<template>
    <div v-if="showModal">
     <div class="modal-backdrop fade show"></div>
      <div class="modal fade show" style="display: block;" tabindex="-1" role="dialog">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">{{ title }}</h5>
              <button type="button" class="btn-close" @click="$emit('close')"></button>
            </div>
            <div class="modal-body">
              <div class="mb-3">
                <label class="form-label">Código</label>
                <input type="text" class="form-control" v-model="productData.codigo" placeholder="Código" />
              </div>
              <div class="mb-3">
                <label class="form-label">Descripción</label>
                <input type="text" class="form-control" v-model="productData.descripcion" placeholder="Descripción del Producto" />
              </div>
              <div class="mb-3">
                <label class="form-label">Valor Unitario</label>
                <input type="number" class="form-control" v-model="productData.valorUnitario" placeholder="Valor Unitario" />
              </div>
              <div class="mb-3 d-flex align-items-center">
                <!-- Añadimos algo de margen al label -->
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
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-primary" @click="handleSave">Guardar Producto</button>
              <button type="button" class="btn btn-secondary" @click="$emit('close')">Cerrar</button>
            </div>
          </div>
        </div>
      </div>
   </div>

</template>
  
  <script>
  export default {
    name: 'RegisterProductModal',
    props: {
      showModal: { type: Boolean, default: false },    // Controla la visibilidad del modal
      modalId: { type: String, default: 'registerProductModal' },
      title: { type: String, default: 'Registrar Producto' },
      initialCode: { type: String, default: '' }       // Para precargar el código si hace falta
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
      // Cada vez que se abra el modal, si tenemos un código inicial, lo asignamos
      showModal(newVal) {
        if (newVal && this.initialCode) {
          this.productData.codigo = this.initialCode;
        }
      }
    },
    methods: {
      handleSave() {
        // Emitimos un evento para que el padre reciba el producto creado
        this.$emit('product-registered', { ...this.productData });
        // (Opcional) Limpiamos campos
        this.productData = { codigo: '', descripcion: '', valorUnitario: 0, tipoImpuesto: 'exenta' };
        // También podríamos cerrar el modal, si queremos:
        this.$emit('close');
      }
    }
  };
  </script>
  
  <style scoped>
  /* Estilos propios del modal o adicionales si los requieres */
  </style>
  