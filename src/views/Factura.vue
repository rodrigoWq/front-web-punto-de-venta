<template>
  <AppNavbar />
  <div class="invoice-wrapper">
    <div class="invoice-paper">
      <header class="invoice-header">
        <div class="invoice-header__brand">
          <span class="brand-badge">Formulario interno</span>
          <h1 class="invoice-title">Factura de Compra</h1>
          <p class="invoice-description">
            Complete los datos tal como aparecen en el comprobante físico para mantener el registro contable.
          </p>
        </div>
        <div class="invoice-header__meta">
          <div class="meta-grid">
            <div class="meta-field">
              <label for="fecha_emision_top" class="form-label">Fecha de Emisión</label>
              <input
                id="fecha_emision_top"
                type="date"
                :value="fechaEmisionISO"
                @input="actualizarFechaEmision($event.target.value)"
                class="form-control"
                :readonly="readOnly && !fromDeliveryNote"
              />
            </div>
            <div class="meta-field">
              <label for="timbrado_top" class="form-label">Timbrado</label>
              <input
                id="timbrado_top"
                type="text"
                v-model="factura.timbrado"
                class="form-control"
                placeholder="Número de timbrado"
                :readonly="readOnly && !fromDeliveryNote"
              />
            </div>
            <div class="meta-field">
              <label for="nro_factura_top" class="form-label">N° de Factura</label>
              <input
                id="nro_factura_top"
                type="text"
                v-model="factura.nroFactura"
                class="form-control"
                placeholder="Número de factura"
                :readonly="readOnly && !fromDeliveryNote"
              />
            </div>
            <div class="meta-field">
              <label for="condicion_venta_top" class="form-label">Condición de Venta</label>
              <select
                id="condicion_venta_top"
                v-model="factura.condicionVenta"
                class="form-control"
                :readonly="readOnly"
              >
                <option value="CONTADO">Contado</option>
                <option value="CREDITO">Crédito</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      <form class="invoice-form" @submit.prevent="guardarFactura">
        <section class="invoice-section">
          <h3 class="section-heading">Datos del proveedor</h3>
          <div class="section-grid">
            <div class="form-field">
              <label class="form-label">RUC / Proveedor</label>
              <div class="input-group">
                <ProviderSelect
                  ref="providerSelect"
                  v-model="selectedProviderInput"
                  :disabled="readOnly && !fromDeliveryNote"
                  @provider-selected="onProviderSelected"
                  @register="openProviderModal"
                  @input-blur="buscarProveedorPorDocumento"
                  @input-enter="buscarProveedorPorDocumento"
                  @keydown.enter.prevent="buscarProveedorPorDocumento"
                  :bare="true"
                  :noList="true"
                />
                <button
                  type="button"
                  class="btn btn-outline-primary btn-sm px-3"
                  @click="toggleBuscarProveedor"
                  :disabled="readOnly && !fromDeliveryNote"
                >
                  Buscar
                </button>
              </div>
            </div>
            <div class="form-field">
              <label for="razon_social" class="form-label">Nombre o Razón Social</label>
              <input
                id="razon_social"
                type="text"
                v-model="factura.razonSocial"
                class="form-control"
                placeholder="Nombre o razón social"
                :readonly="readOnly"
              />
            </div>
          </div>
        </section>

        <section class="invoice-section">
          <div class="section-heading with-line">Detalle de mercaderías</div>
          <div class="detail-entry">
            <div class="detail-field code">
              <label class="form-label">Código</label>
              <div class="input-group code-input-group">
                <input
                  type="text"
                  v-model="productoData.codigo_producto"
                  class="form-control"
                  placeholder="Código de barra"
                  @blur="autocompletarProducto"
                  @keydown.enter.prevent="autocompletarProducto"
                  :readonly="readOnly"
                />
                <button
                  type="button"
                  class="btn btn-outline-primary btn-sm px-3"
                  @click="toggleBuscarProducto"
                  :disabled="readOnly && !fromDeliveryNote"
                >
                  Buscar
                </button>
              </div>
            </div>
            <div class="detail-field description">
              <label class="form-label">Descripción</label>
              <input
                type="text"
                v-model="productoData.descripcion"
                class="form-control"
                placeholder="Descripción"
                @keydown.enter.prevent
                readOnly
              />
            </div>
            <div class="detail-field qty">
              <label class="form-label">Cantidad</label>
              <input
                type="number"
                v-model.number="productoData.cantidad"
                class="form-control"
                placeholder="Cantidad"
                min="0"
                @keydown.enter.prevent
                :readonly="readOnly"
              />
            </div>
            <div class="detail-field price">
              <label class="form-label">Precio Unitario</label>
              <input
                type="number"
                v-model.number="productoData.precio_unitario_neto"
                class="form-control"
                placeholder="Valor unitario"
                @keydown.enter.prevent
                :readonly="readOnly"
              />
            </div>
            <div class="detail-field tax">
              <label class="form-label">Tipo de Impuesto</label>
              <input
                type="text"
                class="form-control"
                :value="productoData.tipo_iva_id === 1 ? 'IVA 10%' : (productoData.tipo_iva_id === 2 ? 'IVA 5%' : 'Exenta')"
                readonly
              />
            </div>
          </div>

          <div class="detail-actions">
            <button
              v-if="!readOnly"
              type="button"
              class="btn btn-secondary"
              :disabled="fromDeliveryNote"
              @click="agregarProducto"
            >
              Agregar Producto
            </button>
          </div>

          <SimpleRegisterModal
            :showModal="showRegisterModal"
            :title="registerModalTitle"
            @close="showRegisterModal = false"
            @register="irARegistro"
          />

          <h4 class="section-subheading">Productos agregados</h4>
          <AppTable
            :headers="['Código', 'Descripción', 'Cantidad', 'Precio Unitario', 'Exenta', 'IVA 5%', 'IVA 10%', 'Acciones']"
            tableClass="table table-bordered table-sm invoice-details-table"
          >
            <tr v-for="(producto, index) in factura.productos" :key="index">
              <td>
                <span>{{ producto.codigo_producto }}</span>
              </td>
              <td>
                <span>{{ producto.descripcion }}</span>
              </td>
              <td class="col-numeric">
                <input
                  v-if="productoEditandoIndex === index"
                  v-model.number="productoData.cantidad"
                  type="number"
                  min="0"
                  class="form-control form-control-sm"
                />
                <span v-else>{{ producto.cantidad }}</span>
              </td>
              <td class="col-numeric">
                <input
                  v-if="productoEditandoIndex === index"
                  v-model.number="productoData.precio_unitario_neto"
                  type="number"
                  class="form-control form-control-sm"
                />
                <span v-else>{{ formateaNumero(producto.precio_unitario_neto) }}</span>
              </td>
              <td class="col-numeric">
                <span v-if="producto.tipo_iva_id === 3 || producto.tipoImpuesto === 'exenta'">
                  {{ formateaNumero(redondearHaciaArriba(producto.cantidad * producto.precio_unitario_neto)) }}
                </span>
              </td>
              <td class="col-numeric">
                <span v-if="producto.tipo_iva_id === 2">
                  {{ formateaNumero(redondearHaciaArriba(producto.cantidad * producto.precio_unitario_neto)) }}
                </span>
              </td>
              <td class="col-numeric">
                <span v-if="producto.tipo_iva_id === 1 || producto.tipo_iva_id === 10">
                  {{ formateaNumero(redondearHaciaArriba(producto.cantidad * producto.precio_unitario_neto)) }}
                </span>
              </td>
              <td class="actions-col">
                <template v-if="productoEditandoIndex === index">
                  <button
                    type="button"
                    class="btn btn-success btn-sm me-1"
                    @click="guardarEdicionProducto"
                    :disabled="readOnly && !fromDeliveryNote"
                  >
                    Guardar
                  </button>
                  <button
                    type="button"
                    class="btn btn-danger btn-sm"
                    @click="cancelarEdicion"
                    :disabled="readOnly && !fromDeliveryNote"
                  >
                    Cancelar
                  </button>
                </template>
                <template v-else>
                  <button
                    type="button"
                    class="btn btn-primary btn-sm me-1"
                    @click="editarProducto(index)"
                    :disabled="readOnly && !fromDeliveryNote"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    class="btn btn-danger btn-sm"
                    @click="eliminarProducto(index)"
                    :disabled="readOnly && !fromDeliveryNote"
                  >
                    Eliminar
                  </button>
                </template>
              </td>
            </tr>
          </AppTable>
        </section>

        <section class="invoice-section totals-section">
          <div class="totals-grid">
            <div>
              <h4 class="section-subheading">Liquidación del IVA</h4>
              <table class="table table-bordered table-sm totals-table">
                <tbody>
                  <tr>
                    <th>IVA 5%</th>
                    <td class="col-numeric">{{ formateaNumero(redondearHaciaArriba(factura.totalIva5)) }}</td>
                  </tr>
                  <tr>
                    <th>IVA 10%</th>
                    <td class="col-numeric">{{ formateaNumero(redondearHaciaArriba(factura.totalIva10)) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div>
              <h4 class="section-subheading">Totales</h4>
              <table class="table table-bordered table-sm totals-table">
                <tbody>
                  <tr>
                    <th>Total IVA</th>
                    <td class="col-numeric">{{ formateaNumero(redondearHaciaArriba(factura.totalFactura)) }}</td>
                  </tr>
                  <tr>
                    <th>Monto Total</th>
                    <td class="col-numeric">{{ formateaNumero(redondearHaciaArriba(montoTotal)) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <div class="submit-row">
          <button v-if="!readOnly || fromDeliveryNote" type="submit" class="btn btn-success btn-lg">
            Guardar Factura
          </button>
        </div>
      </form>

      <RegistrarProveedorModal
        v-model:showModal="showProviderModal"
        :initial-ruc="initialProviderDocument"
        @provider-registered="onProviderRegistered"
      />
      <RegisterProductModal
        v-model:showModal="showProductModal"
        :initial-code="initialProductCode"
        @product-registered="onProductRegistered"
        @close-all-register-modals="showRegisterModal = false"
      />

  <div v-if="mostrarSelectorProveedor" class="overlay-backdrop">
        <div class="overlay-panel card">
          <div class="overlay-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Seleccionar Proveedor</h5>
            <button type="button" class="btn-close" @click="cerrarSelectorProveedor"></button>
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
  <div v-if="mostrarSelectorProducto" class="overlay-backdrop">
        <div class="overlay-panel card">
          <div class="overlay-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Seleccionar Producto</h5>
            <button type="button" class="btn-close" @click="cerrarSelectorProducto"></button>
          </div>
          <div class="overlay-body">
            <ProductSelector @product-selected="onProductoSeleccionado" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Factura from '@/models/Factura';
import Producto from '@/models/Producto';
import AppTable from '@/components/AppTable.vue';
import SimpleRegisterModal from '@/components/SimpleRegisterModal.vue';
import apiService from '@/services/apiService.js';
import ProviderSelect from '@/components/ProviderSelect.vue';
import RegistrarProveedorModal    from '@/components/RegistrarProveedorModal.vue'
import RegisterProductModal from '@/components/RegistrarProductoModal.vue';
import AppNavbar from '@/components/AppNavbar.vue';
import ProveedoresView from '@/views/ProveedoresView.vue';
import ProductSelector from '@/components/ProductSelector.vue';

export default {
  name: 'FacturaView',
  components: {
  AppNavbar,
  AppTable,
  SimpleRegisterModal,
  ProviderSelect,
  RegistrarProveedorModal,
  RegisterProductModal,
  ProveedoresView,
  ProductSelector
  },
  props: {
    datosParaFactura: {
      type: Object,
      default: () => null,
    },
  },
  data() {
      return {
          factura: new Factura(), // Instancia de Factura
          productoData: { // Datos temporales del producto
              codigo_producto: '',
              producto_id: null,
              descripcion: '',
              cantidad: 0,
              precio_unitario_neto: 0,
              tipo_iva_id: 1,
              iva10: 0,
              iva5: 0,
              exenta: 0,
          },
          showRegisterModal: false,
          fromDeliveryNote: false,
          fromDeliveryNoteID:'',
          showProductModal: false,
          registerModalTitle: '',
          initialProductCode: '',
          showProviderModal: false,
          readOnly: false,
          nuevoProducto: {
            codigo: '',
            descripcion: '',
            precio_unitario_neto: 0,
            tipo_iva_id: 'exenta',
          },
          selectedProviderInput: '',
          productoEditandoIndex: null, // Índice para identificar el producto que se está editando
          mostrarSelectorProveedor: false,
          mostrarSelectorProducto: false,
          initialProviderDocument: '',
          skipProviderLookupOnce: false
      };
  },
  methods: {
    toggleBuscarProveedor() {
      this.mostrarSelectorProveedor = !this.mostrarSelectorProveedor;
      document.body.style.overflow = this.mostrarSelectorProveedor ? 'hidden' : '';
      this.$nextTick(() => {
        if (this.mostrarSelectorProveedor) {
          const input = document.querySelector('.overlay-body input[type="text"]');
          if (input) input.focus();
        }
      });
    },
    cerrarSelectorProveedor() {
      this.mostrarSelectorProveedor = false;
      document.body.style.overflow = '';
    },
    async buscarProveedorPorDocumento() {
      if (this.readOnly && !this.fromDeliveryNote) return;

      const documento = (this.selectedProviderInput || '').trim();
      if (!documento) return;

      if (this.skipProviderLookupOnce) {
        this.skipProviderLookupOnce = false;
        return;
      }

      try {
        const { data } = await apiService.get(
          `${process.env.VUE_APP_API_BASE_URL}/api/providers/document/${encodeURIComponent(documento)}`
        );

        if (data) {
          this.onProviderSelected({
            nro_documento: data.nro_documento || documento,
            nombre: data.nombre || data.nombre_fantasia || ''
          });
          this.factura.direccion = data.direccion || this.factura.direccion;
        } else {
          this.abrirModalRegistroProveedor(documento);
        }
      } catch (error) {
        if (error?.response?.status === 404) {
          this.abrirModalRegistroProveedor(documento);
        } else {
          console.error('Error al buscar proveedor por documento:', error);
          alert('No fue posible buscar el proveedor. Intente nuevamente.');
        }
      }
    },
    abrirModalRegistroProveedor(documento) {
      this.initialProviderDocument = documento;
      this.showProviderModal = true;
    },
    toggleBuscarProducto() {
      if (this.readOnly && !this.fromDeliveryNote) return;
      this.mostrarSelectorProducto = !this.mostrarSelectorProducto;
      document.body.style.overflow = this.mostrarSelectorProducto ? 'hidden' : '';
      this.$nextTick(() => {
        if (this.mostrarSelectorProducto) {
          const input = document.querySelector('.product-selector input[type="text"]');
          if (input) input.focus();
        }
      });
    },
    cerrarSelectorProducto() {
      this.mostrarSelectorProducto = false;
      document.body.style.overflow = '';
    },
    onProveedorSeleccionado(provider) {
      this.onProviderSelected({
        nro_documento: provider.nro_documento,
        nombre: provider.nombre
      });
      this.cerrarSelectorProveedor();
    },
    async onProductoSeleccionado(product) {
      if (!product) return;
      this.productoData.codigo_producto = product.code || '';
      this.productoData.producto_id = product.id || null;
      this.productoData.descripcion = product.name || '';
      this.cerrarSelectorProducto();
      await this.$nextTick();
      this.autocompletarProducto();
    },
    actualizarFechaEmision(isoDate) {
      // Recibe fecha en formato ISO (YYYY-MM-DD) del input date
      this.factura.fechaEmision = isoDate;
    },
    formatearFechaParaMostrar(isoDate) {
      // Convierte de YYYY-MM-DD a DD/MM/YYYY para mostrar
      if (!isoDate) return '';
      const [year, month, day] = isoDate.split('-');
      return `${day}/${month}/${year}`;
    },
    obtenerFechaHoy() {
      // Retorna la fecha de hoy en formato YYYY-MM-DD
      const hoy = new Date();
      const year = hoy.getFullYear();
      const month = String(hoy.getMonth() + 1).padStart(2, '0');
      const day = String(hoy.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    },
    async autocompletarProducto() {
      if (!this.productoData.codigo_producto) return;
      try {
        const url = `${process.env.VUE_APP_API_BASE_URL}/api/products/barcode/${this.productoData.codigo_producto}`;
        const response = await apiService.get(url);
        const producto = response.data;
        if (producto) {
          this.productoData.descripcion = producto.nombre;
          this.productoData.precio_unitario_neto = producto.valorUnitario || 0;
          this.productoData.tipo_iva_id = producto.tipo_iva;
          this.productoData.producto_id = producto.producto_id || null; 
        } else {
          // Producto no encontrado (respuesta vacía) -> abrir directamente modal de registrar producto
          this.initialProductCode = this.productoData.codigo_producto;
          this.registerModalTitle  = ''; // ya no usamos el modal intermedio para este caso
          this.showRegisterModal   = false; // asegurar cerrado
          this.showProductModal    = true;  // abrir modal de registro
        }
      } catch (error) {
        console.error("Error al obtener el producto:", error);
        // Error consultando backend / producto inexistente -> abrir modal de registro directamente
        this.initialProductCode = this.productoData.codigo_producto;
        this.registerModalTitle  = '';
        this.showRegisterModal   = false;
        this.showProductModal    = true;
      }
    },
    async cargarFacturaDesdeParams() {
      const nroDocumento = this.$route.params.id; // Usar el número de documento de la factura
      try {
        const { data: facturaData } = await apiService.get(`${process.env.VUE_APP_API_BASE_URL}/api/purchases/invoices/${nroDocumento}`);
        console.log('Factura recibida:', facturaData);
        if (facturaData && facturaData.cabecera) {
          const cabecera = facturaData.cabecera;

          // <— SYNC the ProviderSelect v‑model too
          this.selectedProviderInput = cabecera.nro_documento.toString();
          this.onProviderSelected({
            nro_documento: cabecera.nro_documento.toString(),
            nombre: cabecera.nombre_razon_social
          });
          // Asignar datos de la cabecera a la factura
          this.factura.ruc = cabecera.nro_documento.toString();
          this.factura.razonSocial = cabecera.nombre_razon_social;
          this.factura.fechaEmision = cabecera.fecha_emision ? cabecera.fecha_emision.split('T')[0] : '';
          this.factura.timbrado = cabecera.timbrado.toString();
          this.factura.nroFactura = cabecera.nro_comprobante.toString();
          this.factura.condicionVenta = cabecera.credito_contado.toUpperCase() === 'CONTADO' ? 'CONTADO' : 'CONTADO';
          this.factura.direccion = cabecera.direccion || '';
          this.factura.tipo_moneda = cabecera.tipo_moneda || 'USD';
          
          // Asignar totales (si tu modelo Factura los utiliza)
          this.factura.totalIva10 = cabecera.iva_detalle && cabecera.iva_detalle['iva_10.00'] ? cabecera.iva_detalle['iva_10.00'] : 0;
          this.factura.totalIva5 = cabecera.iva_detalle && cabecera.iva_detalle['iva_5.00'] ? cabecera.iva_detalle['iva_5.00'] : 0;
          this.factura.totalFactura = Number(cabecera.total_iva) || 0;
          this.factura.totalSinIva = cabecera.total_sin_iva || 0;
          console.log('Factura CABECERA :', this.factura);
          // Mapear los detalles a productos
          // Se asume que tienes un modelo Producto que acepta un objeto con estas propiedades
          // ‑‑‑ dentro de cargarFacturaDesdeParams() justo después de obtener facturaData ‑‑‑
          this.factura.productos = facturaData.detalles.map(det => ({
            id_detalle: det.id_detalle,                 // lo espera el modelo
            producto_id: det.producto_id,              // idem
            codigo_producto: det.codigo_barras || det.codigo_producto || '',
            descripcion:    det.nombre_producto || det.descripcion || '',
            cantidad:       Number(det.cantidad),
            precio_unitario_bruto: Number(det.precio_unitario_bruto),
            precio_unitario_neto:  Number(det.precio_unitario_neto),
            descuento:      Number(det.descuento),
            iva:            Number(det.iva),
            tipo_iva_id:    det.tipo_iva_id            
          }));

        }
      } catch (error) {
        console.error('Error al cargar la factura desde parámetros:', error);
      }
    },


    onProviderSelected(prov) {
      console.log('onInput Call');
      this.skipProviderLookupOnce = true;
      this.factura.ruc = prov.nro_documento;
      this.factura.razonSocial = prov.nombre;
      this.selectedProviderInput = prov.nro_documento;
      this.initialProviderDocument = prov.nro_documento;
    },


      irARegistro() {
        if (this.registerModalTitle === "Producto no encontrado") {
          // Navega a la página de registro de producto
          this.showProductModal   = true;
        } else if (this.registerModalTitle === "Proveedor no encontrado") {
          // Navega a la página de registro de proveedor
          this.showProviderModal = true  
        }
      },

      closeRegisterModal() {
        this.showRegisterModal = false;
        this.nuevoProducto = { codigo: '', descripcion: '', valorUnitario: 0, tipoImpuesto: 'exenta' };
      },
      calcularImpuestoPorTipo() {
        const subtotal = Math.round(Number(this.productoData.cantidad) * Number(this.productoData.precio_unitario_neto));
        if (this.productoData.tipo_iva_id === 'exenta') {
          this.productoData.exenta = subtotal;
          this.productoData.iva5   = 0;
          this.productoData.iva10  = 0;
        } else if (this.productoData.tipo_iva_id === 'iva5') {
          this.productoData.iva5   = subtotal;
          this.productoData.exenta = 0;
          this.productoData.iva10  = 0;
        } else {
          this.productoData.iva10  = subtotal;
          this.productoData.exenta = 0;
          this.productoData.iva5   = 0;
        }
      },
      registrarProducto() {
        console.log("registrarProducto llamado");
        // Guardar el nuevo producto en el array de productos simulados
        //FacturaService.guardarProducto(this.nuevoProducto); // Implementa esta función en el servicio mock
        //this.productoData = { ...this.nuevoProducto, cantidad: 1 }; // Copiar datos del nuevo producto al formulario principal
        this.closeRegisterModal(); // Cerrar el modal
       },
      openProviderModal(){
        this.initialProviderDocument = (this.selectedProviderInput || '').trim();
        this.showProviderModal   =true;    // abre el modal
      },
      onProviderRegistered(newProv){
        /*  newProv llega desde el modal con los datos recién creados  */
        this.onProviderSelected({
            nro_documento:newProv.nro_documento,
            nombre       :newProv.nombre
        })
        this.showProviderModal=false;      // cierra el modal
        this.$nextTick(() => {
          if (this.$refs.providerSelect && typeof this.$refs.providerSelect.loadProviders === 'function') {
            this.$refs.providerSelect.loadProviders();
          }
        });
      },
      agregarProducto() {
          this.calcularImpuestoPorTipo();
          const producto = new Producto(this.productoData);
          console.log("Producto a agregar:", producto);
          if (this.productoEditandoIndex !== null) {
              // Guardar cambios del producto editado
              this.factura.productos.splice(this.productoEditandoIndex, 1, producto);
              this.productoEditandoIndex = null;
          } else {
              // Agregar un nuevo producto
              this.factura.agregarProducto(producto);
          }
          this.factura.calcularTotales(); // Actualizar los totales después de agregar o editar
          this.limpiarCamposProducto();
      },
      eliminarProducto(index) {
        this.factura.eliminarProducto(index); // Eliminar producto de la factura
      },
      limpiarCamposProducto() {
        this.productoData = {
          codigo_producto: '',
          descripcion: '',
          cantidad: 0,
          precio_unitario_neto: 0,
          tipo_iva_id: 'iva10',
          exenta: 0,
          iva5: 0,
          iva10: 0
        };
        this.productoEditandoIndex = null;
      },
      editarProducto(index) {
          // Cargar el producto en el formulario para editar
          const producto = this.factura.productos[index];
          this.productoData = { ...producto };
          this.productoEditandoIndex = index;
          console.log(this.productoData) // Indicar que estamos en modo edición
      },
      onProductRegistered(newProd) {
        // Asignamos explícitamente el nuevo código y demás campos al formulario
        this.productoData.codigo_producto      = newProd.codigo;               // <- aquí el código
        this.productoData.descripcion          = newProd.descripcion;          // <- descripción
        this.productoData.precio_unitario_neto = newProd.precio_unitario_neto; // <- precio neto
        this.productoData.tipo_iva_id          = newProd.tipo_iva_id;          // <- tipo de IVA
        this.showProductModal                  = false;

        this.autocompletarProducto();
      },
    
      closeAllRegisterModals() {
        this.showProductModal = false;
        this.showRegisterModal = false;
      },
      guardarEdicionProducto() {
          // Llama a agregarProducto para guardar los cambios
          this.agregarProducto();
          //this.factura.calcularTotales(); // Actualizar los totales después de editar
      },
      cancelarEdicion() {
        this.productoEditandoIndex = null;
        this.limpiarCamposProducto();
      },
      async guardarFactura() {
        try {
          const nroNotaRemision = (this.fromDeliveryNote && this.fromDeliveryNoteID) ? this.fromDeliveryNoteID : null;
          // Construir el cuerpo de la petición según el formato requerido
          const requestBody = {
            cabecera: {
              nro_comprobante: this.factura.nroFactura.toString(),
              timbrado: this.factura.timbrado.toString(),
              nro_nota_remision: nroNotaRemision,
              fecha_emision: this.factura.fechaEmision ? new Date(this.factura.fechaEmision).toISOString() : null,
              tipo_moneda: this.factura.tipo_moneda || 'USD',
              credito_contado: this.factura.condicionVenta === 'CONTADO' ? 'CONTADO' : 'CONTADO',
              tipo_documento: 'RUC',
              nro_documento: this.selectedProviderInput,
              nombre_razon_social: this.factura.razonSocial,
              direccion: this.factura.direccion || '',
              pendiente: false,
              total_iva: Number(this.factura.totalIva) || 0,
              total_iva_incluido: Number(this.factura.totalFactura) || 0,
              total_sin_iva: Number(this.factura.totalSinIva) || 0
            },
            detalles: this.factura.productos.map(producto => ({
              producto_id: Number(producto.producto_id),
              cantidad: Number(producto.cantidad),
              precio_unitario_bruto: Number(producto.precio_unitario_neto),
              descuento: 0.00,
              tipo_iva: Number(producto.tipo_iva_id),
              fecha_vencimiento: producto.fechaVencimiento ? new Date(producto.fechaVencimiento).toISOString() : null
            }))
          };

          // Imprime en consola el objeto que se enviará
          console.log("Request Body:", requestBody);
          // Enviar la petición POST utilizando apiService
          await apiService.post(`${process.env.VUE_APP_API_BASE_URL}/api/purchases/invoices`, requestBody);
          alert('Factura guardada correctamente');


          // Si la factura se generó desde una nota de remisión, actualizar su estado
          //if (this.fromDeliveryNote && this.fromDeliveryNoteID) {
            //await apiService.patch(`${process.env.VUE_APP_API_BASE_URL}/api/purchases/delivery-notes/${this.fromDeliveryNoteID}`, { estado: 'Facturado' });
            //console.log("El estado de la nota de remisión se ha actualizado a 'Facturado'.");
          //}



          this.factura = new Factura(); // Reiniciar la factura después de guardarla
          this.$router.push({ name: 'ListarComprobantes' });
        } catch (error) {
          console.error('Error al guardar la factura:', error);
        }
      },
      formateaNumero(n) {
        if (n === null || n === undefined) return '';
        return Number(n).toLocaleString('es-PY', { minimumFractionDigits: 0 });
      },
      redondearHaciaArriba(valor) {
        if (valor === null || valor === undefined || isNaN(valor)) return 0;
        return Math.round(Number(valor));
      }
  

  },
  async mounted() {
    if (this.$route.params.id) {
      // Cargar la factura existente si hay un id
      this.readOnly = true;
      await this.cargarFacturaDesdeParams();
    } else {
      // Nueva factura: establecer fecha de hoy por defecto
      this.factura.fechaEmision = this.obtenerFechaHoy();
    }
  },
  computed: {
    fechaEmisionISO() {
      // Retorna la fecha actual o una cadena vacía
      return this.factura.fechaEmision || '';
    },
    montoTotal () {

      return this.factura.productos.reduce((suma, p) => {
        const base = p.cantidad * p.precio_unitario_neto;

        if (p.tipo_iva_id === 1) {          
          return suma + base;
        } else if (p.tipo_iva_id === 2) {   
          return suma + base;
        }                                   
        return suma + base;
      }, 0);
    },
  },
  watch: {
  '$route.query.datosParaFactura': {
    handler(newQuery) {
      console.log('Datos recibidos en FacturaView:', newQuery);
      try {
        const queryData = newQuery
          ? JSON.parse(decodeURIComponent(newQuery))
          : null;

        console.log('Datos recibidos en FacturaView desde ListarComprobantes.vue:', queryData);

        if (queryData) {
          this.readOnly = true;
          this.selectedProviderInput = queryData.ruc;
          this.onProviderSelected({
            nro_documento: queryData.ruc,
            nombre:        queryData.razonSocial
          });
          this.fromDeliveryNote = true;  // Se marca que viene de nota de remisión
          this.fromDeliveryNoteID = queryData.nro_documento; // Guardar el ID de la nota de remisión
          this.factura.ruc = queryData.ruc || this.factura.ruc;
          this.factura.razonSocial = queryData.razonSocial || this.factura.razonSocial;
          
          // Establecer fecha de hoy cuando viene de nota de remisión
          if (!this.factura.fechaEmision) {
            this.factura.fechaEmision = this.obtenerFechaHoy();
          }

          console.log('Factura después de asignar RUC y Razón Social:', this.factura);

          //Limpia productos existentes y carga los nuevos
          this.factura.productos = [];
          queryData.productos.forEach(producto => {
            this.factura.agregarProducto({
              ...producto,
              precio_unitario_neto: producto.valorUnitario || 0,
              tipo_iva_id: producto.iva || producto.tipo_iva_id,
              id: producto.producto_id,
            });
          });

          this.factura.calcularTotales();
        } else {
          this.readOnly = false;
          // Establecer fecha de hoy para nueva factura
          if (!this.factura.fechaEmision) {
            this.factura.fechaEmision = this.obtenerFechaHoy();
          }
        }
      } catch (error) {
        console.error('Error al procesar los datos de la factura:', error);
      }
    },
    immediate: true,
  },
},
};
</script>

<style scoped>
.invoice-wrapper {
  background-color: #f4f4f4;
  min-height: 100vh;
  padding: 32px 16px 48px;
}

.invoice-paper {
  max-width: 1024px;
  margin: 0 auto;
  background: #fff;
  border: 1px solid #d6d6d6;
  border-radius: 12px;
  box-shadow: 0 12px 35px rgba(15, 23, 42, 0.12);
  padding: 32px 36px 40px;
}

.invoice-header {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  justify-content: space-between;
  align-items: stretch;
  padding-bottom: 24px;
  border-bottom: 3px double #747474;
  margin-bottom: 28px;
}

.invoice-header__brand {
  flex: 1;
  min-width: 240px;
}

.brand-badge {
  display: inline-block;
  background: linear-gradient(135deg, #ffd166, #f9a826);
  color: #1f1f1f;
  font-weight: 700;
  text-transform: uppercase;
  font-size: 0.75rem;
  padding: 6px 12px;
  border-radius: 999px;
  letter-spacing: 0.1em;
}

.invoice-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 12px 0 8px;
  letter-spacing: 1px;
}

.invoice-description {
  color: #5f5f5f;
  max-width: 420px;
  margin: 0;
  line-height: 1.5;
}

.invoice-header__meta {
  background: linear-gradient(180deg, #fff7cb 0%, #ffe88a 100%);
  border: 1px solid #e3c75f;
  border-radius: 12px;
  padding: 18px 20px;
  min-width: 320px;
  max-width: 360px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6);
}

.meta-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px 16px;
}

.meta-field label {
  font-size: 0.75rem;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.06em;
  color: #404040;
  margin-bottom: 4px;
  display: block;
}

.invoice-form {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.invoice-section {
  padding: 0;
}

.section-heading {
  font-size: 0.95rem;
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: #444;
  margin-bottom: 16px;
}

.section-heading.with-line {
  border-bottom: 2px solid #131313;
  padding-bottom: 10px;
  margin-bottom: 20px;
}

.section-subheading {
  font-size: 0.9rem;
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
  grid-template-columns: minmax(200px, 1fr) minmax(240px, 1.5fr) 100px 160px 150px;
  gap: 16px;
  padding: 16px 18px;
  border: 1px solid #d9d9d9;
  border-radius: 10px;
  background: #fdfdfd;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.5);
}

.code-input-group .form-control {
  min-width: 0;
}

.code-input-group .btn {
  flex: 0 0 auto;
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

.invoice-details-table {
  border-color: #8f8f8f !important;
}

.invoice-details-table thead th {
  background: #f2f2f2;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.invoice-details-table tbody td {
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

.totals-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 20px;
}

.totals-table th {
  width: 50%;
  font-weight: 600;
  background: #f2f2f2;
  text-transform: uppercase;
  font-size: 0.78rem;
  letter-spacing: 0.08em;
}

.totals-table td {
  font-weight: 700;
  font-size: 1rem;
  text-align: right;
}

.submit-row {
  display: flex;
  justify-content: flex-end;
  border-top: 2px solid #2b2b2b;
  padding-top: 24px;
}

.btn-success.btn-lg {
  min-width: 220px;
}

.overlay-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.overlay-panel {
  width: 95vw;
  max-width: 1100px;
  max-height: 90vh;
  overflow: hidden;
}

.overlay-header {
  border-bottom: 1px solid #e9ecef;
  padding: 10px 14px;
}

.overlay-body {
  padding: 4px 12px 12px;
  max-height: calc(90vh - 56px);
  overflow: auto;
}

@media (max-width: 992px) {
  .detail-entry {
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  }

  .invoice-header__meta {
    max-width: 100%;
    width: 100%;
  }

  .meta-grid {
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  }

  .submit-row {
    justify-content: center;
  }
}
</style>
