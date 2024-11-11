// src/models/Producto.js
export default class Producto {
    constructor({ codigo = '', descripcion = '', cantidad = 0, valorUnitario = 0, tipoImpuesto = 'exenta' }) {
      this.codigo = codigo;
      this.descripcion = descripcion;
      this.cantidad = cantidad;
      this.valorUnitario = valorUnitario;
      this.tipoImpuesto = tipoImpuesto;
      this.totalProducto = this.cantidad * this.valorUnitario;
    }
  
    calcularTotal() {
      this.totalProducto = this.cantidad * this.valorUnitario;
      return this.totalProducto;
    }
  }
  