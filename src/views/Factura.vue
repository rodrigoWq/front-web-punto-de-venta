<template>
  <div class="container mt-5">
      <h1 class="text-center">Formulario de Carga de Factura</h1>
      <form @submit.prevent="guardarFactura">
          <!-- Información de factura -->
          <div class="row g-3 mb-3">
              <div class="col-md-6">
                  <label for="ruc" class="form-label">RUC</label>
                  <input type="text" v-model="factura.ruc" class="form-control" placeholder="RUC del proveedor">
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
            <option value="exenta">Exenta</option>
            <option value="iva5">IVA 5%</option>
            <option value="iva10">IVA 10%</option>
          </select>
        </div>
      </div>

      <div class="d-grid gap-2 mb-3">
        <button type="button" class="btn btn-secondary" @click="agregarProducto">
          Agregar Producto
        </button>
      </div>

      <!-- Modal para registrar un producto -->
      <RegistrarProductoModal
        :showModal="showRegisterModal"
        :initialCode="productoData.codigo"
        @product-registered="onProductRegistered"
        @close="closeRegisterModal"
      />


      <!-- Productos Agregados -->
      <h3>Productos Agregados</h3>
      <AppTable :headers="['Código', 'Descripción', 'Cantidad', 'Valor Unitario', 'Exenta', '5%', '10%', 'Acciones']">
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
            <input v-if="productoEditandoIndex === index" v-model.number="productoData.exenta" type="number" class="form-control form-control-sm" />
            <span v-else>{{ producto.exenta }}</span>
          </td>
          <td>
            <input v-if="productoEditandoIndex === index" v-model.number="productoData.iva5" type="number" class="form-control form-control-sm" />
            <span v-else>{{ producto.iva5 }}</span>
          </td>
          <td>
            <input v-if="productoEditandoIndex === index" v-model.number="productoData.iva10" type="number" class="form-control form-control-sm" />
            <span v-else>{{ producto.iva10 }}</span>
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
            <button type="submit" class="btn btn-success mt-4">Guardar Factura</button>
          </div>
      </form>
  </div>
</template>

<script>
import Factura from '@/models/Factura';
import Producto from '@/models/Producto';
import FacturaService from '@/services/FacturaServiceMock';
import AppTable from '@/components/AppTable.vue';
import RegistrarProductoModal from '@/components/RegistrarProductoModal.vue';


export default {
  name: 'FacturaView',
  components: {
    AppTable,
    RegistrarProductoModal,
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
              descripcion: '',
              cantidad: 0,
              valorUnitario: 0,
              tipoImpuesto: 'iva10',
              iva10: 0,
              iva5: 0,
              exenta: 0,
          },
        showRegisterModal: false,
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
            const producto = await FacturaService.obtenerProductoPorCodigo(this.productoData.codigo);
            if (producto) {
                this.productoData.descripcion = producto.descripcion;
                this.productoData.valorUnitario = producto.valorUnitario;
                this.productoData.tipoImpuesto = producto.tipoImpuesto;
            } else {
                this.nuevoProducto.codigo = this.productoData.codigo; // Autocompletar el código en el modal
                this.showRegisterModal = true; // Mostrar modal si no se encuentra el producto

            }
       },
      async cargarFacturaDesdeParams() {
          const id = Number(this.$route.params.id);
          try {
              // Cargar todas las facturas si no están cargadas
              if (this.facturas.length === 0) {
                  this.facturas = await FacturaService.obtenerFacturas();
              }
              // Buscar la factura con el id proporcionado
              const facturaData = this.facturas.find(factura => factura.id === id);
              if (facturaData) {
                  // Asignar los datos de la factura al modelo `factura`
                  this.factura = new Factura(
                      facturaData.ruc,
                      facturaData.razonSocial,
                      facturaData.fechaEmision,
                      facturaData.timbrado,
                      facturaData.nroFactura,
                      facturaData.condicionVenta
                  );
                  this.factura.productos = facturaData.productos || [];
                  this.factura.calcularTotales();
              }
          } catch (error) {
              console.error('Error al cargar la factura desde parámetros:', error);
          }
      },
      onProductRegistered(newProduct) {
        // Simulamos la "lógica" de guardado en DB o servicio,
        // pero por ahora solo lo agregamos al array de productos de la factura
        this.productoData = { ...newProduct };
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
        FacturaService.guardarProducto(this.nuevoProducto); // Implementa esta función en el servicio mock
        //this.productoData = { ...this.nuevoProducto, cantidad: 1 }; // Copiar datos del nuevo producto al formulario principal
        this.closeRegisterModal(); // Cerrar el modal
       },
        agregarProducto() {
          this.calcularImpuestoPorTipo();
          const producto = new Producto(this.productoData);
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
          // Guardar la factura utilizando el servicio
          this.facturas = await FacturaService.guardarFactura(this.factura);
          alert('Factura guardada correctamente');
          this.factura = new Factura(); // Reiniciar la factura después de guardarla
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
          this.factura.ruc = queryData.ruc || this.factura.ruc;
          this.factura.razonSocial = queryData.razonSocial || this.factura.razonSocial;

          console.log('Factura después de asignar RUC y Razón Social:', this.factura);

          //Limpia productos existentes y carga los nuevos
          this.factura.productos = [];
          queryData.productos.forEach(producto => {
            this.factura.agregarProducto({
              ...producto,
              valorUnitario: producto.valorUnitario || 0,
              tipoImpuesto: producto.tipoImpuesto || 'exenta',
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
