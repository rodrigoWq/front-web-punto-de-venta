<!-- src/views/Inventario/InventoryLayout.vue -->
<template>
  <AppNavbar/>
  <div class="d-flex flex-column">	
    <AppHeader title="Sistema de Inventario" class="header-compact px-4 border-bottom">
      <template #buttons>
        <button class="btn btn-outline-secondary me-2">
          <i class="bi bi-bell"></i> Alertas (3)
        </button>
        <button class="btn btn-outline-secondary">
          <i class="bi bi-gear"></i> Configuración
        </button>
      </template>
    </AppHeader>

    <div class="d-flex flex-grow-1">
      <aside class="sidebar p-3">
        <ul class="nav flex-column">
          <li v-for="item in menu" :key="item.name" class="nav-item">
            <router-link
              class="nav-link"
              :to="item.to"
              exact-active-class="active"
            >
              <i :class="item.icon + ' me-2'"></i> {{ item.label }}
            </router-link>
          </li>
        </ul>
      </aside>

      <main class="flex-fill p-4">
        <router-view/>
      </main>
    </div>
  </div>
</template>

<script>
  import AppHeader from '@/components/AppHeader.vue';
  import AppNavbar from '@/components/AppNavbar.vue';
  export default {
    name: 'InventoryLayout',
    components: {
      AppHeader,
      AppNavbar
    },
    data() {
      return {
        menu: [
          { name: 'dashboard',   label: 'Dashboard',    to: { name: 'InvDashboard' },    icon: 'bi bi-speedometer2' },
          { name: 'productos',   label: 'Productos',    to: { name: 'InvProductos' },    icon: 'bi bi-box-seam' },
          { name: 'movimientos', label: 'Movimientos',  to: { name: 'InvMovimientos' },  icon: 'bi bi-arrow-left-right' },
          { name: 'lotes',       label: 'Lotes',        to: { name: 'InvLotes' },        icon: 'bi bi-box2' },
          { name: 'control',     label: 'Control',      to: { name: 'InvControl' },      icon: 'bi bi-clipboard-check' },
          { name: 'depositos',   label: 'Depósitos',    to: { name: 'InvDepositos' },    icon: 'bi bi-building' },
          { name: 'productos-precio', label: 'Precios', to: { name: 'ProductosPrecio' }, icon: 'bi bi-tag' }
        ]
      }
    }
  }
</script>

<style scoped>

 .inventory-layout {
   display: flex;
   flex-direction: column;
   height: 100vh;
 }

 .inventory-layout .d-flex {
   flex-grow: 1;
 }

.header-compact  {
  padding-top: .5rem;
  padding-bottom: .5rem;
}

.header-compact h1 {
  margin: 0;
  font-size: 5rem;    /* opcional */
  font-weight: 600;
}

.sidebar {
  width: 240px;
  background: #fff;
  border-right: 1px solid #e5e5e5;
}

.sidebar .nav-link {
  color: #000;                 /* texto negro por defecto   */
  border-radius: .25rem;       /* bordes suaves             */
  padding: .5rem 1rem;         /* más respiración           */
}

.sidebar .nav-link:hover {
  background: #f2f2f2;         /* gris claro en hover       */
  color: #000;
}

.sidebar .nav-link.active {
  background: #0d0d0d;         /* negro para el activo      */
  color: #fff;                 /* texto blanco              */
  font-weight: 500;            /* el mismo énfasis original */
}
main { background: #f9f9f9; overflow-y: auto; }
</style>
