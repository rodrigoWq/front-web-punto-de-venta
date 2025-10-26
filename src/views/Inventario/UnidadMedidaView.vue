<template>
  <div>
    <div class="d-flex align-items-center justify-content-between mb-3">
      <h2 class="mb-0">Gestión de Unidades de Medida</h2>
      <button class="btn btn-dark" @click="openCreate">
        <i class="bi bi-plus-lg me-1"></i> Nueva Unidad
      </button>
    </div>

    <div class="card">
      <div class="table-responsive">
        <table class="table mb-0">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Descripción</th>
              <th style="width: 200px;">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="3" class="text-center py-4">Cargando...</td>
            </tr>
            <tr v-else-if="error">
              <td colspan="3" class="text-danger py-4">{{ error }}</td>
            </tr>
            <tr v-else v-for="u in units" :key="unitKey(u)">
              <td>{{ u.nombre }}</td>
              <td>{{ u.descripcion }}</td>
              <td>
                <button class="btn btn-outline-secondary btn-sm me-2" @click="openEdit(u)">Editar</button>
                <button class="btn btn-outline-danger btn-sm" @click="remove(u)">Eliminar</button>
              </td>
            </tr>
            <tr v-if="!loading && !error && units.length === 0">
              <td colspan="3" class="text-center py-4">Sin unidades</td>
            </tr>
          </tbody>
        </table>
      </div>
      <AppPagination
        class="px-3 pb-3"
        :current-page="currentPage"
        :total-pages="totalPages"
        @page-changed="handlePageChange"
      />
    </div>

    <!-- Modal crear/editar (inline) -->
    <div v-if="showModal" class="modal-backdrop fade show"></div>
    <div
      v-if="showModal"
      class="modal fade show d-block"
      id="unidad-modal"
      tabindex="-1"
      role="dialog"
      aria-modal="true"
      @click.self="closeModal"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEditing ? 'Editar Unidad' : 'Nueva Unidad' }}</h5>
            <button type="button" class="btn-close" aria-label="Close" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent>
              <div class="mb-3">
                <label class="form-label">Nombre</label>
                <input
                  v-model.trim="form.nombre"
                  type="text"
                  class="form-control"
                  placeholder="Nombre de la unidad"
                />
              </div>
              <div class="mb-3">
                <label class="form-label">Descripción</label>
                <textarea
                  v-model.trim="form.descripcion"
                  class="form-control"
                  rows="3"
                  placeholder="Descripción"
                />
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="closeModal">Cancelar</button>
            <button class="btn btn-primary" :disabled="saving || !isFormValid" @click="save">
              <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
              {{ isEditing ? 'Guardar cambios' : 'Crear' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AppPagination from '@/components/AppPagination.vue';
import api from '@/services/apiService.js';

export default {
  name: 'UnidadMedidaView',
  components: { AppPagination },
  data() {
    return {
      units: [],
      loading: false,
      error: '',
      showModal: false,
      isEditing: false,
      saving: false,
      currentPage: 1,
      totalPages: 1,
      pageSize: 10,
      form: {
        id: null,
        nombre: '',
        descripcion: ''
      }
    };
  },
  watch: {
    showModal: {
      immediate: true,
      handler(val) {
        try {
          if (typeof document !== 'undefined' && document?.body) {
            if (val) document.body.classList.add('modal-open');
            else document.body.classList.remove('modal-open');
          }
        } catch (e) {
          console.debug('Modal toggle failed', e);
        }
      }
    }
  },
  beforeUnmount() {
    try {
      if (typeof document !== 'undefined' && document?.body) {
        document.body.classList.remove('modal-open');
      }
    } catch (e) {
      console.debug('Modal cleanup failed', e);
    }
  },
  computed: {
    isFormValid() {
      return this.form.nombre && this.form.nombre.length >= 2;
    }
  },
  mounted() {
    this.fetchUnits();
  },
  methods: {
    unitId(u) {
      return u.unidad_medida_id ?? u.id ?? this.unitKey(u);
    },
    unitKey(u) {
      return `${u.unidad_medida_id ?? u.id ?? u.nombre}`;
    },
    async fetchUnits() {
      this.loading = true;
      this.error = '';
      try {
        const { data } = await api.get('/api/measure-units', { page: this.currentPage, limit: this.pageSize });
        let list = [];
        let pagination = null;
        if (Array.isArray(data)) {
          list = data;
        } else if (Array.isArray(data?.data)) {
          list = data.data;
        } else if (Array.isArray(data?.data?.data)) {
          list = data.data.data;
          pagination = data.data.pagination ?? null;
        } else {
          list = [];
        }
        this.units = list;
        if (pagination) {
          this.currentPage = Number(pagination.page) || this.currentPage;
          this.totalPages = Number(pagination.totalPages) || 1;
          this.pageSize = Number(pagination.limit) || this.pageSize;
        } else {
          this.totalPages = 1;
        }
      } catch (e) {
        console.error(e);
        this.error = 'No se pudieron cargar las unidades';
      } finally {
        this.loading = false;
      }
    },
    handlePageChange(page) {
      if (page === this.currentPage) return;
      this.currentPage = page;
      this.fetchUnits();
    },
    openCreate() {
      this.isEditing = false;
      this.form = { id: null, nombre: '', descripcion: '' };
      this.showModal = true;
    },
    async openEdit(u) {
      this.isEditing = true;
      const id = this.unitId(u);
      try {
        const { data } = await api.get(`/api/measure-units/${id}`);
        const mu = data?.data ?? data;
        this.form = {
          id,
          nombre: mu?.nombre ?? u.nombre ?? '',
          descripcion: mu?.descripcion ?? u.descripcion ?? ''
        };
      } catch (e) {
        this.form = {
          id,
          nombre: u.nombre ?? '',
          descripcion: u.descripcion ?? ''
        };
      }
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
    },
    async save() {
      if (!this.isFormValid) return;
      this.saving = true;
      try {
        if (this.isEditing && this.form.id != null) {
          await api.put(`/api/measure-units/${this.form.id}`, {
            nombre: this.form.nombre,
            descripcion: this.form.descripcion
          });
        } else {
          await api.post('/api/measure-units', {
            nombre: this.form.nombre,
            descripcion: this.form.descripcion
          });
        }
        this.showModal = false;
        await this.fetchUnits();
      } catch (e) {
        console.error(e);
      } finally {
        this.saving = false;
      }
    },
    async remove(u) {
      const id = this.unitId(u);
      if (!id) return;
      const confirmed = await confirm({
        message: '¿Eliminar esta unidad?',
        title: 'Eliminar unidad de medida',
        confirmText: 'Eliminar',
        cancelText: 'Cancelar'
      });
      if (!confirmed) return;
      try {
        await api.delete(`/api/measure-units/${id}`);
        await this.fetchUnits();
        alert.success('Unidad de medida eliminada.');
      } catch (e) {
        console.error(e);
        alert.error('No se pudo eliminar la unidad. Intente nuevamente.');
      }
    }
  }
};
</script>

<style scoped>
.card {
  border: 1px solid #e5e5e5;
  border-radius: .5rem;
}

th, td { vertical-align: middle; }
</style>
