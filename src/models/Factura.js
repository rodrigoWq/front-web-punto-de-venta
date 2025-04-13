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
    let sumExenta = 0;
    let sumIva5 = 0;
    let sumIva10 = 0;
  
    this.productos.forEach(prod => {
      sumExenta += Number(prod.exenta) || 0;
      sumIva5   += Number(prod.iva5)   || 0;
      sumIva10  += Number(prod.iva10)  || 0;
    });

    const r = n => Number(n.toFixed(2))
  
    this.totalIvaExenta = r(sumExenta);
    this.totalIva5      = r(sumIva5);
    this.totalIva10     = r(sumIva10);
    this.totalFactura   = r(sumIva5 + sumIva10);
    
  }
}
