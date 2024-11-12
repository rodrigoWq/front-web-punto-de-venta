// src/services/NotaDeRemisionServiceMock.js
import NotaDeRemision from '@/models/NotaDeRemision';
import ProductoNotaRemision from '@/models/ProductoNotaRemision';

class NotaDeRemisionServiceMock {
  constructor() {
    // Datos de prueba: Crear notas de remisión con productos de ejemplo
    const nota1 = new NotaDeRemision({
      timbrado: '12345678',
      razonSocial: 'Empresa Ejemplo S.A.',
      ruc: '80012345-6',
      nroNotaRemision: 'NR001',
      fechaEmision: '2024-11-10'
    });
    nota1.id = 1; // Asigna un id único a la nota de remisión
    nota1.agregarProducto(new ProductoNotaRemision({ codigo: 'PR001', descripcion: 'Producto X', cantidad: 10, unidadMedida: 'kg', fechaVencimiento: '2025-05-10' }));
    nota1.agregarProducto(new ProductoNotaRemision({ codigo: 'PR002', descripcion: 'Producto Y', cantidad: 5, unidadMedida: 'kg', fechaVencimiento: '2025-06-15' }));

    const nota2 = new NotaDeRemision({
      timbrado: '87654321',
      razonSocial: 'Distribuidora ABC',
      ruc: '80054321-0',
      nroNotaRemision: 'NR002',
      fechaEmision: '2024-11-12'
    });
    nota2.id = 2; // Asigna un id único a la nota de remisión
    nota2.agregarProducto(new ProductoNotaRemision({ codigo: 'PR003', descripcion: 'Producto Z', cantidad: 20, unidadMedida: 'lt', fechaVencimiento: '2025-07-20' }));

    this.notasDeRemision = [nota1, nota2]; // Lista inicial de notas de remisión
  }

  async obtenerNotas() {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...this.notasDeRemision]), 500);
    });
  }

  async obtenerNotaPorId(id) {
    return new Promise((resolve) => {
      const nota = this.notasDeRemision.find(n => n.id === Number(id));
      resolve(nota);
    });
  }

  async guardarNotaRemision(notaData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const nuevaNota = new NotaDeRemision(notaData);
        nuevaNota.id = Date.now(); // Genera un ID único
        this.notasDeRemision.push(nuevaNota);
        resolve([...this.notasDeRemision]);
      }, 500);
    });
  }
}

export default new NotaDeRemisionServiceMock();

