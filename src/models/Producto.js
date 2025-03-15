// src/models/Producto.js
export default class Producto {
    constructor({ codigo, descripcion, cantidad, valorUnitario, tipoImpuesto, exenta, iva5, iva10 }) {
      this.codigo = codigo;
      this.descripcion = descripcion;
      this.cantidad = cantidad;
      this.valorUnitario = valorUnitario;
      this.tipoImpuesto = tipoImpuesto;
      this.exenta = exenta || 0;
      this.iva5 = iva5 || 0;
      this.iva10 = iva10 || 0;
    }
  
    calcularTotal() {
      this.totalProducto = this.cantidad * this.valorUnitario;
      return this.totalProducto;
    }
  }
  