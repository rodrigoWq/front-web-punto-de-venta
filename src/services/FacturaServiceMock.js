// src/services/FacturaServiceMock.js
import Factura from '@/models/Factura';
import Producto from '@/models/Producto';

class FacturaServiceMock {
    constructor() {
      // Datos de prueba: Crear facturas con productos de ejemplo
      const factura1 = new Factura('12345678-9', 'Proveedor S.A.', '2024-11-10', '001-12345', 'F001-000001', 'contado');
      factura1.id = 1; // Asigna un id único a la factura
      factura1.agregarProducto(new Producto({ codigo: 'P001', descripcion: 'Producto A', cantidad: 2, valorUnitario: 50000, tipoImpuesto: 'iva10' }));

      const factura2 = new Factura('98765432-1', 'Distribuidor XYZ', '2024-11-11', '002-54321', 'F002-000002', 'credito');
      factura2.id = 2; // Asigna un id único a la factura
      factura2.agregarProducto(new Producto({ codigo: 'P003', descripcion: 'Producto C', cantidad: 5, valorUnitario: 15000, tipoImpuesto: 'exenta' }));

      this.facturas = [factura1, factura2];

    }

  async obtenerFacturas() {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...this.facturas]), 500);
    });
  }

  async guardarFactura(facturaData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        facturaData.id = Date.now();
        const nuevaFactura = new Factura(
          facturaData.ruc,
          facturaData.razonSocial,
          facturaData.fechaEmision,
          facturaData.timbrado,
          facturaData.nroFactura,
          facturaData.condicionVenta
        );
        nuevaFactura.productos = facturaData.productos;
        // Calcula el total después de asignar los productos
        nuevaFactura.calcularTotales();
        this.facturas.push(nuevaFactura);
        resolve([...this.facturas]);
      }, 500);
    });
  }
  

  async eliminarFactura(facturaId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.facturas = this.facturas.filter(factura => factura.id !== facturaId);
        resolve([...this.facturas]);
      }, 500);
    });
  }
}

export default new FacturaServiceMock();
