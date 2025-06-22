import { defineStore } from 'pinia';
import CajaService from '@/services/CajaService';

export const useCajaStore = defineStore('caja', {
  state: () => ({
    movimientos: [],
    isOpen: false,
    loading: false
  }),
  actions: {
    async fetchMovimientos() {
      try {
        this.loading = true;
        const { data } = await CajaService.obtenerMovimientos();
        this.movimientos = data || [];
      } finally {
        this.loading = false;
      }
    },
    async registrarMovimiento(movimiento) {
      await CajaService.registrarMovimiento(movimiento);
      await this.fetchMovimientos();
    },
    async abrirCaja() {
      await CajaService.abrirCaja();
      this.isOpen = true;
    },
    async cerrarCaja() {
      await CajaService.cerrarCaja();
      this.isOpen = false;
    }
  }
});
