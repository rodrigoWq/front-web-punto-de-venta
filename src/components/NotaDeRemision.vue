<template>
  <div class="container mt-5">
    <h1 class="text-center">Nota de Remisión</h1>
    <form @submit.prevent="guardarNotaRemision">
      <!-- Encabezado -->
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
          <input type="text" v-model="productoData.codigo" class="form-control" placeholder="Código de Barra">
        </div>
        <div class="col-md-2">
          <label class="form-label">Cantidad</label>
          <input type="number" v-model="productoData.cantidad" class="form-control" placeholder="Cantidad">
        </div>
        <div class="col-md-2">
          <label class="form-label">Unidad de Medida</label>
          <input type="text" v-model="productoData.unidadMedida" class="form-control" placeholder="Unidad de medida">
        </div>
        <div class="col-md-4">
          <label class="form-label">Descripción</label>
          <input type="text" v-model="productoData.descripcion" class="form-control" placeholder="Descripción de la mercadería">
        </div>
        <div class="col-md-2">
          <label class="form-label">Fecha de Vencimiento</label>
          <input type="date" v-model="productoData.fechaVencimiento" class="form-control">
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
            <td>
              <input
                v-if="productoEditandoIndex === index"
                v-model="productoData.codigo"
                class="form-control form-control-sm"
              />
              <span v-else>{{ producto.codigo }}</span>
            </td>
            <td>
              <input
                v-if="productoEditandoIndex === index"
                v-model.number="productoData.cantidad"
                type="number"
                class="form-control form-control-sm"
              />
              <span v-else>{{ producto.cantidad }}</span>
            </td>
            <td>
              <input
                v-if="productoEditandoIndex === index"
                v-model="productoData.unidadMedida"
                class="form-control form-control-sm"
              />
              <span v-else>{{ producto.unidadMedida }}</span>
            </td>
            <td>
              <input
                v-if="productoEditandoIndex === index"
                v-model="productoData.descripcion"
                class="form-control form-control-sm"
              />
              <span v-else>{{ producto.descripcion }}</span>
            </td>
            <td>
              <button
                v-if="productoEditandoIndex === index"
                class="btn btn-success btn-sm me-1"
                @click="guardarEdicionProducto"
              >
                Guardar
              </button>
              <button
                v-else
                class="btn btn-primary btn-sm me-1"
                @click="editarProducto(index)"
              >
                Editar
              </button>
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
import NotaDeRemisionService from '@/services/NotaDeRemisionServiceMock';

export default {
  name: 'NotaDeRemision',
  props: ['id'], // Recibe el id como prop
  data() {
    return {
      notaData: {
        timbrado: '',
        razonSocial: '',
        ruc: '',
        nroNotaRemision: '',
        fechaEmision: ''
      },
      productoData: {
        codigo: '',
        descripcion: '',
        cantidad: 0,
        unidadMedida: '',
        fechaVencimiento: ''
      },
      productos: [],
      notasDeRemision: [] // Lista de notas cargadas si es necesario
    };
  },
  methods: {
    async cargarNotaDeRemision(id) {
      try {
        const nota = await NotaDeRemisionService.obtenerNotaPorId(id);
        if (nota) {
          // Cargar los datos de la nota en notaData y productos
          this.notaData = {
            timbrado: nota.timbrado,
            razonSocial: nota.razonSocial,
            ruc: nota.ruc,
            nroNotaRemision: nota.nroNotaRemision,
            fechaEmision: nota.fechaEmision
          };
          this.productos = nota.productos || []; // Cargar productos si existen
        }
      } catch (error) {
        console.error('Error al cargar la nota de remisión:', error);
      }
    },
    async guardarNotaRemision() {
      try {
        // Crear una nueva nota de remisión incluyendo los productos
        const nuevaNota = {
          ...this.notaData,
          productos: this.productos // Añade los productos actuales a la nota
        };
        const notasActualizadas = await NotaDeRemisionService.guardarNotaRemision(nuevaNota);
        this.notasDeRemision = notasActualizadas;
        alert('Nota de remisión guardada correctamente');
        this.resetNota(); // Reinicia los campos después de guardar
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
    editarProducto(index) {
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
    resetNota() {
      this.notaData = {
        timbrado: '',
        razonSocial: '',
        ruc: '',
        nroNotaRemision: '',
        fechaEmision: ''
      };
      this.productos = [];
    }
  },
  async mounted() {
    // Si hay un id, carga los datos de la nota de remisión específica
    if (this.id) {
      await this.cargarNotaDeRemision(this.id);
    }
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
  