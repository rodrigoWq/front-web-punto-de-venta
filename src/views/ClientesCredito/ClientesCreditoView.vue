<template>
  <div>
    <AppNavbar />
    <div class="container clientes-credito-module mt-5">
      <AppHeader title="Gestión de Clientes con Crédito">
        <template #buttons>
          <button class="btn btn-outline-secondary me-2" @click="goBack">
            <i class="bi bi-arrow-left"></i> Atrás
          </button>
          <router-link class="btn btn-primary" :to="{ name: 'ClienteCreditoCrear' }">
            Nuevo cliente + crédito
          </router-link>
        </template>
      </AppHeader>

      <AppFilter
        v-model="search"
        placeholder="Buscar por nombre o documento..."
        customClasses="mt-4 mb-4"
      >
        <AppButton
          variant="outline-secondary"
          customClass="me-2"
          :class="{ active: filterType === 'all' }"
          @click="setFilter('all')"
        >
          Todos los clientes
        </AppButton>
        <AppButton
          variant="outline-secondary"
          customClass="me-2"
          :class="{ active: filterType === 'credit' }"
          @click="setFilter('credit')"
        >
          Sólo clientes crédito
        </AppButton>
      </AppFilter>

      <div v-if="error" class="alert alert-danger" role="alert">
        {{ error }}
      </div>

      <h2 class="fw-bold mb-3">Listado</h2>

      <AppTable :headers="tableHeaders">
        <template v-if="loading">
          <tr>
            <td :colspan="tableHeaders.length" class="text-center py-3">Cargando clientes...</td>
          </tr>
        </template>
        <template v-else-if="!clients.length">
          <tr>
            <td :colspan="tableHeaders.length" class="text-center py-3">Sin resultados.</td>
          </tr>
        </template>
        <template v-else>
          <tr v-for="client in clients" :key="client.rowKey">
            <td>{{ client.nombre }}</td>
            <td>{{ client.documento || '—' }}</td>
            <td>{{ client.telefono || '—' }}</td>
            <td>{{ client.email || '—' }}</td>
            <td>{{ client.condiciones }}</td>
            <td v-if="showCreditColumns">{{ client.limiteCreditoFormatted }}</td>
            <td v-if="showCreditColumns">{{ client.saldoActualFormatted }}</td>
            <td v-if="showCreditColumns">{{ client.estadoCredito || '—' }}</td>
            <td>
              <div class="actions-wrapper">
                <button
                  v-if="client.condiciones !== 'CREDITO'"
                  type="button"
                  class="btn btn-warning btn-sm"
                  @click="goToAssign(client)"
                >
                    Asignar
                </button>
                <template v-else>
                  <router-link
                    class="btn btn-primary btn-sm me-1"
                    :to="detailRoute(client)"
                  >
                    Gestionar
                  </router-link>
                </template>
              </div>
            </td>
          </tr>
        </template>
      </AppTable>

      <AppPagination
        v-if="pagination.totalPages > 1"
        :currentPage="pagination.page"
        :totalPages="pagination.totalPages"
        @page-changed="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import AppNavbar from '@/components/AppNavbar.vue';
import AppHeader from '@/components/AppHeader.vue';
import AppFilter from '@/components/AppFilter.vue';
import AppButton from '@/components/AppButton.vue';
import AppTable from '@/components/AppTable.vue';
import AppPagination from '@/components/AppPagination.vue';
import clientCreditService from '@/services/clientCreditService.js';

const router = useRouter();
const search = ref('');
const filterType = ref('all');
const loading = ref(false);
const error = ref('');
const clients = ref([]);
const pagination = reactive({
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 1
});

const showCreditColumns = computed(() => filterType.value === 'credit');

const tableHeaders = computed(() => {
  const baseHeaders = ['Nombre', 'Documento', 'Teléfono', 'Email', 'Condición'];
  if (showCreditColumns.value) {
    baseHeaders.push('Límite Crédito', 'Saldo Actual', 'Estado Crédito');
  }
  baseHeaders.push('Acciones');
  return baseHeaders;
});

let searchDebounce;
watch(search, () => {
  clearTimeout(searchDebounce);
  searchDebounce = setTimeout(() => {
    pagination.page = 1;
    fetchClients();
  }, 400);
});

onBeforeUnmount(() => clearTimeout(searchDebounce));

function setFilter(type) {
  if (filterType.value === type) return;
  filterType.value = type;
  pagination.page = 1;
  fetchClients();
}

function handlePageChange(page) {
  if (page === pagination.page) return;
  pagination.page = page;
  fetchClients();
}

function goBack() {
  router.back();
}

function detailRoute(client) {
  return {
    name: 'ClienteCreditoDetalle',
    params: { id: client.clienteId },
    state: { client }
  };
}

function goToAssign(client) {
  router.push({
    name: 'ClienteCreditoAsignar',
    params: { id: client.clienteId },
    state: { client }
  });
}

function formatCurrencyPYG(value) {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return '—';
  }
  return new Intl.NumberFormat('es-PY', { style: 'currency', currency: 'PYG', maximumFractionDigits: 0 }).format(
    Number(value)
  );
}

function mapClient(raw, isCreditList) {
  const clienteId =
    raw?.cliente_id ??
    raw?.id ??
    raw?.cliente?.cliente_id ??
    null;
  const creditoId =
    raw?.credito_id ??
    raw?.credito?.credito_id ??
    null;

  const limite = Number(raw?.limite_credito ?? raw?.credito?.limite_credito ?? 0);
  const saldo = Number(raw?.saldo_actual ?? raw?.credito?.saldo_actual ?? 0);
  const estado =
    raw?.estado_credito ??
    raw?.credito?.estado ??
    raw?.estado ??
    (isCreditList ? 'ACTIVO' : null);

  return {
    rowKey: `${clienteId ?? raw?.nro_documento ?? raw?.ruc ?? Math.random()}`,
    clienteId: clienteId,
    creditoId,
    nombre: raw?.nombre_completo ?? raw?.cliente?.nombre_completo ?? '—',
    documento: raw?.nro_documento ?? raw?.ruc ?? raw?.documento_entidad ?? '',
    telefono: raw?.telefono ?? '',
    email: raw?.email ?? '',
    condiciones: raw?.condiciones_pago ?? (isCreditList ? 'CREDITO' : 'CONTADO'),
    limiteCredito: limite,
    limiteCreditoFormatted: Number.isFinite(limite) ? formatCurrencyPYG(limite) : '—',
    saldoActual: saldo,
    saldoActualFormatted: Number.isFinite(saldo) ? formatCurrencyPYG(saldo) : '—',
    estadoCredito: estado,
    toggling: false
  };
}

function parseResponse(response, isCreditList) {
  const body = response?.data ?? {};
  const dataArray = Array.isArray(body) ? body : Array.isArray(body.data) ? body.data : [];
  const paginationInfo = body.pagination ?? null;
  const mappedClients = dataArray.map(item => mapClient(item, isCreditList));

  if (paginationInfo) {
    pagination.total = paginationInfo.total ?? mappedClients.length;
    pagination.totalPages =
      paginationInfo.totalPages ??
      Math.max(1, Math.ceil((paginationInfo.total ?? mappedClients.length) / (paginationInfo.limit ?? pagination.limit)));
    pagination.limit = paginationInfo.limit ?? pagination.limit;
    pagination.page = paginationInfo.page ?? pagination.page;
  } else {
    pagination.total = mappedClients.length;
    pagination.totalPages = 1;
  }

  return mappedClients;
}

async function fetchClients() {
  loading.value = true;
  error.value = '';
  try {
    const params = {
      page: pagination.page,
      limit: pagination.limit,
      search: search.value || undefined
    };

    const response =
      filterType.value === 'credit'
        ? await clientCreditService.listCreditClients(params)
        : await clientCreditService.listClients(params);

    clients.value = parseResponse(response, filterType.value === 'credit');
  } catch (err) {
    console.error('Error al cargar clientes:', err);
    error.value = 'No fue posible obtener los clientes. Intente nuevamente.';
    clients.value = [];
    pagination.total = 0;
    pagination.totalPages = 1;
  } finally {
    loading.value = false;
  }
}


onMounted(() => {
  fetchClients();
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

.actions-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.actions-wrapper .btn {
  min-width: 100px;
}
</style>
