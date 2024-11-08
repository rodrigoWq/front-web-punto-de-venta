<template>
    <div class="container mt-5">
      <header class="d-flex justify-content-between align-items-center">
        <h1>Gestión de Documentos</h1>
        <div class="header-buttons">
          <router-link class="btn btn-success" to="/factura">Registrar Factura</router-link>
          <router-link class="btn btn-success" to="/nota-de-remision">Registrar Nota de Remisión</router-link>
        </div>
      </header>
  
      <!-- Barra de Filtros -->
      <div class="filter-section mt-4 mb-4">
        <div class="d-flex justify-content-start mb-3">
          <input type="text" v-model="searchInput" @input="actualizarListaComprobantes" class="form-control w-25" placeholder="Buscar por número de factura o RUC...">
        </div>
        <div class="filters d-flex justify-content-end">
          <button class="btn btn-outline-secondary me-2" :class="{ active: filtroTipo === 'all' }" @click="setFiltroTipo('all')">Todos los Tipos</button>
          <button class="btn btn-outline-secondary me-2" :class="{ active: filtroTipo === 'factura' }" @click="setFiltroTipo('factura')">Factura</button>
          <button class="btn btn-outline-secondary" :class="{ active: filtroTipo === 'nota_remision' }" @click="setFiltroTipo('nota_remision')">Nota de Remisión</button>
        </div>
      </div>
  
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
            <td>{{ comprobante.numeroComprobante || comprobante.nroFactura || 'N/A' }}</td>
            <td>{{ comprobante.rucCliente || comprobante.ruc || 'N/A' }}</td>
            <td>{{ comprobante.fecha || comprobante.fechaEmision || 'N/A' }}</td>
            <td>{{ formatearMonto(comprobante.montoTotal || comprobante.totalFactura) }}</td>
            <td>{{ comprobante.estado || 'activo' }}</td>
            <td>{{ comprobante.tipo === 'nota_remision' ? 'Nota de Remisión' : 'Factura' }}</td>
            <td>
              <button class="btn btn-primary btn-sm me-1" @click="verDetalleComprobante(index)">Ver</button>
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
  export default {
    name: 'ListarFacturas',
    data() {
      return {
        comprobantes: JSON.parse(localStorage.getItem('comprobantes')) || [],
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
          localStorage.setItem('comprobantes', JSON.stringify(this.comprobantes));
          alert('Comprobante anulado correctamente.');
        }
      },
      verDetalleComprobante(index) {
        const comprobante = this.comprobantes[index];
        alert(`Detalle del comprobante N° ${comprobante.numeroComprobante}:\n\nRUC: ${comprobante.rucCliente}\nFecha: ${comprobante.fecha}\nTotal: ${comprobante.montoTotal}\nTipo: ${comprobante.tipo === 'factura' ? 'Factura' : 'Nota de Remisión'}\nEstado: ${comprobante.estado}`);
      },
      generarFacturaDesdeNotaRemision(notaRemision) {
        if (confirm('¿Desea generar una factura a partir de esta nota de remisión?')) {
          const facturaData = {
            ruc: notaRemision.rucCliente,
            razonSocial: notaRemision.razonSocial || 'Nombre desconocido',
            fechaEmision: new Date().toISOString().split('T')[0],
            productos: notaRemision.productos || [],
            totalFactura: notaRemision.montoTotal,
            condicionVenta: 'contado',
            direccion: notaRemision.direccion || 'Sin dirección',
            tipoOriginal: 'nota_remision'
          };
          localStorage.setItem('facturaData', JSON.stringify(facturaData));
          this.$router.push('/factura');
        }
      }
    }
  };
</script>
  
<style scoped>
  body {
    background-color: #f4f4f4;
  }
  h1 {
    margin-bottom: 30px;
  }
  .container {
    background-color: #fff;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  }
  .form-label {
    font-weight: bold;
  }
  .editable-cell {
    background-color: #eaffea;
    border: 1px solid #5cb85c;
  }
</style>
  