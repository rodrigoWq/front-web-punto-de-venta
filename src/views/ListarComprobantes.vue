<template>
  <AppNavbar />
  <div class="container mt-5">
    <AppHeader title="Gestión de Documentos">
      <template #buttons>
        <router-link class="btn btn-success me-2" :to="{ name: 'RegistrarFactura' }">Registrar Factura</router-link>
        <router-link class="btn btn-success" :to="{ name: 'RegistrarNotaDeRemision' }">Registrar Nota de Remisión</router-link>
      </template>
    </AppHeader>


    <AppFilter v-model="searchInput" placeholder="Buscar por número de comprobante o RUC..." customClasses="mt-4 mb-4">
      <AppButton variant="outline-secondary" customClass="me-2" :class="{ active: filtroTipo === 'all' }" @click="setFiltroTipo('all')">Todos los Tipos</AppButton>
      <AppButton variant="outline-secondary" customClass="me-2" :class="{ active: filtroTipo === 'factura' }" @click="setFiltroTipo('factura')">Factura</AppButton>
      <AppButton variant="outline-secondary" :class="{ active: filtroTipo === 'nota_remision' }" @click="setFiltroTipo('nota_remision')">Nota de Remisión</AppButton>
    </AppFilter>


    <!-- Tabla de Comprobantes -->
    <h2>Lista de Comprobantes</h2>
    <table class="table table-striped">
      <thead>
        <tr>
          <th>N° de Comprobante</th>
          <th>RUC</th>
          <th>Fecha</th>
          <th>Monto Total</th>
          <th>Pendiente</th>
          <th>Tipo de Comprobante</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(comprobante, index) in comprobantesFiltradosPaginados" :key="index">
          <td>{{ comprobante.nro_comprobante || comprobante.nro_nota_remision || 'N/A' }}</td>
          <td>{{ comprobante.nro_documento || 'N/A' }}</td>
          <td>{{ comprobante.fecha_emision || 'N/A' }}</td>
          <td>{{ comprobante.total_iva_incluido || comprobante.total_sin_iva || 'N/A' }}</td>
          <td>{{ comprobante.pendiente }}</td>

          <td>{{ comprobante.tipo === 'nota_remision' ? 'Nota de Remisión' : 'Factura' }}</td>
          <td>
            <button class="btn btn-primary btn-sm me-1" @click="verDetalleComprobante(comprobante)">Ver</button>
            <button class="btn btn-danger btn-sm me-1" :disabled="comprobante.estado === 'anulado'">Anular</button>
            <button v-if="comprobante.tipo === 'nota_remision'" class="btn btn-info btn-sm" @click="generarFacturaDesdeNotaRemision(comprobante)">Generar Factura</button>
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
import AppButton from '../components/AppButton.vue';
import AppPagination from '../components/AppPagination.vue';

export default {
  name: 'ListarComprobantes',
  components: {
    AppNavbar,
    AppHeader,
    AppFilter,  
    AppButton,
    AppPagination 
  },
  data() {
    return {
      comprobantes: [],
      searchInput: '',
      filtroTipo: 'all',
      paginaActual: 1,
      itemsPorPagina: 5
    };
  },
  computed: {
    comprobantesFiltrados() {
      return this.comprobantes.filter(comprobante => {
        const numero = (comprobante.nro_comprobante || comprobante.nro_nota_remision || '').toLowerCase();
        const ruc = (comprobante.nro_documento || '').toLowerCase();
        const tipo = comprobante.tipo || '';

        const matchesSearch = numero.includes(this.searchInput.toLowerCase()) || ruc.includes(this.searchInput.toLowerCase());
        const matchesFilter = this.filtroTipo === 'all' || tipo === this.filtroTipo;

        return matchesSearch && matchesFilter;
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
    async cargarComprobantes() {
      try {
        const { data: facturas } = await ApiServices.get(`${process.env.VUE_APP_API_BASE_URL}/api/purchases/invoices`);
        const { data: notas } = await ApiServices.get(`${process.env.VUE_APP_API_BASE_URL}/api/purchases/delivery-notes`);
        
        facturas.forEach(factura => {
          factura.tipo = 'factura';
        });
        notas.forEach(nota => {
          nota.tipo = 'nota_remision';
        });
        
        this.comprobantes = [...facturas, ...notas];
      } catch (error) {
        console.error('Error al cargar comprobantes:', error);
      }
    },

    async generarFacturaDesdeNotaRemision(comprobante) {
      if (!comprobante || !comprobante.nro_documento || !comprobante.nombre_razon_social) {
        console.error('Faltan datos en el comprobante:', comprobante);
        alert('Este comprobante no tiene todos los datos necesarios para generar una factura.');
        return;
      }

      try {
        // Si comprobante.productos no existe o está vacío, hacemos una consulta al API para obtener los detalles
        if (!comprobante.productos || comprobante.productos.length === 0) {
          // Realizamos el GET usando el servicio definido, utilizando el identificador (nro_nota_remision)
          const { data } = await ApiServices.get(`${process.env.VUE_APP_API_BASE_URL}/api/purchases/delivery-notes/${comprobante.nro_nota_remision}`);
          // La respuesta debe tener la estructura: { cabecera: { ... }, detalles: [ ... ] }
          // Asignamos el arreglo de detalles a la propiedad productos del comprobante
          comprobante.productos = data.detalles;
        }
      } catch (error) {
        console.error('Error al obtener el detalle de productos:', error);
        alert('No se pudieron cargar los productos del comprobante.');
        return;
      }

      const datosParaFactura = {
        productos: comprobante.productos || [],
        ruc: comprobante.nro_documento,
        razonSocial: comprobante.nombre_razon_social
      };
      console.log("datosParaFactura", comprobante);
      this.$router.push({
        name: 'RegistrarFactura',
        query: { datosParaFactura: encodeURIComponent(JSON.stringify(datosParaFactura)) },
      });
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
      if (comprobante.tipo === 'nota_remision') {
        console.log("tipo: nota_remision")
        this.$router.push({ name: 'NotaDeRemision', params: { id: comprobante.nro_nota_remision } });
      } else {
        console.log("tipo: factura")
        this.$router.push({ name: 'Factura', params: { id: comprobante.nro_comprobante } });
      }
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
