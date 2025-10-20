<template>
  <AppNavbar />
  <div class="note-wrapper">
    <div class="note-paper">
      <header class="note-header">
        <div class="note-header__brand">
          <span class="note-badge">Documento auxiliar</span>
          <h1 class="note-title">Nota de Remisión</h1>
          <p class="note-description">
            Completa los datos de traslado tal como aparecen en el comprobante físico para asegurar la trazabilidad.
          </p>
        </div>
        <div class="note-header__meta">
          <div class="meta-grid">
            <div class="meta-field">
              <label for="timbrado" class="form-label">Timbrado</label>
              <input
                id="timbrado"
                type="text"
                v-model="notaData.timbrado"
                class="form-control"
                placeholder="Número de timbrado"
                :readonly="readOnly"
              />
            </div>
            <div class="meta-field">
              <label for="fecha_emision" class="form-label">Fecha de Emisión</label>
              <!-- Editable: usar date picker; Solo lectura: mostrar dd/mm/yyyy -->
              <input
                v-if="!readOnly"
                id="fecha_emision"
                type="text"
                ref="fechaEmisionInput"
                class="form-control"
                :placeholder="DATE_PLACEHOLDER"
              />
              <input
                v-else
                id="fecha_emision"
                type="text"
                :value="formatDateDisplay(notaData.fecha_emision)"
                class="form-control"
                readonly
              />
            </div>
            <div class="meta-field">
              <label for="nro_nota_remision" class="form-label">N° de Nota</label>
              <input
                id="nro_nota_remision"
                type="text"
                v-model="notaData.nro_nota_remision"
                class="form-control"
                placeholder="Número de nota de remisión"
                :readonly="readOnly"
              />
            </div>
          </div>
        </div>
      </header>

      <form class="note-form" @submit.prevent="guardarNotaRemision">
        <section class="note-section">
          <h3 class="section-heading">Datos del proveedor</h3>
          <div class="section-grid">
            <div class="form-field">
              <label class="form-label">RUC / Proveedor</label>
              <div class="input-group">
                <ProviderSelect
                  ref="providerSelect"
                  v-model="selectedProviderInput"
                  :disabled="true"
                  :bare="true"
                  :noList="true"
                  placeholder="RUC / Nombre del proveedor"
                  @provider-selected="onProviderSelected"
                  @register="() => showProviderModal = true"
                />
                <button
                  type="button"
                  class="btn btn-outline-primary btn-sm px-3"
                  @click="toggleBuscarProveedor"
                  :disabled="readOnly"
                  title="Buscar proveedor"
                >
                  Buscar
                </button>
              </div>
            </div>
            <div class="form-field">
              <label for="nombre_razon_social" class="form-label">Razón Social</label>
              <input
                id="nombre_razon_social"
                type="text"
                v-model="notaData.nombre_razon_social"
                class="form-control"
                placeholder="Nombre o razón social"
                :readonly="readOnly"
              />
            </div>
          </div>
        </section>

        <section class="note-section">
          <div class="section-heading with-line">Detalle de mercaderías</div>
          <div class="detail-entry">
            <div class="detail-field code">
              <label class="form-label">Código de Barra</label>
              <input
                type="text"
                v-model="productoData.codigo_barras"
                class="form-control"
                placeholder="Código de barra"
                @blur="autocompletarProducto"
                @keydown.enter.prevent
                :readonly="readOnly"
              />
            </div>
            <div class="detail-field qty">
              <label class="form-label">Cantidad</label>
              <input
                type="number"
                v-model="productoData.cantidad"
                class="form-control"
                placeholder="Cantidad"
                :readonly="readOnly"
              />
            </div>
            <div class="detail-field unit">
              <label class="form-label">Unidad</label>
              <input
                type="text"
                v-model="productoData.unidad_medida"
                class="form-control"
                placeholder="Unidad de medida"
                readonly
              />
            </div>
            <div class="detail-field description">
              <label class="form-label">Descripción</label>
              <input
                type="text"
                v-model="productoData.descripcion"
                class="form-control"
                placeholder="Descripción de la mercadería"
                readonly
              />
            </div>
            <div class="detail-field due-date">
              <label class="form-label">Fecha de Vencimiento</label>
              <input
                v-if="!readOnly"
                type="text"
                ref="fechaVencimientoInput"
                class="form-control"
                :placeholder="DATE_PLACEHOLDER"
              />
              <input
                v-else
                type="text"
                :value="formatDateDisplay(productoData.fechaVencimiento)"
                class="form-control"
                readonly
              />
            </div>
          </div>

          <div class="detail-actions" v-if="!readOnly">
            <button
              type="button"
              class="btn btn-secondary"
              @click="agregarProducto"
              :disabled="readOnly"
            >
              Agregar Producto
            </button>
          </div>

          <SimpleRegisterModal
            v-model:showModal="showRegisterModal"
            :title="registerModalTitle"
            @close="showRegisterModal = false"
            @register="irARegistro"
          />

          <h4 class="section-subheading">Productos agregados</h4>
          <AppTable
            :headers="['Código de Barra', 'Cantidad', 'Unidad', 'Descripción', 'Acciones']"
            tableClass="table table-bordered table-sm note-details-table"
          >
            <tr v-for="(producto, index) in productos" :key="index">
              <td><span>{{ producto.codigo_barras }}</span></td>
              <td class="col-numeric">
                <input
                  v-if="productoEditandoIndex === index"
                  v-model.number="productoData.cantidad"
                  type="number"
                  class="form-control form-control-sm"
                />
                <span v-else>{{ producto.cantidad }}</span>
              </td>
              <td><span>{{ producto.unidad_medida }}</span></td>
              <td><span>{{ producto.descripcion }}</span></td>
              <td class="actions-col">
                <template v-if="productoEditandoIndex === index">
                  <button
                    type="button"
                    class="btn btn-success btn-sm me-1"
                    @click="guardarEdicionProducto"
                    :disabled="readOnly"
                  >
                    Guardar
                  </button>
                  <button
                    type="button"
                    class="btn btn-warning btn-sm me-1"
                    @click="cancelarEdicion"
                    :disabled="readOnly"
                  >
                    Cancelar
                  </button>
                </template>
                <template v-else>
                  <button
                    type="button"
                    class="btn btn-primary btn-sm me-1"
                    @click="editarProducto(index)"
                    :disabled="readOnly"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    class="btn btn-danger btn-sm"
                    @click="eliminarProducto(index)"
                    :disabled="readOnly"
                  >
                    Eliminar
                  </button>
                </template>
              </td>
            </tr>
          </AppTable>
        </section>

        <div class="submit-row">
          <button
            type="submit"
            class="btn btn-success btn-lg"
            :disabled="readOnly"
            v-if="!readOnly"
          >
            Guardar Nota de Remisión
          </button>
        </div>
      </form>

      <RegisterProductModal
        v-model:showModal="showProductModal"
        :initial-code="initialProductCode"
        @product-registered="onProductRegistered"
        @close-all-register-modals="showRegisterModal = false"
      />

      <RegistrarProveedorModal
        v-model:showModal="showProviderModal"
        @provider-registered="onProviderRegistered"
      />

      <div v-if="mostrarSelectorProveedor" class="overlay-backdrop" @click.self="cerrarSelectorProveedor">
        <div class="overlay-panel">
          <div class="overlay-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Seleccionar Proveedor</h5>
            <button type="button" class="btn-close" aria-label="Cerrar" @click="cerrarSelectorProveedor"></button>
          </div>
          <div class="overlay-body">
            <ProveedoresView
              :selectorMode="true"
              :hideHeader="false"
              :allowRegisterInSelector="true"
              @proveedor-seleccionado="onProveedorSeleccionado"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
  
<script>

import AppNavbar from '@/components/AppNavbar.vue';
import AppTable from '@/components/AppTable.vue';
import apiService from '@/services/apiService.js';
import SimpleRegisterModal from '@/components/SimpleRegisterModal.vue';
import ProviderSelect from '@/components/ProviderSelect.vue';
import RegistrarProveedorModal from '@/components/RegistrarProveedorModal.vue';
import RegisterProductModal from '@/components/RegistrarProductoModal.vue';
import ProveedoresView from '@/views/ProveedoresView.vue';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.css';
import { Spanish } from 'flatpickr/dist/l10n/es.js';

export default {
  name: 'NotaDeRemision',
  components: {
  AppNavbar,
    AppTable,
    SimpleRegisterModal,
    ProviderSelect,
    RegistrarProveedorModal,
    RegisterProductModal,
    ProveedoresView
  
  },
  props: ['id'], // Recibe el id como prop
  data() {
    return {
      DATE_PICKER_FORMAT: 'd/m/Y',
      DATE_PLACEHOLDER: 'dd/mm/yyyy',
      fechaEmisionPicker: null,
      fechaVencimientoPicker: null,
      updatingFechaEmision: false,
      updatingFechaVencimiento: false,
      notaData: {
        nro_nota_remision: '',
        timbrado: '',
        // Guardamos en formato "YYYY-MM-DD" para que el input type=date funcione.
        fecha_emision: '',
        tipo_moneda: 'PYG',
        condicionVenta: 'Contado', // se usará en "credito_contado"
        ruc: '',
        nombre_razon_social: '',
        direccion: '',
        pendiente: false,
        
      },
      selectedProviderInput: '',
      showProductModal:false,
      initialProductCode: '',
      productoData: {
        id: null,            // ID del producto (si existe)
        codigo: '',          // Se puede usar para buscar el producto
        codigo_producto: '', // Código interno del producto
        codigo_barras: '',   // Código de barras
        descripcion: '',
        cantidad: 0,
        unidad_medida: '',
        iva: 10.00,          // Valor numérico del IVA
        fechaVencimiento: ''
      },
      showRegisterModal: false,
      showProviderModal: false,
      mostrarSelectorProveedor: false,
      registerModalTitle: '',
      nuevoProducto: {
        codigo: '',
        descripcion: '',
        cantidad: 0,
        unidadMedida: '',
        fechaVencimiento: '',
      },
      readOnly: false,
      productos: [],
      notasDeRemision: [],
      productoEditandoIndex: null,
      originalProducto: null
    };
  },
  watch: {
    'notaData.fecha_emision'(newVal) {
      if (this.updatingFechaEmision) return;
      this.updatePickerDate(this.fechaEmisionPicker, newVal);
    },
    'productoData.fechaVencimiento'(newVal) {
      if (this.updatingFechaVencimiento) return;
      this.updatePickerDate(this.fechaVencimientoPicker, newVal);
    }
  },
  methods: {
    // Devuelve la fecha actual en formato "YYYY-MM-DD" (compatible con input type=date)
    todayISO() {
      const d = new Date();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${d.getFullYear()}-${mm}-${dd}`;
    },
    // Convierte valores variados (ISO, YYYY-MM-DD, Date) a "dd/mm/yyyy" para display
    formatDateDisplay(value) {
      if (!value) return '';
      try {
        // Si viene como YYYY-MM-DD
        if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
          const [y, m, d] = value.split('-');
          return `${d}/${m}/${y}`;
        }
        // Si viene como ISO o Date parseable
        const date = new Date(value);
        if (isNaN(date.getTime())) return '';
        const dd = String(date.getDate()).padStart(2, '0');
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const yy = date.getFullYear();
        return `${dd}/${mm}/${yy}`;
      } catch (_) {
        return '';
      }
    },
    ddmmyyyyToISO(value) {
      if (!value) return '';
      const trimmed = value.trim();
      if (!/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) return '';
      const [day, month, year] = trimmed.split('/');
      return `${year}-${month}-${day}`;
    },
    isoStringToDate(iso) {
      if (!iso) return null;
      const match = /^\d{4}-\d{2}-\d{2}$/.exec(iso.trim());
      if (!match) {
        const parsed = new Date(iso);
        return isNaN(parsed.getTime()) ? null : parsed;
      }
      const [year, month, day] = iso.split('-').map(Number);
      if (!year || !month || !day) return null;
      return new Date(year, month - 1, day);
    },
    initFechaEmisionPicker() {
      const input = this.$refs.fechaEmisionInput;
      if (!input) return;
      this.fechaEmisionPicker = flatpickr(input, {
        dateFormat: this.DATE_PICKER_FORMAT,
        locale: Spanish,
        defaultDate: this.isoStringToDate(this.notaData.fecha_emision),
        allowInput: true,
        onValueUpdate: (_, dateStr) => this.handleFechaEmisionInput(dateStr),
        onClose: (_, dateStr, instance) => {
          if (!dateStr) {
            this.handleFechaEmisionInput(instance.input.value);
          }
        }
      });
      this.updatePickerDate(this.fechaEmisionPicker, this.notaData.fecha_emision);
    },
    initFechaVencimientoPicker() {
      const input = this.$refs.fechaVencimientoInput;
      if (!input) return;
      this.fechaVencimientoPicker = flatpickr(input, {
        dateFormat: this.DATE_PICKER_FORMAT,
        locale: Spanish,
        defaultDate: this.isoStringToDate(this.productoData.fechaVencimiento),
        allowInput: true,
        onValueUpdate: (_, dateStr) => this.handleFechaVencimientoInput(dateStr),
        onClose: (_, dateStr, instance) => {
          if (!dateStr) {
            this.handleFechaVencimientoInput(instance.input.value);
          }
        }
      });
      this.updatePickerDate(this.fechaVencimientoPicker, this.productoData.fechaVencimiento);
    },
    handleFechaEmisionInput(rawValue) {
      const trimmed = (rawValue || '').trim();
      if (!trimmed) {
        this.updatingFechaEmision = true;
        this.notaData.fecha_emision = '';
        this.$nextTick(() => {
          this.updatingFechaEmision = false;
        });
        return;
      }
      const iso = this.ddmmyyyyToISO(trimmed);
      if (!iso) return;
      this.updatingFechaEmision = true;
      this.notaData.fecha_emision = iso;
      this.$nextTick(() => {
        this.updatingFechaEmision = false;
      });
    },
    handleFechaVencimientoInput(rawValue) {
      const trimmed = (rawValue || '').trim();
      if (!trimmed) {
        this.updatingFechaVencimiento = true;
        this.productoData.fechaVencimiento = '';
        this.$nextTick(() => {
          this.updatingFechaVencimiento = false;
        });
        return;
      }
      const iso = this.ddmmyyyyToISO(trimmed);
      if (!iso) return;
      this.updatingFechaVencimiento = true;
      this.productoData.fechaVencimiento = iso;
      this.$nextTick(() => {
        this.updatingFechaVencimiento = false;
      });
    },
    updatePickerDate(picker, iso) {
      if (!picker) return;
      if (!iso) {
        picker.clear();
        return;
      }
      const dateObj = this.isoStringToDate(iso);
      if (!dateObj) {
        picker.clear();
        return;
      }
      const desired = this.formatDateDisplay(iso);
      if (picker.input.value !== desired) {
        picker.setDate(dateObj, false);
      }
    },
    async autocompletarProducto() {
      if (!this.productoData.codigo_barras) return;
      try {
        const url = `${process.env.VUE_APP_API_BASE_URL}/api/products/barcode/${this.productoData.codigo_barras}`;
        const response = await apiService.get(url);
        const producto = response.data;
        if (producto) {
          this.productoData.descripcion = producto.nombre;
          this.productoData.unidad_medida = producto.unidad_medida_nombre;
          this.productoData.fechaVencimiento = producto.fecha_vencimiento;
          this.productoData.id = producto.producto_id || null; 
        } else {
          // Producto no encontrado -> abrir directamente modal de registro de producto
          this.nuevoProducto.codigo = this.productoData.codigo_barras;
          this.initialProductCode   = this.productoData.codigo_barras;
          this.registerModalTitle   = ''; // no usamos mensaje "Producto no encontrado" ahora
          this.showRegisterModal    = false;
          this.showProductModal     = true; // abrir registrar producto
        }
      } catch (error) {
        console.error("Error al obtener el producto:", error);
        // Error o no existe -> abrir directamente el modal de registro
        this.nuevoProducto.codigo = this.productoData.codigo_barras;
        this.initialProductCode   = this.productoData.codigo_barras;
        this.registerModalTitle   = '';
        this.showRegisterModal    = false;
        this.showProductModal     = true;
      }
    },
    onProductRegistered(newProduct) {
      // vuelca el código de barra recién creado al input
      this.productoData.codigo_barras    = newProduct.codigo_barras || newProduct.codigo;
      // opcionalmente actualiza el resto de campos si los usas
      this.productoData.descripcion      = newProduct.descripcion;
      this.productoData.unidad_medida    = newProduct.unidad_medida || newProduct.unidadMedida;
      this.productoData.fechaVencimiento = newProduct.fechaVencimiento;
      // cierra el modal y relanza el autocomplete para traer cualquier dato adicional
      this.showProductModal              = false;
      this.autocompletarProducto();
    },
    closeRegisterModal() {
      this.showRegisterModal = false;
      this.nuevoProducto = {
        codigo: '',
        descripcion: '',
        cantidad: 0,
        unidadMedida: '',
        fechaVencimiento: '',
      };
    },
    toggleBuscarProveedor() {
      if (this.readOnly) return;
      this.mostrarSelectorProveedor = !this.mostrarSelectorProveedor;
      document.body.style.overflow = this.mostrarSelectorProveedor ? 'hidden' : '';
      if (this.mostrarSelectorProveedor) {
        this.$nextTick(() => {
          const firstInput = document.querySelector('.overlay-panel input');
          if (firstInput) firstInput.focus();
        });
      }
    },
    cerrarSelectorProveedor() {
      this.mostrarSelectorProveedor = false;
      document.body.style.overflow = '';
    },
    onProveedorSeleccionado(prov) {
      this.onProviderSelected(prov);
      this.cerrarSelectorProveedor();
    },
    cancelarEdicion() {
      // Si quieres revertir el producto en el array:
      if (this.productoEditandoIndex !== null && this.originalProducto) {
        this.productos[this.productoEditandoIndex] = { ...this.originalProducto };
      }

      // Deja de editar y limpia campos
      this.productoEditandoIndex = null;
      this.limpiarCamposProducto();
      this.originalProducto = null;  // ya no se necesita la copia
    },
    onProveedorRegistered(nuevoProv) {
      // Asignas los datos a la nota actual
      this.notaData.ruc = nuevoProv.ruc;
      this.notaData.razonSocial = nuevoProv.razonSocial;
      // Si deseas guardar teléfono en algún lugar, puedes hacerlo también
    },
    registrarProducto() {
      //NotaDeRemisionService.guardarProducto(this.nuevoProducto); // Implementa esta función en el servicio mock
      //this.productoData = { ...this.nuevoProducto }; // Copiar datos del nuevo producto al formulario principal
      this.closeRegisterModal(); // Cerrar el modal
    },
    openProductModal(){
      this.showProductModal = true;
    },
    async cargarNotaDeRemision(id) {
      try {
        const { data: nota } = await apiService.get(`${process.env.VUE_APP_API_BASE_URL}/api/purchases/delivery-notes/${id}`);
        if (nota) {
          const cabecera = nota.cabecera;

          this.selectedProviderInput = cabecera.nro_documento.toString();
          this.onProviderSelected({
            nro_documento: cabecera.nro_documento.toString(),
            nombre: cabecera.nombre_razon_social
          });

          this.notaData = {
            nro_nota_remision: cabecera.nro_nota_remision,
            timbrado: cabecera.timbrado,
            // Guardar como YYYY-MM-DD para el input date cuando sea editable.
            fecha_emision: cabecera.fecha_emision ? cabecera.fecha_emision.split('T')[0] : '',
            tipo_moneda: cabecera.tipo_moneda,
            condicionVenta: cabecera.credito_contado,
            nro_documento: cabecera.nro_documento,
            nombre_razon_social: cabecera.nombre_razon_social,
            direccion: cabecera.direccion,
            pendiente: cabecera.pendiente
          };
          this.productos = nota.detalles.map(detalle => ({
            producto_id: detalle.producto_id,
            cantidad: detalle.cantidad,
            unidad_medida: detalle.unidad_medida,
            codigo_producto: detalle.codigo_producto,
            codigo_barras: detalle.codigo_barras,
            descripcion: detalle.nombre_producto,
            iva: detalle.iva,
            fechaVencimiento: detalle.fecha_vencimiento
          }));
        }
      } catch (error) {
        console.error('Error al cargar la nota de remisión:', error);
      }
    },
    async guardarNotaRemision() {
      try {
        const requestBody = {
          cabecera: {
            nro_nota_remision: this.notaData.nro_nota_remision,
            timbrado: this.notaData.timbrado,
            fecha_emision: this.notaData.fecha_emision ? new Date(this.notaData.fecha_emision).toISOString() : null,
            tipo_moneda: this.notaData.tipo_moneda || 'PYG',
            credito_contado: this.notaData.condicionVenta,
            tipo_documento: 'RUC',
            nro_documento: this.selectedProviderInput,
            nombre_razon_social: this.notaData.nombre_razon_social,  // O ajustar según convenga
            direccion: this.notaData.direccion,
            pendiente: this.notaData.pendiente
          },
          detalles: this.productos.map(producto => ({
            producto_id: producto.id || producto.codigo_barras,
            cantidad: Number(producto.cantidad),
            unidad_medida: producto.unidad_medida,
            codigo_producto: producto.codigo_producto || producto.codigo || '',
            codigo_barras: producto.codigo_barras || producto.codigo || '',
            descripcion: producto.descripcion,
            iva: Number(producto.iva),
            fecha_vencimiento: producto.fechaVencimiento ? new Date(producto.fechaVencimiento).toISOString().split('T')[0] : null
          }))
        };
        console.log("Request Body:", requestBody);
        // Como apiService ya tiene configurada la URL base, usamos el endpoint relativo
        const url = `${process.env.VUE_APP_API_BASE_URL}/api/purchases/delivery-notes`;
        const response = await apiService.post(url, requestBody);
        this.notasDeRemision = response.data;
        alert('Nota de remisión guardada correctamente');
        this.resetNota();
        this.$router.back();
      } catch (error) {
        console.error('Error al guardar la nota de remisión:', error);
      }
    },
    agregarProducto() {
      if (this.productoEditandoIndex !== null) {
        this.productos.splice(this.productoEditandoIndex, 1, { ...this.productoData });
        this.productoEditandoIndex = null;
      } else {
        this.productos.push({ ...this.productoData });
      }
      this.limpiarCamposProducto();
    },
    irARegistro() {
      if (this.registerModalTitle === "Producto no encontrado") {
        // Navega a la página de registro de producto
        this.initialProductCode = this.productoData.codigo_barras;
        this.showProductModal   = true;
        console.log('[NotaDeRemision] initialProductCode →', this.initialProductCode);

      } else if (this.registerModalTitle === "Proveedor no encontrado") {
        this.showProviderModal = true  
      }
    },
    onProviderSelected(prov) {
      this.notaData.nro_documento        = prov.nro_documento;
      this.notaData.nombre_razon_social  = prov.nombre;
      this.selectedProviderInput = prov.nro_documento;
    },
    editarProducto(index) {

      this.originalProducto = { ...this.productos[index] };

      this.productoData = { ...this.productos[index] };
      this.productoEditandoIndex = index;
    },
    guardarEdicionProducto() {
      this.agregarProducto();
    },
    eliminarProducto(index) {
      this.productos.splice(index, 1);
    },
    limpiarCamposProducto() {
      this.productoData = { codigo: '', descripcion: '', cantidad: 0, unidadMedida: '', fechaVencimiento: '' };
      this.productoEditandoIndex = null;
    },
    onProviderRegistered(nuevoProv) {
      this.selectedProviderInput        = nuevoProv.nro_documento || '';
      this.notaData.nombre_razon_social = nuevoProv.nombre       || '';
      this.showProviderModal            = false;
      this.$nextTick(() => {
        this.$refs.providerSelect.loadProviders();
      });
    },
    resetNota() {
      this.notaData = {
      nro_nota_remision: '',
      timbrado: '',
      fecha_emision: this.todayISO(),
      tipo_moneda: 'PYG',
      condicionVenta: 'Contado',
      nro_documento: '',
      nombre_razon_social: '',
      direccion: '',
      pendiente: false
    };
    this.productos = [];
    }
  },
  async mounted() {
    // Si hay un id, carga los datos de la nota de remisión específica
    if (this.id) {
      this.readOnly = true;
      await this.cargarNotaDeRemision(this.id);
    } else {
      // Nueva nota: fecha de emisión hoy por defecto
      this.notaData.fecha_emision = this.todayISO();
    }

    if (!this.readOnly) {
      this.$nextTick(() => {
        this.initFechaEmisionPicker();
        this.initFechaVencimientoPicker();
      });
    }
  },
  beforeUnmount() {
    if (this.fechaEmisionPicker) {
      this.fechaEmisionPicker.destroy();
      this.fechaEmisionPicker = null;
    }
    if (this.fechaVencimientoPicker) {
      this.fechaVencimientoPicker.destroy();
      this.fechaVencimientoPicker = null;
    }
  }
};
</script>


  
<style scoped>
.note-wrapper {
  background-color: #f4f4f4;
  min-height: 100vh;
  padding: 32px 16px 48px;
}

.note-paper {
  max-width: 960px;
  margin: 0 auto;
  background: #fff;
  border: 1px solid #d6d6d6;
  border-radius: 12px;
  box-shadow: 0 12px 35px rgba(15, 23, 42, 0.12);
  padding: 32px 36px 36px;
}

.note-header {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  justify-content: space-between;
  align-items: stretch;
  padding-bottom: 24px;
  border-bottom: 3px double #747474;
  margin-bottom: 28px;
}

.note-header__brand {
  flex: 1;
  min-width: 260px;
}

.note-badge {
  display: inline-block;
  background: linear-gradient(135deg, #a5d6ff, #4fa0ff);
  color: #0f172a;
  font-weight: 700;
  text-transform: uppercase;
  font-size: 0.75rem;
  padding: 6px 12px;
  border-radius: 999px;
  letter-spacing: 0.1em;
}

.note-title {
  font-size: 1.85rem;
  font-weight: 700;
  margin: 12px 0 8px;
  letter-spacing: 0.08em;
}

.note-description {
  color: #5f5f5f;
  max-width: 420px;
  margin: 0;
  line-height: 1.5;
}

.note-header__meta {
  background: linear-gradient(180deg, #f1f7ff 0%, #e2ecfe 100%);
  border: 1px solid #9dbdf7;
  border-radius: 12px;
  padding: 18px 20px;
  min-width: 280px;
  max-width: 340px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);
}

.meta-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 14px 16px;
}

.meta-field label {
  font-size: 0.75rem;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.06em;
  color: #3d3d3d;
  margin-bottom: 4px;
  display: block;
}

.note-form {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.note-section {
  padding: 0;
}

.section-heading {
  font-size: 0.95rem;
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: #444;
  margin-bottom: 18px;
}

.section-heading.with-line {
  border-bottom: 2px solid #131313;
  padding-bottom: 10px;
  margin-bottom: 20px;
}

.section-subheading {
  font-size: 0.88rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #4f4f4f;
  margin: 24px 0 12px;
}

.section-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 18px 24px;
  border: 1px solid #d9d9d9;
  border-radius: 10px;
  padding: 18px;
  background: linear-gradient(180deg, #fafafa 0%, #fefefe 100%);
}

.form-field .input-group {
  display: flex;
  gap: 10px;
}

.form-field .btn {
  white-space: nowrap;
}

.detail-entry {
  display: grid;
  grid-template-columns: 150px 110px 110px minmax(200px, 1fr) 160px;
  gap: 16px;
  padding: 16px 18px;
  border: 1px solid #d9d9d9;
  border-radius: 10px;
  background: #fdfdfd;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6);
}

.detail-field label {
  font-size: 0.75rem;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.06em;
  color: #666;
  margin-bottom: 6px;
  display: block;
}

.detail-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}

.note-details-table {
  border-color: #8f8f8f !important;
}

.note-details-table thead th {
  background: #f2f2f2;
  font-size: 0.82rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.note-details-table tbody td {
  vertical-align: middle;
  font-size: 0.9rem;
}

.col-numeric {
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.actions-col {
  width: 180px;
  text-align: center;
}

.submit-row {
  display: flex;
  justify-content: flex-end;
  border-top: 2px solid #2b2b2b;
  padding-top: 24px;
}

.btn-success.btn-lg {
  min-width: 240px;
}

.overlay-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 40px;
  z-index: 1050;
}

.overlay-panel {
  width: min(1100px, 96%);
  max-height: 86vh;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.overlay-header {
  padding: 10px 14px;
  border-bottom: 1px solid #e5e7eb;
}

.overlay-body {
  padding: 4px 12px 12px;
  overflow: auto;
  max-height: calc(86vh - 48px);
}

@media (max-width: 992px) {
  .detail-entry {
    grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  }

  .note-header__meta {
    max-width: 100%;
    width: 100%;
  }

  .submit-row {
    justify-content: center;
  }
}
</style>
  