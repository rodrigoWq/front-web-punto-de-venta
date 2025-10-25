<template>
  <div>
    <AppNavbar />
    <div class="container clientes-credito-module mt-5">
      <AppHeader title="Nuevo Cliente con Crédito">
        <template #buttons>
          <button class="btn btn-outline-secondary me-2" @click="goBack">
            <i class="bi bi-arrow-left"></i> Atrás
          </button>
          <router-link class="btn btn-outline-secondary" :to="{ name: 'ClientesCredito' }">
            Volver al listado
          </router-link>
        </template>
      </AppHeader>

      <div class="row mt-3">
        <div class="col-lg-6 mb-3">
          <div class="card h-100 shadow-sm border-0">
            <div class="card-header bg-primary text-white">
              Datos del cliente
            </div>
            <div class="card-body">
              <form @submit.prevent>
                <div class="mb-3">
                  <label class="form-label">Nombre completo *</label>
                  <input v-model="cliente.nombre_completo" type="text" class="form-control" required />
                </div>
                <div class="mb-3">
                  <label class="form-label">Nro. documento *</label>
                  <input v-model="cliente.nro_documento" type="text" class="form-control" required />
                </div>
                <div class="mb-3">
                  <label class="form-label">RUC</label>
                  <input v-model="cliente.ruc" type="text" class="form-control" />
                </div>
                <div class="mb-3">
                  <label class="form-label">Teléfono *</label>
                  <input v-model="cliente.telefono" type="tel" class="form-control" required />
                </div>
                <div class="mb-3">
                  <label class="form-label">Email</label>
                  <input v-model="cliente.email" type="email" class="form-control" />
                </div>
                <div class="mb-3">
                  <label class="form-label">Dirección *</label>
                  <input v-model="cliente.direccion" type="text" class="form-control" required />
                </div>
                <div class="mb-3">
                  <label class="form-label">Nombre fantasía</label>
                  <input v-model="cliente.nombre_fantasia" type="text" class="form-control" />
                </div>
              </form>
            </div>
          </div>
        </div>

        <div class="col-lg-6 mb-3">
          <div class="card h-100 shadow-sm border-0">
            <div class="card-header bg-dark text-white">
              Datos de la línea de crédito
            </div>
            <div class="card-body">
              <form @submit.prevent="crearClienteCredito">
                <div class="mb-3">
                  <label class="form-label">Código interno</label>
                  <input v-model="credito.codigo_interno" type="text" class="form-control" />
                </div>
                <div class="mb-3">
                  <label class="form-label">Límite de crédito (Gs.) *</label>
                  <input v-model.number="credito.limite_credito" type="number" min="0" class="form-control" required />
                </div>
                <div class="mb-3">
                  <label class="form-label">Estado *</label>
                  <select v-model="credito.estado" class="form-select" required>
                    <option value="ACTIVO">Activo</option>
                    <option value="INACTIVO">Inactivo</option>
                  </select>
                </div>
                <div class="d-flex justify-content-end">
                  <button type="button" class="btn btn-outline-secondary me-2" @click="limpiarFormularios" :disabled="loading">
                    Limpiar
                  </button>
                  <button type="submit" class="btn btn-primary" :disabled="loading">
                    {{ loading ? 'Guardando...' : 'Crear cliente crédito' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div v-if="error" class="alert alert-danger mt-3" role="alert">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import AppNavbar from '@/components/AppNavbar.vue';
import AppHeader from '@/components/AppHeader.vue';
import clientCreditService from '@/services/clientCreditService.js';

const router = useRouter();
const loading = ref(false);
const error = ref('');

const cliente = reactive({
  nombre_completo: '',
  nro_documento: '',
  ruc: '',
  telefono: '',
  email: '',
  direccion: '',
  nombre_fantasia: ''
});

const credito = reactive({
  codigo_interno: '',
  limite_credito: null,
  estado: 'ACTIVO'
});

function validarFormulario() {
  if (!cliente.nombre_completo || !cliente.nro_documento || !cliente.telefono || !cliente.direccion) {
    error.value = 'Complete los datos obligatorios del cliente.';
    return false;
  }
  if (credito.limite_credito === null || Number(credito.limite_credito) <= 0) {
    error.value = 'Ingrese un límite de crédito mayor a cero.';
    return false;
  }
  return true;
}

function limpiarFormularios() {
  cliente.nombre_completo = '';
  cliente.nro_documento = '';
  cliente.ruc = '';
  cliente.telefono = '';
  cliente.email = '';
  cliente.direccion = '';
  cliente.nombre_fantasia = '';

  credito.codigo_interno = '';
  credito.limite_credito = null;
  credito.estado = 'ACTIVO';
  error.value = '';
}

function goBack() {
  router.back();
}

function buildPayload() {
  return {
    cliente: {
      ...cliente,
      condiciones_pago: 'CREDITO'
    },
    credito: {
      ...credito,
      limite_credito: Number(credito.limite_credito)
    }
  };
}

function getApiMessage(err) {
  return (
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    'No fue posible registrar el cliente con crédito.'
  );
}

async function crearClienteCredito() {
  error.value = '';
  if (!validarFormulario()) return;

  loading.value = true;
  try {
    await clientCreditService.createClientWithCredit(buildPayload());
    alert('Cliente de crédito registrado correctamente.');
    router.push({ name: 'ClientesCredito' });
  } catch (err) {
    console.error('Error al crear cliente crédito:', err);
    error.value = getApiMessage(err);
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.clientes-credito-module {
  background-color: #ffffff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.clientes-credito-module h1,
.clientes-credito-module h2 {
  color: #343a40;
}

.card-header {
  font-weight: 600;
}
</style>
