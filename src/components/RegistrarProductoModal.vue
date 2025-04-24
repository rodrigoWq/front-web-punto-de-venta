<template>
  <div class="modal fade" :class="{ show: showModal }"
       :style="{ display: showModal ? 'block' : 'none' }" tabindex="-1" role="dialog">
    <div class="modal-dialog modal-lg" role="document">
      <div class="modal-content">

        <!-- header -->
        <div class="modal-header">
          <h5 class="modal-title">{{ title }}</h5>
          <button type="button" class="btn-close" @click="closeModal"></button>
        </div>

        <!-- body -->
        <div class="modal-body">

          <div class="row g-3">
            <div class="col-md-6"><label class="form-label">Código de Barras</label>
              <input type="text" class="form-control" v-model="productData.codigo_barras" placeholder="Código de Barras">
            </div>
            <div class="col-md-6"><label class="form-label">Nombre</label>
              <input type="text" class="form-control" v-model="productData.nombre" placeholder="Nombre del Producto">
            </div>
          </div>

          <div class="row g-3 mt-3">
            <div class="col-md-6"><label class="form-label">Descripción</label>
              <input type="text" class="form-control" v-model="productData.descripcion" placeholder="Descripción">
            </div>
            <div class="col-md-6"><label class="form-label">URL de Imagen</label>
              <input type="text" class="form-control" v-model="productData.url_imagen" placeholder="imagen.jpg">
            </div>
          </div>

          <div class="row g-3 mt-3">
            <CategorySelect
              v-model="productData.categoria_id"
              :disabled="readOnly" 
            />
            <MeasureUnitSelect
              v-model="productData.unidad_medida_id"
              :disabled="readOnly"
            />
          </div>

          <div class="row g-3 mt-3">
            <div class="col-md-6"><label class="form-label">Tipo IVA</label>
              <select class="form-select" v-model.number="productData.tipo_iva">
                <option :value="1">IVA 10%</option>
                <option :value="2">IVA 5%</option>
                <option :value="3">Exenta</option>
              </select>
            </div>
            <div class="col-md-6 d-flex align-items-center mt-4">
              <input class="form-check-input me-2" type="checkbox" id="activo" v-model="productData.activo">
              <label class="form-check-label" for="activo">Activo</label>
            </div>
          </div>

        </div>

        <!-- footer -->
        <div class="modal-footer">
          <button type="button" class="btn btn-primary" @click="handleSave">Guardar Producto</button>
          <button type="button" class="btn btn-secondary" @click="closeModal">Cancelar</button>
        </div>

      </div>
    </div>
  </div>
  <div v-if="showModal" class="modal-backdrop fade show"></div>
</template>

<script>
import apiService from '../services/apiService.js';
import CategorySelect from './CategorySelect.vue'; 
import MeasureUnitSelect from './MeasureUnitSelect.vue';


export default {
  name: 'RegisterProductModal',
  components: { CategorySelect, MeasureUnitSelect },
  emits:['update:showModal','product-registered'],
  props: {
    showModal: { type: Boolean, default: false },
    title: { type: String, default: 'Registrar Producto' },
    initialCode: { type: String, default: '' },
    product: { type:Object, default:null }
  },
  data() {
    return {
      productData: {
        codigo_barras: this.initialCode,
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
    initialCode(newCode) {
      if (this.showModal) {
        this.productData.codigo_barras = newCode;
        console.log('[RegisterProductModal] initialCode cambió a', newCode);
      }
    },
    showModal(val) {
      if (val) {
        if (this.product) {
          
          this.productData = { ...this.product };
          console.log('[RegisterProductModal] modo edición, datos cargados:', this.productData);
        } else {
          this.resetForm();
          this.productData.codigo_barras = this.initialCode;
          console.log('[RegisterProductModal] alta, código precargado =', this.initialCode);
        }
      }
    },
  },
  methods: {
    handleSave() {
      // 1. Determinar si es edición (PUT) o creación (POST)
      const isEdit = !!this.productData.producto_id;
      const baseUrl = process.env.VUE_APP_API_BASE_URL + '/api/products';
      const url     = isEdit
        ? `${baseUrl}/${this.productData.producto_id}`  // PUT sobre /api/products/:id
        : baseUrl;                                      // POST sobre /api/products

      // 2. Ejecutar la llamada correcta
      const request = isEdit
        ? apiService.put(url, this.productData)
        : apiService.post(url, this.productData);

      // 3. Manejar la respuesta manteniendo tus emits y reseteos
      request
        .then(response => {
          const payload = response.data;
          // Emitir igual que antes, con los campos alias
          this.$emit('product-registered', {
            ...payload,
            codigo_barras: payload.codigo_barras,
            codigo:        payload.codigo_barras
          });
          this.$emit('update:showModal', false);
          this.$emit('close-all-register-modals');
          if (!isEdit) {
            this.productData = {
              codigo_barras: '',
              nombre:        '',
              descripcion:   '',
              url_imagen:    '',
              categoria_id:  null,
              unidad_medida_id: null,
              activo:        true,
              tipo_iva:      1
            };
          }
          this.$emit('close');
        })
        .catch(error => {
          console.error("Error guardando producto:", error);
        });
    },
    closeModal(){ 
      this.$emit('update:showModal',false);
      this.$emit('close-all-register-modals');
     },
    handleVolver() {
      this.$router.back();
    },
    resetForm() {
      this.productData = {
        codigo_barras:   this.initialCode,
        nombre:          '',
        descripcion:     '',
        url_imagen:      '',
        categoria_id:    null,
        unidad_medida_id:null,
        activo:          true,
        tipo_iva:        1
      };
    },
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
