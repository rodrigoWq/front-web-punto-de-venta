<template>
  <div class="container mt-5">
    <h1 class="text-center">Nota de Remisión</h1>
    <form @submit.prevent="guardarNotaRemision">
      <!-- Encabezado -->
      <div class="row g-3 mb-3">
        <div class="col-md-4">
          <label for="nro_documento" class="form-label">RUC</label>
          <input type="text" v-model="notaData.nro_documento" class="form-control" placeholder="RUC del destinatario" @blur="autocompletarProveedor" @keydown.enter.prevent>
        </div>
        <div class="col-md-4">
          <label for="nombre_razon_social" class="form-label">Razón Social</label>
          <input type="text" v-model="notaData.nombre_razon_social" class="form-control" placeholder="Razón Social">
        </div>
        <div class="col-md-4">
          <label for="timbrado" class="form-label">Timbrado</label>
          <input type="text" v-model="notaData.timbrado" class="form-control" placeholder="Número de timbrado">
        </div>
      </div>
      <div class="row g-3 mb-3">
        <div class="col-md-6">
          <label for="nro_nota_remision" class="form-label">N° de Nota de Remisión</label>
          <input type="text" v-model="notaData.nro_nota_remision" class="form-control" placeholder="Número de Nota de Remisión">
        </div>
        <div class="col-md-6">
          <label for="fecha_emision" class="form-label">Fecha de Emisión</label>
          <input type="date" v-model="notaData.fecha_emision" class="form-control">
        </div>
      </div>


      <!-- Datos de la Mercadería -->
      <h3>Datos de la Mercadería</h3>
      <div class="row g-3 mb-3">
        <div class="col-md-2">
          <label class="form-label">Código de Barra</label>
          <input type="text" v-model="productoData.codigo_barras" class="form-control" placeholder="Código de Barra" @blur="autocompletarProducto" @keydown.enter.prevent>
        </div>
        <div class="col-md-2">
          <label class="form-label">Cantidad</label>
          <input type="number" v-model="productoData.cantidad" class="form-control" placeholder="Cantidad">
        </div>
        <div class="col-md-2">
          <label class="form-label">Unidad de Medida</label>
          <input type="text" v-model="productoData.unidad_medida" class="form-control" placeholder="Unidad de medida">
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
         <button type="button" class="btn btn-secondary" @click="agregarProducto">
            Agregar Producto
          </button>
      </div>

      <SimpleRegisterModal
        :showModal="showRegisterModal"
        :title="registerModalTitle"
        @close="showRegisterModal = false"
        @register="irARegistro" />

      <!-- Tabla de productos agregados -->
      <h3>Productos Agregados</h3>
      <AppTable :headers="['Código de Barra','Cantidad','Unidad de Medida','Descripción','Acciones']">
        <tr v-for="(producto, index) in productos" :key="index">
          <td><input v-if="productoEditandoIndex === index" v-model="productoData.codigo_barras" class="form-control form-control-sm" /><span v-else>{{ producto.codigo_barras }}</span></td>
          <td><input v-if="productoEditandoIndex === index" v-model.number="productoData.cantidad" type="number" class="form-control form-control-sm" /><span v-else>{{ producto.cantidad }}</span></td>
          <td><input v-if="productoEditandoIndex === index" v-model="productoData.unidad_medida" class="form-control form-control-sm" /><span v-else>{{ producto.unidad_medida }}</span></td>
          <td><input v-if="productoEditandoIndex === index" v-model="productoData.descripcion" class="form-control form-control-sm" /><span v-else>{{ producto.descripcion }}</span></td>
          <td>
            <template v-if="productoEditandoIndex === index">
              <button type="button" class="btn btn-success btn-sm me-1" @click="guardarEdicionProducto">Guardar</button>
              <button type="button" class="btn btn-warning btn-sm me-1" @click="cancelarEdicion">Cancelar</button>
            </template>
            <template v-else>
              <button type="button" class="btn btn-primary btn-sm me-1" @click="editarProducto(index)">Editar</button>
              <button type="button" class="btn btn-danger btn-sm" @click="eliminarProducto(index)">Eliminar</button>
            </template>
          </td>

        </tr>
      </AppTable>

      <div class="d-grid gap-2 mt-4">
        <button type="submit" class="btn btn-success">Guardar Nota de Remisión </button>
      </div>
    </form>
  </div>
</template>
  
<script>

import AppTable from '@/components/AppTable.vue';
import apiService from '@/services/apiService.js';
import SimpleRegisterModal from '@/components/SimpleRegisterModal.vue';

export default {
  name: 'NotaDeRemision',
  components: {
    AppTable,
    SimpleRegisterModal
  
  },
  props: ['id'], // Recibe el id como prop
  data() {
    return {
      notaData: {
        nro_nota_remision: '',
        timbrado: '',
        fecha_emision: '',
        tipo_moneda: 'PYG',
        condicionVenta: 'Contado', // se usará en "credito_contado"
        ruc: '',
        nombre_razon_social: '',
        direccion: '',
        pendiente: false,
        
      },
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
      registerModalTitle: '',
      nuevoProducto: {
        codigo: '',
        descripcion: '',
        cantidad: 0,
        unidadMedida: '',
        fechaVencimiento: '',
      },
      productos: [],
      notasDeRemision: [],
      productoEditandoIndex: null,
      originalProducto: null
    };
  },
  methods: {
    async autocompletarProducto() {
      if (!this.productoData.codigo_barras) return;
      try {
        const url = `${process.env.VUE_APP_API_BASE_URL}/api/products/barcode/${this.productoData.codigo_barras}`;
        const response = await apiService.get(url);
        const producto = response.data;
        if (producto) {
          this.productoData.descripcion = producto.descripcion;
          this.productoData.unidad_medida = producto.unidad_medida_nombre;
          this.productoData.fechaVencimiento = producto.fecha_vencimiento;
          this.productoData.id = producto.producto_id || null; 
        } else {
          // Si no se encuentra, precargar el código en el modal de registro
          this.nuevoProducto.codigo = this.productoData.codigo;
          this.showRegisterModal = true;
          this.registerModalTitle = "Producto no encontrado"
        }
      } catch (error) {
        console.error("Error al obtener el producto:", error);
        this.nuevoProducto.codigo = this.productoData.codigo;
        this.registerModalTitle = "Producto no encontrado";
        this.showRegisterModal = true;
      }
    },
    onProductRegistered(newProduct) {
      // Aquí asignas el producto recién creado al 'productoData' actual
      this.productoData = { ...newProduct };
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
    async cargarNotaDeRemision(id) {
      try {
        const { data: nota } = await apiService.get(`${process.env.VUE_APP_API_BASE_URL}/api/purchases/delivery-notes/${id}`);
        if (nota) {
          const cabecera = nota.cabecera;
          this.notaData = {
            nro_nota_remision: cabecera.nro_nota_remision,
            timbrado: cabecera.timbrado,
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
            descripcion: detalle.descripcion,
            iva: detalle.iva,
            fechaVencimiento: detalle.fecha_vencimiento
          }));
        }
      } catch (error) {
        console.error('Error al cargar la nota de remisión:', error);
      }
    },
    async autocompletarProveedor() {
      if (!this.notaData.nro_documento) return;
      try {
        const url = `${process.env.VUE_APP_API_BASE_URL}/api/providers/document/${this.notaData.nro_documento}`;
        const response = await apiService.get(url);
        const proveedor = response.data;
        if (proveedor) {
          this.notaData.nombre_razon_social = proveedor.nombre;
        } else {
          // Si no se encuentra el proveedor, asignar título y mostrar el modal
          this.registerModalTitle = "Proveedor no encontrado";
          this.showRegisterModal = true;
        }
      } catch (error) {
        console.error("Error al obtener el proveedor:", error);
        this.showRegisterModal = true;
        this.registerModalTitle = "Proveedor no encontrado";
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
            nro_documento: this.notaData.nro_documento,
            nombre_razon_social: this.notaData.nombre_rason_social || this.notaData.nombre_rason_social,  // O ajustar según convenga
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
        this.$router.push({ name: 'RegistrarProducto' });
      } else if (this.registerModalTitle === "Proveedor no encontrado") {
        // Navega a la página de registro de proveedor
        this.$router.push({ name: 'RegistrarProveedor' });
      }
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
    resetNota() {
      this.notaData = {
      nro_nota_remision: '',
      timbrado: '',
      fecha_emision: '',
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
  .modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5); /* Fondo semitransparente */
  z-index: 1040;
}

</style>
  