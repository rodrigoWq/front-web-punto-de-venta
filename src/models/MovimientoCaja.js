export default class MovimientoCaja {
  constructor({ descripcion = '', monto = 0, tipo = 'ingreso', fecha = null } = {}) {
    this.descripcion = descripcion;
    this.monto = monto;
    this.tipo = tipo; // 'ingreso' o 'egreso'
    this.fecha = fecha || new Date().toISOString();
  }
}
