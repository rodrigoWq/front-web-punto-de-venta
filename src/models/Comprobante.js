// src/models/Comprobante.js
export default class Comprobante {
    constructor({ ruc = '', razonSocial = '', fechaEmision = '', estado = 'activo', tipo = '' }) {
      this.ruc = ruc;
      this.razonSocial = razonSocial;
      this.fechaEmision = fechaEmision;
      this.estado = estado;
      this.tipo = tipo; // either 'factura' or 'nota_remision'
    }
  }
  