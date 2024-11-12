// src/models/Factura.js
import Comprobante from './Comprobante';
import Producto from './Producto';

export default class Factura extends Comprobante {
  constructor({ 
    ruc = '', 
    razonSocial = '', 
    fechaEmision = '', 
    timbrado = '', 
    nroFactura = '', 
    condicionVenta = 'contado', 
    productos = [] 
  } = {}) {
    super({ ruc, razonSocial, fechaEmision, tipo: 'factura' });
    this.timbrado = timbrado;
    this.nroFactura = nroFactura;
    this.condicionVenta = condicionVenta;
    this.productos = productos.map(product => new Producto(product));
    this.calcularTotales();
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
