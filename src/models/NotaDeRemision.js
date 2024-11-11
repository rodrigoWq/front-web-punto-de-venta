// src/models/NotaDeRemision.js
import ProductoNotaRemision from './ProductoNotaRemision'; // Importamos la subclase para productos de Nota de Remisión

export default class NotaDeRemision {
  constructor({ timbrado, razonSocial, ruc, nroNotaRemision, fechaEmision }) {
    this.timbrado = timbrado || '';
    this.razonSocial = razonSocial || '';
    this.ruc = ruc || '';
    this.nroNotaRemision = nroNotaRemision || '';
    this.fechaEmision = fechaEmision || '';
    this.productos = [];
  }

  agregarProducto(productoData) {
    // Usamos la subclase ProductoNotaRemision para productos de Nota de Remisión
    const producto = new ProductoNotaRemision(productoData);
    this.productos.push(producto);
  }

  eliminarProducto(index) {
    this.productos.splice(index, 1);
  }

  reset() {
    this.timbrado = '';
    this.razonSocial = '';
    this.ruc = '';
    this.nroNotaRemision = '';
    this.fechaEmision = '';
    this.productos = [];
  }
}
