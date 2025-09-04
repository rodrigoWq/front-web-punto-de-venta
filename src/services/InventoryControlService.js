// src/services/InventoryControlService.js
// Servicio unificado para Control de Inventario: incluye categorías, usuarios y endpoints del control
import api from './apiService'

export default {
  // Categorías
  getCategories(params = {}) {
    return api.get('/api/categories', params)
  },

  // Usuarios (controladores y eventualmente fiscalizadores)
  getUsers() {
    return api.get('/api/auth/users')
  },

  // Control de inventario - listado preliminar
  getPreliminaryList(payload) {
    return api.post('/api/inventory-controls/preliminary-list', payload)
  },

  // Control de inventario - crear control
  createControl(payload) {
    return api.post('/api/inventory-controls/', payload)
  },

  // Mis controles (para cargar conteo)
  getMyControls() {
    return api.get('/api/inventory-controls/my-controls')
  },

  // Detalle para carga de planilla
  getControlLoadDetail(controlId) {
    return api.get(`/api/inventory-controls/${controlId}/load/detail`)
  }
}
