<template>
  <AppNavbar />
  <div class="container mt-5">
    <AppHeader title="Control de Caja">
      <template #buttons>
        <AppButton v-if="caja.estado === 'cerrada'" @click="showOpenModal = true">Abrir Caja</AppButton>
        <AppButton v-else variant="danger" @click="showCloseModal = true">Cerrar Caja</AppButton>
      </template>
    </AppHeader>

    <div class="mb-4">
      <p><strong>Estado:</strong> {{ caja.estado }}</p>
      <p v-if="caja.fechaApertura"><strong>Fecha de Apertura:</strong> {{ formatDate(caja.fechaApertura) }}</p>
      <p v-if="caja.montoApertura"><strong>Monto Apertura:</strong> {{ caja.montoApertura }}</p>
    </div>

    <div v-if="caja.estado === 'abierta'" class="mb-4">
      <h4>Registrar Movimiento</h4>
      <div class="row g-2 align-items-end">
        <div class="col-md-3">
          <select v-model="nuevoMovimiento.tipo" class="form-select">
            <option value="ingreso">Ingreso</option>
            <option value="egreso">Egreso</option>
          </select>
        </div>
        <div class="col-md-3">
          <input v-model.number="nuevoMovimiento.monto" type="number" class="form-control" placeholder="Monto" />
        </div>
        <div class="col-md-4">
          <input v-model="nuevoMovimiento.descripcion" class="form-control" placeholder="Descripción" />
        </div>
        <div class="col-md-2">
          <AppButton variant="success" class="w-100" @click="registrarMovimiento">Agregar</AppButton>
        </div>
      </div>
    </div>

    <h3 class="mt-4">Movimientos</h3>
    <AppTable :headers="['Fecha', 'Tipo', 'Monto', 'Descripción']">
      <tr v-for="(m, index) in caja.movimientos" :key="index">
        <td>{{ formatDate(m.fecha) }}</td>
        <td>{{ m.tipo }}</td>
        <td>{{ m.monto }}</td>
        <td>{{ m.descripcion }}</td>
      </tr>
    </AppTable>

    <OpenCajaModal v-model:showModal="showOpenModal" @open="abrirCaja" />
    <CloseCajaModal v-model:showModal="showCloseModal" @close="cerrarCaja" />
  </div>
</template>

<script>
import AppNavbar from '@/components/AppNavbar.vue';
import AppHeader from '@/components/AppHeader.vue';
import AppButton from '@/components/AppButton.vue';
import AppTable from '@/components/AppTable.vue';
import OpenCajaModal from '@/components/OpenCajaModal.vue';
import CloseCajaModal from '@/components/CloseCajaModal.vue';
import CajaService from '@/services/CajaService';

export default {
  name: 'CajaView',
  components: {
    AppNavbar,
    AppHeader,
    AppButton,
    AppTable,
    OpenCajaModal,
    CloseCajaModal
  },
  data() {
    return {
      caja: { estado: 'cerrada', movimientos: [] },
      nuevoMovimiento: { tipo: 'ingreso', monto: 0, descripcion: '' },
      showOpenModal: false,
      showCloseModal: false
    };
  },
  methods: {
    async cargarCajaActual() {
      try {
        const res = await CajaService.obtenerCajaActual();
        this.caja = res.data || { estado: 'cerrada', movimientos: [] };
      } catch (err) {
        console.error('Error obteniendo caja actual', err);
      }
    },
    formatDate(date) {
      return date ? new Date(date).toLocaleString() : '';
    },
    async abrirCaja(monto) {
      try {
        await CajaService.abrirCaja({ monto_apertura: monto });
        this.cargarCajaActual();
      } catch (err) {
        console.error('Error abriendo caja', err);
      }
    },
    async cerrarCaja(monto) {
      try {
        await CajaService.cerrarCaja(this.caja.id, { monto_cierre: monto });
        this.cargarCajaActual();
      } catch (err) {
        console.error('Error cerrando caja', err);
      }
    },
    async registrarMovimiento() {
      if (this.caja.estado !== 'abierta') return;
      try {
        await CajaService.registrarMovimiento(this.caja.id, this.nuevoMovimiento);
        this.nuevoMovimiento = { tipo: 'ingreso', monto: 0, descripcion: '' };
        this.cargarCajaActual();
      } catch (err) {
        console.error('Error registrando movimiento', err);
      }
    }
  },
  mounted() {
    this.cargarCajaActual();
  }
};
</script>

<style scoped>
</style>
