<template>
  <div class="container mt-5">
    <h1>Caja</h1>
    <div v-if="!caja || !caja.abierta" class="mb-3">
      <label class="form-label">Monto inicial</label>
      <input v-model.number="montoInicial" type="number" class="form-control" />
      <button class="btn btn-primary mt-2" @click="abrirCaja">Abrir Caja</button>
    </div>
    <div v-else class="mb-3">
      <p><strong>Fecha Apertura:</strong> {{ formatDate(caja.fechaApertura) }}</p>
      <p><strong>Saldo Actual:</strong> {{ caja.saldoActual }}</p>
      <div class="button-group mb-2">
        <button class="btn btn-danger me-2" @click="cerrarCaja">Cerrar Caja</button>
      </div>
      <div class="mt-3">
        <input v-model="descripcion" class="form-control mb-2" placeholder="Descripción" />
        <input v-model.number="montoMovimiento" type="number" class="form-control mb-2" placeholder="Monto" />
        <button class="btn btn-success me-2" @click="registrarIngreso">Registrar Cobro</button>
        <button class="btn btn-warning" @click="registrarEgreso">Registrar Pago</button>
      </div>
    </div>
    <h2 class="mt-4">Movimientos</h2>
    <table class="table">
      <thead>
        <tr>
          <th>Fecha</th>
          <th>Descripción</th>
          <th>Monto</th>
          <th>Tipo</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(mov, index) in movimientos" :key="index">
          <td>{{ formatDate(mov.fecha) }}</td>
          <td>{{ mov.descripcion }}</td>
          <td>{{ mov.monto }}</td>
          <td>{{ mov.tipo }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import CajaService from '@/services/CajaServiceMock';

export default {
  name: 'CajaView',
  data() {
    return {
      caja: null,
      movimientos: [],
      montoInicial: 0,
      descripcion: '',
      montoMovimiento: 0
    };
  },
  async mounted() {
    this.caja = await CajaService.obtenerEstado();
    this.movimientos = await CajaService.obtenerMovimientos();
  },
  methods: {
    async abrirCaja() {
      this.caja = await CajaService.abrirCaja(this.montoInicial);
      this.movimientos = await CajaService.obtenerMovimientos();
    },
    async cerrarCaja() {
      await CajaService.cerrarCaja();
      this.caja = null;
      this.movimientos = [];
    },
    async registrarIngreso() {
      if (!this.descripcion || !this.montoMovimiento) return;
      await CajaService.registrarMovimiento({
        descripcion: this.descripcion,
        monto: this.montoMovimiento,
        tipo: 'ingreso'
      });
      this.movimientos = await CajaService.obtenerMovimientos();
      this.caja = await CajaService.obtenerEstado();
      this.descripcion = '';
      this.montoMovimiento = 0;
    },
    async registrarEgreso() {
      if (!this.descripcion || !this.montoMovimiento) return;
      await CajaService.registrarMovimiento({
        descripcion: this.descripcion,
        monto: this.montoMovimiento,
        tipo: 'egreso'
      });
      this.movimientos = await CajaService.obtenerMovimientos();
      this.caja = await CajaService.obtenerEstado();
      this.descripcion = '';
      this.montoMovimiento = 0;
    },
    formatDate(fecha) {
      return fecha ? new Date(fecha).toLocaleString() : '';
    }
  }
};
</script>

<style scoped>
.button-group {
  margin-bottom: 1rem;
}
</style>

