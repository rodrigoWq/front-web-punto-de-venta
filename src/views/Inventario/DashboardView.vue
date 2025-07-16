<!-- src/views/Inventario/DashboardView.vue -->
<template>
  <div>
    <!-- Métricas superiores -->
    <div class="row g-4 mb-4">
      <div class="col-md-3" v-for="card in metricCards" :key="card.title">
        <div class="card h-100">
          <div class="card-body d-flex justify-content-between align-items-center">
            <div>
              <h6 class="mb-1">{{ card.title }}</h6>
              <h2 class="mb-1">{{ card.prefix }}{{ card.value.toLocaleString() }}</h2>
              <small class="text-muted">{{ card.footer }}</small>
            </div>
            <i :class="card.icon" :style="{ fontSize: '2rem', color: card.color }"></i>
          </div>
        </div>
      </div>
    </div>

    <div class="row g-4">
      <!-- Alertas de bajo stock -->
      <div class="col-md-6">
        <div class="card h-100">
          <div class="card-body">
            <h5>
              <i class="bi bi-exclamation-triangle-fill text-danger me-2"></i>
              Alertas de Bajo Stock
            </h5>
            <hr>
            <div
              v-for="item in lowStockAlerts"
              :key="item.id"
              class="border rounded p-3 mb-3"
              :style="{ borderColor: '#f8d7da' }"
            >
              <div class="d-flex justify-content-between">
                <div>
                  <strong>{{ item.product }}</strong>
                  <div class="text-muted">{{ item.location }}</div>
                </div>
                <div class="text-end">
                  <div>Stock: {{ item.stock }}</div>
                  <div class="text-danger">Mín: {{ item.min }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Productos por vencer -->
      <div class="col-md-6">
        <div class="card h-100">
          <div class="card-body">
            <h5>
              <i class="bi bi-calendar-event-fill text-warning me-2"></i>
              Productos por Vencer
            </h5>
            <hr>
            <div
              v-for="item in expiringProducts"
              :key="item.id"
              class="border rounded p-3 mb-3"
              :style="{ borderColor: '#fff3cd' }"
            >
              <div class="d-flex justify-content-between">
                <div>
                  <strong>{{ item.product }}</strong>
                  <div class="text-muted">Lote: {{ item.lote }}</div>
                </div>
                <div class="text-end">
                  <div class="text-warning">{{ item.date }}</div>
                  <div class="text-muted">{{ item.location }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'

const metricCards = [
  {
    title: 'Total Productos',
    value: 1234,
    prefix: '',
    footer: '+12% desde el mes pasado',
    icon: 'bi bi-box',
    color: '#333'
  },
  {
    title: 'Valor Total Stock',
    value: 45231,
    prefix: '$',
    footer: '+8% desde el mes pasado',
    icon: 'bi bi-graph-up',
    color: '#333'
  },
  {
    title: 'Productos Bajo Stock',
    value: 23,
    prefix: '',
    footer: 'Requieren atención',
    icon: 'bi bi-exclamation-triangle-fill',
    color: '#dc3545'
  },
  {
    title: 'Productos por Vencer',
    value: 7,
    prefix: '',
    footer: 'Próximos 30 días',
    icon: 'bi bi-calendar2-event',
    color: '#fd7e14'
  },
]

const lowStockAlerts = reactive([
  { id: 1, product: 'Laptop Dell XPS 13',     location: 'Almacén Central', stock: 2, min: 5 },
  { id: 2, product: 'Mouse Logitech MX',      location: 'Sucursal Norte', stock: 1, min: 10 },
  { id: 3, product: 'Teclado Mecánico',       location: 'Almacén Central', stock: 0, min: 3 },
])

const expiringProducts = reactive([
  { id: 1, product: 'Medicamento A', lote: 'LOTO001', date: '2024-02-15', location: 'Farmacia' },
  { id: 2, product: 'Alimento B',     lote: 'LOTO002', date: '2024-02-20', location: 'Almacén Central' },
])
</script>

<style scoped>
h6 { font-weight: 500; }
</style>
