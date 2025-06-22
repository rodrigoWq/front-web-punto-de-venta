// src/models/Caja.js
export default class Caja {
  constructor({ id = null, fechaApertura = null, fechaCierre = null, montoApertura = 0, montoCierre = 0, estado = 'cerrada', movimientos = [] } = {}) {
    this.id = id;
    this.fechaApertura = fechaApertura;
    this.fechaCierre = fechaCierre;
    this.montoApertura = montoApertura;
    this.montoCierre = montoCierre;
    this.estado = estado; // 'abierta' o 'cerrada'
    this.movimientos = movimientos;
  }

  agregarMovimiento(tipo, monto, descripcion) {
    this.movimientos.push({ tipo, monto, descripcion, fecha: new Date() });
  }
}
