// src/models/Producto.js
export default class Producto {
  constructor({
    id_detalle = null,
    producto_id,
    cantidad,
    codigo_producto,
    descripcion,
    precio_unitario_bruto,
    descuento,
    precio_unitario_neto,
    iva,
    tipo_iva_id,
  }) {
    // Asignar el identificador; se puede usar id_detalle según la lógica de negocio
    this.id = id_detalle;
    this.producto_id = producto_id || null;
    this.descuento = descuento || 0;
    this.precioUnitarioNeto = Number(precio_unitario_neto) || 0;
    // Capturar el código del producto
    this.codigo = codigo_producto || '';
    // Capturar la descripción
    this.descripcion = descripcion || '';
    // Convertir cantidad a número
    this.cantidad = Number(cantidad);
    // Valor unitario a partir del precio_unitario_bruto
    this.valorUnitario = Number(precio_unitario_bruto);
    // Determinar el tipo de impuesto basándose en tipo_iva_id:
    // 1 = IVA 10%, 2 = IVA 5%, de lo contrario se considera exenta.
    this.tipoImpuesto = tipo_iva_id === 1 ? 'iva_10' : (tipo_iva_id === 2 ? 'iva_5' : 'exenta');
    // Asignar impuestos según el tipo.
    this.iva10 = this.tipoImpuesto === 'iva_10' ? Number(iva) : 0;
    this.iva5 = this.tipoImpuesto === 'iva_5' ? Number(iva) : 0;
    this.exenta = this.tipoImpuesto === 'exenta' ? Number(precio_unitario_bruto) * Number(cantidad) : 0;
  }
  
    calcularTotal() {
      this.totalProducto = this.cantidad * this.valorUnitario;
      return this.totalProducto;
    }
  }
  