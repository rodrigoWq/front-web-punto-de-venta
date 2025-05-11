<template>
  <div id="pantalla-inicio">
    <!-- Navegación (sin cambios) -->
    <AppNavbar />
    <!-- Contenido Principal -->
    <div class="container mt-4 flex-grow-1">
      <!-- Formulario de Producto -->
      <div class="card p-4 mb-4">
        <div class="row g-3">
          <div class="col">
            <label for="productCode" class="form-label">Código del producto</label>
            <div class="input-group">
              <input type="text" class="form-control" v-model="productCode" placeholder="Ingresa el código" />
              <button type="button" class="btn btn-success" @click="agregarProducto">
                <i class="bi bi-plus"></i>
              </button>
            </div>
          </div>
          <div class="col">
            <label for="productQuantity" class="form-label">Cantidad</label>
            <input type="number" class="form-control" v-model="productQuantity" value="1" />
          </div>
          <div class="col">
            <label for="rucCliente" class="form-label">RUC / CI</label>
            <div class="input-group">
              <input type="text" class="form-control" v-model="rucCliente" placeholder="Ingresa el RUC/CI del cliente"  @blur="verificarRUC"  />
            </div>
          </div>
        </div>
      </div>
  
      <!-- Tabla de Productos -->
      <div class="table-container">
        <AppTable :headers="['No. de Producto', 'Código', 'Nombre', 'Cantidad', 'Unidad de Medida', 'Precio Unitario', 'Acciones']">
          <tr v-for="(producto, index) in productosPaginados" :key="index">
            <td>{{ ((paginaActual - 1) * itemsPorPagina) + (index + 1) }}</td>
            <td>{{ producto.codigo }}</td>
            <td>{{ producto.nombre }}</td>
            <td>{{ producto.cantidad }}</td>
            <td>{{ producto.unidad_medida }}</td>
            <td>{{ producto.precio }}</td>
            <td>
              <button type="button" class="btn btn-danger btn-sm" @click="eliminarProducto(index)">
                <i class="bi bi-trash"></i>
              </button>
            </td>
          </tr>
        </AppTable>
        <AppPagination :currentPage="paginaActual" :totalPages="totalPaginas" @page-changed="cambiarPagina" />
      </div>
    </div>

      <!-- Sección de Total y Acciones (justo por encima del footer real) -->
    <div class="total-footer-section">
      <h4>
        Total: <span>{{ totalAmount }}</span>
      </h4> 
      <!-- Reemplazo en la sección de Total y Acciones -->
      <div class="button-container">
        <button type="button" class="btn btn-warning" @click="ponerVentaEnEspera">Poner Venta en Espera</button>
        <button type="button" class="btn btn-danger" @click="cancelarVenta">Cancelar Venta</button>
        <button type="button" class="btn btn-success" @click="confirmarVenta">Confirmar Venta</button>
      </div>

    </div>

    <!-- Footer Fijo al Final -->
    <div class="footer d-flex w-100 align-items-center">
      <div class="flex-grow-1 text-center">
        Cajero en turno: Juan Pérez | Hora: 10:45 AM
      </div>
      <button type="button" class="btn btn-primary ms-auto">
        Reimprimir último ticket
      </button>
    </div>

    <ModalCliente v-if="showClienteModal" @close="showClienteModal = false" />



  </div>
</template>

<script>

import AppTable from '../components/AppTable.vue';
import AppNavbar from '../components/AppNavbar.vue';
import AppPagination from '../components/AppPagination.vue';
import apiService from '../services/apiService.js';
import ModalCliente from '../components/ClienteModal.vue';


export default {
  name: "PantallaInicio",
  components: {
    AppTable,
    AppNavbar,
    AppPagination,
    ModalCliente,
  },
  data() {
    return {
      productCode: '',
      productQuantity: 1,
      rucCliente: '',
      cabecera: {
        referencia: '',
        observaciones: '',
        tipo_entrega: 'domicilio'
      },
      productos: [],
      paginaActual: 1,
      itemsPorPagina: 5,
      showClienteModal: false
    };
  },
  computed: {
    totalAmount() {
      return this.productos.reduce((acc, producto) => {
        return acc + producto.cantidad * producto.precio;
      }, 0).toFixed(2);
    },
    productosPaginados() {
    const start = (this.paginaActual - 1) * this.itemsPorPagina;
    const end = start + this.itemsPorPagina;
    return this.productos.slice(start, end);
    },
    totalPaginas() {
      return Math.ceil(this.productos.length / this.itemsPorPagina);
    }
  },
  methods: {
    async agregarProducto() {
      if (!this.productCode) {
        alert("Por favor, ingresa un código de producto");
        return;
      }
      try {
        // Se usa el método GET del servicio, pasando el parámetro 'codigo_barras'
        const url = `${process.env.VUE_APP_API_BASE_URL}/api/products/barcode/${this.productCode}`;
        const response = await apiService.get(url);
        const product = response.data;
        if (product) {
          // Mapeamos solo los campos que usaremos en el front
          const productoNuevo = {
            codigo: product.producto_id,
            nombre: product.nombre,
            cantidad: this.productQuantity,
            // Como el backend envía 'unidad_medida_nombre', lo usamos para mostrar la unidad
            unidad_medida: product.unidad_medida_nombre,
            // Si el precio no viene en la respuesta, se asigna 0 (o el valor que se considere adecuado)
            precio: product.precio_venta_actual || 0
          };
          this.productos.push(productoNuevo);
        } else {
          alert("Producto no encontrado");
        }
      } catch (error) {
        console.error("Error al obtener el producto:", error);
        alert("Error al obtener el producto");
      }
    },
    async confirmarVenta() {
      try {
        // 1) Traer datos del cliente según RUC/CI
        const { data: cliente } = await apiService.get(
          `${process.env.VUE_APP_API_BASE_URL}/api/clients/search/${this.rucCliente}`
        );

        // 2) Armar la cabecera con lo que ya tenés en cliente + lo que pusiste en cabecera
        const cab = {
          nombre_cliente: cliente.nombre_completo,
          nro_documento:   cliente.nro_documento,
          telefono:        cliente.telefono,
          direccion:       cliente.direccion,
          email:           cliente.email,
          referencia:      this.cabecera.referencia,
          observaciones:   this.cabecera.observaciones,
          tipo_entrega:    this.cabecera.tipo_entrega
        };

        // 3) Payload final
        const payload = {
          cabecera: cab,
          detalles: this.productos.map(p => ({
            producto_id: p.codigo,
            cantidad:    p.cantidad
          }))
        };

        // 4) Envío

        console.log('Payload:', payload);
        await apiService.post(`${process.env.VUE_APP_API_BASE_URL}/api/orders/pending`, payload);
        alert('Pedido registrado correctamente');

        // 5) Limpio todo
        this.productos = [];
        this.paginaActual = 1;
        this.cabecera.referencia = '';
        this.cabecera.observaciones = '';
        this.cabecera.tipo_entrega  = 'domicilio';
      } catch (error) {
        console.error('Error al confirmar venta:', error);
        alert('Error al registrar el pedido');
      }
    },
    eliminarProducto(index) {
      if (confirm("¿Estás seguro de que deseas eliminar este producto?")) {
        this.productos.splice(index, 1);
      }
    },
    cambiarPagina(page) {
      this.paginaActual = page;
    },
    async ponerVentaEnEspera() {
      const confirmacion = confirm("¿Estás seguro de que deseas poner esta venta en espera?");
      if (!confirmacion) return;
      const data = {
        venta_id: null,
        cliente_id: 1,
        items_venta: this.productos.map(producto => ({
          producto_id: producto.codigo,
          cantidad: producto.cantidad,
          precio: producto.precio
        })),
        monto_total: this.totalAmount,
        fecha_venta: new Date().toISOString().slice(0, 10)
      };
      try {
        const response = await fetch(`${process.env.VUE_APP_PENDING_SALES_URL}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });
        const result = await response.json();
        if (result.message) {
          alert("Venta puesta en espera correctamente.");
          this.productos = [];
        }
      } catch (error) {
        console.error("Error:", error);
        alert("Hubo un error al poner la venta en espera.");
      }
    },
    async verificarRUC() {
      if (!this.rucCliente.trim()) return;
      try {
        const url = `${process.env.VUE_APP_API_BASE_URL}/api/clients/search/${this.rucCliente}`;
        const response = await apiService.get(url);
        const cliente = response.data;
        if (!cliente || Object.keys(cliente).length === 0) {
          this.showClienteModal = true;
        }
      } catch (error) {
        // Si el error es por cliente no encontrado, se puede mostrar el modal
        if (error.response && error.response.status === 404) {
          this.showClienteModal = true;
        } else {
          console.error("Error al verificar RUC:", error);
        }
      }
    }

  },
  mounted() {
    
  }
};
</script>

<style scoped>
/* Se mantienen los estilos actuales */
body {
  font-family: Arial, sans-serif;
  display: flex;
  flex-direction: column;
  height: 100vh;
  margin: 0;
  overflow: hidden;
}

.navbar-dark .navbar-nav .nav-link {
  color: white;
  font-weight: bold;
}

.navbar-dark .navbar-nav .nav-link:hover {
  color: #ddd;
}

.table-hover tbody tr:hover {
  background-color: #f1f1f1;
}

.container {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  overflow: hidden;
}

.table-container {
  flex-grow: 1;
  overflow-y: auto;
  overflow-x: auto;
  padding-bottom: 95px;
}

.table {
  border: 2px solid #000;
  border-collapse: collapse;
}

.table th,
.table td {
  border: 1px solid #ddd;
  padding: 8px;
}

.table thead th {
  position: sticky;
  top: 0;
  background-color: white;
  z-index: 1;
  border-bottom: 2px solid #000;
}

.button-container {
  display: flex;
  gap: 10px;
}

.total-footer-section h4 {
  display: flex;
  justify-content: center;
}

.total-footer-section {
  position: fixed;
  bottom: 50px;
  left: 0;
  right: 0;
  width: 100vw;
  background-color: #e9ecef;
  padding: 10px 20px;
  border-top: 1px solid #ddd;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
  z-index: 1000;
  box-sizing: border-box;
}

h4 span {
  color: #ff5722;
}

.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #343a40;
  color: white;
  padding: 10px 20px;
  height: 50px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 1000;
  box-sizing: border-box;
}

.footer .d-flex {
  justify-content: space-between;
  width: 100%;
}

.gap-3 {
  gap: 10px;
}

.footer .btn {
  padding: 5px 10px;
  font-size: 14px;
}

.total-footer-section h4 {
  padding-left: 100px;
}

.comercial-graciela {
  color: white !important;
  font-weight: bold;
}
</style>
