<template>
  <div class="container-xl px-4">
    <!-- Título + botón uniforme -->
    <div class="row">
      <div class="col-12">
        <div class="d-flex justify-content-between align-items-center mb-4 mt-2">
          <h2 class="fw-bold mb-0">Gestión de Depósitos</h2>
          <button class="btn btn-dark d-flex align-items-center">
            <i class="bi bi-plus-lg me-2"></i> Nuevo Depósito
          </button>
        </div>
      </div>
    </div>

    <!-- Tarjetas de depósitos -->
    <div class="row g-4">
      <div class="col-md-4" v-for="dep in deposits" :key="dep.id">
        <div class="border rounded p-4 h-100">
          <h4 class="fw-bold mb-0">{{ dep.name }}</h4>
          <small class="text-muted d-block mb-3">{{ dep.subtitle }}</small>

          <p class="mb-1">Productos: <span class="fw-bold float-end">{{ dep.products.toLocaleString() }}</span></p>
          <p class="mb-1">Valor Total: <span class="fw-bold float-end">{{ dep.total }}</span></p>
          <p class="mb-3">Estado: <span class="badge bg-dark ms-2">{{ dep.status }}</span></p>

          <button class="btn btn-outline-secondary w-100">Ver Detalle</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const deposits = ref([
  {
    id: 1,
    name: 'Almacén Central',
    subtitle: 'Depósito principal',
    products: 1234,
    total: '$25,430',
    status: 'Activo',
  },
  {
    id: 2,
    name: 'Sucursal Norte',
    subtitle: 'Punto de venta',
    products: 456,
    total: '$12,890',
    status: 'Activo',
  },
  {
    id: 3,
    name: 'Farmacia',
    subtitle: 'Productos farmacéuticos',
    products: 789,
    total: '$8,750',
    status: 'Activo',
  },
])
</script>
