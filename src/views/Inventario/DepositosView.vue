<template>
  <div class="container-xl px-4">
    <!-- Título + botón uniforme -->
    <div class="row">
      <div class="col-12">
        <div class="d-flex justify-content-between align-items-center mb-4 mt-2">
          <h2 class="fw-bold mb-0">Gestión de Depósitos</h2>
          <button
            class="btn btn-dark d-flex align-items-center"
            @click="openCreateModal"
            :disabled="loading"
          >
            <i class="bi bi-plus-lg me-2"></i> Nuevo Depósito
          </button>
        </div>
      </div>
    </div>

    <!-- Tarjetas de depósitos -->
    <div class="row g-4">
      <div v-if="loading" class="col-12 text-center text-muted py-5">
        <i class="bi bi-arrow-clockwise spin me-2"></i> Cargando depósitos...
      </div>
      <div v-else-if="deposits.length === 0" class="col-12 text-center text-muted py-5">
        No hay depósitos registrados.
      </div>
      <div class="col-md-4" v-else v-for="dep in deposits" :key="dep.id">
        <div class="border rounded p-4 h-100">
          <h4 class="fw-bold mb-0">{{ dep.nombre }}</h4>
          <small class="text-muted d-block mb-3">{{ dep.descripcion || '—' }}</small>

          <p class="mb-1">
            Actualizado en:
            <span class="fw-bold float-end">{{ formatDate(dep.actualizadoEn) }}</span>
          </p>
          <p class="mb-1">
            Habilitado:
            <span class="fw-bold float-end">{{ dep.habilitado ? 'Sí' : 'No' }}</span>
          </p>
          <p class="mb-3">
            Estado:
            <span
              :class="[
                'badge rounded-pill ms-2 px-3 py-2',
                dep.activo ? 'bg-dark text-white' : 'bg-light text-dark border'
              ]"
            >
              {{ dep.activo ? 'Activo' : 'Inactivo' }}
            </span>
          </p>

          <div class="d-flex gap-2">
            <button class="btn btn-outline-secondary flex-fill" @click="viewDetails(dep.id)">
              Ver Detalle
            </button>
            <button class="btn btn-outline-secondary" title="Editar" @click="openEditModal(dep)">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-outline-danger" title="Eliminar" @click="deleteDeposit(dep.id)">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Crear/Editar Depósito (custom) -->
    <div
      v-if="showFormModal"
      class="modal fade show"
      style="display: block;"
      tabindex="-1"
      aria-modal="true"
      role="dialog"
      aria-labelledby="depositoFormModalLabel"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="depositoFormModalLabel">{{ isEditing ? 'Editar Depósito' : 'Nuevo Depósito' }}</h5>
            <button type="button" class="btn-close" aria-label="Close" @click="closeFormModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent>
              <!-- Campo Sucursal ID oculto a nivel de UI; se completa automáticamente -->
              <input type="hidden" v-model.number="form.sucursal_id" />
              <div class="mb-3">
                <label class="form-label">Nombre</label>
                <input
                  type="text"
                  class="form-control"
                  v-model.trim="form.nombre"
                  maxlength="120"
                  placeholder="Nombre del depósito"
                />
              </div>
              <div class="mb-3">
                <label class="form-label">Descripción</label>
                <textarea
                  class="form-control"
                  v-model.trim="form.descripcion"
                  rows="3"
                  placeholder="Descripción del depósito"
                ></textarea>
              </div>
              <div class="form-check form-switch mb-2">
                <input class="form-check-input" type="checkbox" id="depActivo" v-model="form.activo" />
                <label class="form-check-label" for="depActivo">Activo</label>
              </div>
              <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" id="depHabilitado" v-model="form.habilitado" />
                <label class="form-check-label" for="depHabilitado">Habilitado</label>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline-secondary" @click="closeFormModal" :disabled="saving">Cancelar</button>
            <button class="btn btn-dark" @click="saveDeposit" :disabled="saving">
              <i v-if="saving" class="bi bi-arrow-clockwise spin me-2"></i>
              {{ isEditing ? 'Guardar cambios' : 'Crear depósito' }}
            </button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="showFormModal" class="modal-backdrop fade show"></div>

    <!-- Modal Detalle Depósito (custom) -->
    <div
      v-if="showDetailModal"
      class="modal fade show"
      style="display: block;"
      tabindex="-1"
      aria-modal="true"
      role="dialog"
      aria-labelledby="depositoDetailModalLabel"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="depositoDetailModalLabel">Detalle del Depósito</h5>
            <button type="button" class="btn-close" aria-label="Close" @click="showDetailModal = false"></button>
          </div>
          <div class="modal-body">
            <div v-if="detailLoading" class="text-center text-muted py-3">
              <i class="bi bi-arrow-clockwise spin me-2"></i> Cargando detalle...
            </div>
            <div v-else-if="!selectedDepositDetail">
              <div class="text-muted">No se pudo cargar el detalle.</div>
            </div>
            <div v-else>
              <dl class="row mb-0">
                <dt class="col-sm-4">ID</dt>
                <dd class="col-sm-8">{{ selectedDepositDetail.deposito_id }}</dd>

                <dt class="col-sm-4">Sucursal ID</dt>
                <dd class="col-sm-8">{{ selectedDepositDetail.sucursal_id }}</dd>

                <dt class="col-sm-4">Nombre</dt>
                <dd class="col-sm-8">{{ selectedDepositDetail.nombre }}</dd>

                <dt class="col-sm-4">Descripción</dt>
                <dd class="col-sm-8">{{ selectedDepositDetail.descripcion || '—' }}</dd>

                <dt class="col-sm-4">Activo</dt>
                <dd class="col-sm-8">{{ selectedDepositDetail.activo ? 'Sí' : 'No' }}</dd>

                <dt class="col-sm-4">Habilitado</dt>
                <dd class="col-sm-8">{{ selectedDepositDetail.habilitado ? 'Sí' : 'No' }}</dd>

                <dt class="col-sm-4">Creado en</dt>
                <dd class="col-sm-8">{{ formatDate(selectedDepositDetail.creado_en) }}</dd>

                <dt class="col-sm-4">Actualizado en</dt>
                <dd class="col-sm-8">{{ formatDate(selectedDepositDetail.actualizado_en) }}</dd>
              </dl>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-dark" @click="showDetailModal = false">Cerrar</button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="showDetailModal" class="modal-backdrop fade show"></div>
  </div>
  
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import apiService from '@/services/apiService.js'

// Estado
const deposits = ref([])
const loading = ref(false)

// Modal Crear/Editar
const showFormModal = ref(false)
const saving = ref(false)
const editingId = ref(null)
const isEditing = computed(() => editingId.value !== null)

const form = reactive({
  sucursal_id: null,
  nombre: '',
  descripcion: '',
  activo: true,
  habilitado: true,
})

// Modal Detalle
const showDetailModal = ref(false)
const detailLoading = ref(false)
const selectedDepositDetail = ref(null)

// Helpers
function resetForm() {
  form.sucursal_id = null
  form.nombre = ''
  form.descripcion = ''
  form.activo = true
  form.habilitado = true
}

function closeFormModal() {
  showFormModal.value = false
  editingId.value = null
  resetForm()
}

function formatDate(iso) {
  if (!iso) return '—'
  try {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return iso
    return d.toLocaleString()
  } catch (e) {
    return iso
  }
}

// Cargar lista de depósitos
async function loadDeposits() {
  loading.value = true
  try {
    const { data } = await apiService.get('/api/inventory/warehouses')
    const arr = Array.isArray(data?.depositos) ? data.depositos : []
    deposits.value = arr.map(d => ({
      id: d.deposito_id,
      sucursalId: d.sucursal_id,
      nombre: d.nombre,
      descripcion: d.descripcion,
      activo: !!d.activo,
      habilitado: !!d.habilitado,
      creadoEn: d.creado_en,
      actualizadoEn: d.actualizado_en,
    }))
  } catch (err) {
    console.error('Error cargando depósitos', err)
  } finally {
    loading.value = false
  }
}

// Ver detalle usando endpoint específico
async function viewDetails(id) {
  showDetailModal.value = true
  detailLoading.value = true
  selectedDepositDetail.value = null
  try {
    const { data } = await apiService.get(`/api/inventory/warehouse/${id}`)
    selectedDepositDetail.value = data
  } catch (err) {
    console.error('Error cargando detalle del depósito', err)
  } finally {
    detailLoading.value = false
  }
}

// Crear
function openCreateModal() {
  editingId.value = null
  resetForm()
  // Autocompletar sucursal desde config/entorno
  form.sucursal_id = getDefaultSucursalId()
  showFormModal.value = true
}

// Editar
async function openEditModal(dep) {
  editingId.value = dep.id
  // Intentar traer datos frescos del backend
  try {
    const { data } = await apiService.get(`/api/inventory/warehouse/${dep.id}`)
    form.sucursal_id = data.sucursal_id
    form.nombre = data.nombre
    form.descripcion = data.descripcion || ''
    form.activo = !!data.activo
    form.habilitado = !!data.habilitado
  } catch (e) {
    // Si falla, usar lo que tenemos en memoria
    form.sucursal_id = dep.sucursalId ?? null
    form.nombre = dep.nombre ?? ''
    form.descripcion = dep.descripcion ?? ''
    form.activo = !!dep.activo
    form.habilitado = !!dep.habilitado
  }
  showFormModal.value = true
}

// Guardar (crear/editar)
async function saveDeposit() {
  // Validaciones mínimas
  if (!form.nombre?.trim()) {
    alert('El nombre es obligatorio')
    return
  }
  if (!form.sucursal_id || form.sucursal_id <= 0) {
    alert('Sucursal ID debe ser un número válido')
    return
  }

  const payload = {
    sucursal_id: Number(form.sucursal_id),
    nombre: form.nombre.trim(),
    descripcion: form.descripcion?.trim() || '',
    activo: !!form.activo,
    habilitado: !!form.habilitado,
  }

  saving.value = true
  try {
  const wasEditing = isEditing.value
  if (wasEditing) {
      await apiService.put(`/api/inventory/warehouse/${editingId.value}`, payload)
    } else {
      await apiService.post('/api/inventory/warehouse', payload)
    }
    await loadDeposits()
    closeFormModal()
  alert(wasEditing ? 'Depósito actualizado' : 'Depósito creado')
  } catch (err) {
    console.error('Error guardando depósito', err)
  } finally {
    saving.value = false
  }
}

// Eliminar
async function deleteDeposit(id) {
  const confirmed = await confirm({
    message: '¿Está seguro de eliminar este depósito?',
    title: 'Eliminar depósito',
    confirmText: 'Eliminar',
    cancelText: 'Cancelar'
  })
  if (!confirmed) return
  try {
    await apiService.delete(`/api/inventory/warehouse/${id}`)
    await loadDeposits()
    alert.success('Depósito eliminado')
  } catch (err) {
    console.error('Error eliminando depósito', err)
    alert.error('No se pudo eliminar el depósito. Revisa la consola.')
  }
}

onMounted(() => {
  loadDeposits()
})

// Obtener sucursal ID por defecto (env -> localStorage -> lista -> 1)
function getDefaultSucursalId() {
  const envVal = process.env.VUE_APP_SUCURSAL_ID
  if (envVal && !Number.isNaN(Number(envVal))) return Number(envVal)
  const ls = localStorage.getItem('sucursal_id') || localStorage.getItem('sucursalId')
  if (ls && !Number.isNaN(Number(ls))) return Number(ls)
  if (deposits.value.length > 0 && deposits.value[0].sucursalId) return Number(deposits.value[0].sucursalId)
  console.warn('[Depositos] usando sucursal_id=1 por defecto')
  return 1
}
</script>

<style scoped>
.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
