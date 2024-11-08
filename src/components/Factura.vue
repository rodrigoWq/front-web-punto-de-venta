<template>
    <div class="container mt-5">
      <h1 class="text-center">Formulario de Carga de Factura</h1>
      <form @submit.prevent="guardarFactura">
        <!-- Información de factura -->
        <div class="row g-3 mb-3">
          <div class="col-md-6">
            <label for="ruc" class="form-label">RUC</label>
            <input type="text" v-model="facturaData.ruc" class="form-control" placeholder="RUC del proveedor">
          </div>
          <div class="col-md-6">
            <label for="razon_social" class="form-label">Nombre o Razón Social</label>
            <input type="text" v-model="facturaData.razonSocial" class="form-control" placeholder="Nombre o razón social">
          </div>
        </div>
        <!-- Información adicional -->
        <div class="row g-3 mb-3">
          <div class="col-md-6">
            <label for="fecha_emision" class="form-label">Fecha de Emisión</label>
            <input type="date" v-model="facturaData.fechaEmision" class="form-control">
          </div>
          <div class="col-md-6">
            <label for="timbrado" class="form-label">Timbrado</label>
            <input type="text" v-model="facturaData.timbrado" class="form-control" placeholder="Número de timbrado">
          </div>
        </div>
        <div class="row g-3 mb-3">
          <div class="col-md-6">
            <label for="nro_factura" class="form-label">N° de Factura</label>
            <input type="text" v-model="facturaData.nroFactura" class="form-control" placeholder="Número de factura">
          </div>
          <div class="col-md-6">
            <label for="condicion_venta" class="form-label">Condición de Venta</label>
            <select v-model="facturaData.condicionVenta" class="form-control">
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
            <input type="text" v-model="producto.codigo" class="form-control" placeholder="Código">
          </div>
          <div class="col-md-3">
            <label class="form-label">Descripción</label>
            <input type="text" v-model="producto.descripcion" class="form-control" placeholder="Descripción">
          </div>
          <div class="col-md-2">
            <label class="form-label">Cantidad</label>
            <input type="number" v-model="producto.cantidad" class="form-control" placeholder="Cantidad">
          </div>
          <div class="col-md-2">
            <label class="form-label">Valor Unitario</label>
            <input type="number" v-model="producto.valorUnitario" class="form-control" placeholder="Valor Unitario">
          </div>
          <div class="col-md-3">
            <label class="form-label">Tipo de Impuesto</label>
            <select v-model="producto.tipoImpuesto" class="form-control">
              <option value="exenta">Exenta</option>
              <option value="iva5">IVA 5%</option>
              <option value="iva10">IVA 10%</option>
            </select>
          </div>
        </div>
        <button type="button" class="btn btn-secondary" @click="agregarProducto">Agregar Producto</button>
  
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
            <tr v-for="(producto, index) in productos" :key="index">
              <td>{{ producto.codigo }}</td>
              <td>{{ producto.descripcion }}</td>
              <td>{{ producto.cantidad }}</td>
              <td>{{ producto.valorUnitario }}</td>
              <td v-if="producto.tipoImpuesto === 'exenta'">{{ producto.totalProducto }}</td>
              <td v-if="producto.tipoImpuesto === 'iva5'">{{ producto.totalProducto }}</td>
              <td v-if="producto.tipoImpuesto === 'iva10'">{{ producto.totalProducto }}</td>
              <td>
                <button class="btn btn-danger" @click="eliminarProducto(index)">Eliminar</button>
              </td>
            </tr>
          </tbody>
        </table>
        <!-- Totales -->
        <div class="row">
          <div class="col-md-4">
            <label>Total Factura:</label>
            <span>{{ totalFactura }}</span>
          </div>
          <div class="col-md-4">
            <label>IVA 5%:</label>
            <span>{{ totalIva5 }}</span>
          </div>
          <div class="col-md-4">
            <label>IVA 10%:</label>
            <span>{{ totalIva10 }}</span>
          </div>
        </div>
        <button type="submit" class="btn btn-success mt-4">Guardar Factura</button>
      </form>
    </div>
</template>
  
<script>
  export default {
    name: 'FacturaView',
    data() {
      return {
        facturaData: {
          ruc: '',
          razonSocial: '',
          fechaEmision: '',
          timbrado: '',
          nroFactura: '',
          condicionVenta: '',
          productos: [],
        },
        producto: {
          codigo: '',
          descripcion: '',
          cantidad: 0,
          valorUnitario: 0,
          tipoImpuesto: 'exenta',
        },
        productos: [],
        totalFactura: 0,
        totalIva5: 0,
        totalIva10: 0,
        totalIvaExenta: 0,
      };
    },
    methods: {
      agregarProducto() {
        const nuevoProducto = { ...this.producto, totalProducto: this.producto.cantidad * this.producto.valorUnitario };
        this.productos.push(nuevoProducto);
        this.calcularTotales();
        this.limpiarCamposProducto();
      },
      eliminarProducto(index) {
        this.productos.splice(index, 1);
        this.calcularTotales();
      },
      calcularTotales() {
        this.totalFactura = this.productos.reduce((acc, prod) => acc + prod.totalProducto, 0);
        this.totalIva5 = this.productos.reduce((acc, prod) => acc + (prod.tipoImpuesto === 'iva5' ? prod.totalProducto : 0), 0);
        this.totalIva10 = this.productos.reduce((acc, prod) => acc + (prod.tipoImpuesto === 'iva10' ? prod.totalProducto : 0), 0);
        this.totalIvaExenta = this.productos.reduce((acc, prod) => acc + (prod.tipoImpuesto === 'exenta' ? prod.totalProducto : 0), 0);
      },
      limpiarCamposProducto() {
        this.producto = { codigo: '', descripcion: '', cantidad: 0, valorUnitario: 0, tipoImpuesto: 'exenta' };
      },
      guardarFactura() {
        alert('Factura guardada correctamente');
      }
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
  