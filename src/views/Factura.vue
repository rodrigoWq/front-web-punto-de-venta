<template>
  <div class="container mt-5">
      <h1 class="text-center">Formulario de Carga de Factura</h1>
      <form @submit.prevent="guardarFactura">
          <!-- Información de factura -->
          <div class="row g-3 mb-3">
              <div class="col-md-6">
                  <label for="ruc" class="form-label">RUC</label>
                  <input type="text" v-model="factura.ruc" class="form-control" placeholder="RUC del proveedor" @blur="autocompletarProveedor"  @keydown.enter.prevent>
              </div>
              <div class="col-md-6">
                  <label for="razon_social" class="form-label">Nombre o Razón Social</label>
                  <input type="text" v-model="factura.razonSocial" class="form-control" placeholder="Nombre o razón social">
              </div>
          </div>
          <!-- Información adicional -->
          <div class="row g-3 mb-3">
              <div class="col-md-6">
                  <label for="fecha_emision" class="form-label">Fecha de Emisión</label>
                  <input type="date" v-model="factura.fechaEmision" class="form-control">
              </div>
              <div class="col-md-6">
                  <label for="timbrado" class="form-label">Timbrado</label>
                  <input type="text" v-model="factura.timbrado" class="form-control" placeholder="Número de timbrado">
              </div>
          </div>
          <div class="row g-3 mb-3">
              <div class="col-md-6">
                  <label for="nro_factura" class="form-label">N° de Factura</label>
                  <input type="text" v-model="factura.nroFactura" class="form-control" placeholder="Número de factura">
              </div>
              <div class="col-md-6">
                  <label for="condicion_venta" class="form-label">Condición de Venta</label>
                  <select v-model="factura.condicionVenta" class="form-control">
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
          <input type="text" v-model="productoData.codigo" class="form-control" placeholder="Código" @blur="autocompletarProducto" @keydown.enter.prevent />
        </div>
        <div class="col-md-3">
          <label class="form-label">Descripción</label>
          <input type="text" v-model="productoData.descripcion" class="form-control" placeholder="Descripción" @keydown.enter.prevent />
        </div>
        <div class="col-md-2">
          <label class="form-label">Cantidad</label>
          <input type="number" v-model="productoData.cantidad" class="form-control" placeholder="Cantidad" @keydown.enter.prevent />
        </div>
        <div class="col-md-2">
          <label class="form-label">Valor Unitario</label>
          <input type="number" v-model="productoData.valorUnitario" class="form-control" placeholder="Valor Unitario" @keydown.enter.prevent />
        </div>
        <div class="col-md-3">
          <label class="form-label">Tipo de Impuesto</label>
          <select v-model="productoData.tipoImpuesto" class="form-control" @keydown.enter.prevent>
            <option :value="3">Exenta</option>
            <option :value="2">IVA 5%</option>
            <option :value="1">IVA 10%</option>
          </select>
        </div>
      </div>

      <div class="d-grid gap-2 mb-3">
        <button type="button" class="btn btn-secondary" :disabled="fromDeliveryNote" @click="agregarProducto">
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
            <input v-if="productoEditandoIndex === index" v-model="productoData.codigo" class="form-control form-control-sm" />
            <span v-else>{{ producto.codigo }}</span>
          </td>
          <td>
            <input v-if="productoEditandoIndex === index" v-model="productoData.descripcion" class="form-control form-control-sm" />
            <span v-else>{{ producto.descripcion }}</span>
          </td>
          <td>
            <input v-if="productoEditandoIndex === index" v-model.number="productoData.cantidad" type="number" class="form-control form-control-sm" />
            <span v-else>{{ producto.cantidad }}</span>
          </td>
          <td>
            <input v-if="productoEditandoIndex === index" v-model.number="productoData.valorUnitario" type="number" class="form-control form-control-sm" />
            <span v-else>{{ producto.valorUnitario }}</span>
          </td>
          <td>
            <!--<input v-if="productoEditandoIndex === index" v-model.number="productoData.exenta" type="number" class="form-control form-control-sm" />-->
            <span>{{ producto.exenta }}</span>
          </td>
          <td>
            <!--<input v-if="productoEditandoIndex === index" v-model.number="productoData.iva5" type="number" class="form-control form-control-sm" />-->
            <span>{{ producto.iva5 }}</span>
          </td>
          <td>
            <!--<input v-if="productoEditandoIndex === index" v-model.number="productoData.iva10" type="number" class="form-control form-control-sm" />-->
            <span>{{ producto.iva10 }}</span>
          </td>
          <td>
            <template v-if="productoEditandoIndex === index">
              <button v-if="productoEditandoIndex === index" type="button" class="btn btn-success btn-sm me-1" @click="guardarEdicionProducto">Guardar</button>
              <button type="button" class="btn btn-danger btn-sm" @click="cancelarEdicion">Cancelar</button>
            </template>
            <template v-else>
              <button type="button" class="btn btn-primary btn-sm me-1" @click="editarProducto(index)">Editar</button>
              <button type="button" class="btn btn-danger btn-sm" @click="eliminarProducto(index)">Eliminar</button>
            </template>
          </td>

        </tr>
      </AppTable>


          <!-- Totales -->
          <h3>Liquidación del IVA</h3>
          <div class="row g-3">
            <div class="col-md-6">
              <label for="iva_5" class="form-label">Liquidación del IVA 5%</label>
              <input type="number" class="form-control" id="iva_5" :value="factura.totalIva5" placeholder="IVA 5%" readonly />
            </div>
            <div class="col-md-6">
              <label for="iva_10" class="form-label">Liquidación del IVA 10%</label>
              <input type="number" class="form-control" id="iva_10" :value="factura.totalIva10" placeholder="IVA 10%" readonly />
            </div>
          </div>
          <div class="row g-3 mt-3">
            <div class="col-md-6">
              <label for="iva_exenta" class="form-label">Liquidación del IVA Exenta</label>
              <input type="number" class="form-control" id="iva_exenta" :value="factura.totalIvaExenta" placeholder="IVA Exenta" readonly />
            </div>
            <div class="col-md-6">
              <label for="total_factura" class="form-label">Total Factura</label>
              <input type="number" class="form-control" id="total_factura" :value="factura.totalFactura" placeholder="Total Factura" readonly />
            </div>
          </div>

          <div class ="d-grid gap-2 mt-4">
            <button type="submit" class="btn btn-success mt-4" >Guardar Factura</button>
          </div>
      </form>
  </div>
</template>

<script>
import Factura from '@/models/Factura';
import Producto from '@/models/Producto';
import AppTable from '@/components/AppTable.vue';
import SimpleRegisterModal from '@/components/SimpleRegisterModal.vue';
import apiService from '@/services/apiService.js';


export default {
  name: 'FacturaView',
  components: {
    AppTable,
    SimpleRegisterModal
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
              id: null,
              descripcion: '',
              cantidad: 0,
              valorUnitario: 0,
              tipoImpuesto: 1,
              iva10: 0,
              iva5: 0,
              exenta: 0,
          },
        showRegisterModal: false,
        fromDeliveryNote: false,
        nuevoProducto: {
            codigo: '',
            descripcion: '',
            valorUnitario: 0,
            tipoImpuesto: 'exenta',
        },
          facturas: [], // Almacenará las facturas cargadas desde el servicio
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
          this.productoData.valorUnitario = producto.valorUnitario || 0;
          this.productoData.tipoImpuesto = producto.tipo_iva;
          this.productoData.id = producto.producto_id || null; 
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
    async autocompletarProveedor() {
      if (!this.factura.ruc) return;
      try {
        const url = `${process.env.VUE_APP_API_BASE_URL}/api/providers/document/${this.factura.ruc}`;
        const response = await apiService.get(url);
        const proveedor = response.data;
        if (proveedor) {
          this.factura.razonSocial = proveedor.nombre;
        } else {
          this.registerModalTitle = "Proveedor no encontrado";
          this.showRegisterModal = true;
        }
      } catch (error) {
        console.error("Error al obtener el proveedor:", error);
        this.registerModalTitle = "Proveedor no encontrado";
        this.showRegisterModal = true;
      }
    },
    async cargarFacturaDesdeParams() {
      const nroDocumento = this.$route.params.id; // Usar el número de documento de la factura
      try {
        const { data: facturaData } = await apiService.get(`${process.env.VUE_APP_API_BASE_URL}/api/purchases/invoices/${nroDocumento}`);
        if (facturaData) {
          // Asignar los datos de la factura utilizando la estructura del endpoint
          this.factura = new Factura(
            facturaData.cabecera.nro_documento,
            facturaData.cabecera.nombre_razon_social,
            facturaData.cabecera.fecha_emision.split('T')[0],
            facturaData.cabecera.timbrado,
            facturaData.cabecera.nro_comprobante,
            facturaData.cabecera.credito_contado.toLowerCase() === 'contado' ? 'contado' : 'credito'
          );
          // Mapear los detalles de la factura a los productos
          this.factura.productos = facturaData.detalles.map(detalle => ({
            id: detalle.producto_id,
            cantidad: detalle.cantidad,
            valorUnitario: detalle.precio_unitario_bruto,
            tipoImpuesto: detalle.tipo_iva === 10.00 ? 'iva10' : (detalle.tipo_iva === 5.00 ? 'iva5' : 'exenta')
          }));
          this.factura.calcularTotales();
        }
      } catch (error) {
        console.error('Error al cargar la factura desde parámetros:', error);
      }
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
        const subtotal = Number(this.productoData.cantidad) * Number(this.productoData.valorUnitario);
        if (this.productoData.tipoImpuesto === 'exenta') {
          this.productoData.exenta = subtotal;
          this.productoData.iva5   = 0;
          this.productoData.iva10  = 0;
        } else if (this.productoData.tipoImpuesto === 'iva5') {
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
          valorUnitario: 0,
          tipoImpuesto: 'iva10',
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
          this.productoEditandoIndex = index; // Indicar que estamos en modo edición
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
              producto_id: Number(producto.id),
              cantidad: Number(producto.cantidad),
              precio_unitario_bruto: Number(producto.valorUnitario),
              descuento: 0.00,
              tipo_iva: Number(producto.tipoImpuesto),
              fecha_vencimiento: producto.fechaVencimiento ? new Date(producto.fechaVencimiento).toISOString() : null
            }))
          };

          // Imprime en consola el objeto que se enviará
          console.log("Request Body:", requestBody);
          // Enviar la petición POST utilizando apiService
          await apiService.post(`${process.env.VUE_APP_API_BASE_URL}/api/purchases/invoices`, requestBody);
          alert('Factura guardada correctamente');
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
      await this.cargarFacturaDesdeParams();
    }
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
          this.fromDeliveryNote = true;  // Se marca que viene de nota de remisión
          this.factura.ruc = queryData.ruc || this.factura.ruc;
          this.factura.razonSocial = queryData.razonSocial || this.factura.razonSocial;

          console.log('Factura después de asignar RUC y Razón Social:', this.factura);

          //Limpia productos existentes y carga los nuevos
          this.factura.productos = [];
          queryData.productos.forEach(producto => {
            this.factura.agregarProducto({
              ...producto,
              valorUnitario: producto.valorUnitario || 0,
              tipoImpuesto: producto.iva || 'exenta',
              id: producto.producto_id,
            });
          });

          this.factura.calcularTotales();
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
