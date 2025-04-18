<template>
  <div class="container mt-5">
      <h1 class="text-center">Formulario de Carga de Factura</h1>
      <form @submit.prevent="guardarFactura">
          <!-- Información de factura -->
          <div class="row g-3 mb-3">
            <ProviderSelect
              v-model="selectedProviderInput"
              :disabled="readOnly"
              @provider-selected="onProviderSelected"
              @register="openProviderModal"
            />
            <div class="col-md-6">
                <label for="razon_social" class="form-label">Nombre o Razón Social</label>
                <input type="text" v-model="factura.razonSocial" class="form-control" placeholder="Nombre o razón social" :readonly="readOnly">
            </div>
          </div>
          <!-- Información adicional -->
          <div class="row g-3 mb-3">
              <div class="col-md-6">
                  <label for="fecha_emision" class="form-label">Fecha de Emisión</label>
                  <input type="date" v-model="factura.fechaEmision" class="form-control" :readonly="readOnly">
              </div>
              <div class="col-md-6">
                  <label for="timbrado" class="form-label">Timbrado</label>
                  <input type="text" v-model="factura.timbrado" class="form-control" placeholder="Número de timbrado" :readonly="readOnly">
              </div>
          </div>
          <div class="row g-3 mb-3">
              <div class="col-md-6">
                  <label for="nro_factura" class="form-label">N° de Factura</label>
                  <input type="text" v-model="factura.nroFactura" class="form-control" placeholder="Número de factura" :readonly="readOnly">
              </div>
              <div class="col-md-6">
                  <label for="condicion_venta" class="form-label">Condición de Venta</label>
                  <select v-model="factura.condicionVenta" class="form-control" :readonly="readOnly">
                      <option value="contado">Contado</option>
                      <option value="credito">Crédito</option>
                  </select>
              </div>
          </div>

        <!-- Detalles de Productos -->
        <h3>Detalles de Productos</h3>
        <div class="row g-3 mb-3">
        <div class="col-md-2">
          <label class="form-label">Código</label>
          <input type="text" v-model="productoData.codigo" class="form-control" placeholder="Código" @blur="autocompletarProducto" @keydown.enter.prevent :readonly="readOnly"/>
        </div>
        <div class="col-md-3">
          <label class="form-label">Descripción</label>
          <input type="text" v-model="productoData.descripcion" class="form-control" placeholder="Descripción" @keydown.enter.prevent readOnly />
        </div>
        <div class="col-md-2">
          <label class="form-label">Cantidad</label>
          <input type="number" v-model.number="productoData.cantidad" class="form-control" placeholder="Cantidad" @keydown.enter.prevent :readonly="readOnly"/>
        </div>
        <div class="col-md-2">
          <label class="form-label">Valor Unitario</label>
          <input type="number" v-model.number="productoData.precio_unitario_neto" class="form-control" placeholder="Valor Unitario" @keydown.enter.prevent :readonly="readOnly"/>
        </div>
        <div class="col-md-3">
          <label class="form-label">Tipo de Impuesto</label>
          <input type="text" 
                class="form-control" 
                :value="productoData.tipo_iva_id === 1 ? 'IVA 10%' : (productoData.tipo_iva_id === 2 ? 'IVA 5%' : 'Exenta')" 
                readonly />
        </div>

      </div>

      <div class="d-grid gap-2 mb-3">
        <button v-if="!readOnly" type="button" class="btn btn-secondary" :disabled="fromDeliveryNote" @click="agregarProducto">
          Agregar Producto
        </button>
      </div>

      <SimpleRegisterModal
        :showModal="showRegisterModal"
        :title="registerModalTitle"
        @close="showRegisterModal = false"
        @register="irARegistro" />


      <!-- Productos Agregados -->
      <h3>Productos Agregados</h3>
      <AppTable :headers="['Código', 'Descripción', 'Cantidad', 'Valor Unitario', 'Exenta', 'Iva 5%', 'Iva 10%', 'Acciones']">
        <tr v-for="(producto, index) in factura.productos" :key="index">
          <td>
            <span>{{ producto.codigo_producto}}</span>
          </td>
          <td>          
            <span>{{ producto.descripcion }}</span>
          </td>
          <td>
            <input v-if="productoEditandoIndex === index" v-model.number="productoData.cantidad" type="number" class="form-control form-control-sm" />
            <span v-else>{{ producto.cantidad }}</span>
          </td>
          <td>
            <input v-if="productoEditandoIndex === index" v-model.number="productoData.precio_unitario_neto" type="number" class="form-control form-control-sm" />
            <span v-else>{{ producto.precio_unitario_neto  }}</span>
          </td>
          <td>
            <span v-if="producto.tipo_iva_id === 3 || producto.tipoImpuesto === 'exenta'">
              {{ producto.cantidad * producto.precio_unitario_neto }}
            </span>
            <span v-else></span>
          </td>
          <td>
            <span v-if="producto.tipo_iva_id === 2">
              {{ producto.cantidad * producto.precio_unitario_neto }}
            </span>
            <span v-else></span>
          </td>
          <td>
            <span v-if="producto.tipo_iva_id === 1 || producto.tipo_iva_id === 10">
              {{ producto.cantidad * producto.precio_unitario_neto }}
            </span>
            <span v-else></span>
          </td>

          <td>
            <template v-if="productoEditandoIndex === index">
              <button type="button" class="btn btn-success btn-sm me-1" @click="guardarEdicionProducto" :disabled="readOnly">Guardar</button>
              <button type="button" class="btn btn-danger btn-sm" @click="cancelarEdicion" :disabled="readOnly">Cancelar</button>
            </template>
            <template v-else>
              <button type="button" class="btn btn-primary btn-sm me-1" @click="editarProducto(index)" :disabled="readOnly">Editar</button>
              <button type="button" class="btn btn-danger btn-sm" @click="eliminarProducto(index)" :disabled="readOnly">Eliminar</button>
            </template>
          </td>

        </tr>
      </AppTable>


          <!-- Totales -->
          <h3>Liquidación del IVA</h3>
          <div class="row g-3">
            <div class="col-md-6">
              <label for="iva_5" class="form-label">Liquidación del IVA 5%</label>
              <input type="number" class="form-control" id="iva_5" :value="factura.totalIva5" placeholder="IVA 5%" readonly  />
            </div>
            <div class="col-md-6">
              <label for="iva_10" class="form-label">Liquidación del IVA 10%</label>
              <input type="number" class="form-control" id="iva_10" :value="factura.totalIva10" placeholder="IVA 10%" readonly  />
            </div>
          </div>
          <h3>Totales</h3>
          <div class="row g-3">
            <div class="col-md-6">
              <label for="total_factura" class="form-label">Total IVA</label>
              <input type="number" id="total_factura" class="form-control" :value="factura.totalFactura" placeholder="Total Factura IVA" readonly />
            </div>
            <div class="col-md-6">
              <label for="monto_total" class="form-label">Monto Total</label>
              <input type="number" id="monto_total" class="form-control" :value="montoTotal" placeholder="Monto Total" readonly />
            </div>
          </div>


          <div class ="d-grid gap-2 mt-4">
            <button v-if="!readOnly" type="submit" class="btn btn-success mt-4" >Guardar Factura</button>
          </div>
      </form>
      <RegistrarProveedorModal
        v-model:showModal="showProviderModal"
        @provider-registered="onProviderRegistered"
      />
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


export default {
  name: 'FacturaView',
  components: {
    AppTable,
    SimpleRegisterModal,
    ProviderSelect,
    RegistrarProveedorModal
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
              codigo: '',
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
          showProviderModal: false,
          readOnly: false,
          nuevoProducto: {
            codigo: '',
            descripcion: '',
            precio_unitario_neto: 0,
            tipo_iva_id: 'exenta',
          },
          selectedProviderInput: '',
          productoEditandoIndex: null // Índice para identificar el producto que se está editando
      };
  },
  methods: {
    async autocompletarProducto() {
      if (!this.productoData.codigo) return;
      try {
        const url = `${process.env.VUE_APP_API_BASE_URL}/api/products/barcode/${this.productoData.codigo}`;
        const response = await apiService.get(url);
        const producto = response.data;
        if (producto) {
          this.productoData.descripcion = producto.descripcion;
          this.productoData.precio_unitario_neto = producto.valorUnitario || 0;
          this.productoData.tipo_iva_id = producto.tipo_iva;
          this.productoData.producto_id = producto.producto_id || null; 
        } else {
          this.registerModalTitle = "Producto no encontrado";
          this.showRegisterModal = true;
        }
      } catch (error) {
        console.error("Error al obtener el producto:", error);
        this.registerModalTitle = "Producto no encontrado";
        this.showRegisterModal = true;
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
          this.factura.condicionVenta = cabecera.credito_contado.toLowerCase() === 'contado' ? 'contado' : 'credito';
          this.factura.direccion = cabecera.direccion || '';
          this.factura.tipo_moneda = cabecera.tipo_moneda || 'USD';
          
          // Asignar totales (si tu modelo Factura los utiliza)
          this.factura.totalIva10 = cabecera.iva_detalle && cabecera.iva_detalle['iva_10.00'] ? cabecera.iva_detalle['iva_10.00'] : 0;
          this.factura.totalIva5 = cabecera.iva_detalle && cabecera.iva_detalle['iva_5.00'] ? cabecera.iva_detalle['iva_5.00'] : 0;
          this.factura.totalFactura = cabecera.total_iva_incluido || 0;
          this.factura.totalSinIva = cabecera.total_sin_iva || 0;
          console.log('Factura CABECERA :', this.factura);
          // Mapear los detalles a productos
          // Se asume que tienes un modelo Producto que acepta un objeto con estas propiedades
          // ‑‑‑ dentro de cargarFacturaDesdeParams() justo después de obtener facturaData ‑‑‑
          this.factura.productos = facturaData.detalles.map(det => ({
            id_detalle: det.id_detalle,                 // lo espera el modelo
            producto_id: det.producto_id,              // idem
            codigo_producto: det.codigo_barras || det.codigo_producto || '',
            descripcion:    det.descripcion || '',
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
      this.factura.ruc = prov.nro_documento;
      this.factura.razonSocial = prov.nombre;
      this.selectedProviderInput = prov.nro_documento;
    },


      irARegistro() {
        if (this.registerModalTitle === "Producto no encontrado") {
          // Navega a la página de registro de producto
          this.$router.push({ name: 'RegistrarProducto' });
        } else if (this.registerModalTitle === "Proveedor no encontrado") {
          // Navega a la página de registro de proveedor
          this.$router.push({ name: 'RegistrarProveedor'});
        }
      },

      closeRegisterModal() {
        this.showRegisterModal = false;
        this.nuevoProducto = { codigo: '', descripcion: '', valorUnitario: 0, tipoImpuesto: 'exenta' };
      },
      calcularImpuestoPorTipo() {
        const subtotal = Number(this.productoData.cantidad) * Number(this.productoData.precio_unitario_neto);
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
        this.selectedProviderInput='';     // oculta la “píldora”
        this.showProviderModal   =true;    // abre el modal
      },
      onProviderRegistered(newProv){
        /*  newProv llega desde el modal con los datos recién creados  */
        this.onProviderSelected({
            nro_documento:newProv.nro_documento,
            nombre       :newProv.nombre
        })
        this.showProviderModal=false;      // cierra el modal
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
          codigo: '',
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
          // Construir el cuerpo de la petición según el formato requerido
          const requestBody = {
            cabecera: {
              nro_comprobante: this.factura.nroFactura.toString(),
              timbrado: this.factura.timbrado.toString(),
              fecha_emision: this.factura.fechaEmision ? new Date(this.factura.fechaEmision).toISOString() : null,
              tipo_moneda: this.factura.tipo_moneda || 'USD',
              credito_contado: this.factura.condicionVenta === 'contado' ? 'Contado' : 'Crédito',
              tipo_documento: 'RUC',
              nro_documento: this.factura.ruc.toString(),
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


          // Si la factura se generó desde una nota de remisión, eliminar la nota
          if (this.fromDeliveryNote && this.fromDeliveryNoteID) {
            await apiService.delete(`${process.env.VUE_APP_API_BASE_URL}/api/purchases/delivery-notes/${this.fromDeliveryNoteID}`);
            console.log("Nota de remisión eliminada exitosamente.");
          }



          this.factura = new Factura(); // Reiniciar la factura después de guardarla
          this.$router.back();
        } catch (error) {
          console.error('Error al guardar la factura:', error);
        }
      }
  

  },
  async mounted() {
    if (this.$route.params.id) {
      // Cargar la factura existente si hay un id
      this.readOnly = true;
      await this.cargarFacturaDesdeParams();
    }
  },
  computed: {
    montoTotal () {

      return this.factura.productos.reduce((suma, p) => {
        const base = p.cantidad * p.precio_unitario_neto;

        if (p.tipo_iva_id === 1) {          
          return suma + base;
        } else if (p.tipo_iva_id === 2) {   
          return suma + base;
        }                                   
        return suma + base;
      }, 0).toFixed(2);   
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
  /* Migrar el CSS de factura.css aquí */
  body {
      background-color: #f4f4f4;
  }
  
  h1 {
      margin-bottom: 30px;
  }
  
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5); /* Fondo semitransparente */
    z-index: 1040;
}


  .container {
      background-color: #fff;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  }
  
  .form-label {
      font-weight: bold;
  }
  
  .editable-cell {
      background-color: #eaffea;
      border: 1px solid #5cb85c;
  }

    .btn-accion {
        width: 80px; /* Ajusta el ancho deseado */
        height: 40px; /* Ajusta el alto deseado */
        padding: 0; /* Ajusta el relleno si es necesario */
        font-size: 14px; /* Ajusta el tamaño de fuente */
    }

</style>
