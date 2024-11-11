// src/models/ProductoNotaRemision.js
import Producto from './Producto';

export default class ProductoNotaRemision extends Producto {
  constructor({ codigo, descripcion, cantidad, unidadMedida, fechaVencimiento }) {
    super({ codigo, descripcion, cantidad });  // Llama al constructor de Producto
    this.unidadMedida = unidadMedida; // Específico para Nota de Remisión
    this.fechaVencimiento = fechaVencimiento; // Específico para Nota de Remisión
    this.valorUnitario = 0;  // No usamos este campo en la Nota de Remisión, lo desactivamos
    this.tipoImpuesto = ''; // Lo dejamos vacío, ya que no se requiere para la Nota de Remisión
    this.totalProducto = 0;  // Calcularemos total manualmente si es necesario
  }

  // Si necesitas realizar cálculos específicos para Nota de Remisión, puedes sobreescribir este método
  calcularTotal() {
    // Aquí no usamos valorUnitario para Nota de Remisión
    this.totalProducto = this.cantidad;  // Si la Nota de Remisión solo lleva cantidad, lo calculamos de otra manera
    return this.totalProducto;
  }
}
