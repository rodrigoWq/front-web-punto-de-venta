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
          <th>Estado</th>
          <th>Tipo de Comprobante</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(comprobante, index) in comprobantesFiltradosPaginados" :key="index">
          <td>{{ comprobante.nroNotaRemision || comprobante.nroFactura || 'N/A' }}</td>
          <td>{{ comprobante.rucCliente || comprobante.ruc || 'N/A' }}</td>
          <td>{{ comprobante.fecha || comprobante.fechaEmision || 'N/A' }}</td>
          <td>{{ comprobante.montoTotal || comprobante.totalFactura || '0,00' }}</td>
          <td>{{ comprobante.estado || 'activo' }}</td>
          <td>{{ comprobante.tipo === 'nota_remision' ? 'Nota de Remisión' : 'Factura' }}</td>
          <td>
            <button class="btn btn-primary btn-sm me-1" @click="verDetalleComprobante(comprobante)">Ver</button>
            <button class="btn btn-danger btn-sm me-1" :disabled="comprobante.estado === 'anulado'" @click="anularComprobante(index)">Anular</button>
            <button v-if="comprobante.tipo === 'nota_remision'" class="btn btn-info btn-sm" @click="generarFacturaDesdeNotaRemision(comprobante)">Generar Factura</button>
          </td>
        </tr>
      </tbody>
    </table>


    <!-- Controles de Paginación -->
    <div class="d-flex justify-content-center mt-3">
      <button class="btn btn-secondary me-2" @click="cambiarPagina(paginaActual - 1)" :disabled="paginaActual === 1">Anterior</button>
      <button v-for="page in totalPaginas" :key="page" class="btn btn-outline-secondary me-2" @click="cambiarPagina(page)" :disabled="page === paginaActual">{{ page }}</button>
      <button class="btn btn-secondary" @click="cambiarPagina(paginaActual + 1)" :disabled="paginaActual === totalPaginas">Siguiente</button>
    </div>
  </div>
</template>

<script>
import FacturaService from '@/services/FacturaServiceMock';
import NotaDeRemisionService from '@/services/NotaDeRemisionServiceMock';
import AppNavbar from './common/AppNavbar.vue';
import AppHeader from './common/AppHeader.vue';
import AppFilter from './common/AppFilter.vue';
import AppButton from './common/AppButton.vue';

export default {
  name: 'ListarComprobantes',
  components: {
    AppNavbar,
    AppHeader,
    AppFilter,  
    AppButton 
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
        const numero = (comprobante.numeroComprobante || comprobante.nroFactura || '').toLowerCase();
        const ruc = (comprobante.rucCliente || comprobante.ruc || '').toLowerCase();
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
        const facturas = await FacturaService.obtenerFacturas();
        const notas = await NotaDeRemisionService.obtenerNotas();
        
        // Añadir tipo a cada comprobante para distinguirlos
        facturas.forEach(factura => factura.tipo = 'factura');
        notas.forEach(nota => {
          nota.tipo = 'nota_remision';
          nota.productos = nota.productos || []; // Asegúrate de que tiene productos
          nota.ruc = nota.ruc || 'N/A'; // Valor por defecto si no tiene RUC
          nota.razonSocial = nota.razonSocial || 'N/A'; // Valor por defecto si no tiene razón social
        });
        
        // Combinar facturas y notas de remisión
        this.comprobantes = [...facturas, ...notas];
      } catch (error) {
        console.error('Error al cargar comprobantes:', error);
      }
    },
    generarFacturaDesdeNotaRemision(comprobante) {
      if (!comprobante || !comprobante.productos || !comprobante.ruc || !comprobante.razonSocial) {
        console.error('Faltan datos en el comprobante:', comprobante);
        alert('Este comprobante no tiene todos los datos necesarios para generar una factura.');
        return;
      }

      const datosParaFactura = {
        productos: comprobante.productos, // Productos de la nota de remisión
        ruc: comprobante.ruc,            // RUC asociado
        razonSocial: comprobante.razonSocial, // Razón social asociada
      };
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
        this.$router.push({ name: 'NotaDeRemision', params: { id: comprobante.id } });
      } else {
        console.log("tipo: factura")
        this.$router.push({ name: 'Factura', params: { id: comprobante.id } });
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
