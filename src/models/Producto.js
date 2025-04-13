// src/models/Producto.js
export default class Producto {
  constructor({
    producto_id          = null,
    cantidad             = 0,
    codigo_producto      = '',
    descripcion          = '',
    precio_unitario_neto = 0,
    tipo_iva_id          = 3          
  }) {

    this.producto_id  = producto_id;

    this.codigo_producto = codigo_producto;
    this.descripcion     = descripcion;

    this.cantidad        = Number(cantidad) || 0;
    this.precio_unitario_neto   = Number(precio_unitario_neto) || 0;


    this.tipo_iva_id = Number(tipo_iva_id);
    this.tipoImpuesto = this.tipo_iva_id === 1 || this.tipo_iva_id === 10
                          ? 'iva_10'
                          : this.tipo_iva_id === 2 ? 'iva_5' : 'exenta';


    // Calcula las bases para IVA o exenta.
    const base = this.cantidad * this.precio_unitario_neto;
    if (this.tipoImpuesto === 'iva_10') {
      // Se asume que el monto de IVA se calcula dividiendo la base entre 11 (ya que la base es el 90.9%)
      this.iva10 = base / 11;
      this.iva5 = 0;
      this.exenta = 0;
    } else if (this.tipoImpuesto === 'iva_5') {
      // Si el 5% se calcula, se hace de forma similar. (Adapta la fórmula según tu necesidad)
      this.iva5 = base / 21;  // por ejemplo
      this.iva10 = 0;
      this.exenta = 0;
    } else {
      // Exenta: toda la base va a exenta.
      this.exenta = base;
      this.iva10 = 0;
      this.iva5 = 0;
    }

  }
  
  calcularTotal() {
    this.totalProducto = this.cantidad * this.precio_unitario_neto;
    return this.totalProducto;
  }
}
  