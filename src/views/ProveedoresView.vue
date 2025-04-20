<template>
    <AppNavbar />
    <div class="container mt-5">
      <AppHeader title="Gestión de Proveedores">
        <template #buttons>
          <!-- Al hacer click navega a la pantalla de registro (ya existente) -->
          <button class="btn btn-success" @click="()=>{ editProviderId=null; showProviderModal=true }">
            Registrar Proveedor
          </button>
        </template>
      </AppHeader>
  
      <!-- Barra de Filtros -->
      <AppFilter v-model="searchInput" placeholder="Buscar por nombre..." customClasses="mt-4 mb-4" />
  
      <!-- Tabla de Proveedores -->
      <h2>Lista de Proveedores</h2>
      <AppTable :headers="['Nombre', 'Contacto', 'Identificación Fiscal', 'Teléfono', 'Email', 'Acciones']">
        <tr v-for="provider in providersFilteredPaginated" :key="provider.proveedor_id">
          <td>{{ provider.nombre }}</td>
          <td>{{ provider.contacto }}</td>
          <td>{{ provider.nro_documento }}</td>
          <td>{{ provider.telefono_celular }}</td>
          <td>{{ provider.email }}</td>
          <td>
            <!-- Al editar, navegamos a la pantalla de registro en modo edición -->
            <button class="btn btn-primary btn-sm" @click="editarProveedor(provider)">✏️</button>
            <button class="btn btn-danger btn-sm" @click="eliminarProveedor(provider.proveedor_id)">🗑️</button>
          </td>
        </tr>
      </AppTable>
  
      <AppPagination :currentPage="currentPage" :totalPages="totalPages" @page-changed="changePage" />
      <!-- Modal Registrar/Editar Proveedor -->
      <RegistrarProveedorModal
        v-model:showModal="showProviderModal"
        :id="editProviderId"
        :initial-ruc="editProviderId ? '' : undefined"
        @provider-registered="cargarProveedores"
      />
    </div>
  </template>
  
  <script>
import AppNavbar from '../components/AppNavbar.vue';
import AppHeader from '../components/AppHeader.vue';
import AppFilter from '../components/AppFilter.vue';
import AppTable from '../components/AppTable.vue';
import AppPagination from '../components/AppPagination.vue';
import apiService from '../services/apiService';
import RegistrarProveedorModal from '@/components/RegistrarProveedorModal.vue';


export default {
  name: 'ProveedoresABM',
  components: {
    AppNavbar,
    AppHeader,
    AppFilter,
    AppTable,
    AppPagination,
    RegistrarProveedorModal,
  },
  data() {
    return {
      providers: [],       // Lista de proveedores
      searchInput: '',     // Filtro de búsqueda por nombre
      currentPage: 1,
      itemsPerPage: 5,
      showProviderModal: false,
      editProviderId: null 

    };
  },
  computed: {
    providersFiltered() {
      const search = this.searchInput.toLowerCase();
      return this.providers.filter(provider =>
        provider.nombre.toLowerCase().includes(search)
      );
    },
    totalPages() {
      return Math.ceil(this.providersFiltered.length / this.itemsPerPage);
    },
    providersFilteredPaginated() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      return this.providersFiltered.slice(start, start + this.itemsPerPage);
    },
  },
  methods: {
    async cargarProveedores() {
      try {
        const url = `${process.env.VUE_APP_API_BASE_URL}/api/providers/`;
        const response = await apiService.get(url);
        this.providers = response.data;
      } catch (error) {
        console.error('Error al cargar proveedores:', error);
      }
    },
    changePage(page) {
      this.currentPage = page;
    },
    editarProveedor(provider) {
      // Navega a la pantalla de registro/en edición pasando el ID del proveedor
      this.editProviderId   = provider.proveedor_id;
      this.showProviderModal = true;
    },
    async eliminarProveedor(id) {
      if (confirm('¿Estás seguro de eliminar este proveedor?')) {
        try {
          const url = `${process.env.VUE_APP_API_BASE_URL}/api/providers/${id}`;
          await apiService.delete(url);
          this.providers = this.providers.filter(p => p.proveedor_id !== id);
        } catch (error) {
          console.error('Error al eliminar proveedor:', error);
        }
      }
    },
  },
  mounted() {
    this.cargarProveedores();
  },
};
</script>
