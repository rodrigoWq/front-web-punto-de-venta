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

  // Controles donde soy fiscalizador (para revisión/ajustes)
  getMyFiscalizations() {
    return api.get('/api/inventory-controls/my-fiscalizations')
  },

  // Detalle para carga de planilla
  getControlLoadDetail(controlId) {
    return api.get(`/api/inventory-controls/${controlId}/load/detail`)
  }
  ,
  // Datos de revisión (header + items) para ajustes
  getRevisionData(controlId) {
    return api.get(`/api/inventory-controls/${controlId}/load/`)
  }
  ,
  // Enviar conteo físico (carga) del control
  updateControlLoad(controlId, payload) {
    // payload esperado: { items: [ { producto_id, cantidad_fisica } ] }
    return api.put(`/api/inventory-controls/${controlId}/load/`, payload)
  }
  ,
  // Guardar revisión de decisiones
  reviewControl(controlId, decisiones) {
    const payload = Array.isArray(decisiones) ? { decisiones } : decisiones
    return api.put(`/api/inventory-controls/${controlId}/review`, payload)
  }
  ,
  // Ejecutar ajustes del control
  executeAdjustments(controlId) {
    return api.post(`/api/inventory-controls/${controlId}/execute-adjustments`)
  }
}
