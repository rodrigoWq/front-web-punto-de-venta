<template>
  <div class="container-xl px-4">
    <!-- Título y botón uniforme -->
    <div class="row">
      <div class="col-12">
        <div class="d-flex justify-content-between align-items-center mb-4 mt-2">
          <h2 class="fw-bold mb-0">Gestión de Lotes</h2>
          <button class="btn btn-dark d-flex align-items-center">
            <i class="bi bi-plus-lg me-2"></i> Nuevo Lote
          </button>
        </div>
      </div>
    </div>

    <!-- Tabla de Lotes dentro de card blanco -->
    <div class="bg-white rounded shadow-sm p-4">
      <div class="table-responsive">
        <table class="table align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th>Código Lote</th>
              <th>Producto</th>
              <th>Fecha Producción</th>
              <th>Fecha Vencimiento</th>
              <th>Stock Actual</th>
              <th>Depósito</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="lot in lots" :key="lot.id">
              <td>{{ lot.code }}</td>
              <td>{{ lot.product }}</td>
              <td>{{ lot.productionDate }}</td>
              <td>{{ lot.expirationDate || '-' }}</td>
              <td>{{ lot.stock }}</td>
              <td>{{ lot.deposit }}</td>
              <td>
                <span
                  class="badge rounded-pill px-3 py-2"
                  :class="lot.status === 'Por Vencer' ? 'bg-danger text-white' : 'bg-dark text-white'"
                >
                  {{ lot.status }}
                </span>
              </td>
              <td>
                <button class="btn btn-outline-secondary btn-sm">Ver Detalle</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const lots = ref([
  {
    id: 1,
    code: 'LOTO001',
    product: 'Medicamento A',
    productionDate: '2023-08-15',
    expirationDate: '2024-02-15',
    stock: 25,
    deposit: 'Farmacia',
    status: 'Por Vencer',
  },
  {
    id: 2,
    code: 'LOTO002',
    product: 'Alimento B',
    productionDate: '2023-12-01',
    expirationDate: '2024-06-01',
    stock: 150,
    deposit: 'Almacén Central',
    status: 'Vigente',
  },
  {
    id: 3,
    code: 'LOTO003',
    product: 'Producto Sin Vencimiento',
    productionDate: '2024-01-10',
    expirationDate: '',
    stock: 75,
    deposit: 'Almacén Central',
    status: 'Vigente',
  },
])
</script>
