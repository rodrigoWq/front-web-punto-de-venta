<template>
  <AppNavbar />
  <div class="container mt-4" id="caja-view">
    <AppHeader title="Sistema de Caja" subtitle="Gestión de Tesorería">
      <template #buttons>
        <span class="badge bg-dark me-2">Caja Abierta</span>
        <div class="btn-group" ref="dropdownGroup">
          <button
            type="button"
            class="btn btn-primary dropdown-toggle"
            :aria-expanded="isOpen"
            @click="toggleDropdown"
          >
            + Nuevo Movimiento
          </button>
          <ul class="dropdown-menu" :class="{ show: isOpen }">
            <li>
              <a class="dropdown-item" href="#">
                <i class="bi bi-graph-up text-success me-2"></i>Cobro de Factura de Venta
              </a>
            </li>
            <li>
              <a class="dropdown-item" href="#">
                <i class="bi bi-graph-down text-danger me-2"></i>Pago de Factura
              </a>
            </li>
            <li>
              <a class="dropdown-item" href="#">
                <i class="bi bi-plus-lg text-primary me-2"></i>Ingreso Varios
              </a>
            </li>
            <li>
              <a class="dropdown-item" href="#">
                <i class="bi bi-dash-lg text-warning me-2"></i>Egreso Varios
              </a>
            </li>
            <li>
              <a class="dropdown-item" href="#">
                <i class="bi bi-credit-card text-purple me-2"></i>Cobro a Cliente Crédito
              </a>
            </li>
            <li>
              <a class="dropdown-item" href="#">
                <i class="bi bi-briefcase text-secondary me-2"></i>Pago a Proveedor
              </a>
            </li>
          </ul>
        </div>
      </template>
    </AppHeader>

    <div class="card p-3 mb-3">
      <h5><i class="bi bi-clock me-2"></i>Sesión Actual</h5>
      <div class="row mt-2">
        <div class="col-md-3"><strong>Usuario</strong><br>Juan Pérez</div>
        <div class="col-md-3"><strong>Apertura</strong><br>22/6/2025, 7:54:39 p. m.</div>
        <div class="col-md-3"><strong>Monto Inicial</strong><br>Gs. 500.000</div>
        <div class="col-md-3 text-end">
            <router-link
                class="btn btn-outline-secondary"
                :to="{ name: 'CerrarCaja' }"
                >
                Cerrar Caja
            </router-link>
        </div>
      </div>
    </div>

    <div class="row mb-4">
      <div class="col-md-3">
        <div class="card text-center p-3">
          <div class="text-success">Ingresos del Día</div>
          <h5 class="text-success">Gs. 150.000</h5>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card text-center p-3">
          <div class="text-danger">Egresos del Día</div>
          <h5 class="text-danger">Gs. 75.000</h5>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card text-center p-3">
          <div class="text-primary">Saldo en Caja</div>
          <h5 class="text-primary">Gs. 575.000</h5>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card text-center p-3">
          <div class="text-warning">Facturas Pendientes</div>
          <h5 class="text-warning">5</h5>
        </div>
      </div>
    </div>

    <ul class="nav nav-tabs">
      <li class="nav-item">
        <a class="nav-link active" href="#">Movimientos</a>
      </li>
      <li class="nav-item">
        <a class="nav-link" href="#">Recibos</a>
      </li>
      <li class="nav-item">
        <a class="nav-link" href="#">Reportes</a>
      </li>
      <li class="nav-item">
        <a class="nav-link" href="#">Configuración</a>
      </li>
    </ul>

    <div class="mt-3">
      <!-- Aquí luego agregaremos la tabla de movimientos -->
      <p class="text-muted">Seleccione una pestaña para visualizar el contenido.</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import AppNavbar from '@/components/AppNavbar.vue'
import AppHeader from '@/components/AppHeader.vue'

const isOpen = ref(false)
function toggleDropdown() {
  isOpen.value = !isOpen.value
}

</script>

<style scoped>
#caja-view .card {
  border-radius: 0.5rem;
}
#caja-view .nav-link.active {
  font-weight: bold;
}
.dropdown-menu.show {
  display: block;
  position: absolute;
  z-index: 1050;
}
/* Asegúrate de que el contenedor btn-group sea relativo */
.btn-group {
  position: relative;
}

/* Ubica el dropdown 100% abajo del botón */
.dropdown-menu {
  top: 100%;
  left: 0;
  margin-top: 0.25rem; /* espaciado pequeño */
}
</style>
