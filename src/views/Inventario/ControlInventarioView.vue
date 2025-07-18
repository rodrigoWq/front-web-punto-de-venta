<template>
  <div class="container-xl px-4">
    <!-- Título + botón -->
    <div class="row">
      <div class="col-12">
        <div class="d-flex justify-content-between align-items-center mb-4 mt-2">
          <h2 class="fw-bold mb-0">Control de Inventario</h2>
          <button class="btn btn-dark d-flex align-items-center">
            <i class="bi bi-plus-lg me-2"></i> Nuevo Control
          </button>
        </div>
      </div>
    </div>

    <!-- Métricas -->
    <div class="row g-4 mb-4">
      <div class="col-md-4" v-for="card in cards" :key="card.title">
        <div class="card h-100">
          <div class="card-body">
            <h6 class="mb-1">{{ card.title }}</h6>
            <h2 class="mb-1" :class="card.color">{{ card.value }}</h2>
            <small class="text-muted">{{ card.subtitle }}</small>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabla de controles -->
    <div class="row">
      <div class="col-12">
        <div class="bg-white rounded shadow-sm p-4">
          <h5 class="fw-bold mb-1">Controles de Inventario</h5>
          <small class="text-muted d-block mb-3">
            Flujo: Generación de listado → Conteo físico → Revisión supervisor → Generación de ajustes
          </small>

          <div class="table-responsive">
            <table class="table align-middle mb-0">
              <thead class="table-light">
                <tr>
                  <th>ID Control</th>
                  <th>Depósito</th>
                  <th>Fecha Creación</th>
                  <th>Responsable</th>
                  <th>Estado</th>
                  <th class="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="ctl in controls" :key="ctl.id">
                  <td>{{ ctl.id }}</td>
                  <td>{{ ctl.deposit }}</td>
                  <td>{{ ctl.date }}</td>
                  <td>{{ ctl.user }}</td>
                  <td>
                    <span
                      class="badge rounded-pill px-3 py-2"
                      :class="ctl.statusClass"
                    >
                      {{ ctl.status }}
                    </span>
                  </td>
                  <td class="text-end">
                    <button class="btn btn-outline-secondary btn-sm">
                      {{ ctl.action }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const cards = [
  { title: 'Controles Pendientes', value: 3, subtitle: 'Esperando conteo físico', color: 'text-warning' },
  { title: 'En Revisión',         value: 2, subtitle: 'Pendientes de aprobación', color: 'text-primary' },
  { title: 'Completados',         value: 15, subtitle: 'Este mes',               color: 'text-success' },
]

const controls = ref([
  {
    id: 'CTRL-001',
    deposit: 'Almacén Central',
    date: '2024-01-15',
    user: 'Juan Pérez',
    status: 'Conteo en Progreso',
    statusClass: 'bg-light text-dark',
    progress: 65,
    action: 'Continuar',
  },
  {
    id: 'CTRL-002',
    deposit: 'Sucursal Norte',
    date: '2024-01-14',
    user: 'María García',
    status: 'En Revisión',
    statusClass: 'bg-dark text-white',
    progress: 100,
    action: 'Revisar',
  },
  {
    id: 'CTRL-003',
    deposit: 'Farmacia',
    date: '2024-01-13',
    user: 'Carlos López',
    status: 'Completado',
    statusClass: 'bg-light text-dark',
    progress: 100,
    action: 'Ver Reporte',
  },
])
</script>
