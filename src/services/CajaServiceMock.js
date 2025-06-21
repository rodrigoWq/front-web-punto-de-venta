// src/services/CajaServiceMock.js
import Caja from '@/models/Caja';

class CajaServiceMock {
  constructor() {
    this.caja = new Caja();
  }

  async abrirCaja(data) {
    return new Promise(resolve => {
      setTimeout(() => {
        this.caja = new Caja({
          id: Date.now(),
          fechaApertura: new Date().toISOString(),
          montoApertura: data.monto_apertura,
          estado: 'abierta',
          movimientos: []
        });
        resolve({ data: this.caja });
      }, 200);
    });
  }

  async cerrarCaja(id, data) {
    return new Promise(resolve => {
      setTimeout(() => {
        this.caja.fechaCierre = new Date().toISOString();
        this.caja.montoCierre = data.monto_cierre;
        this.caja.estado = 'cerrada';
        resolve({ data: this.caja });
      }, 200);
    });
  }

  async obtenerCajaActual() {
    return new Promise(resolve => {
      setTimeout(() => resolve({ data: this.caja }), 200);
    });
  }

  async registrarMovimiento(id, movimiento) {
    return new Promise(resolve => {
      setTimeout(() => {
        this.caja.agregarMovimiento(movimiento.tipo, movimiento.monto, movimiento.descripcion);
        resolve({ data: this.caja });
      }, 200);
    });
  }

  async listar() {
    return new Promise(resolve => {
      setTimeout(() => resolve({ data: [this.caja] }), 200);
    });
  }
}

export default new CajaServiceMock();
