<template>
  <div class="container-xl px-4">
    <!-- Header -->
    <div class="row">
      <div class="col-12">
        <div class="d-flex justify-content-between align-items-center mb-3 mt-2">
          <h2 class="fw-bold mb-0">Control de Inventario</h2>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <ul class="nav nav-tabs mb-3">
      <li class="nav-item">
        <button class="nav-link" :class="{ active: activeTab==='new' }" type="button" @click="activeTab='new'">Nuevo control</button>
      </li>
      <li class="nav-item">
        <button class="nav-link" :class="{ active: activeTab==='load' }" type="button" @click="switchToLoad()">Cargar conteo</button>
      </li>
      <li class="nav-item">
        <button class="nav-link disabled" type="button" tabindex="-1" aria-disabled="true">Revisión/Ajustes</button>
      </li>
    </ul>

  <!-- Tab: Nuevo control -->
  <div v-if="activeTab==='new'" class="row g-4">
      <!-- Left: Form -->
      <div class="col-12 col-xl-6">
        <div class="card h-100">
          <div class="card-body">
            <h5 class="fw-bold">Generar Control</h5>
            <small class="text-muted d-block mb-3">Complete los datos para generar la orden de control</small>

            <!-- Depósito -->
            <div class="mb-3">
              <label class="form-label">Depósito *</label>
              <select class="form-select" v-model.number="form.deposito_id">
                <option value="" disabled>Seleccionar depósito</option>
                <option v-for="d in depositos" :key="d.id" :value="d.id">{{ d.nombre }}</option>
              </select>
              <div v-if="errors.deposito_id" class="form-text text-danger">{{ errors.deposito_id }}</div>
            </div>

            <!-- Categorías -->
            <div class="mb-3">
              <label class="form-label d-block">Categorías</label>
              <div class="border rounded p-3 bg-light">
                <div class="row">
                  <div class="col-12 col-md-6">
                    <div class="form-check" v-for="cat in categoriasColumns[0]" :key="'l_'+cat.id">
                      <input class="form-check-input" type="checkbox" :id="'cat_'+cat.id" :value="cat.id" v-model="form.categorias" />
                      <label class="form-check-label" :for="'cat_'+cat.id">{{ cat.nombre }}</label>
                    </div>
                  </div>
                  <div class="col-12 col-md-6">
                    <div class="form-check" v-for="cat in categoriasColumns[1]" :key="'r_'+cat.id">
                      <input class="form-check-input" type="checkbox" :id="'cat_'+cat.id+'_r'" :value="cat.id" v-model="form.categorias" />
                      <label class="form-check-label" :for="'cat_'+cat.id+'_r'">{{ cat.nombre }}</label>
                    </div>
                  </div>
                </div>
              </div>
              <div v-if="errors.categorias" class="form-text text-danger">{{ errors.categorias }}</div>
            </div>

            <!-- Fiscalizador -->
            <div class="mb-3">
              <label class="form-label">Fiscalizador *</label>
              <select class="form-select" v-model.number="form.fiscalizador_id">
                <option value="" disabled>Seleccionar fiscalizador</option>
                <option v-for="u in usuarios" :key="u.id" :value="u.id">{{ u.nombre }}</option>
              </select>
              <div v-if="errors.fiscalizador_id" class="form-text text-danger">{{ errors.fiscalizador_id }}</div>
            </div>

            <!-- Controlador -->
            <div class="mb-1">
              <label class="form-label">Controlador *</label>
              <select class="form-select" v-model.number="form.controlador_id">
                <option value="" disabled>Seleccionar controlador</option>
                <option v-for="u in usuarios" :key="'ctrl_'+u.id" :value="u.id">{{ u.nombre }}</option>
              </select>
            </div>
            <small class="text-muted d-block mb-3">Debe ser un usuario distinto al fiscalizador</small>
            <div v-if="errors.controlador_id" class="form-text text-danger mt-n2 mb-2">{{ errors.controlador_id }}</div>

            <!-- Fecha de generación (editable, no se envía al backend) -->
            <div class="mb-3">
              <label class="form-label">Fecha de generación</label>
              <input type="date" class="form-control" v-model="fechaHoy" />
            </div>

            <!-- Observaciones -->
            <div class="mb-4">
              <label class="form-label">Observaciones</label>
              <textarea class="form-control" rows="3" placeholder="Observaciones adicionales..." v-model="form.observaciones"></textarea>
            </div>

            <!-- Actions -->
            <div class="d-flex gap-3">
              <button class="btn btn-dark flex-grow-1" :disabled="isLoadingListado" @click="handleGenerarListado">
                <span v-if="isLoadingListado" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Generar listado
              </button>
              <button class="btn btn-link" type="button" @click="resetForm">Limpiar</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Generated List -->
      <div class="col-12 col-xl-6">
        <div class="card h-100">
          <div class="card-body d-flex flex-column">
            <h5 class="fw-bold">Listado Generado</h5>
            <small class="text-muted d-block mb-3">Productos incluidos en el control</small>

            <div class="table-responsive" v-if="items.length">
              <table class="table align-middle">
                <thead class="table-light">
                  <tr>
                    <th style="width: 40px"><input class="form-check-input" type="checkbox" v-model="selectAll" /></th>
                    <th>Producto</th>
                    <th>Categoría</th>
                    <th>Unidad base</th>
                    <th class="text-end">Stock sistema</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="it in items" :key="it.producto_id">
                    <td><input class="form-check-input" type="checkbox" v-model="selectedIds" :value="it.producto_id" /></td>
                    <td>
                      <div class="fw-semibold">{{ it.producto_nombre }}</div>
                      <small class="text-muted">{{ it.codigo_barras || it.codigo_producto }}</small>
                    </td>
                    <td>{{ it.categoria_nombre }}</td>
                    <td>{{ it.unidad_base }}</td>
                    <td class="text-end">{{ it.stock_sistema }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div v-else class="border rounded p-4 text-center text-muted flex-grow-1 d-flex align-items-center justify-content-center">
              <div>
                <i class="bi bi-box-seam me-2"></i>No hay productos generados todavía.
              </div>
            </div>

            <div class="d-flex gap-2 mt-3">
              <button class="btn btn-dark flex-grow-1" :disabled="!items.length || isSaving" @click="handleGuardarControl">
                <span v-if="isSaving" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Guardar control
              </button>
              <button class="btn btn-outline-secondary" type="button" @click="clearListado" :disabled="isSaving">Cancelar</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab: Cargar conteo -->
    <div v-else-if="activeTab==='load'" class="row g-4">
      <div class="col-12">
        <div class="card mb-3">
          <div class="card-body">
            <div class="d-flex align-items-center mb-2">
              <h5 class="fw-bold mb-0 me-3">Controles</h5>
              <small class="text-muted">Selecciona un control para cargar o imprimir</small>
            </div>

            <div v-if="myControlsLoading" class="text-muted">Cargando controles...</div>
            <div v-else>
              <div v-if="!myControls.length" class="text-muted">No hay controles disponibles.</div>
              <div v-else class="list-group list-group-flush">
                <div class="list-group-item d-flex justify-content-between align-items-center flex-wrap" v-for="ctl in myControls" :key="ctl.control_id">
                  <div class="d-flex align-items-center gap-3 flex-wrap">
                    <div class="fw-bold">Control #{{ ctl.codigo_control }}</div>
                    <span class="badge text-uppercase" :class="badgeClass(ctl.estado_control)">{{ ctl.estado_control }}</span>
                    <span class="text-muted">{{ ctl.deposito_nombre }}</span>
                    <span class="text-muted">{{ ctl.fiscalizador_nombre }}</span>
                    <span class="text-muted">{{ ctl.controlador_nombre }}</span>
                    <span class="text-muted">{{ formatDate(ctl.fecha) }}</span>
                  </div>
                  <div class="d-flex gap-2">
                    <button class="btn btn-outline-secondary btn-sm" @click="imprimirPlanilla(ctl)">Imprimir planilla</button>
                    <button class="btn btn-link btn-sm" @click="cargarPlanilla(ctl)">Cargar Planilla</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Conteo Físico -->
      <div class="col-12">
        <div class="card">
          <div class="card-body">
            <h5 class="fw-bold">Conteo Físico</h5>
            <small class="text-muted d-block mb-3">Ingrese las cantidades físicas contadas</small>

            <!-- Buscador de código de barras -->
            <div class="mb-3 p-3 border rounded bg-light">
              <label class="form-label mb-1">Código de Barras</label>
              <input class="form-control" placeholder="Escanee o ingrese código de barras..." v-model.trim="barcodeFilter" />
              <small class="text-primary">El código debe coincidir con el producto en la tabla</small>
            </div>

            <div class="table-responsive" v-if="filteredLoadItems.length">
              <table class="table align-middle">
                <thead class="table-light">
                  <tr>
                    <th>Producto</th>
                    <th>Unidad Medida</th>
                    <th>Categoría</th>
                    <th>Presentación</th>
                    <th>Unidades por presentación</th>
                    <th>Cantidad física</th>
                    <th>Notas</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in filteredLoadItems" :key="row.producto_id">
                    <td>
                      <div class="fw-semibold">{{ row.producto_nombre }}</div>
                      <small class="text-muted">{{ row.codigo_barras || row.codigo_producto || '-' }}</small>
                    </td>
                    <td>{{ row.unidad_base }}</td>
                    <td>{{ row.categoria_nombre }}</td>
                    <td style="min-width: 160px;">
                      <select class="form-select form-select-sm" v-model="row.presentacionSeleccionada">
                        <option :value="null">Unidad</option>
                        <option v-for="p in row.presentaciones" :key="p._key" :value="p._key">{{ p.nombre || p.label || 'Presentación' }}</option>
                      </select>
                    </td>
                    <td>{{ unidadesPorPresentacion(row) }}</td>
                    <td style="max-width: 100px;">
                      <input type="number" min="0" class="form-control form-control-sm" v-model.number="row.cantidadFisica" />
                    </td>
                    <td style="min-width: 160px;">
                      <input type="text" class="form-control form-control-sm" placeholder="Notas..." v-model.trim="row.notas" />
                    </td>
                    <td class="text-center text-muted"><i class="bi bi-exclamation-triangle"></i></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-else class="text-muted">No hay items para cargar. Seleccione un control y pulse "Cargar Planilla".</div>

            <div class="d-flex justify-content-end mt-3">
              <button class="btn btn-dark" :disabled="!loadItems.length" @click="finalizarCarga">Finalizar carga</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import InventoryControlService from '@/services/InventoryControlService'

// Tabs
const activeTab = ref('new')

// Form state
const form = reactive({
  deposito_id: '',
  categorias: [],
  fiscalizador_id: '',
  controlador_id: '',
  observaciones: ''
})

// Depósitos: placeholder local hasta tener endpoint
const depositos = ref([
  { id: 1, nombre: 'Depósito Central' }
])

// Categorías y usuarios: cargar desde backend
const categoriasOptions = ref([])
const usuarios = ref([]) // para controlador (y opcionalmente fiscalizador cuando haya endpoint)

// loading flags for options
const isLoadingOptions = reactive({ categorias: false, usuarios: false })

// Fecha por defecto según zona horaria de Paraguay
const TIMEZONE = 'America/Asuncion'
const fechaHoy = ref(new Date().toLocaleDateString('en-CA', { timeZone: TIMEZONE })) // YYYY-MM-DD

// Generated list state
const items = ref([]) // respuesta.items
const header = ref(null)

// Derived: split categorías en 2 columnas
const categoriasColumns = computed(() => {
  const half = Math.ceil(categoriasOptions.value.length / 2)
  return [
    categoriasOptions.value.slice(0, half),
    categoriasOptions.value.slice(half)
  ]
})

// Selection state (UI only)
const selectedIds = ref([])
const selectAll = computed({
  get() {
    return items.value.length && selectedIds.value.length === items.value.length
  },
  set(val) {
    selectedIds.value = val ? items.value.map(i => i.producto_id) : []
  }
})

// Loading flags
const isLoadingListado = ref(false)
const isSaving = ref(false)

// Simple validation
const errors = reactive({})
function validateForm(forSave = false) {
  errors.deposito_id = !form.deposito_id ? 'Seleccione un depósito' : ''
  errors.categorias = !form.categorias.length ? 'Seleccione al menos una categoría' : ''
  if (forSave) {
    errors.fiscalizador_id = !form.fiscalizador_id ? 'Seleccione un fiscalizador' : ''
    errors.controlador_id = !form.controlador_id ? 'Seleccione un controlador' : ''
    if (form.fiscalizador_id && form.controlador_id && form.fiscalizador_id === form.controlador_id) {
      errors.controlador_id = 'El controlador debe ser distinto al fiscalizador'
    }
  } else {
    errors.fiscalizador_id = ''
    errors.controlador_id = ''
  }
  return !Object.values(errors).some(Boolean)
}

async function handleGenerarListado() {
  if (!validateForm(false)) return
  isLoadingListado.value = true
  try {
    const payload = { deposito_id: Number(form.deposito_id), categorias: form.categorias.map(Number) }
    const { data } = await InventoryControlService.getPreliminaryList(payload)
    header.value = data.header
    items.value = Array.isArray(data.items) ? data.items : []
    // Default select all
    selectedIds.value = items.value.map(i => i.producto_id)
  } catch (e) {
    // Errores ya manejados globalmente por apiService
  } finally {
    isLoadingListado.value = false
  }
}

async function handleGuardarControl() {
  if (!validateForm(true)) return
  if (!items.value.length) return
  isSaving.value = true
  try {
    const payload = {
      deposito_id: Number(form.deposito_id),
      categorias: form.categorias.map(Number),
      fiscalizador_id: Number(form.fiscalizador_id),
      controlador_id: Number(form.controlador_id),
      observaciones: form.observaciones?.trim() || ''
    }
    const { data } = await InventoryControlService.createControl(payload)
    window.alert(data?.message || 'Control generado correctamente')
    // Reset after success
    resetForm()
    clearListado()
  } catch (e) {
    // handled globally
  } finally {
    isSaving.value = false
  }
}

function resetForm() {
  form.deposito_id = ''
  form.categorias = []
  form.fiscalizador_id = ''
  form.controlador_id = ''
  form.observaciones = ''
  // keep fechaHoy as today
}

function clearListado() {
  items.value = []
  header.value = null
  selectedIds.value = []
}

// Reset list if depósito or categorías change
watch(() => [form.deposito_id, form.categorias.slice()], clearListado)

// Load categories and controllers on mount
onMounted(async () => {
  // Categorías
  try {
    isLoadingOptions.categorias = true
    const { data } = await InventoryControlService.getCategories({ page: 1, limit: 100 })
    const rows = data?.data?.data || []
    categoriasOptions.value = rows.map(c => ({ id: c.categoria_id, nombre: c.nombre }))
  } catch (e) {
    // handled globally
  } finally {
    isLoadingOptions.categorias = false
  }

  // Controladores (usuarios)
  try {
    isLoadingOptions.usuarios = true
    const { data } = await InventoryControlService.getUsers()
    const rows = Array.isArray(data) ? data : []
    // El backend devuelve 'nombre' para mostrar
    usuarios.value = rows.map(u => ({ id: u.usuario_id, nombre: u.nombre }))
  } catch (e) {
    // handled globally
  } finally {
    isLoadingOptions.usuarios = false
  }
})

// ---------- Cargar conteo (Tab 2) ----------
const myControls = ref([])
const myControlsLoading = ref(false)
const selectedControl = ref(null)
const loadHeader = ref(null)
const loadItems = ref([])
const barcodeFilter = ref('')

function switchToLoad() {
  activeTab.value = 'load'
  if (!myControls.value.length) fetchMyControls()
}

async function fetchMyControls() {
  myControlsLoading.value = true
  try {
    const { data } = await InventoryControlService.getMyControls()
    myControls.value = data?.controls || []
    if (!Array.isArray(myControls.value)) myControls.value = []
  } catch (e) {
    // Fallback si el backend falla: autorespuesta básica
    myControls.value = [
      {
        control_id: 1,
        codigo_control: 'CTRL-001',
        estado_control: 'GENERADO',
        fecha: new Date().toISOString(),
        deposito_id: 1,
        deposito_nombre: 'Depósito Central',
        fiscalizador_id: 1,
        controlador_id: 1,
        fiscalizador_nombre: 'Emilio',
        controlador_nombre: 'Emilio'
      }
    ]
  } finally {
    myControlsLoading.value = false
  }
}

async function cargarPlanilla(ctl) {
  selectedControl.value = ctl
  try {
    const { data } = await InventoryControlService.getControlLoadDetail(ctl.control_id)
    loadHeader.value = data?.header || null
    const items = Array.isArray(data?.items) ? data.items : []
    // normalizar filas con campos de edición
    loadItems.value = items.map((it, idx) => ({
      ...it,
      presentaciones: (it.presentaciones || []).map((p, i) => ({ ...p, _key: `${idx}_${i}` })),
      presentacionSeleccionada: null,
      cantidadFisica: 0,
      notas: ''
    }))
  } catch (e) {
    // Fallback autorespuesta cuando el endpoint no esté disponible
    loadHeader.value = {
      control_id: ctl?.control_id ?? 1,
      codigo_control: ctl?.codigo_control ?? 'CTRL-001',
      estado_control: ctl?.estado_control ?? 'GENERADO',
      deposito_id: ctl?.deposito_id ?? 1,
      deposito_nombre: ctl?.deposito_nombre ?? 'Depósito Central',
      fiscalizador_id: ctl?.fiscalizador_id ?? 1,
      fiscalizador_nombre: ctl?.fiscalizador_nombre ?? 'Emilio',
      controlador_id: ctl?.controlador_id ?? 1,
      controlador_nombre: ctl?.controlador_nombre ?? 'Emilio',
      fecha: ctl?.fecha ?? new Date().toISOString()
    }
    const fallbackItems = [
      {
        producto_id: 33,
        producto_nombre: 'Prueba004',
        unidad_base: 'onza',
        categoria_nombre: 'Embutidos',
        presentaciones: []
      }
    ]
    loadItems.value = fallbackItems.map((it) => ({
      ...it,
      presentaciones: [],
      presentacionSeleccionada: null,
      cantidadFisica: 0,
      notas: ''
    }))
  }
}

function imprimirPlanilla(ctl) {
  // Reutiliza el mismo detalle, renderiza simple y dispara print
  InventoryControlService.getControlLoadDetail(ctl.control_id)
    .then(({ data }) => {
      const header = data?.header
      const items = data?.items || []
      const win = window.open('', '_blank')
      if (!win) return
      const rows = items.map(i => `
        <tr>
          <td>${i.producto_nombre}</td>
          <td>${i.unidad_base || ''}</td>
          <td>${i.categoria_nombre || ''}</td>
          <td>${i.codigo_barras || i.codigo_producto || ''}</td>
        </tr>`).join('')
      const html = `
        <html><head><title>Planilla ${header?.codigo_control || ''}</title>
        <style>body{font-family:Arial;padding:16px} table{width:100%;border-collapse:collapse} th,td{border:1px solid #ddd;padding:6px;text-align:left} th{background:#f7f7f7}</style>
        </head><body>
        <h3>Planilla de Conteo - ${header?.codigo_control || ''}</h3>
        <div><strong>Depósito:</strong> ${header?.deposito_nombre || ''}</div>
        <div><strong>Fiscalizador:</strong> ${header?.fiscalizador_nombre || ''} &nbsp; <strong>Controlador:</strong> ${header?.controlador_nombre || ''}</div>
        <div><strong>Fecha:</strong> ${formatDate(header?.fecha)}</div>
        <hr/>
        <table><thead><tr><th>Producto</th><th>Unidad</th><th>Categoría</th><th>Código</th></tr></thead>
  <tbody>${rows}</tbody></table>
  <script>window.onload=()=>window.print()</scr${''}ipt>
        </body></html>`
      win.document.open()
      win.document.write(html)
      win.document.close()
    })
    .catch(() => {
      // Fallback para impresión
      const header = {
        codigo_control: ctl?.codigo_control ?? 'CTRL-001',
        deposito_nombre: ctl?.deposito_nombre ?? 'Depósito Central',
        fiscalizador_nombre: ctl?.fiscalizador_nombre ?? 'Emilio',
        controlador_nombre: ctl?.controlador_nombre ?? 'Emilio',
        fecha: ctl?.fecha ?? new Date().toISOString()
      }
      const items = [
        { producto_nombre: 'Prueba004', unidad_base: 'onza', categoria_nombre: 'Embutidos', codigo_barras: '' }
      ]
      const win = window.open('', '_blank')
      if (!win) return
      const rows = items.map(i => `
        <tr>
          <td>${i.producto_nombre}</td>
          <td>${i.unidad_base || ''}</td>
          <td>${i.categoria_nombre || ''}</td>
          <td>${i.codigo_barras || ''}</td>
        </tr>`).join('')
      const html = `
        <html><head><title>Planilla ${header?.codigo_control || ''}</title>
        <style>body{font-family:Arial;padding:16px} table{width:100%;border-collapse:collapse} th,td{border:1px solid #ddd;padding:6px;text-align:left} th{background:#f7f7f7}</style>
        </head><body>
        <h3>Planilla de Conteo - ${header?.codigo_control || ''}</h3>
        <div><strong>Depósito:</strong> ${header?.deposito_nombre || ''}</div>
        <div><strong>Fiscalizador:</strong> ${header?.fiscalizador_nombre || ''} &nbsp; <strong>Controlador:</strong> ${header?.controlador_nombre || ''}</div>
        <div><strong>Fecha:</strong> ${formatDate(header?.fecha)}</div>
        <hr/>
        <table><thead><tr><th>Producto</th><th>Unidad</th><th>Categoría</th><th>Código</th></tr></thead>
        <tbody>${rows}</tbody></table>
        <script>window.onload=()=>window.print()</scr${''}ipt>
        </body></html>`
      win.document.open()
      win.document.write(html)
      win.document.close()
    })
}

const filteredLoadItems = computed(() => {
  const q = barcodeFilter.value.trim().toLowerCase()
  if (!q) return loadItems.value
  return loadItems.value.filter(r =>
    String(r.codigo_barras || r.codigo_producto || '').toLowerCase().includes(q)
  )
})

function unidadesPorPresentacion(row) {
  const sel = row.presentaciones?.find(p => p._key === row.presentacionSeleccionada)
  return sel?.unidades_por_presentacion ? `${sel.unidades_por_presentacion} unidades` : '—'
}

function finalizarCarga() {
  // TODO: endpoint de finalizar carga; por ahora feedback local
  window.alert('Carga finalizada (demo).')
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('es-PY', { year: 'numeric', month: '2-digit', day: '2-digit' })
  } catch {
    return ''
  }
}

function badgeClass(estado) {
  const e = String(estado || '').toUpperCase()
  if (e.includes('CANCEL')) return 'bg-danger'
  if (e.includes('CARG')) return 'bg-dark text-white'
  if (e.includes('PEND')) return 'bg-warning'
  return 'bg-success'
}
</script>
