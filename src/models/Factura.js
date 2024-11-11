// src/models/Factura.js
import Producto from './Producto';

export default class Factura {
  constructor(ruc = '', razonSocial = '', fechaEmision = '', timbrado = '', nroFactura = '', condicionVenta = 'contado') {
    this.ruc = ruc;
    this.razonSocial = razonSocial;
    this.fechaEmision = fechaEmision;
    this.timbrado = timbrado;
    this.nroFactura = nroFactura;
    this.condicionVenta = condicionVenta;
    this.productos = [];
  }

  agregarProducto(productoData) {
    const producto = new Producto(productoData);
    this.productos.push(producto);
    this.calcularTotales();
  }

  eliminarProducto(index) {
    this.productos.splice(index, 1);
    this.calcularTotales();
  }

  calcularTotales() {
    this.totalFactura = this.productos.reduce((acc, prod) => acc + prod.totalProducto, 0);
    this.totalIva5 = this.productos.reduce((acc, prod) => acc + (prod.tipoImpuesto === 'iva5' ? prod.totalProducto : 0), 0);
    this.totalIva10 = this.productos.reduce((acc, prod) => acc + (prod.tipoImpuesto === 'iva10' ? prod.totalProducto : 0), 0);
    this.totalIvaExenta = this.productos.reduce((acc, prod) => acc + (prod.tipoImpuesto === 'exenta' ? prod.totalProducto : 0), 0);
  }
}
