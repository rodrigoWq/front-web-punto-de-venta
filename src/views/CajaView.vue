<template>
  <AppNavbar />
  <div class="container mt-5">
    <AppHeader title="Control de Caja">
      <template #buttons>
        <button v-if="caja.estado === 'cerrada'" class="btn btn-primary" @click="mostrarAbrirModal">Abrir Caja</button>
        <button v-else class="btn btn-danger" @click="mostrarCerrarModal">Cerrar Caja</button>
      </template>
    </AppHeader>

    <div v-if="caja.estado === 'abierta'">
      <p><strong>Fecha de Apertura:</strong> {{ caja.fechaApertura }}</p>
      <p><strong>Monto Apertura:</strong> {{ caja.montoApertura }}</p>
      <h3 class="mt-4">Movimientos</h3>
      <ul class="list-group mb-3">
        <li v-for="(m, index) in caja.movimientos" :key="index" class="list-group-item">
          {{ m.fecha }} - {{ m.tipo }} - {{ m.monto }} - {{ m.descripcion }}
        </li>
      </ul>
      <div class="mb-3">
        <input v-model="nuevoMovimiento.descripcion" placeholder="Descripción" class="form-control mb-2" />
        <input v-model.number="nuevoMovimiento.monto" type="number" placeholder="Monto" class="form-control mb-2" />
        <select v-model="nuevoMovimiento.tipo" class="form-select mb-2">
          <option value="ingreso">Ingreso</option>
          <option value="egreso">Egreso</option>
        </select>
        <button class="btn btn-success" @click="registrarMovimiento">Agregar Movimiento</button>
      </div>
    </div>

    <div class="modal fade" id="abrirModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Abrir Caja</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <input v-model.number="montoApertura" type="number" class="form-control" placeholder="Monto de apertura" />
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button type="button" class="btn btn-primary" @click="abrirCaja">Abrir</button>
          </div>
        </div>
      </div>
    </div>

    <div class="modal fade" id="cerrarModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Cerrar Caja</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <input v-model.number="montoCierre" type="number" class="form-control" placeholder="Monto de cierre" />
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button type="button" class="btn btn-danger" @click="cerrarCaja">Cerrar</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Modal } from 'bootstrap';
import AppNavbar from '@/components/AppNavbar.vue';
import AppHeader from '@/components/AppHeader.vue';
import CajaService from '@/services/CajaService';

export default {
  name: 'CajaView',
  components: { AppNavbar, AppHeader },
  data() {
    return {
      caja: { estado: 'cerrada', movimientos: [] },
      montoApertura: 0,
      montoCierre: 0,
      nuevoMovimiento: { tipo: 'ingreso', monto: 0, descripcion: '' }
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
    mostrarAbrirModal() {
      const modal = new Modal(document.getElementById('abrirModal'));
      modal.show();
    },
    mostrarCerrarModal() {
      const modal = new Modal(document.getElementById('cerrarModal'));
      modal.show();
    },
    async abrirCaja() {
      try {
        await CajaService.abrirCaja({ monto_apertura: this.montoApertura });
        this.cargarCajaActual();
        Modal.getInstance(document.getElementById('abrirModal')).hide();
      } catch (err) {
        console.error('Error abriendo caja', err);
      }
    },
    async cerrarCaja() {
      try {
        await CajaService.cerrarCaja(this.caja.id, { monto_cierre: this.montoCierre });
        this.cargarCajaActual();
        Modal.getInstance(document.getElementById('cerrarModal')).hide();
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
