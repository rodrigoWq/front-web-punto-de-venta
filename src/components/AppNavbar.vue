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
              <router-link class="nav-link" to="/listar-proveedores">
                <i class="bi bi-truck"></i> Proveedores
              </router-link>
            </li>
            <li class="nav-item" v-if="$route.path === '/pantalla-inicio'">
              <a class="nav-link" href="#" data-bs-toggle="modal" data-bs-target="#onHoldSalesModal">
                <i class="bi bi-hourglass-split"></i> Ventas en espera
              </a>
            </li>
            <li class="nav-item admin-only">
              <router-link class="nav-link" to="/Productos">
                <i class="bi bi-box-seam"></i> Productos
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/listar-comprobantes">
                <i class="bi bi-receipt"></i> Facturas
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/listar-notas-remision">
                <i class="bi bi-file-text"></i> Notas de Remisión
              </router-link>
            </li>
            <li class="nav-item admin-only">
              <router-link class="nav-link" to="/user-management">
                <i class="bi bi-person-gear"></i> User Management
              </router-link>
            </li>
          </ul>
          <li class="nav-item position-relative">
            <!-- Texto que dispara el menú al hacer clic -->
            <span class="navbar-text comercial-graciela" style="cursor: pointer;" @click="toggleMenu">
              COMERCIAL GRACIELA
            </span>

            <!-- Menú personalizado, se muestra solo si showMenu es true -->
            <div v-if="showMenu" class="position-absolute p-2 border border-light rounded" style="right: 0; top: 100%; background-color: black;"> 
              <button type="button" class="btn btn-link text-white p-0 border-0" @click="cerrarSesion">Cerrar Sesión</button>
            </div>
          </li>
        </div>
      </div>
    </nav>
    <!-- Modal Buscar Producto -->
    <div class="modal fade" id="searchProductModal" tabindex="-1" aria-labelledby="searchProductModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="searchProductModalLabel">Buscar Producto</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label for="productCodeSearch" class="form-label">Código de Barras</label>
              <input
                id="productCodeSearch"
                type="text"
                class="form-control"
                v-model="productCodeSearch"
                @keydown.enter.prevent="buscarProducto"
                placeholder="Ingresa el código de barras"
              />
            </div>
            <div id="searchResult" class="mt-3" v-html="searchResult"></div>
          </div>
          <div class="modal-footer">
            <!-- Botones que antes estaban en #footer -->
            <button type="button" class="btn btn-secondary me-2" data-bs-dismiss="modal" @click="clearSearchForm">Cerrar</button>
            <button type="button" class="btn btn-primary" @click="buscarProducto">Buscar</button>
          </div>
        </div>
      </div>
    </div>


    <!-- Modal Ventas en Espera -->
    <div class="modal fade" id="onHoldSalesModal" tabindex="-1" aria-labelledby="onHoldSalesModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="onHoldSalesModalLabel">Ventas en Espera</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <ul class="list-group">
              <li v-for="venta in ventasEnEspera" :key="venta.id" class="list-group-item">
                {{ venta.descripcion }} - {{ formatCurrency(venta.monto_total) }}
                <!-- Reemplaza AppButton por un botón nativo -->
                <button type="button" class="btn btn-primary btn-sm" @click="retomarVenta(venta.id)">Retomar</button>
              </li>
            </ul>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
          </div>
        </div>
      </div>
    </div>



</template>
  
<script>
// Agregar al inicio del script
import apiService from '../services/apiService.js';

export default {
    name: 'AppNavbar',
    // Added data properties:
    data() {
      return {
        productCodeSearch: '',
        productNameSearch: '',
        searchResult: '',
        showMenu: false,
        ventasEnEspera: []
      };
    },
    // Added methods:
    methods: {
      // Reemplazar el método buscarProducto en “methods”
      async buscarProducto() {
        this.searchResult = '';
        const codigo = this.productCodeSearch.trim();
        if (!codigo) {
          this.searchResult = '<div class="alert alert-warning">Por favor, ingresa el código de barras.</div>';
          return;
        }
        try {
          const url = `${process.env.VUE_APP_API_BASE_URL}/api/products/barcode/${codigo}`;
          const response = await apiService.get(url);
          const producto = response.data;
          console.log("Producto encontrado:", producto);
          if (producto && producto.producto_id) {
            // Aquí puedes agregar la lógica para mostrar el producto encontrado
            this.searchResult = `
              <div class="alert alert-success">
                <strong>Producto encontrado:</strong><br>
                <strong>Nombre:</strong> ${producto.nombre}<br>
                <strong>Categoría:</strong> ${producto.categoria_nombre}<br>
                <strong>Descripción:</strong> ${producto.descripcion ?? '—'}<br>
                <strong>Disponibilidad:</strong> ${producto.stock_disponible > 0 ? 'Disponible' : 'Sin stock'}<br>
                <strong>Precio:</strong> $${(producto.precio_venta_actual ?? 0)}<br>
                <strong>Unidad de Medida:</strong> ${producto.unidad_medida_nombre}<br>
                <strong>IVA:</strong> ${producto.porcentaje_iva}%<br>

              </div>`;
          } else {
            this.searchResult = '<div class="alert alert-danger">Producto no encontrado.</div>';
          }
        } catch (e) {
          console.error("Error al obtener el producto:", e);
          this.searchResult = '<div class="alert alert-danger">Error al buscar el producto.</div>';
        }
      },
      toggleMenu() {
        this.showMenu = !this.showMenu;
      },
      clearSearchForm() {
        this.productCodeSearch = '';
        this.searchResult      = '';
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
        // try {
        //   const response = await fetch(`${process.env.VUE_APP_PENDING_SALES_LIST_URL}`);
        //   const data = await response.json();
        //   this.ventasEnEspera = data.ventas;
        // } catch (error) {
        //   console.error("Error al obtener ventas en espera:", error);
        // }
      },
      cerrarSesion() {
        // Lógica de cierre de sesión: remover token, rol, etc.
        localStorage.removeItem("authToken");
        localStorage.removeItem("rol_id");
        this.$router.push("/"); // O la ruta que desees al cerrar sesión
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
  