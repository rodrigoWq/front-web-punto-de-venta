// src/services/NotaDeRemisionServiceMock.js
import NotaDeRemision from '@/models/NotaDeRemision';

class NotaDeRemisionServiceMock {
  constructor() {
    this.notasDeRemision = [];
  }

  async obtenerNotas() {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...this.notasDeRemision]), 500);
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
