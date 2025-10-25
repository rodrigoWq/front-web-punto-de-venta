// src/services/clientCreditService.js
// Encapsula todas las operaciones del módulo de clientes con crédito.

import apiService from './apiService';

const BASE = '/api/clients';

function buildParams(params = {}) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '')
  );
}

export default {
  listClients(params) {
    return apiService.get(`${BASE}`, buildParams(params));
  },

  listCreditClients(params) {
    return apiService.get(`${BASE}/credit`, buildParams(params));
  },

  searchCreditClients(query) {
    return apiService.get(`${BASE}/credit/search`, buildParams({ query }));
  },

  fetchClientById(id) {
    return apiService.get(`${BASE}/${id}`);
  },

  fetchCreditClientById(id) {
    return apiService.get(`${BASE}/credit/${id}`);
  },

  updateClient(id, payload) {
    return apiService.put(`${BASE}/${id}`, payload);
  },

  createClientWithCredit(payload) {
    return apiService.post(`${BASE}/credit`, payload);
  },

  convertClientToCredit(id, payload) {
    return apiService.post(`${BASE}/${id}/credit`, payload);
  },

  updateClientCredit(id, payload) {
    return apiService.put(`${BASE}/credit/${id}`, payload);
  },

  updateCreditStatus(id, payload) {
    return apiService.patch(`${BASE}/credit/${id}/status`, payload);
  },

  updateCreditLimit(id, payload) {
    return apiService.patch(`${BASE}/credit/${id}/limit`, payload);
  },

  fetchCreditStatement(id, params) {
    return apiService.get(`${BASE}/credit/${id}/statement`, buildParams(params));
  }
};
