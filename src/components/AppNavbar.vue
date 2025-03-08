<template>
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
      <div class="container-fluid">
        <router-link class="navbar-brand" to="/pantalla-inicio">
          <i class="bi bi-house-door"></i>
        </router-link>
        <div class="navbar-collapse">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            <li class="nav-item">
              <a class="nav-link" href="#" data-bs-toggle="modal" data-bs-target="#searchProductModal">
                <i class="bi bi-search"></i> Buscar productos
              </a>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/clientes">
                <i class="bi bi-people"></i> Clientes
              </router-link>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#" data-bs-toggle="modal" data-bs-target="#onHoldSalesModal">
                <i class="bi bi-hourglass-split"></i> Ventas en espera
              </a>
            </li>
            <li class="nav-item admin-only">
              <router-link class="nav-link" to="/inventario">
                <i class="bi bi-box-seam"></i> Inventario
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/listar-comprobantes">
                <i class="bi bi-receipt"></i> Comprobantes
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/caja">
                <i class="bi bi-cash-stack"></i> Caja
              </router-link>
            </li>
            <li class="nav-item admin-only">
              <router-link class="nav-link" to="/user-management">
                <i class="bi bi-person-gear"></i> User Management
              </router-link>
            </li>
          </ul>
          <span class="navbar-text comercial-graciela">
            COMERCIAL GRACIELA
          </span>
        </div>
      </div>
    </nav>
    <!-- Buscar Producto Modal -->
    <AppModal modalId="searchProductModal" title="Buscar Producto">
      <template #body>
        <div class="mb-3">
          <label for="productCodeSearch" class="form-label">Código del producto</label>
          <input type="text" class="form-control" v-model="productCodeSearch" @keydown.enter.prevent="buscarProducto" placeholder="Ingresa el código">
        </div>
        <div class="mb-3">
          <label for="productNameSearch" class="form-label">Nombre del producto</label>
          <input type="text" class="form-control" v-model="productNameSearch" @keydown.enter.prevent="buscarProducto" placeholder="Ingresa el nombre del producto">
        </div>
        <div id="searchResult" class="mt-3" v-html="searchResult"></div>
      </template>
      <template #footer>
        <AppButton variant="secondary" customClass="me-2" data-bs-dismiss="modal">
          Cerrar
        </AppButton>
        <AppButton variant="primary" @click="buscarProducto">
          Buscar
        </AppButton>
      </template>
    </AppModal>

    <!-- Ventas en Espera Modal -->
    <AppModal modalId="onHoldSalesModal" title="Ventas en Espera">
      <template #body>
        <ul class="list-group">
          <li v-for="venta in ventasEnEspera" :key="venta.id" class="list-group-item">
            {{ venta.descripcion }} - {{ formatCurrency(venta.monto_total) }}
            <AppButton variant="primary" customClass="btn-sm" @click="retomarVenta(venta.id)">
              Retomar
            </AppButton>
          </li>
        </ul>
      </template>
      <template #footer>
        <AppButton variant="secondary" data-bs-dismiss="modal">
          Cerrar
        </AppButton>
      </template>
    </AppModal>


  </template>
  
  <script>
import AppButton from './AppButton.vue';
import AppModal from './AppModal.vue';

// Removed unused import:
// import App from '@/App.vue';

export default {
    name: 'AppNavbar',
    components: {
      AppButton,
      AppModal
    },
    // Added data properties:
    data() {
      return {
        productCodeSearch: '',
        productNameSearch: '',
        searchResult: '',
        ventasEnEspera: []
      };
    },
    // Added methods:
    methods: {
      buscarProducto() {
        this.searchResult = "";
        const codigo = this.productCodeSearch.trim();
        const nombre = this.productNameSearch.trim();
        if (!codigo && !nombre) {
          this.searchResult = '<div class="alert alert-warning">Por favor, ingresa el código o el nombre del producto.</div>';
          return;
        }
        console.log( `${process.env.VUE_APP_PRODUCT_CHECK_URL_CODE}${codigo}`)
        const url = codigo
          ? `${process.env.VUE_APP_PRODUCT_CHECK_URL_CODE}${codigo}`
          : `${process.env.VUE_APP_PRODUCT_CHECK_URL_NAME}nombre=${encodeURIComponent(nombre)}`;

        fetch(url)
          .then(response => response.json())
          .then(producto => {
            if (producto) {
              this.searchResult = `
                <div class="alert alert-success">
                  <strong>Producto encontrado:</strong><br>
                  <strong>Nombre:</strong> ${producto.nombre}<br>
                  <strong>Código:</strong> ${producto.codigo_barras}<br>
                  <strong>Precio:</strong> $${producto.precio.toFixed(2)}<br>
                  <strong>Stock:</strong> ${producto.stock_disponible}<br>
                  <strong>Unidad de Medida:</strong> ${producto.unidad_medida}<br>
                </div>`;
            } else {
              this.searchResult = '<div class="alert alert-danger">Producto no encontrado.</div>';
            }
          })
          .catch(error => {
            console.error("Error al buscar el producto:", error);
            this.searchResult = '<div class="alert alert-danger">Error al buscar el producto.</div>';
          });
      },
      async retomarVenta(ventaId) {
        try {
          const response = await fetch(`${process.env.VUE_APP_PENDING_SALES_URL}/id=${ventaId}`);
          const data = await response.json();
          alert("Venta retomada con éxito.");
          // Emit event to parent if needed:
          this.$emit("venta-retomada", data.items_venta);
        } catch (error) {
          console.error("Error al retomar la venta:", error);
        }
      },
      formatCurrency(value) {
        return new Intl.NumberFormat("es-ES", {
          style: "currency",
          currency: "USD"
        }).format(value);
      },
      async obtenerVentasEnEspera() {
        try {
          const response = await fetch(`${process.env.VUE_APP_PENDING_SALES_LIST_URL}`);
          const data = await response.json();
          this.ventasEnEspera = data.ventas;
        } catch (error) {
          console.error("Error al obtener ventas en espera:", error);
        }
      }
    },
    // Added mounted hook:
    mounted() {
      this.obtenerVentasEnEspera();
    }
  };

  </script>
  
  <style scoped>
  .navbar {
    background-color: #343a40; /* Dark background for consistency */
  }
  
  .navbar-brand i {
    margin-right: 8px;
    font-size: 1.5rem;
  }
  
  .navbar-nav .nav-link {
    font-size: 1rem;
    margin-right: 10px;
  }
  
  .navbar-text.comercial-graciela {
    font-size: 1.1rem;
    font-weight: 600;
    color: #ffffff;
  }

    .navbar-brand,
    .navbar-nav .nav-link,
    .navbar-text.comercial-graciela {
    color: #ffffff !important;
    font-weight: bold;
}
    
  </style>
  