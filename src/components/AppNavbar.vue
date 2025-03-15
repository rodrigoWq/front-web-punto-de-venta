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
            <!-- Contenido que antes estaba en #body -->
            <div class="mb-3">
              <label for="productCodeSearch" class="form-label">Código del producto</label>
              <input type="text" class="form-control" v-model="productCodeSearch" @keydown.enter.prevent="buscarProducto" placeholder="Ingresa el código">
            </div>
            <div class="mb-3">
              <label for="productNameSearch" class="form-label">Nombre del producto</label>
              <input type="text" class="form-control" v-model="productNameSearch" @keydown.enter.prevent="buscarProducto" placeholder="Ingresa el nombre del producto">
            </div>
            <div id="searchResult" class="mt-3" v-html="searchResult"></div>
          </div>
          <div class="modal-footer">
            <!-- Botones que antes estaban en #footer -->
            <button type="button" class="btn btn-secondary me-2" data-bs-dismiss="modal">Cerrar</button>
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
      toggleMenu() {
        this.showMenu = !this.showMenu;
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
      },
      cerrarSesion() {
        // Lógica de cierre de sesión: remover token, rol, etc.
        localStorage.removeItem("token");
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
  