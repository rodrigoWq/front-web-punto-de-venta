// src/services/ClienteService.js
import Cliente from '@/models/Cliente';

class ClienteService {
  constructor() {
    this.apiUrl = '/api/clientes'; // Ajusta la URL según tu backend
  }

  async obtenerClientes() {
    const response = await fetch(this.apiUrl);
    const clientesData = await response.json();
    return clientesData.map(
      data => new Cliente(data.nombre, data.ruc, data.telefono, data.tipo, data.saldo)
    );
  }

  async guardarCliente(cliente) {
    const method = cliente.id ? 'PUT' : 'POST';
    const url = cliente.id ? `${this.apiUrl}/${cliente.id}` : this.apiUrl;
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(cliente)
    });
    return await response.json();
  }

  async eliminarCliente(clienteId) {
    const response = await fetch(`${this.apiUrl}/${clienteId}`, {
      method: 'DELETE'
    });
    return await response.json();
  }
}

export default new ClienteService();
