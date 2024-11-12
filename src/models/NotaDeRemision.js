// src/models/NotaDeRemision.js
import Comprobante from './Comprobante';
import ProductoNotaRemision from './ProductoNotaRemision';

export default class NotaDeRemision extends Comprobante {
  constructor({ ruc, razonSocial, fechaEmision, timbrado, nroNotaRemision, productos = [] }) {
    super({ ruc, razonSocial, fechaEmision, tipo: 'nota_remision' });
    this.timbrado = timbrado;
    this.nroNotaRemision = nroNotaRemision;
    this.productos = productos.map(product => new ProductoNotaRemision(product));
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
