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
                  <input type="text" v-model="productoData.codigo" class="form-control" placeholder="Código">
              </div>
              <div class="col-md-3">
                  <label class="form-label">Descripción</label>
                  <input type="text" v-model="productoData.descripcion" class="form-control" placeholder="Descripción">
              </div>
              <div class="col-md-2">
                  <label class="form-label">Cantidad</label>
                  <input type="number" v-model="productoData.cantidad" class="form-control" placeholder="Cantidad">
              </div>
              <div class="col-md-2">
                  <label class="form-label">Valor Unitario</label>
                  <input type="number" v-model="productoData.valorUnitario" class="form-control" placeholder="Valor Unitario">
              </div>
              <div class="col-md-3">
                  <label class="form-label">Tipo de Impuesto</label>
                  <select v-model="productoData.tipoImpuesto" class="form-control">
                      <option value="exenta">Exenta</option>
                      <option value="iva5">IVA 5%</option>
                      <option value="iva10">IVA 10%</option>
                  </select>
              </div>
          </div>
          <div class="d-grid gap-2 mb-3">
            <button type="button" class="btn btn-secondary" @click="agregarProducto">Agregar Producto</button>
          </div>

          <!-- Productos Agregados -->
          <h3>Productos Agregados</h3>
          <table class="table table-bordered mt-3">
              <thead>
                  <tr>
                      <th>Código</th>
                      <th>Descripción</th>
                      <th>Cantidad</th>
                      <th>Valor Unitario</th>
                      <th>Exenta</th>
                      <th>5%</th>
                      <th>10%</th>
                      <th>Acciones</th>
                  </tr>
              </thead>
              <tbody>
                  <tr v-for="(producto, index) in factura.productos" :key="index">
                      <td>{{ producto.codigo }}</td>
                      <td>{{ producto.descripcion }}</td>
                      <td>{{ producto.cantidad }}</td>
                      <td>{{ producto.valorUnitario }}</td>
                      <!-- Conditional content within each column to maintain alignment -->
                      <td>{{ producto.tipoImpuesto === 'exenta' ? producto.totalProducto : '' }}</td>
                      <td>{{ producto.tipoImpuesto === 'iva5' ? producto.totalProducto : '' }}</td>
                      <td>{{ producto.tipoImpuesto === 'iva10' ? producto.totalProducto : '' }}</td>
                      <td>
                          <button class="btn btn-danger" @click="eliminarProducto(index)">Eliminar</button>
                      </td>
                  </tr>
              </tbody>
          </table>
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

export default {
  name: 'FacturaView',
  data() {
      return {
          factura: new Factura(), // Instancia de Factura
          productoData: { // Datos temporales del producto
              codigo: '',
              descripcion: '',
              cantidad: 0,
              valorUnitario: 0,
              tipoImpuesto: 'exenta',
          },
          facturas: [] // Almacenará las facturas cargadas desde el servicio
      };
  },
  methods: {
      async cargarFacturas() {
          try {
              this.facturas = await FacturaService.obtenerFacturas(); // Carga las facturas iniciales
          } catch (error) {
              console.error('Error al cargar las facturas:', error);
          }
      },
      cargarFacturaDesdeParams() {
        if (this.$route.params.facturaData) {
          console.log("Loaded facturaData from params:", this.$route.params.facturaData); // Debug line
          const facturaData = this.$route.params.facturaData;
          this.factura = new Factura(
            facturaData.ruc,
            facturaData.razonSocial,
            facturaData.fechaEmision,
            facturaData.timbrado,
            facturaData.nroFactura,
            facturaData.condicionVenta
          );
          this.factura.productos = facturaData.productos || [];
          this.factura.calcularTotales(); // Calcula el total de la factura
        }
      },
      agregarProducto() {
          const producto = new Producto(this.productoData); // Crear una instancia de Producto
          this.factura.agregarProducto(producto); // Agregar producto a la factura
          this.limpiarCamposProducto();
      },
      eliminarProducto(index) {
          this.factura.eliminarProducto(index); // Eliminar producto de la factura
      },
      limpiarCamposProducto() {
          this.productoData = { codigo: '', descripcion: '', cantidad: 0, valorUnitario: 0, tipoImpuesto: 'exenta' };
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
      await this.cargarFacturas(); // Cargar las facturas al montar el componente
      this.cargarFacturaDesdeParams(); // Cargar datos de factura desde los parámetros si existen
  },
  watch: {
    '$route.params.facturaData': {
      handler(newVal) {
        if (newVal) {
          this.cargarFacturaDesdeParams(); // Reload data if params change
        }
      },
      immediate: true
    }
  }
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
</style>
