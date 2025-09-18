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

    <AppFilter v-model="searchInput" placeholder="Buscar por número de nota o proveedor..." customClasses="mt-4 mb-4">
    </AppFilter>

    <!-- Tabla de Comprobantes -->
    <h2>Lista de Notas de Remisión</h2>
    <table class="table table-striped">
      <thead>
        <tr>
          <th>N° de Nota de Remisión</th>
          <th>Proveedor</th>
          <th>Fecha</th>
          <th>Estado</th>
          <th>Tipo de Comprobante</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(comprobante, index) in comprobantesFiltradosPaginados" :key="index">
          <td>{{ comprobante.nro_nota_remision || 'N/A' }}</td>
          <td>{{ comprobante.nombre_razon_social || 'N/A' }}</td>
          <td>{{ comprobante.fecha_emision ? comprobante.fecha_emision.split('T')[0] : 'N/A' }}</td>
          <td>{{ comprobante.estado }}</td>
          <td>Nota de Remisión</td>
          <td>
            <button class="btn btn-primary btn-sm me-1" @click="verDetalleComprobante(comprobante)">
              Ver
            </button>
            <button class="btn btn-danger btn-sm me-1" :disabled="comprobante.estado === 'anulado'" @click="anularComprobante(comprobante)">
              Anular
            </button>
            <!-- Se muestra el botón solo si la nota no está facturada o anulada -->
            <button 
              class="btn btn-info btn-sm" 
              :disabled="!comprobante.pendiente || comprobante.estado === 'anulado'"
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
          itemsPorPagina: 5,
          totalItems: 0,
          totalPaginas: 0
        };
      },
      computed: {
        comprobantesFiltrados() {
          if (!this.searchInput) {
            return this.comprobantes;
          }
          return this.comprobantes.filter(comprobante => {
            const numero = (comprobante.nro_nota_remision || '').toLowerCase();
            const proveedor = (comprobante.nombre_razon_social || '').toLowerCase();
            return numero.includes(this.searchInput.toLowerCase()) || proveedor.includes(this.searchInput.toLowerCase());
          });
        },
        comprobantesFiltradosPaginados() {
          // La paginación ahora es manejada por el backend, 
          // así que simplemente devolvemos los comprobantes filtrados.
          // El filtrado se aplica a la página actual de datos.
          return this.comprobantesFiltrados;
        }
      },
      methods: {
        async cargarComprobantes(page = 1) {
          try {
            const url = `${process.env.VUE_APP_API_BASE_URL}/api/purchases/delivery-notes?page=${page}&limit=${this.itemsPorPagina}`;
            const response = await ApiServices.get(url);
            
            const notas = response.data.data || [];
            
            notas.forEach(nota => {
              nota.tipo = 'nota_remision';
            });
            this.comprobantes = notas;
            
            const pagination = response.data.pagination || {};
            this.totalItems = pagination.total || 0;
            this.paginaActual = pagination.page || 1;
            this.itemsPorPagina = pagination.limit || 5;
            this.totalPaginas = pagination.totalPages || 1;

          } catch (error) {
            console.error('Error al cargar notas de remisión:', error);
          }
        },
        cambiarPagina(page) {
          this.cargarComprobantes(page);
        },
        formatearMonto(monto) {
          if (monto === undefined || monto === null) return "0,00";
          let partes = monto.toString().split('.');
          let parteEntera = partes[0];
          let parteDecimal = partes[1] ? ',' + partes[1] : '';
          parteEntera = parteEntera.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
          return parteEntera + parteDecimal;
        },
        async anularComprobante(comprobante) {
          if (!confirm('¿Está seguro de que desea anular esta nota de remisión?')) return;
          
          try {
             await ApiServices.delete(
               `${process.env.VUE_APP_API_BASE_URL}/api/purchases/delivery-notes/${comprobante.nro_nota_remision}`
             );
             alert('Nota de remisión anulada correctamente.');
            // Recarga la página actual de notas
            await this.cargarComprobantes(this.paginaActual);
          } catch (error) {
            console.error('Error al anular nota de remisión:', error);
            alert('No se pudo anular la nota de remisión. Intente de nuevo.');
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
            razonSocial: comprobante.nombre_razon_social,
            nro_documento: comprobante.nro_nota_remision,
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
    