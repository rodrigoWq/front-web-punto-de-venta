<template>
  <div>
    <AppNavbar />
    <div class="container clientes-credito-module mt-5">
      <AppHeader :title="`Crédito de ${cliente.nombre_completo || 'cliente'}`">
        <template #buttons>
          <button class="btn btn-outline-secondary me-2" @click="goBack">
            <i class="bi bi-arrow-left"></i> Atrás
          </button>
          <router-link class="btn btn-outline-secondary me-2" :to="{ name: 'ClientesCredito' }">
            Ver listado
          </router-link>
        </template>
      </AppHeader>

      <div v-if="loading" class="alert alert-info mt-3" role="alert">
        Cargando datos de crédito...
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
              <div class="card-header bg-dark text-white d-flex justify-content-between align-items-center">
                <span>Datos de la línea de crédito</span>
                <small class="fw-light">Actualizado: {{ credito.actualizado_en_display || '—' }}</small>
              </div>
              <div class="card-body">
                <form @submit.prevent="actualizarDatos">
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

                  <div class="row mb-3">
                    <div class="col-6">
                      <label class="form-label">Saldo actual</label>
                      <input :value="credito.saldo_actual_formatted" type="text" class="form-control" disabled />
                    </div>
                    <div class="col-6">
                      <label class="form-label">Monto utilizado</label>
                      <input :value="credito.monto_total_formatted" type="text" class="form-control" disabled />
                    </div>
                  </div>

                  <div class="d-flex justify-content-end">
                    <button type="submit" class="btn btn-primary" :disabled="saving">
                      {{ saving ? 'Guardando...' : 'Actualizar datos' }}
                    </button>
                  </div>
                </form>

                <hr />

                <form @submit.prevent="actualizarLimite">
                  <div class="row g-2 align-items-end">
                    <div class="col-sm-7">
                      <label class="form-label">Nuevo límite de crédito (Gs.) *</label>
                      <input v-model.number="nuevoLimite" type="number" min="0" class="form-control" required />
                    </div>
                    <div class="col-sm-5 d-flex justify-content-end">
                      <button type="submit" class="btn btn-outline-primary w-100" :disabled="limitSaving">
                        {{ limitSaving ? 'Actualizando...' : 'Aplicar nuevo límite' }}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        <div class="card mt-4 shadow-sm border-0" ref="statementSection">
          <div class="card-header bg-secondary text-white d-flex justify-content-between align-items-center">
            <span>Estado de cuenta</span>
            <strong>Saldo actual: {{ credito.saldo_actual_formatted }}</strong>
          </div>
          <div class="card-body">
            <form class="row g-3 align-items-end" @submit.prevent="cargarEstadoCuenta">
              <div class="col-sm-4">
                <label class="form-label">Desde (DD/MM/AAAA)</label>
                <input v-model="filtros.desde" type="text" class="form-control" placeholder="DD/MM/AAAA" />
              </div>
              <div class="col-sm-4">
                <label class="form-label">Hasta (DD/MM/AAAA)</label>
                <input v-model="filtros.hasta" type="text" class="form-control" placeholder="DD/MM/AAAA" />
              </div>
              <div class="col-sm-4 d-flex justify-content-end">
                <button type="button" class="btn btn-outline-secondary me-2" @click="limpiarFiltros" :disabled="statementLoading">
                  Limpiar filtros
                </button>
                <button type="submit" class="btn btn-dark" :disabled="statementLoading">
                  {{ statementLoading ? 'Consultando...' : 'Consultar' }}
                </button>
              </div>
            </form>

            <div v-if="statementError" class="alert alert-danger mt-3" role="alert">
              {{ statementError }}
            </div>

            <div v-if="statementLoading" class="alert alert-info mt-3" role="alert">
              Consultando estado de cuenta...
            </div>

            <div v-if="!statementLoading" class="mt-4">
              <h6>Pendientes</h6>
              <AppTable :headers="statementHeaders">
                <template v-if="!estadoCuenta.pendientes.length">
                  <tr>
                    <td :colspan="statementHeaders.length" class="text-center py-2">Sin registros pendientes.</td>
                  </tr>
                </template>
                <template v-else>
                  <tr v-for="item in estadoCuenta.pendientes" :key="`pend-${item.nro_factura}-${item.tipo_factura}`">
                    <td>{{ item.nro_factura }}</td>
                    <td>{{ item.tipo_factura }}</td>
                    <td>{{ formatCurrency(item.monto_total) }}</td>
                    <td>{{ formatCurrency(item.total_pagado) }}</td>
                    <td>{{ formatCurrency(item.saldo_restante) }}</td>
                    <td>{{ item.estado }}</td>
                    <td>{{ item.ultima_fecha_pago_display || '—' }}</td>
                  </tr>
                </template>
              </AppTable>

              <h6 class="mt-4">Pagadas</h6>
              <AppTable :headers="statementHeaders">
                <template v-if="!estadoCuenta.pagadas.length">
                  <tr>
                    <td :colspan="statementHeaders.length" class="text-center py-2">Sin registros pagados.</td>
                  </tr>
                </template>
                <template v-else>
                  <tr v-for="item in estadoCuenta.pagadas" :key="`pag-${item.nro_factura}-${item.tipo_factura}`">
                    <td>{{ item.nro_factura }}</td>
                    <td>{{ item.tipo_factura }}</td>
                    <td>{{ formatCurrency(item.monto_total) }}</td>
                    <td>{{ formatCurrency(item.total_pagado) }}</td>
                    <td>{{ formatCurrency(item.saldo_restante) }}</td>
                    <td>{{ item.estado }}</td>
                    <td>{{ item.ultima_fecha_pago_display || '—' }}</td>
                  </tr>
                </template>
              </AppTable>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AppNavbar from '@/components/AppNavbar.vue';
import AppHeader from '@/components/AppHeader.vue';
import AppTable from '@/components/AppTable.vue';
import clientCreditService from '@/services/clientCreditService.js';
import { toApiDate, toDisplayDate } from '@/utils/date.js';

const route = useRoute();
const router = useRouter();
const clientId = route.params.id;

const loading = ref(true);
const saving = ref(false);
const limitSaving = ref(false);
const error = ref('');

const cliente = reactive({
  cliente_id: null,
  nombre_completo: '',
  nro_documento: '',
  ruc: '',
  telefono: '',
  email: '',
  direccion: '',
  nombre_fantasia: ''
});

const credito = reactive({
  credito_id: null,
  codigo_interno: '',
  limite_credito: 0,
  estado: 'ACTIVO',
  saldo_actual: 0,
  monto_total_credito: 0,
  creado_en: '',
  actualizado_en: '',
  saldo_actual_formatted: '',
  monto_total_formatted: '',
  actualizado_en_display: ''
});

const nuevoLimite = ref(0);
const filtros = reactive({
  desde: '',
  hasta: ''
});
const estadoCuenta = reactive({
  pendientes: [],
  pagadas: []
});
const statementLoading = ref(false);
const statementError = ref('');
const statementSection = ref(null);

const statementHeaders = computed(() => [
  'Factura',
  'Tipo',
  'Monto',
  'Total Pagado',
  'Saldo',
  'Estado',
  'Último Pago'
]);

function formatCurrency(value) {
  const num = Number(value);
  if (Number.isNaN(num)) return '—';
  return new Intl.NumberFormat('es-PY', { style: 'currency', currency: 'PYG', maximumFractionDigits: 0 }).format(num);
}

function assignCliente(raw) {
  cliente.cliente_id = raw?.cliente_id ?? raw?.id ?? cliente.cliente_id;
  cliente.nombre_completo = raw?.nombre_completo ?? cliente.nombre_completo;
  cliente.nro_documento = raw?.nro_documento ?? cliente.nro_documento;
  cliente.ruc = raw?.ruc ?? '';
  cliente.telefono = raw?.telefono ?? '';
  cliente.email = raw?.email ?? '';
  cliente.direccion = raw?.direccion ?? '';
  cliente.nombre_fantasia = raw?.nombre_fantasia ?? '';
}

function assignCredito(raw) {
  const limite = Number(raw?.limite_credito ?? credito.limite_credito ?? 0);
  const saldo = Number(raw?.saldo_actual ?? raw?.saldo ?? credito.saldo_actual ?? 0);
  const montoTotal = Number(raw?.monto_total_credito ?? credito.monto_total_credito ?? 0);

  credito.credito_id = raw?.credito_id ?? credito.credito_id ?? raw?.id ?? null;
  credito.codigo_interno = raw?.codigo_interno ?? '';
  credito.limite_credito = Number.isNaN(limite) ? 0 : limite;
  credito.estado = raw?.estado_credito ?? raw?.estado ?? credito.estado;
  credito.saldo_actual = Number.isNaN(saldo) ? 0 : saldo;
  credito.monto_total_credito = Number.isNaN(montoTotal) ? 0 : montoTotal;
  credito.creado_en = raw?.creado_en ?? credito.creado_en;
  credito.actualizado_en = raw?.actualizado_en ?? credito.actualizado_en;
  credito.saldo_actual_formatted = formatCurrency(credito.saldo_actual);
  credito.monto_total_formatted = formatCurrency(credito.monto_total_credito);
  credito.actualizado_en_display = toDisplayDate(credito.actualizado_en);
  nuevoLimite.value = credito.limite_credito;
}

function buildUpdatePayload() {
  return {
    cliente: {
      nombre_completo: cliente.nombre_completo,
      nro_documento: cliente.nro_documento,
      ruc: cliente.ruc,
      telefono: cliente.telefono,
      email: cliente.email,
      direccion: cliente.direccion,
      nombre_fantasia: cliente.nombre_fantasia
    },
    credito: {
      codigo_interno: credito.codigo_interno || undefined,
      limite_credito: Number(credito.limite_credito),
      estado: credito.estado
    }
  };
}

function validarDatosGenerales() {
  if (!cliente.nombre_completo || !cliente.nro_documento || !cliente.telefono || !cliente.direccion) {
    error.value = 'Complete los datos obligatorios del cliente.';
    return false;
  }
  if (Number(credito.limite_credito) <= 0) {
    error.value = 'Ingrese un límite de crédito mayor a cero.';
    return false;
  }
  return true;
}

function buildLimitPayload() {
  return {
    limite_credito: Number(nuevoLimite.value)
  };
}

function validarLimite() {
  if (nuevoLimite.value === null || Number(nuevoLimite.value) <= 0) {
    statementError.value = '';
    error.value = 'El nuevo límite debe ser mayor a cero.';
    return false;
  }
  return true;
}

function goBack() {
  router.back();
}

async function cargarDetalle() {
  loading.value = true;
  statementLoading.value = true;
  error.value = '';
  statementError.value = '';
  try {
    const preload = history.state?.client;
    if (preload && preload.condiciones === 'CREDITO') {
      assignCliente(preload);
    }
    const response = await clientCreditService.fetchCreditStatement(clientId, {});
    actualizarDesdeEstadoCuenta(response?.data, { incluirDatosEntidad: true });
  } catch (err) {
    console.error('Error al obtener el crédito del cliente:', err);
    const message =
      err?.response?.data?.message || err?.response?.data?.error || 'No fue posible cargar el crédito del cliente.';
    error.value = message;
    statementError.value = message;
    estadoCuenta.pendientes = [];
    estadoCuenta.pagadas = [];
  } finally {
    loading.value = false;
    statementLoading.value = false;
  }
}

async function actualizarDatos() {
  error.value = '';
  if (!validarDatosGenerales()) return;
  saving.value = true;
  try {
    await clientCreditService.updateClientCredit(clientId, buildUpdatePayload());
    alert('Datos del cliente y crédito actualizados correctamente.');
    await cargarDetalle();
  } catch (err) {
    console.error('Error al actualizar datos:', err);
    error.value = err?.response?.data?.message || err?.response?.data?.error || 'No fue posible actualizar los datos.';
  } finally {
    saving.value = false;
  }
}

async function actualizarLimite() {
  error.value = '';
  if (!validarLimite()) return;
  limitSaving.value = true;
  try {
    await clientCreditService.updateCreditLimit(clientId, buildLimitPayload());
    alert('Límite de crédito actualizado correctamente.');
    await cargarDetalle();
  } catch (err) {
    console.error('Error al actualizar límite:', err);
    error.value = err?.response?.data?.message || err?.response?.data?.error || 'No fue posible actualizar el límite.';
  } finally {
    limitSaving.value = false;
  }
}

function limpiarFiltros() {
  filtros.desde = '';
  filtros.hasta = '';
  statementError.value = '';
}

function validarFechas() {
  if (filtros.desde && !toApiDate(filtros.desde)) {
    statementError.value = 'La fecha "Desde" no tiene el formato DD/MM/AAAA.';
    return false;
  }
  if (filtros.hasta && !toApiDate(filtros.hasta)) {
    statementError.value = 'La fecha "Hasta" no tiene el formato DD/MM/AAAA.';
    return false;
  }
  return true;
}

function mapStatementItem(item) {
  return {
    ...item,
    monto_total: Number(item?.monto_total ?? 0),
    total_pagado: Number(item?.total_pagado ?? 0),
    saldo_restante: Number(item?.saldo_restante ?? 0),
    ultima_fecha_pago_display: toDisplayDate(item?.ultima_fecha_pago)
  };
}

function actualizarDesdeEstadoCuenta(body, { incluirDatosEntidad = false } = {}) {
  const data = body ?? {};
  if (incluirDatosEntidad) {
    const clienteData = data?.cliente ?? data;
    const creditoData = data?.credito ?? data;
    assignCliente(clienteData);
    assignCredito(creditoData);
  }
  estadoCuenta.pendientes = Array.isArray(data?.pendientes) ? data.pendientes.map(mapStatementItem) : [];
  estadoCuenta.pagadas = Array.isArray(data?.pagadas) ? data.pagadas.map(mapStatementItem) : [];
}

async function cargarEstadoCuenta() {
  statementError.value = '';
  if (!validarFechas()) return;
  statementLoading.value = true;
  try {
    const params = {};
    const desdeApi = toApiDate(filtros.desde);
    const hastaApi = toApiDate(filtros.hasta);
    if (desdeApi) params.desde = desdeApi;
    if (hastaApi) params.hasta = hastaApi;

    const response = await clientCreditService.fetchCreditStatement(clientId, params);
    actualizarDesdeEstadoCuenta(response?.data, { incluirDatosEntidad: false });
  } catch (err) {
    console.error('Error al consultar estado de cuenta:', err);
    statementError.value =
      err?.response?.data?.message || err?.response?.data?.error || 'No fue posible obtener el estado de cuenta.';
    estadoCuenta.pendientes = [];
    estadoCuenta.pagadas = [];
  } finally {
    statementLoading.value = false;
  }
}

function navegarASeccion() {
  if (route.query.section === 'statement' && statementSection.value) {
    nextTick(() => {
      statementSection.value.scrollIntoView({ behavior: 'smooth' });
    });
  }
}

onMounted(async () => {
  await cargarDetalle();
  navegarASeccion();
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
