<template>
  <div class="modal fade register-product-modal" :class="{ show: showModal }"
       :style="{ display: showModal ? 'block' : 'none' }" tabindex="-1" role="dialog">
    <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable" role="document">
      <div class="modal-content">

        <!-- header -->
        <div class="modal-header">
          <div class="modal-title-wrap">
            <p class="modal-eyebrow">Gestión de productos</p>
            <h5 class="modal-title">{{ title }}</h5>
          </div>
          <button type="button" class="btn-close" @click="closeModal"></button>
        </div>

        <!-- body -->
        <div class="modal-body">
          <div class="form-wrapper">
            <div class="form-grid">
              <div class="form-field">
                <label class="form-label" for="codigo_barras">Código de Barras</label>
                <input id="codigo_barras" type="text" class="form-control" v-model="productData.codigo_barras" placeholder="Código de Barras">
              </div>
              <div class="form-field">
                <label class="form-label" for="nombre">Nombre</label>
                <input id="nombre" type="text" class="form-control" v-model="productData.nombre" placeholder="Nombre del Producto">
              </div>
              <div class="form-field">
                <label class="form-label" for="descripcion">Descripción</label>
                <input id="descripcion" type="text" class="form-control" v-model="productData.descripcion" placeholder="Descripción">
              </div>
              <div class="form-field">
                <label class="form-label" for="url_imagen">URL de Imagen</label>
                <input id="url_imagen" type="text" class="form-control" v-model="productData.url_imagen" placeholder="imagen.jpg">
              </div>
              <div class="form-field">
                <label class="form-label">Categoría</label>
                <CategorySelect
                  v-model="productData.categoria_id"
                  :disabled="readOnly"
                />
              </div>
              <div class="form-field">
                <label class="form-label">Unidad de Medida</label>
                <MeasureUnitSelect
                  v-model="productData.unidad_medida_id"
                  :disabled="readOnly"
                />
              </div>
              <div class="form-field">
                <label class="form-label" for="tipo_iva">Tipo IVA</label>
                <select id="tipo_iva" class="form-select" v-model.number="productData.tipo_iva">
                  <option :value="1">IVA 10%</option>
                  <option :value="2">IVA 5%</option>
                  <option :value="3">Exenta</option>
                </select>
              </div>
              <div class="form-field switch-field">
                <label class="form-label" for="activo">Estado</label>
                <div class="form-switcher">
                  <input class="form-check-input" type="checkbox" id="activo" v-model="productData.activo">
                  <label class="form-check-label" for="activo">Activo</label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- footer -->
        <div class="modal-footer">
          <div class="modal-hint">
            Revisa que los datos sean correctos antes de guardar.
          </div>
          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" @click="closeModal">Cancelar</button>
            <button type="button" class="btn btn-primary" @click="handleSave">Guardar Producto</button>
          </div>
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
          // Mapear campos del producto desde ProductosView al formato del modal
          this.productData = {
            producto_id: this.product.id,
            codigo_barras: this.product.code || '',
            nombre: this.product.name || '',
            descripcion: this.product.descripcion || '',
            url_imagen: this.product.url_imagen || '',
            categoria_id: this.product.categoria_id || null,
            unidad_medida_id: this.product.unidad_medida_id || null,
            activo: this.product.activo !== undefined ? this.product.activo : true,
            tipo_iva: this.product.tipo_iva || 1
          };
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
.register-product-modal .modal-dialog {
  max-width: 920px;
}

.modal-content {
  border-radius: 18px;
  border: none;
  box-shadow: 0 28px 48px -20px rgba(15, 23, 42, 0.35);
  overflow: hidden;
}

.modal-header {
  padding: 24px 28px 16px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.2);
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(14, 116, 144, 0.08));
}

.modal-title-wrap {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.modal-eyebrow {
  margin: 0;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #0f172a;
  opacity: 0.6;
  font-weight: 600;
}

.modal-title {
  margin: 0;
  font-weight: 700;
  color: #0f172a;
}

.btn-close {
  font-size: 1.125rem;
  color: #0f172a;
  opacity: 0.6;
  transition: opacity 0.2s ease;
}

.btn-close:hover {
  opacity: 1;
}

.modal-body {
  padding: 28px;
  background: #f8fafc;
}

.form-wrapper {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px 24px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-weight: 600;
  color: #1e293b;
  font-size: 0.9rem;
}

.form-control,
.form-select {
  border-radius: 10px;
  border: 1px solid rgba(148, 163, 184, 0.6);
  padding: 10px 12px;
  font-size: 0.95rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.form-control:focus,
.form-select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.switch-field {
  align-self: center;
}

.form-switcher {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: rgba(226, 232, 240, 0.6);
  border-radius: 999px;
  padding: 6px 14px;
}

.form-check-input {
  width: 46px;
  height: 24px;
  margin: 0;
  cursor: pointer;
}

.form-check-label {
  font-weight: 600;
  color: #1e293b;
  cursor: pointer;
}

.modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 20px 28px 24px;
  border-top: 1px solid rgba(148, 163, 184, 0.18);
  background: #fff;
}

.modal-hint {
  font-size: 0.85rem;
  color: #475569;
  max-width: 60%;
}

.modal-actions {
  display: flex;
  gap: 12px;
}

.btn {
  border-radius: 999px;
  padding: 10px 22px;
  font-weight: 600;
  border: none;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.btn-secondary {
  background: #e2e8f0;
  color: #0f172a;
}

.btn-secondary:hover {
  background: #cbd5f5;
}

.btn-primary {
  background: linear-gradient(120deg, #2563eb, #0ea5e9);
  box-shadow: 0 14px 24px -14px rgba(37, 99, 235, 0.6);
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 16px 30px -14px rgba(37, 99, 235, 0.75);
}

@media (max-width: 768px) {
  .modal-content {
    border-radius: 14px;
  }

  .modal-body {
    padding: 20px;
  }

  .form-wrapper {
    padding: 18px;
  }

  .modal-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
  }

  .modal-actions {
    width: 100%;
    justify-content: flex-end;
    flex-wrap: wrap;
  }

  .modal-actions .btn {
    flex: 1 1 45%;
  }
}
</style>
