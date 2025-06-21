export default class Caja {
  constructor({ abierta = false, saldoInicial = 0, saldoActual = 0, fechaApertura = null, fechaCierre = null } = {}) {
    this.abierta = abierta;
    this.saldoInicial = saldoInicial;
    this.saldoActual = saldoActual;
    this.fechaApertura = fechaApertura;
    this.fechaCierre = fechaCierre;
    this.movimientos = [];
  }

  abrir(monto) {
    this.abierta = true;
    this.saldoInicial = monto;
    this.saldoActual = monto;
    this.fechaApertura = new Date().toISOString();
    this.movimientos = [];
  }

  cerrar() {
    this.abierta = false;
    this.fechaCierre = new Date().toISOString();
  }

  registrarMovimiento(mov) {
    this.movimientos.push(mov);
    if (mov.tipo === 'ingreso') {
      this.saldoActual += mov.monto;
    } else {
      this.saldoActual -= mov.monto;
    }
  }
}
