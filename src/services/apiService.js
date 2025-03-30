// src/services/apiService.js
import axios from 'axios';

// Configuración base: la URL base se obtiene de las variables de entorno
const apiService = axios.create({
  baseURL: process.env.VUE_APP_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor para agregar el token de autenticación a cada petición
apiService.interceptors.request.use(
  config => {
    const token = localStorage.getItem('authToken'); // O el método que uses para guardar el token
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Interceptor para manejar errores en las respuestas de forma global
apiService.interceptors.response.use(
  response => response,
  error => {
    console.error('Error en la respuesta del API:', error);
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        // Por ejemplo, redirigir a login o notificar al usuario que no tiene permisos
        // Aquí podrías limpiar el token y redirigir:
        localStorage.removeItem('authToken');
        window.location.href = '/';
      }
    return Promise.reject(error);
  }
);

// Métodos genéricos para consumir el API
export default {
  get(url, params = {}) {
    return apiService.get(url, { params });
  },
  post(url, data) {
    return apiService.post(url, data);
  },
  put(url, data) {
    return apiService.put(url, data);
  },
  delete(url, data) {
    return apiService.delete(url, { data });
  }
};
