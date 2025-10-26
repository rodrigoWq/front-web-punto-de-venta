<template>
    <AppNavbar v-if="!selectorMode && !hideHeader" />
  <div class="container" :class="selectorMode ? 'mt-1 pt-2' : 'mt-5'">
      <AppHeader v-if="!hideHeader" title="Gestión de Proveedores" :class="{ 'mb-2': selectorMode }">
        <template v-if="!selectorMode || allowRegisterInSelector" #buttons>
          <!-- Al hacer click navega a la pantalla de registro (ya existente) -->
          <button class="btn btn-success" @click="()=>{ editProviderId=null; showProviderModal=true }">
            Registrar Proveedor
          </button>
        </template>
      </AppHeader>
  
      <!-- Barra de Filtros -->
  <AppFilter v-model="searchInput" placeholder="Buscar por nombre..." :customClasses="selectorMode ? 'mt-1 mb-3' : 'mt-4 mb-4'" />
  
      <!-- Tabla de Proveedores -->
      <h2>Lista de Proveedores</h2>
      <AppTable :headers="tableHeaders">
        <tr v-for="provider in providersFilteredPaginated" :key="provider.proveedor_id" :class="{ 'selectable-row': selectorMode }" @click="selectorMode ? seleccionarProveedor(provider) : null">
          <td>{{ provider.nombre }}</td>
          <td>{{ provider.contacto }}</td>
          <td>{{ provider.nro_documento }}</td>
          <td>{{ provider.telefono_celular }}</td>
          <td>{{ provider.email }}</td>
          <td v-if="!selectorMode">
            <!-- Al editar, navegamos a la pantalla de registro en modo edición -->
            <button class="btn btn-primary btn-sm" @click.stop="editarProveedor(provider)">✏️</button>
            <button class="btn btn-danger btn-sm" @click.stop="eliminarProveedor(provider.proveedor_id)">🗑️</button>
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
  emits: ['proveedor-seleccionado'],
  props: {
    selectorMode: { type: Boolean, default: false },
    hideHeader: { type: Boolean, default: false },
    allowRegisterInSelector: { type: Boolean, default: false }
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
    tableHeaders() {
      const base = ['Nombre', 'Contacto', 'Identificación Fiscal', 'Teléfono', 'Email'];
      return this.selectorMode ? base : [...base, 'Acciones'];
    },
    providersFiltered() {
      const providersArray = Array.isArray(this.providers) ? this.providers : [];
      const search = this.searchInput.toLowerCase();
      return providersArray.filter(provider =>
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
    seleccionarProveedor(provider) {
      this.$emit('proveedor-seleccionado', provider);
    },
    async cargarProveedores() {
      try {
        const url = `${process.env.VUE_APP_API_BASE_URL}/api/providers/`;
        const response = await apiService.get(url);
        // Asegúrate de que siempre asignes un array
        this.providers = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      } catch (error) {
        console.error('Error al cargar proveedores:', error);
        this.providers = []; // Asigna un array vacío en caso de error
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
      const confirmed = await confirm({
        message: '¿Estás seguro de eliminar este proveedor?',
        title: 'Eliminar proveedor',
        confirmText: 'Eliminar',
        cancelText: 'Cancelar'
      });
      if (!confirmed) return;

      try {
        const url = `${process.env.VUE_APP_API_BASE_URL}/api/providers/${id}`;
        await apiService.delete(url);
        this.providers = this.providers.filter(p => p.proveedor_id !== id);
        alert.success('Proveedor eliminado correctamente.');
      } catch (error) {
        console.error('Error al eliminar proveedor:', error);
        alert.error('No se pudo eliminar el proveedor. Revisa la consola.');
      }
    },
  },
  mounted() {
    this.cargarProveedores();
  },
};
</script>

<style scoped>
.selectable-row {
  cursor: pointer;
}
.selectable-row:hover {
  background-color: #f8f9fa;
}
</style>
