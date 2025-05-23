<template>
  <AppNavbar />
  <div class="container mt-5">
    <AppHeader title="Gestión de Facturas">
      <template #buttons>
        <router-link class="btn btn-success me-2" :to="{ name: 'RegistrarFactura' }">Registrar Factura</router-link>
      </template>
    </AppHeader>


    <AppFilter v-model="searchInput" placeholder="Buscar por número de comprobante o RUC..." customClasses="mt-4 mb-4">
    </AppFilter>


    <!-- Tabla de Comprobantes -->
    <h2>Lista de Facturas</h2>
    <table class="table table-striped">
      <thead>
        <tr>
          <th>N° de Comprobante</th>
          <th>RUC</th>
          <th>Fecha</th>
          <th>Monto Total</th>
          <th>Estado</th>
          <th>Tipo de Comprobante</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(comprobante, index) in comprobantesFiltradosPaginados" :key="index">
          <td>{{ comprobante.nro_comprobante || 'N/A' }}</td>
          <td>{{ comprobante.nro_documento || 'N/A' }}</td>
          <td>{{ comprobante.fecha_emision ? comprobante.fecha_emision.split('T')[0] : 'N/A' }}</td>
          <td>{{ Math.trunc(comprobante.total_iva_incluido) || Math.trunc(comprobante.total_sin_iva) || 'N/A' }}</td>
          <td>{{ comprobante.estado }}</td>

          <td>Factura</td>
          <td>
            <button class="btn btn-primary btn-sm me-1" @click="verDetalleComprobante(comprobante)">Ver</button>
            <button class="btn btn-danger btn-sm me-1" :disabled="comprobante.estado === 'anulado'">Anular</button>
          </td>
        </tr>
      </tbody>
    </table>


    <!-- Controles de Paginación -->
    <AppPagination :currentPage="paginaActual" :totalPages="totalPaginas" @page-changed="cambiarPagina" />
  </div>
</template>

<script>
import ApiServices from '../services/apiService.js';
import AppNavbar from '../components/AppNavbar.vue';
import AppHeader from '../components/AppHeader.vue';
import AppFilter from '../components/AppFilter.vue';
import AppPagination from '../components/AppPagination.vue';

export default {
  name: 'ListarComprobantes',
  components: {
    AppNavbar,
    AppHeader,
    AppFilter,  
    AppPagination 
  },
  data() {
    return {
      comprobantes: [],
      searchInput: '',
      paginaActual: 1,
      itemsPorPagina: 5
    };
  },
  computed: {
    comprobantesFiltrados() {
      return this.comprobantes.filter(comprobante => {
        const numero = (comprobante.nro_comprobante || '').toLowerCase();
        const ruc = (comprobante.nro_documento || '').toLowerCase();
        return numero.includes(this.searchInput.toLowerCase()) || ruc.includes(this.searchInput.toLowerCase());
      });
      
    },
    comprobantesFiltradosPaginados() {
      const start = (this.paginaActual - 1) * this.itemsPorPagina;
      const end = start + this.itemsPorPagina;
      return this.comprobantesFiltrados.slice(start, end);
    },
    totalPaginas() {
      return Math.ceil(this.comprobantesFiltrados.length / this.itemsPorPagina);
    }
  },
  methods: {
    async cargarComprobantes(page = 1) {
      try {
        const response = await ApiServices.get(`${process.env.VUE_APP_API_BASE_URL}/api/purchases/invoices`, {
          params: { page }
        });
        
        // Extraemos las facturas y asignamos el tipo
        const facturas = response.data.data || [];
        facturas.forEach(factura => {
          factura.tipo = 'factura';
        });
        this.comprobantes = facturas;
        
        // Extraemos la metadata de paginación
        const pagination = response.data.pagination || {};
        this.totalItems = pagination.total || 0;
        this.paginaActual = pagination.page || 1;
        this.itemsPorPagina = pagination.limit || 10;
        this.totalPaginas = pagination.totalPages || 1;
      } catch (error) {
        console.error('Error al cargar facturas:', error);
      }
    },


    setFiltroTipo(tipo) {
      this.filtroTipo = tipo;
      this.paginaActual = 1;
    },
    cambiarPagina(page) {
      this.paginaActual = page;
    },
    formatearMonto(monto) {
      if (monto === undefined || monto === null) return "0,00";
      let partes = monto.toString().split('.');
      let parteEntera = partes[0];
      let parteDecimal = partes[1] ? ',' + partes[1] : '';
      parteEntera = parteEntera.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      return parteEntera + parteDecimal;
    },
    actualizarListaComprobantes() {
      this.paginaActual = 1;
    },
    anularComprobante(index) {
      if (confirm('¿Está seguro de que desea anular este comprobante?')) {
        this.comprobantes[index].estado = 'anulado';
        // Aquí podríamos implementar una lógica para sincronizar el estado con el backend si fuera necesario
        alert('Comprobante anulado correctamente.');
      }
    },
    verDetalleComprobante(comprobante) {
      console.log("Tipo: factura");
      this.$router.push({ name: 'Factura', params: { id: comprobante.nro_comprobante } });
    },
  },
  async mounted() {
    await this.cargarComprobantes();
  }
};
</script>

<style scoped>
/* Estilos generales */
.container {
  background-color: #ffffff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
h1, h2 {
  color: #343a40;
}
.form-label {
  font-weight: bold;
  color: #495057;
}
</style>
