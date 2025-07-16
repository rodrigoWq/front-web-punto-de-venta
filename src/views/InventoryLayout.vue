<!-- src/views/Inventario/InventoryLayout.vue -->
<template>
  <AppNavbar/>
  <div class="inventory-layout d-flex flex-column">	
    <AppHeader title="Sistema de Inventario" class="px-4 mb-0 border-bottom" >
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
              active-class="active"
            >
              <i :class="item.icon"></i> {{ item.label }}
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


.sidebar {
  width: 240px;
  background: #fff;
  border-right: 1px solid #e5e5e5;
}
.sidebar .nav-link.active {
  background-color: #f0f0f0;
  font-weight: 500;
}
main { background: #f9f9f9; overflow-y: auto; }
</style>
