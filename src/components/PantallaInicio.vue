<template>
    <div id="pantalla-inicio">
      <!-- Navegación -->
      <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
        <div class="container-fluid">
          <a class="navbar-brand" href="#">
            <i class="bi bi-house-door"></i>
          </a>
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
  
      <!-- Contenido Principal -->
      <div class="container mt-4 flex-grow-1">
        <!-- Formulario de Producto -->
        <div class="card p-4 mb-4">
          <div class="row g-3">
            <div class="col">
              <label for="productCode" class="form-label">Código del producto</label>
              <div class="input-group">
                <input type="text" class="form-control" v-model="productCode" placeholder="Ingresa el código" />
                <button class="btn btn-success" @click="agregarProducto">
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
                <input type="text" class="form-control" v-model="rucCliente" placeholder="Ingresa el RUC/CI del cliente" />
                <button class="btn btn-success" @click="agregarRUC">
                  <i class="bi bi-plus"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
  
        <!-- Tabla de Productos -->
        <div class="table-container">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>No. de Producto</th>
                <th>Código</th>
                <th>Nombre</th>
                <th>Cantidad</th>
                <th>Unidad de Medida</th>
                <th>Precio Unitario</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(producto, index) in productos" :key="index">
                <td>{{ index + 1 }}</td>
                <td>{{ producto.codigo }}</td>
                <td>{{ producto.nombre }}</td>
                <td>{{ producto.cantidad }}</td>
                <td>{{ producto.unidad_medida }}</td>
                <td>{{ producto.precio }}</td>
                <td>
                  <button class="btn btn-danger btn-sm" @click="eliminarProducto(index)">
                    <i class="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="modal fade" id="searchProductModal" tabindex="-1" aria-labelledby="searchProductModalLabel" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="searchProductModalLabel">Buscar Producto</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
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
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
              <button type="button" class="btn btn-primary" @click="buscarProducto">Buscar</button>
            </div>
          </div>
        </div>
      </div>
          <!-- Modal para Ventas en Espera -->
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
                  <button class="btn btn-primary btn-sm" @click="retomarVenta(venta.id)">Retomar</button>
                </li>
              </ul>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Modales y Otros Componentes (configurados en los métodos de Vue) -->
    </div>
</template>
  
<script>
export default {
  name: "PantallaInicio",
  data() {
    return {
      productCode: '',
      productQuantity: 1,
      rucCliente: '',
      productos: [],
      // Nuevas propiedades para la funcionalidad de búsqueda
      productCodeSearch: '',
      productNameSearch: '',
      searchResult: '',
      ventasEnEspera: []  // Lista de ventas en espera
    };
  },
  computed: {
    totalAmount() {
      return this.productos.reduce((acc, producto) => {
        return acc + producto.cantidad * producto.precio;
      }, 0).toFixed(2);
    }
  },
  methods: {
    agregarProducto() {
      if (!this.productCode) {
        alert("Por favor, ingresa un código de producto");
        return;
      }

      fetch(`https://apimocha.com/producttest/inventory/product/check/codigo_barras=${this.productCode}`)
        .then((response) => response.json())
        .then((product) => {
          if (product) {
            const productoNuevo = {
              codigo: product.producto_id,
              nombre: product.nombre,
              cantidad: this.productQuantity,
              unidad_medida: product.unidad_medida,
              precio: product.precio
            };
            this.productos.push(productoNuevo);
          } else {
            alert("Producto no encontrado");
          }
        })
        .catch((error) => console.error("Error al obtener el producto:", error));
    },
    eliminarProducto(index) {
      if (confirm("¿Estás seguro de que deseas eliminar este producto?")) {
        this.productos.splice(index, 1);
      }
    },
    // Nueva funcionalidad de búsqueda de producto
    buscarProducto() {
      this.searchResult = "";
      const codigo = this.productCodeSearch.trim();
      const nombre = this.productNameSearch.trim();

      if (!codigo && !nombre) {
        this.searchResult = '<div class="alert alert-warning">Por favor, ingresa el código o el nombre del producto.</div>';
        return;
      }

      const url = codigo
        ? `https://apimocha.com/producttest/inventory/product/check/${codigo}`
        : `https://apimocha.com/producttest/inventory/product/check/nombre=${encodeURIComponent(nombre)}`;

      fetch(url)
        .then((response) => response.json())
        .then((producto) => {
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
        .catch((error) => {
          console.error("Error al buscar el producto:", error);
          this.searchResult = '<div class="alert alert-danger">Error al buscar el producto.</div>';
        });
    },
    async ponerVentaEnEspera() {
      const confirmacion = confirm("¿Estás seguro de que deseas poner esta venta en espera?");
      if (!confirmacion) return;

      const data = {
        venta_id: null,
        cliente_id: 1,
        items_venta: this.productos.map((producto) => ({
          producto_id: producto.codigo,
          cantidad: producto.cantidad,
          precio: producto.precio
        })),
        monto_total: this.totalAmount,
        fecha_venta: new Date().toISOString().slice(0, 10)
      };

      try {
        const response = await fetch("https://apimocha.com/example122/sales/pending", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });
        const result = await response.json();
        if (result.message) {
          alert("Venta puesta en espera correctamente.");
          this.productos = [];  // Limpiar productos en tabla después de poner en espera
        }
      } catch (error) {
        console.error("Error:", error);
        alert("Hubo un error al poner la venta en espera.");
      }
    },
    async obtenerVentasEnEspera() {
      try {
        const response = await fetch("https://apimocha.com/producttest/obtenerLista/pending/id=33");
        const data = await response.json();
        this.ventasEnEspera = data.ventas;  // Suponiendo que el formato es data.ventas
      } catch (error) {
        console.error("Error al obtener ventas en espera:", error);
      }
    },
    async retomarVenta(ventaId) {
      try {
        const response = await fetch(`https://apimocha.com/example122/sales/pending/id=${ventaId}`);
        const data = await response.json();
        this.productos = data.items_venta;  // Cargar productos de la venta retomada
        alert("Venta retomada con éxito.");
      } catch (error) {
        console.error("Error al retomar la venta:", error);
      }
    },
    formatCurrency(value) {
      return new Intl.NumberFormat("es-ES", {
        style: "currency",
        currency: "USD"
      }).format(value);
    }
  }
};
</script>

  
<style scoped>
  /* Incluye aquí el contenido de pantalla_inicial.css */
/* Asegurarse de que el body ocupe todo el viewport */
body {
    font-family: Arial, sans-serif;
    display: flex;
    flex-direction: column;
    height: 100vh;
    margin: 0;
    overflow: hidden; /* Elimina el scroll en toda la página */
}

/* Navegación */
.navbar-dark .navbar-nav .nav-link {
    color: white;
    font-weight: bold;
}

.navbar-dark .navbar-nav .nav-link:hover {
    color: #ddd;
}

/* Tabla de productos */
.table-hover tbody tr:hover {
    background-color: #f1f1f1;
}

/* Contenedor principal */
.container {
    display: flex;
    flex-direction: column;
    flex-grow: 1; /* El contenedor crece para ocupar el espacio restante */
    overflow: hidden; /* Evita el scroll en la página principal */
}

/* Tabla de productos */
.table-container {
    flex-grow: 1;
    overflow-y: auto;  /* Permite el desplazamiento vertical solo en la tabla */
    overflow-x: auto;  /* Permite el desplazamiento horizontal si es necesario */
    padding-bottom: 95px; /* Ajusta este valor según la suma de las alturas de los footers */
}

/* Añadir un borde a toda la tabla */
.table {
    border: 2px solid #000; /* Puedes ajustar el grosor y color del borde */
    border-collapse: collapse; /* Hace que las celdas compartan los bordes */
}

/* Añadir borde a las celdas de la tabla */
.table th, .table td {
    border: 1px solid #ddd; /* Borde para celdas y cabecera */
    padding: 8px; /* Espacio dentro de cada celda */
}

/* Opción para darle un borde más pronunciado a la cabecera */
.table thead th {
    position: sticky;
    top: 0; /* Se queda pegado en la parte superior al hacer scroll */
    background-color: white; /* Color de fondo para que se vea sobre las filas */
    z-index: 1; /* Asegura que el encabezado esté por encima de las filas */
    border-bottom: 2px solid #000; /* Borde más grueso para la cabecera */
}

/* Botones alineados a la derecha */
.button-container {
    display: flex;
    gap: 10px; /* Espacio entre los botones */
}

.total-footer-section h4 {
    display: flex;
    justify-content: center;
}

/* Sección de Total y Acciones */
.total-footer-section {
    position: fixed;
    bottom: 50px; /* Justo por encima del footer */
    left: 0;
    right: 0; /* Asegura que ocupe todo el ancho del viewport */
    width: 100vw; /* Asegura que ocupe todo el ancho de la pantalla */
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



/* Estilo para el valor dentro del span */
 h4 span {
    color: #ff5722; /* Color del monto total */
}

/* Footer verdadero */
.footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0; /* Asegura que ocupe todo el ancho del viewport */
    background-color: #343a40;
    color: white;
    padding: 10px 20px;
    height: 50px;
    display: flex;
    justify-content: space-between; /* Mantiene la distribución entre cajero, hora y botones */
    align-items: center;
    z-index: 1000;
    box-sizing: border-box;
}

/* Asegurar que el contenido esté bien distribuido */
.footer .d-flex {
    justify-content: space-between;
    width: 100%;
}

/* Espaciado entre los botones */
.gap-3 {
    gap: 10px; /* Ajusta el espacio entre los botones */
}

/* Ajusta los botones del footer */
.footer .btn {
    padding: 5px 10px;
    font-size: 14px;
}

.total-footer-section h4 {
    padding-left: 100px; /* Ajusta para que el texto del total no se desplace demasiado */
}


/* Texto Comercial Graciela */
.comercial-graciela {
    color: white !important;
    font-weight: bold;
}

  
  /* Estilos adicionales del archivo pantalla_inicial.css... */
  </style>
  