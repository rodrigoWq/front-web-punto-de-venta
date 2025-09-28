<!-- src/views/Inventario/DashboardView.vue -->
<template>
  <div>
    <!-- Mensaje de error -->
    <div v-if="error" class="alert alert-danger" role="alert">
      <i class="bi bi-exclamation-triangle-fill me-2"></i>
      {{ error }}
      <button @click="() => { fetchDashboardData(); fetchAllAlerts(); }" class="btn btn-outline-danger btn-sm ms-3">
        <i class="bi bi-arrow-clockwise me-1"></i>
        Reintentar
      </button>
    </div>

    <!-- Métricas superiores -->
    <div class="row g-4 mb-4">
      <div class="col-md-3" v-for="card in metricCards" :key="card.title">
        <div class="card h-100">
          <div class="card-body d-flex justify-content-between align-items-center">
            <div>
              <h6 class="mb-1">{{ card.title }}</h6>
              <h2 class="mb-1" :class="{ 'placeholder-glow': loading }">
                <span v-if="loading" class="placeholder col-8"></span>
                <span v-else>{{ card.prefix }}{{ card.value.toLocaleString() }}</span>
              </h2>
              <small class="text-muted" :class="{ 'placeholder-glow': loading }">
                <span v-if="loading" class="placeholder col-6"></span>
                <span v-else>{{ card.footer }}</span>
              </small>
            </div>
            <i :class="card.icon" :style="{ fontSize: '2rem', color: card.color, opacity: loading ? 0.3 : 1 }"></i>
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
            
            <!-- Estado de carga -->
            <div v-if="loadingAlerts" class="text-center py-4">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando...</span>
              </div>
              <p class="mt-2 text-muted">Cargando alertas...</p>
            </div>
            
            <!-- Error -->
            <div v-else-if="errorAlerts" class="alert alert-warning" role="alert">
              <i class="bi bi-exclamation-triangle me-2"></i>
              Error al cargar alertas de bajo stock
            </div>
            
            <!-- Sin datos -->
            <div v-else-if="lowStockAlerts.length === 0" class="text-center py-4">
              <i class="bi bi-check-circle text-success" style="font-size: 2rem;"></i>
              <p class="mt-2 text-muted">No hay productos con bajo stock</p>
            </div>
            
            <!-- Lista de alertas -->
            <div v-else class="scrollable-list">
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
            
            <!-- Estado de carga -->
            <div v-if="loadingAlerts" class="text-center py-4">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando...</span>
              </div>
              <p class="mt-2 text-muted">Cargando productos...</p>
            </div>
            
            <!-- Error -->
            <div v-else-if="errorAlerts" class="alert alert-warning" role="alert">
              <i class="bi bi-exclamation-triangle me-2"></i>
              Error al cargar productos por vencer
            </div>
            
            <!-- Sin datos -->
            <div v-else-if="expiringProducts.length === 0" class="text-center py-4">
              <i class="bi bi-check-circle text-success" style="font-size: 2rem;"></i>
              <p class="mt-2 text-muted">No hay productos próximos a vencer</p>
            </div>
            
            <!-- Lista de productos -->
            <div v-else class="scrollable-list">
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
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import apiService from '@/services/apiService.js'

// Estados reactivos para los datos del dashboard
const dashboardData = ref({})
const loading = ref(true)
const error = ref(null)

// Estados para las alertas
const lowStockAlerts = ref([])
const expiringProducts = ref([])
const loadingAlerts = ref(true)
const errorAlerts = ref(null)

// Función para obtener datos del dashboard
const fetchDashboardData = async () => {
  try {
    loading.value = true
    error.value = null
    
    // TODO: Reemplazar con el sucursal_id real del usuario logueado
    const sucursal_id = 1 // Por ahora usamos un valor fijo
    
    const response = await apiService.get(`/api/inventory-alert/alerts/${sucursal_id}/dashboard`)
    dashboardData.value = response.data
  } catch (err) {
    console.error('Error al obtener datos del dashboard:', err)
    error.value = 'Error al cargar los datos del dashboard'
  } finally {
    loading.value = false
  }
}

// Función para obtener alertas de bajo stock
const fetchLowStockAlerts = async () => {
  try {
    const sucursal_id = 1 // TODO: Reemplazar con el sucursal_id real
    const response = await apiService.get(`/api/inventory-alert/alerts?sucursal_id=${sucursal_id}&tipo=BAJO_STOCK&page=1&pageSize=50`)
    
    lowStockAlerts.value = response.data.items.map(item => ({
      id: item.alerta_id,
      product: item.datos.nombre_producto || 'Producto sin nombre',
      location: item.datos.DEPOSITO || 'Depósito no especificado',
      stock: item.datos.cantidad_disponible || 0,
      min: item.datos.stock_minimo || 0
    }))
  } catch (err) {
    console.error('Error al obtener alertas de bajo stock:', err)
    lowStockAlerts.value = []
  }
}

// Función para obtener productos por vencer
const fetchExpiringProducts = async () => {
  try {
    const sucursal_id = 1 // TODO: Reemplazar con el sucursal_id real
    const response = await apiService.get(`/api/inventory-alert/alerts?sucursal_id=${sucursal_id}&tipo=PROX_VENC&page=1&pageSize=50`)
    
    expiringProducts.value = response.data.items.map(item => {
      const fechaVencimiento = item.datos.fecha_vencimiento_prox
      let fechaFormateada = 'Sin fecha'
      
      if (fechaVencimiento) {
        try {
          fechaFormateada = new Date(fechaVencimiento).toLocaleDateString('es-ES')
        } catch (e) {
          fechaFormateada = 'Fecha inválida'
        }
      }
      
      return {
        id: item.alerta_id,
        product: item.datos.nombre_producto || 'Producto sin nombre',
        lote: item.datos.lote_id ? `LOTE${item.datos.lote_id}` : 'Sin lote',
        date: fechaFormateada,
        location: item.datos.DEPOSITO || 'Depósito no especificado'
      }
    })
  } catch (err) {
    console.error('Error al obtener productos por vencer:', err)
    expiringProducts.value = []
  }
}

// Función para obtener todas las alertas
const fetchAllAlerts = async () => {
  try {
    loadingAlerts.value = true
    errorAlerts.value = null
    
    await Promise.all([
      fetchLowStockAlerts(),
      fetchExpiringProducts()
    ])
  } catch (err) {
    console.error('Error al obtener alertas:', err)
    errorAlerts.value = 'Error al cargar las alertas'
  } finally {
    loadingAlerts.value = false
  }
}

// Métricas calculadas basadas en los datos del backend
const metricCards = computed(() => {
  if (!dashboardData.value || loading.value) {
    // Valores por defecto mientras carga
    return [
      {
        title: 'Total Productos',
        value: 0,
        prefix: '',
        footer: 'Cargando...',
        icon: 'bi bi-box',
        color: '#333'
      },
      {
        title: 'Valor Total Stock',
        value: 0,
        prefix: '$',
        footer: 'Cargando...',
        icon: 'bi bi-graph-up',
        color: '#333'
      },
      {
        title: 'Productos Bajo Stock',
        value: 0,
        prefix: '',
        footer: 'Cargando...',
        icon: 'bi bi-exclamation-triangle-fill',
        color: '#dc3545'
      },
      {
        title: 'Productos por Vencer',
        value: 0,
        prefix: '',
        footer: 'Cargando...',
        icon: 'bi bi-calendar2-event',
        color: '#fd7e14'
      },
    ]
  }

  const data = dashboardData.value
  
  return [
    {
      title: 'Total Productos',
      value: data.total_productos?.value || 0,
      prefix: '',
      footer: data.total_productos?.mom_delta_pct 
        ? `${parseFloat(data.total_productos.mom_delta_pct) > 0 ? '+' : ''}${parseFloat(data.total_productos.mom_delta_pct).toFixed(2)}% desde el mes pasado`
        : 'Sin datos del mes anterior',
      icon: 'bi bi-box',
      color: '#333'
    },
    {
      title: 'Valor Total Stock',
      value: parseFloat(data.valor_stock?.value || 0),
      prefix: '$',
      footer: data.valor_stock?.mom_delta_pct 
        ? `${parseFloat(data.valor_stock.mom_delta_pct) > 0 ? '+' : ''}${parseFloat(data.valor_stock.mom_delta_pct).toFixed(2)}% desde el mes pasado`
        : 'Sin datos del mes anterior',
      icon: 'bi bi-graph-up',
      color: '#333'
    },
    {
      title: 'Productos Bajo Stock',
      value: data.alertas?.bajo_stock?.abiertos || 0,
      prefix: '',
      footer: 'Requieren atención',
      icon: 'bi bi-exclamation-triangle-fill',
      color: '#dc3545'
    },
    {
      title: 'Productos por Vencer',
      value: data.alertas?.prox_venc?.abiertos_30d || 0,
      prefix: '',
      footer: 'En los próximos días',
      icon: 'bi bi-calendar2-event',
      color: '#fd7e14'
    },
  ]
})

// Cargar datos al montar el componente
onMounted(() => {
  fetchDashboardData()
  fetchAllAlerts()
})


</script>

<style scoped>
h6 { font-weight: 500; }
/* suficiente altura para mostrar ~3 cards, ajusta según tu padding/margen */
.scrollable-list {
  max-height: 300px;
  overflow-y: auto;
}

/* opcional: estilado de la scrollbar */
.scrollable-list::-webkit-scrollbar {
  width: 8px;
}
.scrollable-list::-webkit-scrollbar-thumb {
  background-color: rgba(0,0,0,0.2);
  border-radius: 4px;
}

</style>
