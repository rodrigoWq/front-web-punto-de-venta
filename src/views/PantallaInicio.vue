<template>
  <div id="pantalla-inicio">
    <!-- Navegación (sin cambios) -->
    <AppNavbar @venta-retomada="cargarPedido" />
    <!-- Contenido Principal -->
    <div class="container mt-4 flex-grow-1">
      <!-- Formulario de Producto -->
      <div class="card p-2 mb-3 compact-form">
          <!-- Fila de Cliente (arriba) -->
          <div class="row g-2 mb-1">
            <div class="col">
              <label for="rucCliente" class="form-label">RUC / CI</label>
              <div class="input-group">
                <input
                  type="text"
                  class="form-control form-control-sm"
                  v-model="rucCliente"
                  placeholder="Ingresa el RUC/CI del cliente"
                  @blur="verificarRUC"
                  @keyup.enter.prevent="verificarRUC"
                />
              </div>
            </div>
            <div class="col">
              <label for="nombreCliente" class="form-label">Cliente</label>
              <div class="input-group">
                <input type="text" id="nombreCliente" class="form-control form-control-sm" v-model="clienteNombre" readonly />
                <button type="button" class="btn btn-outline-primary btn-sm" @click="toggleBuscarCliente">
                  Buscar
                </button>
              </div>
            </div>
          </div>

          <!-- Fila de Producto (abajo) -->
          <div class="row g-2">
            <div class="col">
              <label for="productCode" class="form-label">Código del producto</label>
              <div class="input-group">
                <input
                  type="text"
                  class="form-control form-control-sm"
                  v-model="productCode"
                  placeholder="Ingresa el código"
                  @keyup.enter.prevent="buscarProducto"
                  @blur="productCode && buscarProducto()"
                />
                <button type="button" class="btn btn-outline-primary btn-sm" @click="toggleBuscarProducto">
                  Buscar
                </button>
              </div>
            </div>
            <div class="col">
              <label for="productQuantity" class="form-label">Cantidad</label>
              <input
                type="number"
                class="form-control form-control-sm"
                v-model="productQuantity"
                value="1"
                min="1"
                @keyup.enter.prevent="agregarProducto"
              />
            </div>
            <div class="col">
              <label for="productDescription" class="form-label">Descripción del producto</label>
              <div class="input-group">
                <input
                  type="text"
                  id="productDescription"
                  class="form-control form-control-sm"
                  v-model="productDescription"
                  placeholder="Descripción mostrada al buscar por código"
                  readonly
                />
                <button type="button" class="btn btn-success btn-sm" @click="agregarProducto" :disabled="!selectedProduct">
                  <i class="bi bi-plus"></i>
                </button>
              </div>
            </div>
          </div>
      </div>

      <!-- Overlay de selección de cliente -->
      <div
        v-if="mostrarSelectorCliente"
        class="overlay-backdrop"
        role="dialog"
        aria-modal="true"
        @click.self="cerrarSelectorCliente"
      >
        <div class="overlay-panel card">
          <div class="overlay-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Seleccionar Cliente</h5>
            <button type="button" class="btn-close" aria-label="Cerrar" @click="cerrarSelectorCliente"></button>
          </div>
          <div class="overlay-body">
            <ClientesView
              :selectorMode="true"
              :hideHeader="true"
              @cliente-seleccionado="onClienteSeleccionado"
            />
          </div>
        </div>
      </div>
  
      <!-- Overlay de selección de producto -->
      <div
        v-if="mostrarSelectorProducto"
        class="overlay-backdrop"
        role="dialog"
        aria-modal="true"
        @click.self="cerrarSelectorProducto"
      >
        <div class="overlay-panel card">
          <div class="overlay-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Seleccionar Producto</h5>
            <button type="button" class="btn-close" aria-label="Cerrar" @click="cerrarSelectorProducto"></button>
          </div>
          <div class="overlay-body">
            <ProductosPrecioView
              :selectorMode="true"
              :hideHeader="true"
              @producto-seleccionado="onProductoSeleccionado"
            />
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
            <td>{{ formateaNumero(producto.precio) }}</td>
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

  </div>
  <PendingSaleModal
    v-if="showPendingModal"
    :initialReferencia="cabecera.referencia"
    :initialNombre="clienteNombre"
    :initialNroDocumento="rucCliente"
    @close="showPendingModal = false"
    @submit="handlePendingSubmit"
  />
  
  <!-- Modal Registrar Cliente reutilizable -->
  <RegistrarClienteModal
    :open="showCrearClienteModal"
    :prefillRuc="rucCliente"
    :prefillDocumento="rucCliente"
    @saved="onClienteCreadoDesdeModal"
    @close="showCrearClienteModal = false"
  />
  
</template>

<script>

import AppTable from '../components/AppTable.vue';
import AppNavbar from '../components/AppNavbar.vue';
import AppPagination from '../components/AppPagination.vue';
import apiService from '../services/apiService.js';
import PendingSaleModal from '../components/PendingSaleModal.vue';
import ClientesView from './ClientesView.vue';
import ProductosPrecioView from '@/views/Inventario/ProductosPrecioView.vue';
import RegistrarClienteModal from '@/components/RegistrarClienteModal.vue';


export default {
  name: "PantallaInicio",
  components: { AppTable, AppNavbar, AppPagination, PendingSaleModal, ClientesView, ProductosPrecioView, RegistrarClienteModal },
  data() {
    return {
      productCode: '',
      productQuantity: 1,
      productDescription: '',
      selectedProduct: null,
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
      mostrarSelectorCliente: false,
  mostrarSelectorProducto: false,
      showCrearClienteModal: false,
      // Guardas para evitar bucles/verificaciones repetidas
      isVerifyingRuc: false,
      lastRucChecked: '',
      rucNotFoundForValue: '',
      // Guardas para búsqueda de producto
      isCheckingProduct: false,
      productNotFoundForCode: '',
      lastProductCheckedCode: ''
    };
  },
  computed: {
    totalAmount() {
      return Math.round(this.productos.reduce((acc, producto) => {
        return acc + producto.cantidad * producto.precio;
      }, 0));
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
  watch: {
    productCode() {
      // Si el código cambia, invalidar la selección previa
      this.selectedProduct = null;
      this.productDescription = '';
      this.productNotFoundForCode = '';
    },
    // Si el usuario modifica el RUC/CI, permitimos reintentar y limpiamos flags
    rucCliente(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.rucNotFoundForValue = '';
        // No bloqueamos un nuevo chequeo para el nuevo valor
      }
    }
  },
  methods: {
    toggleBuscarCliente() {
      this.mostrarSelectorCliente = !this.mostrarSelectorCliente;
      // Evitar scroll del fondo cuando está visible
      if (this.mostrarSelectorCliente) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    },
    cerrarSelectorCliente() {
      this.mostrarSelectorCliente = false;
      document.body.style.overflow = '';
    },
    onClienteSeleccionado(cliente) {
      // Completar los datos en la pantalla de inicio y cerrar el selector
      this.rucCliente = cliente.ruc || cliente.nro_documento || '';
      this.clienteNombre = cliente.nombre_completo || cliente.nombre_fantasia || '';
      this.cerrarSelectorCliente();
    },
    abrirModalCrearClienteDesdeInicio() {
      this.showCrearClienteModal = true;
    },
    onClienteCreadoDesdeModal(cli) {
      this.rucCliente = cli?.ruc || cli?.nro_documento || this.rucCliente || '';
      this.clienteNombre = cli?.nombre_completo || cli?.nombre_fantasia || this.clienteNombre || '';
      this.showCrearClienteModal = false;
      // Resetear flags tras crear
      this.rucNotFoundForValue = '';
      this.lastRucChecked = this.rucCliente?.trim() || '';
    },
    async buscarProducto() {
      // Buscar y mostrar descripción, sin agregar a la tabla
      this.selectedProduct = null;
      this.productDescription = '';
      const code = (this.productCode || '').trim();
      if (!code) return;
      if (this.isCheckingProduct) return; // Evita doble disparo (Enter + blur)
      if (this.productNotFoundForCode === code) return; // Ya avisado para este código; esperar que el usuario lo cambie
      if (!this.productQuantity || this.productQuantity <= 0) {
        alert('La cantidad debe ser mayor a 0');
        return;
      }
      const qty = Number(this.productQuantity) || 1;
      this.isCheckingProduct = true;
      // Helper para mapear respuesta a selectedProduct
      const mapToSelected = (p) => {
        // Resolver precio desde distintas formas
        const now = new Date();
        let price = Number(p.precio_venta_actual ?? p.precio_unitario_resuelto ?? p.precio_venta ?? 0);
        if (!price || price <= 0) {
          const arr = Array.isArray(p.precios_vigentes) ? p.precios_vigentes : [];
          if (arr.length) {
            let candidates = arr.filter(x => {
              const desde = x?.vigencia_desde ? new Date(x.vigencia_desde) : null;
              const hasta = x?.vigencia_hasta ? new Date(x.vigencia_hasta) : null;
              const inDate = (!desde || desde <= now) && (!hasta || hasta >= now);
              const qtyOk = (x.cantidad_desde == null || x.cantidad_desde <= qty) && (x.cantidad_hasta == null || x.cantidad_hasta >= qty);
              return inDate && qtyOk;
            });
            if (!candidates.length) candidates = arr;
            candidates.sort((a,b) => new Date(b.vigencia_desde) - new Date(a.vigencia_desde));
            const pick = candidates[0];
            price = Number(pick?.precio_venta ?? 0);
          }
        }
        return {
          id: p.producto_id ?? p.id,
          codigo: p.codigo_barras || '',
          nombre: p.nombre,
          unidad_medida: p.unidad_medida_nombre ?? p.unidad_medida ?? '',
          precio: price || 0
        };
      };

      try {
        const url = `${process.env.VUE_APP_API_BASE_URL}/api/prices/barcode/${encodeURIComponent(code)}?cantidad_unidades=${qty}`;
        const { data: product } = await apiService.get(url);
        if (product) {
          const sel = mapToSelected(product);
          if (!sel.precio || sel.precio <= 0) {
            const msg = `El producto "${sel.nombre}" no tiene un precio de venta asignado.\n\n¿Deseas ir a la pantalla de Gestión de Precios para asignarlo ahora?`;
            const irGestionPrecios = window.confirm(msg);
            if (irGestionPrecios) this.$router.push({ name: 'ProductosPrecio' });
          } else {
            this.selectedProduct = sel;
            this.productDescription = `${sel.nombre}`;
            this.productNotFoundForCode = '';
          }
        } else {
          this.productNotFoundForCode = code;
          alert('Producto no encontrado');
        }
      } catch (error) {
        if (error?.response?.status === 404) {
          this.productNotFoundForCode = code;
          alert('Producto no encontrado');
        } else {
          console.error('Error buscando por código de barras:', error);
          alert('Error al obtener el producto');
        }
      } finally {
        this.lastProductCheckedCode = code;
        this.isCheckingProduct = false;
      }
    },
    toggleBuscarProducto() {
      this.mostrarSelectorProducto = !this.mostrarSelectorProducto;
      if (this.mostrarSelectorProducto) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    },
    cerrarSelectorProducto() {
      this.mostrarSelectorProducto = false;
      document.body.style.overflow = '';
    },
    onProductoSeleccionado(prod) {
      // Tomar el código de barras del producto y buscarlo
      const barcode = String(prod?.codigo_barras ?? '').trim();
      if (!barcode) {
        alert('El producto seleccionado no tiene código de barras asociado.');
        return;
      }
      this.productCode = barcode;
      this.cerrarSelectorProducto();
      this.$nextTick(() => this.buscarProducto());
    },
    agregarProducto() {
      // Agregar a la tabla el producto previamente buscado
      if (!this.selectedProduct) {
        alert('Primero buscá un producto por su código');
        return;
      }
      if (!this.productQuantity || this.productQuantity <= 0) {
        alert('La cantidad debe ser mayor a 0');
        return;
      }
      if (!this.selectedProduct.id) {
        alert('El producto seleccionado no tiene un identificador válido.');
        return;
      }
      const productoNuevo = {
        producto_id: this.selectedProduct.id,
        codigo: this.selectedProduct.codigo,
        nombre: this.selectedProduct.nombre,
        cantidad: this.productQuantity,
        unidad_medida: this.selectedProduct.unidad_medida,
        precio: this.selectedProduct.precio
      };
      this.productos.push(productoNuevo);
      // Reset controlado: mantener código si se desea seguir escaneando, pero limpiar cantidad y selección
      this.productQuantity = 1;
      this.selectedProduct = null;
      this.productDescription = '';
      this.productCode = '';
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
            producto_id: p.producto_id,
            cantidad:    p.cantidad
          }))
        };

        // 6) Envío a /api/sales
        console.log('Payload venta:', payload);
        const resp = await apiService.post(`${process.env.VUE_APP_API_BASE_URL}/api/sales`, payload);
        console.log('[PantallaInicio] /api/sales resp.data:', resp?.data);
        // 7) Venta registrada: limpiar el formulario para una nueva carga (sin redirigir)
        alert('Venta registrada correctamente.');
        // Limpiar estado local
        this.productos = [];
        this.paginaActual = 1;
        this.cabecera.referencia = '';
        this.cabecera.observaciones = '';
        this.cabecera.tipo_entrega  = 'domicilio';
        this.productCode     = '';
        this.productQuantity = 1;
        this.productDescription = '';
        this.selectedProduct = null;
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
    this.productDescription = '';
    this.selectedProduct = null;
    this.rucCliente = '';
    this.clienteNombre = '';
    this.showPendingModal = false;
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
    const detalles = this.productos.map(p => ({ producto_id: p.producto_id, cantidad: p.cantidad }));
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
        this.productDescription = '';
        this.selectedProduct = null;
        this.rucCliente      = '';
        this.clienteNombre   = '';
      } catch (error) {
        console.error(error);
        alert('Error al poner la venta en espera.');
      }
    },
    async verificarRUC() {
      const value = (this.rucCliente || '').trim();
      if (!value) return;
      // Evitar doble ejecución por Enter + blur y evitar reintentos infinitos para el mismo valor
      if (this.isVerifyingRuc) return;
      if (this.rucNotFoundForValue === value) return; // ya se intentó y no se encontró; esperar cambio del input
      if (this.showCrearClienteModal) return; // si el modal ya está abierto, no volver a disparar

      this.isVerifyingRuc = true;
      try {
        const url = `${process.env.VUE_APP_API_BASE_URL}/api/clients/search/${value}`;
        const { data: cliente } = await apiService.get(url);
        if (cliente && Object.keys(cliente).length > 0) {
          this.clienteNombre = cliente.nombre_completo || '';
        } else {
          this.clienteNombre = '';
          this.rucNotFoundForValue = value;
          this.abrirModalCrearClienteDesdeInicio();
        }
      } catch (error) {
        if (error?.response?.status === 404) {
          this.clienteNombre = '';
          this.rucNotFoundForValue = value;
          this.abrirModalCrearClienteDesdeInicio();
        } else {
          console.error('Error al verificar RUC:', error);
        }
      } finally {
        this.lastRucChecked = value;
        this.isVerifyingRuc = false;
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
    redondearHaciaArriba(valor) {
      if (valor === null || valor === undefined || isNaN(valor)) return 0;
      return Math.round(Number(valor));
    }
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

/* Compact form styles to reduce vertical space above the table */
.compact-form {
  padding: 8px !important;
}
.compact-form .form-label {
  margin-bottom: 2px;
  font-size: 0.875rem;
}
.compact-form .input-group > .form-control,
.compact-form .form-control.form-control-sm {
  height: 32px;
  padding: 0.25rem 0.5rem;
}
.compact-form .btn,
.compact-form .btn-sm {
  padding: 0.25rem 0.5rem;
  line-height: 1.1;
}
.compact-form .row {
  margin-right: 0;
  margin-left: 0;
}

/* Fullscreen overlay for embedded client selector */
.overlay-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000; /* above footer and total section */
}
.overlay-panel {
  width: 95vw;
  max-width: 1100px;
  max-height: 90vh;
  overflow: hidden;
}
.overlay-header {
  border-bottom: 1px solid #e9ecef;
  padding: 10px 14px; /* ligeramente más compacto */
}
.overlay-body {
  padding: 6px 12px 12px; /* reducir espacio superior */
  max-height: calc(90vh - 56px);
  overflow: auto;
}
</style>
