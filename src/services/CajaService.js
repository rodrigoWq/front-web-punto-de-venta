// src/services/CajaService.js
import apiService from './apiService';

class CajaService {
  constructor() {
    this.baseUrl = `${process.env.VUE_APP_API_BASE_URL}/api/cajas`;
  }

  abrirCaja(data) {
    return apiService.post(`${this.baseUrl}/abrir`, data);
  }

  cerrarCaja(id, data) {
    return apiService.post(`${this.baseUrl}/${id}/cerrar`, data);
  }

  obtenerCajaActual() {
    return apiService.get(`${this.baseUrl}/actual`);
  }

  registrarMovimiento(id, movimiento) {
    return apiService.post(`${this.baseUrl}/${id}/movimientos`, movimiento);
  }

  listar() {
    return apiService.get(this.baseUrl);
  }
}

export default new CajaService();
