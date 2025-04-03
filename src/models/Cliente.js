// src/models/Cliente.js
export default class Cliente {
    constructor(nombre, ruc, telefono, tipo = 'Contado', saldo = null, id = null) {
      this.id = id || Date.now(); // Genera un ID único si no se proporciona
      this.nombre = nombre;
      this.ruc = ruc;
      this.telefono = telefono;
      this.tipo = tipo;
      this.saldo = tipo === 'credito' ? saldo : null;
    }
  
    actualizarDatos(data) {
      this.nombre = data.nombre || this.nombre;
      this.ruc = data.ruc || this.ruc;
      this.telefono = data.telefono || this.telefono;
      this.tipo = data.tipo || this.tipo;
      this.saldo = this.tipo === 'credito' ? data.saldo || this.saldo : null;
    }
  }
  
  