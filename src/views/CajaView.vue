<template>
  <AppNavbar />
  <div class="container mt-5">
    <AppHeader title="Caja">
      <template #buttons>
        <AppButton v-if="!store.isOpen" @click="showOpenModal = true">Abrir Caja</AppButton>
        <AppButton v-else variant="danger" @click="showCloseModal = true">Cerrar Caja</AppButton>
      </template>
    </AppHeader>

    <div class="mb-4">
      <p><strong>Estado:</strong> {{ store.isOpen ? 'abierta' : 'cerrada' }}</p>
    </div>

    <div v-if="store.isOpen" class="mb-4">
      <h4>Registrar Movimiento</h4>
      <div class="row g-2 align-items-end">
        <div class="col-md-3">
          <select v-model="nuevoMovimiento.tipo" class="form-select">
            <option value="Cobro">Cobro</option>
            <option value="Pago">Pago</option>
            <option value="Depósito">Depósito</option>
            <option value="Retiro">Retiro</option>
          </select>
        </div>
        <div class="col-md-3">
          <input v-model.number="nuevoMovimiento.monto" type="number" class="form-control" placeholder="Monto" />
        </div>
        <div class="col-md-3">
          <select v-model="nuevoMovimiento.formaPago" class="form-select">
            <option value="Efectivo">Efectivo</option>
          </select>
        </div>
        <div class="col-md-2">
          <AppButton variant="success" class="w-100" @click="registrarMovimiento">Agregar</AppButton>
        </div>
      </div>
    </div>

    <h3 class="mt-4">Movimientos</h3>
    <div class="mb-2">
      <input v-model="search" class="form-control" placeholder="Buscar" />
    </div>
    <AppTable :headers="['ID', 'Fecha', 'Tipo', 'Forma de Pago', 'Monto']">
      <tr v-for="m in filteredMovimientos" :key="m.id">
        <td>{{ m.id }}</td>
        <td>{{ formatDate(m.fecha) }}</td>
        <td>{{ m.tipo }}</td>
        <td>{{ m.formaPago }}</td>
        <td>{{ m.monto }}</td>
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
import { useCajaStore } from '@/stores/cajaStore';

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
  setup() {
    const store = useCajaStore();
    return { store };
  },
  data() {
    return {
      nuevoMovimiento: { tipo: 'Cobro', monto: 0, formaPago: 'Efectivo' },
      showOpenModal: false,
      showCloseModal: false,
      search: ''
    };
  },
  computed: {
    filteredMovimientos() {
      const term = this.search.toLowerCase();
      return this.store.movimientos.filter(m =>
        m.tipo.toLowerCase().includes(term) ||
        m.formaPago.toLowerCase().includes(term)
      );
    }
  },
  methods: {
    formatDate(date) {
      return date ? new Date(date).toLocaleString() : '';
    },
    async abrirCaja(amount) {
      await this.store.abrirCaja();
    },
    async cerrarCaja(amount) {
      await this.store.cerrarCaja();
    },
    async registrarMovimiento() {
      if (!this.store.isOpen) return;
      await this.store.registrarMovimiento(this.nuevoMovimiento);
      this.nuevoMovimiento = { tipo: 'Cobro', monto: 0, formaPago: 'Efectivo' };
    }
  },
  mounted() {
    this.store.fetchMovimientos();
  }
};
</script>

<style scoped>
</style>
