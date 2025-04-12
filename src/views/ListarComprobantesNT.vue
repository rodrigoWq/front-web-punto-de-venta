<template>
  <AppNavbar />
  <div class="container mt-5">
    <AppHeader title="Gestión de Notas de Remisión">
      <template #buttons>
        <router-link class="btn btn-success me-2" :to="{ name: 'RegistrarNotaDeRemision' }">
          Registrar Nota de Remisión
        </router-link>
      </template>
    </AppHeader>

    <AppFilter v-model="searchInput" placeholder="Buscar por número de nota o RUC..." customClasses="mt-4 mb-4">
    </AppFilter>

    <!-- Tabla de Comprobantes -->
    <h2>Lista de Notas de Remisión</h2>
    <table class="table table-striped">
      <thead>
        <tr>
          <th>N° de Nota de Remisión</th>
          <th>RUC</th>
          <th>Fecha</th>
          <th>Estado</th>
          <th>Tipo de Comprobante</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(comprobante, index) in comprobantesFiltradosPaginados" :key="index">
          <td>{{ comprobante.nro_nota_remision || 'N/A' }}</td>
          <td>{{ comprobante.nro_documento || 'N/A' }}</td>
          <td>{{ comprobante.fecha_emision ? comprobante.fecha_emision.split('T')[0] : 'N/A' }}</td>
          <td>{{ comprobante.estado }}</td>
          <td>Nota de Remisión</td>
          <td>
            <button class="btn btn-primary btn-sm me-1" @click="verDetalleComprobante(comprobante)">
              Ver
            </button>
            <button class="btn btn-danger btn-sm me-1" :disabled="comprobante.estado === 'anulado'">
              Anular
            </button>
            <!-- Se muestra el botón solo si la nota no tiene factura -->
            <button 
              v-if="comprobante.tiene_factura === 0" 
              class="btn btn-info btn-sm" 
              @click="generarFacturaDesdeNotaRemision(comprobante)">
              Generar Factura
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Controles de Paginación -->
    <AppPagination 
      :currentPage="paginaActual" 
      :totalPages="totalPaginas" 
      @page-changed="cambiarPagina" />
  </div>
</template>
<script>
    import ApiServices from '../services/apiService.js';
    import AppNavbar from '../components/AppNavbar.vue';
    import AppHeader from '../components/AppHeader.vue';
    import AppFilter from '../components/AppFilter.vue';
    import AppPagination from '../components/AppPagination.vue';
    
    export default {
      name: 'ListarNotasDeRemision',
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
          itemsPorPagina: 10,
          totalItems: 0,
          totalPaginas: 0
        };
      },
      computed: {
        comprobantesFiltrados() {
          return this.comprobantes.filter(comprobante => {
            const numero = (comprobante.nro_nota_remision || '').toLowerCase();
            const ruc = (comprobante.nro_documento || '').toLowerCase();
            return numero.includes(this.searchInput.toLowerCase()) || ruc.includes(this.searchInput.toLowerCase());
          });
        },
        comprobantesFiltradosPaginados() {
          const start = (this.paginaActual - 1) * this.itemsPorPagina;
          const end = start + this.itemsPorPagina;
          return this.comprobantesFiltrados.slice(start, end);
        }
      },
      methods: {
        async cargarComprobantes(page = 1) {
          try {
            const response = await ApiServices.get(
              `${process.env.VUE_APP_API_BASE_URL}/api/purchases/delivery-notes`,
              { params: { page } }
            );
            
            // Si la respuesta es un arreglo, úsalo directamente; de lo contrario, intenta extraer "data"
            const notas = Array.isArray(response.data) 
              ? response.data 
              : response.data.data || [];
            
            // Asigna el tipo a cada nota
            notas.forEach(nota => {
              nota.tipo = 'nota_remision';
            });
            this.comprobantes = notas;
            
            // Si la respuesta no trae metadata de paginación, la configuramos localmente
            if (Array.isArray(response.data)) {
              this.totalItems = notas.length;
              this.paginaActual = 1;
              this.itemsPorPagina = 10;
              this.totalPaginas = Math.ceil(notas.length / this.itemsPorPagina);
            } else {
              const pagination = response.data.pagination || {};
              this.totalItems = pagination.total || 0;
              this.paginaActual = pagination.page || 1;
              this.itemsPorPagina = pagination.limit || 10;
              this.totalPaginas = pagination.totalPages || 1;
            }
          } catch (error) {
            console.error('Error al cargar notas de remisión:', error);
          }
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
        anularComprobante(index) {
          if (confirm('¿Está seguro de que desea anular este comprobante?')) {
            this.comprobantes[index].estado = 'anulado';
            // Aquí se podría sincronizar el estado con el backend
            alert('Comprobante anulado correctamente.');
          }
        },
        verDetalleComprobante(comprobante) {
          // Redirige a la vista de detalle para nota de remisión
          this.$router.push({ name: 'NotaDeRemision', params: { id: comprobante.nro_nota_remision } });
        },
        async generarFacturaDesdeNotaRemision(comprobante) {
          if (!comprobante || !comprobante.nro_documento || !comprobante.nombre_razon_social) {
            console.error('Faltan datos en el comprobante:', comprobante);
            alert('Este comprobante no tiene todos los datos necesarios para generar una factura.');
            return;
          }
          try {
            // Si la propiedad productos no existe o está vacía, hacemos una consulta al API para obtener el detalle
            if (!comprobante.productos || comprobante.productos.length === 0) {
              const { data } = await ApiServices.get(`${process.env.VUE_APP_API_BASE_URL}/api/purchases/delivery-notes/${comprobante.nro_nota_remision}`);
              // Se asume que la respuesta tiene una propiedad "detalles"
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
            query: { datosParaFactura: encodeURIComponent(JSON.stringify(datosParaFactura)) }
          });
        }
      },
      async mounted() {
        await this.cargarComprobantes();
      }
    };
</script>
    