// src/stores/cashbox.js
import { defineStore } from 'pinia'
import apiService from '@/services/apiService'

export const useCashboxStore = defineStore('cashbox', {
// Estado inicial (añade nombreUsuario)
state: () => ({
  isOpen        : false,
  aperturaId    : null,
  fechaApertura : null,
  montoInicial  : null,
  nombreUsuario : ''       // ← nuevo
}),
actions: {
  async fetchCurrentOpen() {
    try {
      const res = await apiService.get('/api/cashbox/open/current/')
      if (res.data.success) {
        const d = res.data.data
        this.isOpen        = true
        this.aperturaId    = d.apertura_id
        this.fechaApertura = d.apertura
        this.montoInicial  = parseFloat(d.monto_inicial)
        this.nombreUsuario = d.usuario
      } else {
        this.isOpen = false
      }
    } catch (err) {
      console.error('Error al obtener apertura actual', err)
      this.isOpen = false
    }
  }
}

})
