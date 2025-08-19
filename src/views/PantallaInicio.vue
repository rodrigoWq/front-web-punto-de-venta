<template>
  <div id="pantalla-inicio">
    <!-- Navegación (sin cambios) -->
    <AppNavbar @venta-retomada="cargarPedido" />
    <!-- Contenido Principal -->
    <div class="container mt-4 flex-grow-1">
      <!-- Formulario de Producto -->
      <div class="card p-4 mb-4">
        <div class="row g-3">
          <div class="col">
            <label for="productCode" class="form-label">Código del producto</label>
            <div class="input-group">
              <input type="text" class="form-control" v-model="productCode" placeholder="Ingresa el código"  @keyup.enter.prevent="agregarProducto" />
            </div>
          </div>
          <div class="col">
            <label for="productQuantity" class="form-label">Cantidad</label>
            <input type="number" class="form-control" v-model="productQuantity" value="1" @keyup.enter.prevent="agregarProducto" />
          </div>
          <div class="col">
            <label for="rucCliente" class="form-label">RUC / CI</label>
            <div class="input-group">
              <input type="text" class="form-control" v-model="rucCliente" placeholder="Ingresa el RUC/CI del cliente"  @blur="verificarRUC" @keyup.enter.prevent="verificarRUC" />
            </div>
          </div>
          <div class="col">
            <label for="nombreCliente" class="form-label">Cliente</label>
            <div class="input-group">
              <input type="text" id="nombreCliente" class="form-control" v-model="clienteNombre" readonly />
              <button type="button" class="btn btn-success" @click="agregarProducto">
                <i class="bi bi-plus"></i>
              </button>
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
            <td>{{ String(producto.precio).split('.')[0] }}</td>
            <td>
              <button type="button" class="btn btn-danger btn-sm" @click="eliminarProducto(index)">
                <i class="bi bi-trash"></i>
              </button>
            </td>
          </tr>
        </AppTable>
  <AppPagination v-if="totalPaginas > 1" :currentPage="paginaActual" :totalPages="totalPaginas" @page-changed="cambiarPagina" />
      </div>
    </div>

      <!-- Sección de Total y Acciones (justo por encima del footer real) -->
    <div class="total-footer-section">
      <h4>
        Total: <span class="ms-1">{{ formateaNumero(totalAmount) + '  ₲' }}</span>
      </h4>
      <!-- Reemplazo en la sección de Total y Acciones -->
      <div class="button-container">
        <button type="button" class="btn btn-warning" @click="openPendingModal">Poner Venta en Espera</button>
        <button type="button" class="btn btn-danger" @click="cancelarVenta">Cancelar Venta</button>
        <button type="button" class="btn btn-success" @click="confirmarVenta">Confirmar Venta</button>
      </div>

    </div>

    <!-- Footer Fijo al Final -->
    <div class="footer d-flex w-100 align-items-center">
      <div class="flex-grow-1 text-center">
        Cajero en turno: {{ userName }} | {{ currentDate }} | Hora: {{ currentTime }}
      </div>
      <button type="button" class="btn btn-primary ms-auto">
        Reimprimir último ticket
      </button>
    </div>

  <ModalCliente v-if="showClienteModal" @close="showClienteModal = false" @verificarRUC="verificarRUC" />



  </div>
  <PendingSaleModal
    v-if="showPendingModal"
    :initialReferencia="cabecera.referencia"
    :initialNombre="clienteNombre"
    :initialNroDocumento="rucCliente"
    @close="showPendingModal = false"
    @submit="handlePendingSubmit"
  />
  
</template>

<script>

import AppTable from '../components/AppTable.vue';
import AppNavbar from '../components/AppNavbar.vue';
import AppPagination from '../components/AppPagination.vue';
import apiService from '../services/apiService.js';
import ModalCliente from '../components/ClienteModal.vue';
import PendingSaleModal from '../components/PendingSaleModal.vue';


export default {
  name: "PantallaInicio",
  components: {
    AppTable,
    AppNavbar,
    AppPagination,
    ModalCliente,
    PendingSaleModal
  },
  data() {
    return {
      productCode: '',
      productQuantity: 1,
      rucCliente: '',
      clienteNombre: '',
      userName: '',
      currentTime: '',
      currentDate: '',
      cabecera: {
        referencia: '',
        observaciones: '',
        tipo_entrega: 'domicilio'
      },
      productos: [],
      paginaActual: 1,
      itemsPorPagina: 5,
      showPendingModal: false,
      showClienteModal: false
    };
  },
  computed: {
    totalAmount() {
      return this.productos.reduce((acc, producto) => {
        return acc + producto.cantidad * producto.precio;
      }, 0);
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
          // Si el producto no tiene precio de venta actual o es 0, ofrecemos redirigir al usuario
          const precioActual = Number(product.precio_venta_actual ?? 0);
          if (!precioActual || precioActual <= 0) {
            const msg = `El producto "${product.nombre}" no tiene un precio de venta asignado.\n\n¿Deseas ir a la pantalla de Gestión de Precios para asignarlo ahora?`;
            const irGestionPrecios = window.confirm(msg);
            if (irGestionPrecios) {
              // Navegar a la vista de gestión de precios (ruta definida en router)
              // Usamos el nombre de ruta 'ProductosPrecio' definido en router/index.js
              this.$router.push({ name: 'ProductosPrecio' });
            }
            // No permitimos agregar el producto si no tiene precio
            return;
          }

          // Mapeamos solo los campos que usaremos en el front
          const productoNuevo = {
            codigo: product.producto_id,
            nombre: product.nombre,
            cantidad: this.productQuantity,
            // Como el backend envía 'unidad_medida_nombre', lo usamos para mostrar la unidad
            unidad_medida: product.unidad_medida_nombre,
            // Precio seguro (ya validado arriba)
            precio: precioActual
          };
          this.productos.push(productoNuevo);
          // Reiniciar la cantidad a 1 después de agregar el producto
          this.productQuantity = 1;
          
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

        // 2) Determinar tipo_documento y nro_documento según reglas
        const tieneRuc = !!(cliente && cliente.ruc);
        const tieneCi  = !!(cliente && cliente.ci);
        const tipo_documento = tieneRuc ? 'RUC' : (tieneCi ? 'CI' : 'RUC');
        const nro_documento  = tieneRuc
          ? cliente.ruc
          : (tieneCi ? cliente.ci : (cliente?.nro_documento || this.rucCliente));

        // 3) Determinar credito_contado desde condiciones_pago
        const condiciones = (cliente?.condiciones_pago || 'Contado').toString().trim().toLowerCase();
        const credito_contado = ['credito', 'crédito'].includes(condiciones) ? 'CREDITO' : 'CONTADO';

        // 4) Cabecera para venta
        const cab = {
          nro_documento,
          tipo_documento,
          credito_contado,
          tipo_moneda: 'PYG'
        };

        // 5) Payload final (detalles se mantiene igual)
        const payload = {
          cabecera: cab,
          detalles: this.productos.map(p => ({
            producto_id: p.codigo,
            cantidad:    p.cantidad
          }))
        };

        // 6) Envío a /api/sales
        console.log('Payload venta:', payload);
        await apiService.post(`${process.env.VUE_APP_API_BASE_URL}/api/sales`, payload);
        alert('Venta registrada correctamente');

        // 7) Limpio todo
        this.productos = [];
        this.paginaActual = 1;
        this.cabecera.referencia = '';
        this.cabecera.observaciones = '';
        this.cabecera.tipo_entrega  = 'domicilio';
        this.productCode     = '';
        this.productQuantity = 1;
        this.rucCliente      = '';
        this.clienteNombre   = '';
      } catch (error) {
        console.error('Error al confirmar venta:', error);
        alert('Error al registrar la venta');
      }
    },
    eliminarProducto(index) {
      if (confirm("¿Estás seguro de que deseas eliminar este producto?")) {
        this.productos.splice(index, 1);
      }
    },
    cancelarVenta() {
      const confirmado = window.confirm('¿Seguro que deseas cancelar la venta y limpiar todos los campos?');
    if (!confirmado) return;
    // Limpia todos los inputs y estados locales de la pantalla
    this.productos = [];
    this.paginaActual = 1;
    this.cabecera.referencia = '';
    this.cabecera.observaciones = '';
    this.cabecera.tipo_entrega = 'domicilio';
    this.productCode = '';
    this.productQuantity = 1;
    this.rucCliente = '';
    this.clienteNombre = '';
    this.showPendingModal = false;
    this.showClienteModal = false;
    },
    cambiarPagina(page) {
      this.paginaActual = page;
    },
    openPendingModal() {
      this.showPendingModal = true;
    },
    async handlePendingSubmit({ referencia, nombre, nroDocumento }) {
    // Validación ya hecha en el hijo
      try {
        let clienteData = null;
        if (nroDocumento) {
          const { data } = await apiService.get(
            `${process.env.VUE_APP_API_BASE_URL}/api/clients/search/${nroDocumento}`
          );
          clienteData = data;
        }
        const cab = {
          nombre_cliente: nombre || (clienteData?.nombre_completo ?? ''),
          nro_documento: nroDocumento || (clienteData?.nro_documento ?? ''),
          referencia,
          telefono: clienteData?.telefono ?? '',
          direccion: clienteData?.direccion ?? '',
          email: clienteData?.email ?? '',
          observaciones: this.cabecera.observaciones,
          tipo_entrega: this.cabecera.tipo_entrega
        };
        const detalles = this.productos.map(p => ({ producto_id: p.codigo, cantidad: p.cantidad }));
        await apiService.post(
          `${process.env.VUE_APP_API_BASE_URL}/api/orders/pending`,
          { cabecera: cab, detalles }
        );
        console.log('Venta puesta en espera:', cab, detalles);
        alert('Venta puesta en espera correctamente.');
        // limpiar estado
        this.productos = [];
        this.paginaActual = 1;
        this.cabecera.referencia = '';
        this.cabecera.observaciones = '';
        this.cabecera.tipo_entrega = 'domicilio';
        this.showPendingModal = false;
        this.productCode     = '';
        this.productQuantity = 1;
        this.rucCliente      = '';
        this.clienteNombre   = '';
      } catch (error) {
        console.error(error);
        alert('Error al poner la venta en espera.');
      }
    },
    async verificarRUC() {
      if (!this.rucCliente.trim()) return;
      try {
        const url = `${process.env.VUE_APP_API_BASE_URL}/api/clients/search/${this.rucCliente}`;
        const response = await apiService.get(url);
        const cliente = response.data;
        if (cliente && Object.keys(cliente).length > 0) {
          this.clienteNombre = cliente.nombre_completo;
          this.showClienteModal = false;
        }else {
          this.clienteNombre = '';
          this.showClienteModal = true;
        }
      } catch (error) {
        // Si el error es por cliente no encontrado, se puede mostrar el modal
        if (error.response && error.response.status === 404) {
          this.clienteNombre = '';
          this.showClienteModal = true;
        } else {
          console.error("Error al verificar RUC:", error);
        }
      }
    },
    mostrarReloj() {
      const fecha = new Date();
      const hr = this.formatoHora(fecha.getHours());
      const min = this.formatoHora(fecha.getMinutes());
      const seg = this.formatoHora(fecha.getSeconds());
      this.currentTime = `${hr}:${min}:${seg}`;

      const meses = ['Ene', 'Feb', 'Marz', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      const dias = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];

      const diaSemana = dias[fecha.getDay()];
      const diaDelMes = fecha.getDate();
      const mes = meses[fecha.getMonth()];
      const anho = fecha.getFullYear();
      this.currentDate = `${diaSemana}, ${diaDelMes} ${mes}, ${anho}`;
    },
    formatoHora(hora) {
      return hora < 10 ? '0' + hora : hora;
    },
    cargarPedido({ ruc, nombre, productos }) {
      this.rucCliente    = ruc;
      this.clienteNombre = nombre;
      this.productos     = productos;
      this.paginaActual  = 1;
    },
    formateaNumero (n) {
      if (n === null || n === undefined) return ''
      return Number(n).toLocaleString('es-PY', { minimumFractionDigits: 0 })
    },
  },
  mounted() {
    this.userName = localStorage.getItem("user_name") || '';
    this.mostrarReloj();
    this._timeInterval = setInterval(this.mostrarReloj, 1000);
  },
  beforeUnmount() {
    clearInterval(this._timeInterval);
  },

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
