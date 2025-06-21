import Caja from '@/models/Caja';
import MovimientoCaja from '@/models/MovimientoCaja';

class CajaServiceMock {
  constructor() {
    this.cajaActual = null;
  }

  async abrirCaja(montoInicial) {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.cajaActual = new Caja();
        this.cajaActual.abrir(montoInicial);
        resolve(this.cajaActual);
      }, 300);
    });
  }

  async cerrarCaja() {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (this.cajaActual) {
          this.cajaActual.cerrar();
          this.cajaActual = null;
        }
        resolve();
      }, 300);
    });
  }

  async registrarMovimiento({ descripcion, monto, tipo }) {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (!this.cajaActual) {
          resolve(null);
          return;
        }
        const movimiento = new MovimientoCaja({ descripcion, monto, tipo });
        this.cajaActual.registrarMovimiento(movimiento);
        resolve(movimiento);
      }, 300);
    });
  }

  async obtenerEstado() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.cajaActual);
      }, 300);
    });
  }

  async obtenerMovimientos() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.cajaActual ? [...this.cajaActual.movimientos] : []);
      }, 300);
    });
  }
}

export default new CajaServiceMock();
