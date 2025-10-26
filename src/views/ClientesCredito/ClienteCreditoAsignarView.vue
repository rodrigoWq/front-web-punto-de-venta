<template>
  <div>
    <AppNavbar />
    <div class="container clientes-credito-module mt-5">
      <AppHeader :title="`Asignar crédito a ${cliente.nombre_completo || 'cliente'}`">
        <template #buttons>
          <button class="btn btn-outline-secondary me-2" @click="goBack">
            <i class="bi bi-arrow-left"></i> Atrás
          </button>
          <router-link class="btn btn-outline-secondary" :to="{ name: 'ClientesCredito' }">
            Volver al listado
          </router-link>
        </template>
      </AppHeader>

      <div v-if="loading" class="alert alert-info mt-4" role="alert">
        Cargando información del cliente...
      </div>
      <div v-else>
        <div v-if="error" class="alert alert-danger mt-3" role="alert">
          {{ error }}
        </div>

        <div class="row mt-3">
          <div class="col-lg-6 mb-3">
            <div class="card h-100 shadow-sm border-0">
              <div class="card-header bg-primary text-white">Datos del cliente</div>
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
              <div class="card-header bg-dark text-white">Datos de la línea de crédito</div>
              <div class="card-body">
                <form @submit.prevent="asignarCredito">
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
                    <button type="button" class="btn btn-outline-secondary me-2" @click="volverAlListado" :disabled="saving">
                      Cancelar
                    </button>
                    <button type="submit" class="btn btn-primary" :disabled="saving">
                      {{ saving ? 'Guardando...' : 'Generar crédito' }}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AppNavbar from '@/components/AppNavbar.vue';
import AppHeader from '@/components/AppHeader.vue';
import clientCreditService from '@/services/clientCreditService.js';

const route = useRoute();
const router = useRouter();
const loading = ref(true);
const saving = ref(false);
const error = ref('');
const clienteId = route.params.id;

const cliente = reactive({
  cliente_id: null,
  nombre_completo: '',
  nro_documento: '',
  ruc: '',
  telefono: '',
  email: '',
  direccion: '',
  nombre_fantasia: '',
  condiciones_pago: 'CONTADO'
});

const credito = reactive({
  codigo_interno: '',
  limite_credito: null,
  estado: 'ACTIVO'
});

function assignClientData(raw) {
  cliente.cliente_id = raw?.cliente_id ?? raw?.id ?? raw?.clienteId ?? Number(clienteId) ?? null;
  cliente.nombre_completo = raw?.nombre_completo ?? raw?.cliente?.nombre_completo ?? '';
  cliente.nro_documento = raw?.nro_documento ?? raw?.documento_entidad ?? '';
  cliente.ruc = raw?.ruc ?? '';
  cliente.telefono = raw?.telefono ?? '';
  cliente.email = raw?.email ?? '';
  cliente.direccion = raw?.direccion ?? '';
  cliente.nombre_fantasia = raw?.nombre_fantasia ?? '';
  cliente.condiciones_pago = raw?.condiciones_pago ?? 'CONTADO';
}

function buildClientUpdate() {
  return {
    nombre_completo: cliente.nombre_completo,
    nro_documento: cliente.nro_documento,
    ruc: cliente.ruc,
    telefono: cliente.telefono,
    email: cliente.email,
    direccion: cliente.direccion,
    nombre_fantasia: cliente.nombre_fantasia,
    condiciones_pago: 'CREDITO'
  };
}

function buildCreditPayload() {
  return {
    credito: {
      codigo_interno: credito.codigo_interno || undefined,
      limite_credito: Number(credito.limite_credito),
      estado: credito.estado
    }
  };
}

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

function volverAlListado() {
  router.push({ name: 'ClientesCredito' });
}

function goBack() {
  router.back();
}

function getApiMessage(err) {
  return (
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    'Ocurrió un problema al asignar crédito al cliente.'
  );
}

async function asignarCredito() {
  error.value = '';
  if (!validarFormulario()) return;
  saving.value = true;
  try {
    await clientCreditService.updateClient(clienteId, buildClientUpdate());
    await clientCreditService.convertClientToCredit(clienteId, buildCreditPayload());
    alert('Crédito asignado correctamente.');
    router.push({ name: 'ClientesCredito' });
  } catch (err) {
    console.error('Error al asignar crédito:', err);
    error.value = getApiMessage(err);
  } finally {
    saving.value = false;
  }
}

async function fetchClient() {
  const response = await clientCreditService.fetchClientById(clienteId);
  const body = response?.data;
  if (!body) return;
  if (body?.cliente) {
    assignClientData(body.cliente);
  } else {
    assignClientData(body);
  }
}

async function init() {
  try {
    const preload = history.state?.client;
    if (preload) {
      assignClientData(preload);
    } else {
      await fetchClient();
    }
    if (cliente.condiciones_pago === 'CREDITO') {
      alert('El cliente ya posee una línea de crédito. Será redireccionado a la gestión correspondiente.');
      router.replace({
        name: 'ClienteCreditoDetalle',
        params: { id: cliente.cliente_id || clienteId }
      });
    }
  } catch (err) {
    console.error('Error al obtener datos del cliente:', err);
    error.value = getApiMessage(err);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  init();
});
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
