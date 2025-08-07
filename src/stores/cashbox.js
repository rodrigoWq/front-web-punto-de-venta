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
  nombreUsuario : '',
  igresos_dia   : 0,
  egresos_dia   : 0,
  saldo_en_caja : 0,
  facturas_pendientes : 0
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
        this.igresos_dia   = parseFloat(d.ingresos_dia)
        this.egresos_dia   = parseFloat(d.egresos_dia)
        this.saldo_en_caja = parseFloat(d.saldo_en_caja)
        this.facturas_pendientes = d.facturas_pendientes
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
