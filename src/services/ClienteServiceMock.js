// src/services/ClienteServiceMock.js
import Cliente from '@/models/Cliente';

class ClienteServiceMock {
  constructor() {
    this.clientes = [
      new Cliente('Juan Pérez', '12345678', '0987654321', 'normal', null, 1),
      new Cliente('María López', '87654321', '0987654322', 'credito', 5000, 2),
      new Cliente('Carlos García', '65432123', '0987654323', 'normal', null, 3),
      new Cliente('Ana Torres', '43218765', '0987654324', 'credito', 3000, 4)
    ];
  }

  async obtenerClientes() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...this.clientes]);
      }, 500);
    });
  }

  async crearCliente(cliente) {
    return new Promise((resolve) => {
      setTimeout(() => {
        cliente.id = Date.now();
        const nuevoCliente = new Cliente(
          cliente.nombre,
          cliente.ruc,
          cliente.telefono,
          cliente.tipo,
          cliente.saldo,
          cliente.id
        );
        this.clientes.push(nuevoCliente);
        console.log('Nuevo cliente agregado:', nuevoCliente);
        resolve([...this.clientes]); // Retorna la lista actualizada
      }, 500);
    });
  }

  async actualizarCliente(cliente) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = this.clientes.findIndex(c => c.id === cliente.id);
        if (index !== -1) {
          this.clientes[index] = { ...this.clientes[index], ...cliente };
          console.log('Cliente actualizado en la lista:', this.clientes[index]);
        }
        resolve([...this.clientes]); // Retorna la lista actualizada
      }, 500);
    });
  }

  async eliminarCliente(clienteId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.clientes = this.clientes.filter(c => c.id !== clienteId);
        console.log('Clientes después de eliminar:', this.clientes);
        resolve([...this.clientes]);
      }, 500);
    });
  }
}

export default new ClienteServiceMock();
