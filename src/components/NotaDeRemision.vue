<template>
    <div class="container mt-5">
      <h1 class="text-center">Nota de Remisión</h1>
  
      <!-- Encabezado -->
      <form @submit.prevent="guardarNotaRemision">
        <div class="row g-3 mb-3">
          <div class="col-md-4">
            <label for="timbrado" class="form-label">Timbrado</label>
            <input type="text" v-model="notaData.timbrado" class="form-control" placeholder="Número de timbrado">
          </div>
          <div class="col-md-4">
            <label for="razon_social" class="form-label">Razón Social</label>
            <input type="text" v-model="notaData.razonSocial" class="form-control" placeholder="Razón Social">
          </div>
          <div class="col-md-4">
            <label for="ruc" class="form-label">RUC</label>
            <input type="text" v-model="notaData.ruc" class="form-control" placeholder="RUC del destinatario">
          </div>
        </div>
        <div class="row g-3 mb-3">
          <div class="col-md-6">
            <label for="nro_nota_remision" class="form-label">N° de Nota de Remisión</label>
            <input type="text" v-model="notaData.nroNotaRemision" class="form-control" placeholder="Número de Nota de Remisión">
          </div>
          <div class="col-md-6">
            <label for="fecha_emision" class="form-label">Fecha de Emisión</label>
            <input type="date" v-model="notaData.fechaEmision" class="form-control">
          </div>
        </div>
  
        <!-- Datos de la Mercadería -->
        <h3>Datos de la Mercadería</h3>
        <div class="row g-3 mb-3">
          <div class="col-md-2">
            <label class="form-label">Código de Barra</label>
            <input type="text" v-model="producto.codigo" class="form-control" placeholder="Código de Barra">
          </div>
          <div class="col-md-2">
            <label class="form-label">Cantidad</label>
            <input type="number" v-model="producto.cantidad" class="form-control" placeholder="Cantidad">
          </div>
          <div class="col-md-2">
            <label class="form-label">Unidad de Medida</label>
            <input type="text" v-model="producto.unidadMedida" class="form-control" placeholder="Unidad de medida">
          </div>
          <div class="col-md-4">
            <label class="form-label">Descripción</label>
            <input type="text" v-model="producto.descripcion" class="form-control" placeholder="Descripción de la mercadería">
          </div>
          <div class="col-md-2">
            <label class="form-label">Fecha de Vencimiento</label>
            <input type="date" v-model="producto.fechaVencimiento" class="form-control">
          </div>
        </div>
        <div class="d-grid gap-2 mb-3">
          <button type="button" class="btn btn-secondary" @click="agregarProducto">Agregar Producto</button>
        </div>
  
        <!-- Tabla de productos agregados -->
        <h3>Productos Agregados</h3>
        <table class="table table-bordered mt-3">
          <thead>
            <tr>
              <th>Código de Barra</th>
              <th>Cantidad</th>
              <th>Unidad de Medida</th>
              <th>Descripción</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(producto, index) in productos" :key="index">
              <td>{{ producto.codigo }}</td>
              <td>{{ producto.cantidad }}</td>
              <td>{{ producto.unidadMedida }}</td>
              <td>{{ producto.descripcion }}</td>
              <td>
                <button class="btn btn-danger btn-sm" @click="eliminarProducto(index)">Eliminar</button>
              </td>
            </tr>
          </tbody>
        </table>
  
        <div class="d-grid gap-2 mt-4">
          <button type="submit" class="btn btn-success">Guardar Nota de Remisión</button>
        </div>
      </form>
    </div>
</template>
  
<script>
import NotaDeRemision from '@/models/NotaDeRemision';
import Producto from '@/models/Producto';
import ComprobanteServiceMock from '@/services/ComprobanteServiceMock';

export default {
  name: 'NotaDeRemisionView',
  data() {
      return {
          nota: new NotaDeRemision(), // Instancia de Nota de Remisión
          productoData: {
              codigo: '',
              descripcion: '',
              cantidad: 0,
              unidadMedida: '',
              fechaVencimiento: '',
          },
          notas: [] // Almacenará las notas de remisión
      };
  },
  methods: {
      async cargarNotaDesdeParams() {
          if (this.$route.params.notaData) {
              const notaData = this.$route.params.notaData;
              this.nota = new NotaDeRemision({
                  ruc: notaData.ruc,
                  razonSocial: notaData.razonSocial,
                  fechaEmision: notaData.fechaEmision,
                  timbrado: notaData.timbrado,
                  nroNotaRemision: notaData.nroNotaRemision,
                  productos: notaData.productos || []
              });
          }
      },
      agregarProducto() {
          const producto = new Producto(this.productoData);
          this.nota.agregarProducto(producto);
          this.limpiarCamposProducto();
      },
      eliminarProducto(index) {
          this.nota.eliminarProducto(index);
      },
      limpiarCamposProducto() {
          this.productoData = { codigo: '', descripcion: '', cantidad: 0, unidadMedida: '', fechaVencimiento: '' };
      },
      async guardarNotaRemision() {
          try {
              this.notas = await ComprobanteServiceMock.guardarComprobante(this.nota);
              alert('Nota de remisión guardada correctamente');
              this.nota = new NotaDeRemision();
          } catch (error) {
              console.error('Error al guardar la nota de remisión:', error);
          }
      }
  },
  async mounted() {
      await this.cargarNotaDesdeParams(); // Cargar datos de nota desde los parámetros si existen
  }
};
</script>



  
<style scoped>
  /* Estilos generales */
  body {
    background-color: #f8f9fa;
    font-family: Arial, sans-serif;
  }
  h1 {
    color: #343a40;
    font-weight: bold;
  }
  .container {
    background-color: #ffffff;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  .form-label {
    font-weight: bold;
    color: #495057;
  }
  h3 {
    color: #495057;
    border-bottom: 2px solid #6c757d;
    padding-bottom: 5px;
    margin-bottom: 20px;
  }
  input[type="text"],
  input[type="date"],
  input[type="number"] {
    border-radius: 5px;
    border: 1px solid #ced4da;
  }
</style>
  