<template>
  <div>
    <div class="row">
      <div class="col-12">
        <!-- Título y botón alineados como en Dashboard -->
        <div class="d-flex justify-content-between align-items-center mb-4 mt-2">
          <h2 class="fw-bold mb-0">Gestión de Productos</h2>
          <button class="btn btn-dark d-flex align-items-center">
            <i class="bi bi-plus-lg me-2"></i> Nuevo Producto
          </button>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="col-12">
        <div class="card p-4">
          <!-- Buscador y Filtros -->
          <div class="d-flex justify-content-between align-items-center mb-3">
            <input
              v-model="searchTerm"
              type="text"
              class="form-control me-3"
              style="max-width: 350px"
              placeholder="Buscar productos..."
            />
            <button class="btn btn-outline-secondary d-flex align-items-center">
              <i class="bi bi-funnel me-2"></i> Filtros
            </button>
          </div>

          <!-- Tabla de productos -->
          <div class="table-responsive">
            <table class="table align-middle mb-0">
              <thead class="table-light">
                <tr>
                  <th>Código</th>
                  <th>Nombre</th>
                  <th>Categoría</th>
                  <th>Stock Total</th>
                  <th>Unidad</th>
                  <th>IVA</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="prod in filteredProducts" :key="prod.id">
                  <td>{{ prod.code }}</td>
                  <td>{{ prod.name }}</td>
                  <td>{{ prod.category }}</td>
                  <td>{{ prod.stock }}</td>
                  <td>{{ prod.unit }}</td>
                  <td>{{ prod.iva }}</td>
                  <td>
                    <span
                      :class="[
                        'badge rounded-pill px-3 py-2',
                        prod.stock < prod.minStock
                          ? 'bg-light text-dark fw-bold border border-secondary'
                          : 'bg-dark text-white fw-bold'
                      ]"
                    >
                      {{ prod.stock < prod.minStock ? 'Bajo Stock' : 'Normal' }}
                    </span>
                  </td>
                  <td>
                    <button class="btn btn-outline-secondary btn-sm">Editar</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const searchTerm = ref('')

const products = ref([
  {
    id: 1,
    code: '7891234567890',
    name: 'Laptop Dell XPS 13',
    category: 'Electrónicos',
    stock: 15,
    minStock: 20,
    unit: 'Unidad',
    iva: '21%',
  },
  {
    id: 2,
    code: '7891234567891',
    name: 'Mouse Logitech MX',
    category: 'Accesorios',
    stock: 45,
    minStock: 10,
    unit: 'Unidad',
    iva: '21%',
  },
])

const filteredProducts = computed(() => {
  if (!searchTerm.value) return products.value
  return products.value.filter(
    p =>
      p.name.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      p.code.includes(searchTerm.value)
  )
})
</script>
