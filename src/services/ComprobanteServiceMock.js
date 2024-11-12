// src/services/ComprobanteServiceMock.js
import Factura from '@/models/Factura';
import NotaDeRemision from '@/models/NotaDeRemision';
import Producto from '@/models/Producto';

class ComprobanteServiceMock {
    constructor() {
        // Inicializar datos de prueba para facturas y notas de remisión
        const factura1 = new Factura({ 
            ruc: '12345678-9', razonSocial: 'Proveedor S.A.', fechaEmision: '2024-11-10',
            timbrado: '001-12345', nroFactura: 'F001-000001', condicionVenta: 'contado'
        });
        factura1.agregarProducto(new Producto({ codigo: 'P001', descripcion: 'Producto A', cantidad: 2, valorUnitario: 50000, tipoImpuesto: 'iva10' }));
        factura1.agregarProducto(new Producto({ codigo: 'P002', descripcion: 'Producto B', cantidad: 1, valorUnitario: 100000, tipoImpuesto: 'iva5' }));

        const notaRemision1 = new NotaDeRemision({ 
            ruc: '98765432-1', razonSocial: 'Distribuidor XYZ', fechaEmision: '2024-11-11',
            timbrado: '002-54321', nroNotaRemision: 'NR001-000001'
        });
        notaRemision1.agregarProducto(new Producto({ codigo: 'P003', descripcion: 'Producto C', cantidad: 5, valorUnitario: 15000, tipoImpuesto: 'exenta' }));
        notaRemision1.agregarProducto(new Producto({ codigo: 'P004', descripcion: 'Producto D', cantidad: 3, valorUnitario: 30000, tipoImpuesto: 'iva5' }));

        this.comprobantes = [factura1, notaRemision1];
    }

    async obtenerComprobantes() {
        return new Promise((resolve) => {
            setTimeout(() => resolve([...this.comprobantes]), 500);
        });
    }

    async guardarComprobante(comprobanteData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                let nuevoComprobante;
                if (comprobanteData.tipo === 'factura') {
                    nuevoComprobante = new Factura(comprobanteData);
                } else if (comprobanteData.tipo === 'nota_remision') {
                    nuevoComprobante = new NotaDeRemision(comprobanteData);
                }
                nuevoComprobante.id = Date.now(); // Asignar un ID único
                this.comprobantes.push(nuevoComprobante);
                resolve([...this.comprobantes]);
            }, 500);
        });
    }

    async eliminarComprobante(comprobanteId) {
        return new Promise((resolve) => {
            setTimeout(() => {
                this.comprobantes = this.comprobantes.filter(comprobante => comprobante.id !== comprobanteId);
                resolve([...this.comprobantes]);
            }, 500);
        });
    }
}

export default new ComprobanteServiceMock();
