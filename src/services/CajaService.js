// src/services/CajaService.js
import apiService from './apiService';

class CajaService {
  constructor() {
    this.baseUrl = `${process.env.VUE_APP_API_BASE_URL}/api/caja`;
  }

  abrirCaja() {
    return apiService.post(`${this.baseUrl}/open`);
  }

  cerrarCaja() {
    return apiService.post(`${this.baseUrl}/close`);
  }

  obtenerCajaActual() {
    return apiService.get(`${this.baseUrl}/actual`);
  }

  registrarMovimiento(movimiento) {
    return apiService.post(`${this.baseUrl}/movimientos`, movimiento);
  }

  obtenerMovimientos() {
    return apiService.get(`${this.baseUrl}/movimientos`);
  }
}

export default new CajaService();
