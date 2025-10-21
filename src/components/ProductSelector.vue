<template>
		<div class="product-selector">
		<div class="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3">
			<div class="d-flex gap-3 flex-grow-1">
				<input
					v-model="searchTerm"
					type="text"
					class="form-control"
					style="max-width: 350px"
					placeholder="Buscar por nombre..."
				/>

				<div class="position-relative" style="max-width: 250px; width: 250px;">
					<input
						v-model="categorySearchTerm"
						type="text"
						class="form-control"
						placeholder="Filtrar por categoría..."
						@focus="showCategoryDropdown = true"
						@blur="handleCategoryBlur"
						:disabled="loadingCategories"
					/>

					<div
						v-if="showCategoryDropdown && filteredCategories.length > 0"
						class="category-dropdown position-absolute w-100 mt-1 bg-white border rounded shadow-sm"
						style="max-height: 300px; overflow-y: auto; z-index: 1050;"
					>
						<div
							class="dropdown-item cursor-pointer px-3 py-2 hover-bg-light"
							@mousedown.prevent="selectCategory('', 'Todas las categorías')"
						>
							<strong>Todas las categorías</strong>
						</div>
						<div
							v-for="cat in filteredCategories"
							:key="cat.id"
							class="dropdown-item cursor-pointer px-3 py-2 hover-bg-light"
							@mousedown.prevent="selectCategory(cat.id, cat.name)"
						>
							{{ cat.name }}
						</div>
					</div>
				</div>
			</div>

			<button
				class="btn btn-outline-danger d-flex align-items-center"
				@click="clearFilters"
				:disabled="!searchTerm && !selectedCategory"
			>
				<i class="bi bi-arrow-counterclockwise me-2"></i>
				Limpiar filtros
			</button>
		</div>

		<div class="table-responsive">
			<table class="table align-middle product-selector-table mb-2">
				<thead class="table-light">
					<tr>
						<th>Código</th>
						<th>Nombre</th>
						<th>Categoría</th>
						<th>Stock Total</th>
						<th>Unidad</th>
						<th>IVA</th>
					</tr>
				</thead>
				<tbody>
					<tr v-if="loading">
						<td colspan="6" class="text-center py-4">
							<i class="bi bi-arrow-clockwise spin me-2"></i>
							Cargando productos...
						</td>
					</tr>
					<tr v-else-if="pagedProducts.length === 0">
						<td colspan="6" class="text-center py-4 text-muted">
							No se encontraron productos
						</td>
					</tr>
					<tr
						v-else
						v-for="prod in pagedProducts"
						:key="prod.id"
						class="selectable-row"
						role="button"
						tabindex="0"
						@click="selectProduct(prod)"
						@keyup.enter.prevent="selectProduct(prod)"
					>
						<td>{{ prod.code }}</td>
						<td>
							<div>{{ prod.name }}</div>
							<small class="text-muted" v-if="!prod.tiene_precio">
								{{ prod.estado_producto }}
							</small>
						</td>
						<td>{{ prod.category }}</td>
						<td>{{ prod.stock }}</td>
						<td>{{ prod.unit }}</td>
						<td>{{ prod.iva }}</td>
					</tr>
				</tbody>
			</table>
		</div>

		<AppPagination
			class="mt-3"
			:total-pages="totalPages"
			:current-page="currentPage"
			@page-changed="changePage"
		/>
	</div>
</template>

<script setup>
/* global defineEmits */
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import AppPagination from '@/components/AppPagination.vue'
import apiService from '@/services/apiService.js'

const emit = defineEmits(['product-selected'])

const searchTerm = ref('')
const categorySearchTerm = ref('')
const showCategoryDropdown = ref(false)
const allCategories = ref([])
const selectedCategory = ref('')
const loading = ref(false)
const loadingCategories = ref(false)
const products = ref([])
const currentPage = ref(1)
const totalPages = ref(1)
const pagination = ref({})
const itemsPerPage = 10
const usingLocalPagination = ref(false)

let searchTimeout = null

function mapProduct(item) {
	return {
		id: item.producto_id,
		code: item.codigo_barras || item.codigo_producto || '',
		name: item.nombre || '',
		category: item.categoria_nombre || '',
		stock: item.stock_disponible || 0,
		minStock: 5,
		unit: item.unidad_medida_nombre || '',
		iva: item.tipo_iva_descripcion || '',
		activo: item.activo,
		categoria_id: item.categoria_id,
		unidad_medida_id: item.unidad_medida_id,
		tipo_iva: item.tipo_iva,
		descripcion: item.descripcion || '',
		url_imagen: item.url_imagen || '',
		precio_venta_actual: item.precio_venta_actual,
		tiene_precio: item.disponibilidad?.tiene_precio || false,
		estado_producto: item.estado_producto || ''
	}
}

async function loadCategories() {
	loadingCategories.value = true
	try {
		const allCategoriesData = []
		let page = 1
		let hasMorePages = true

		while (hasMorePages) {
			const response = await apiService.get(`/api/categories?page=${page}&limit=50`)

			let list = []
			let paginationInfo = null
			const data = response.data

			if (Array.isArray(data)) {
				list = data
				hasMorePages = false
			} else if (data?.data) {
				if (Array.isArray(data.data)) {
					list = data.data
					hasMorePages = false
				} else if (Array.isArray(data.data.data)) {
					list = data.data.data
					paginationInfo = data.data.pagination
					hasMorePages = paginationInfo?.hasNextPage || false
				}
			}

			allCategoriesData.push(...list)

			if (!hasMorePages) break

			page += 1

			if (page > 10) {
				console.warn('[ProductSelector] Se alcanzó el límite de 10 páginas al cargar categorías')
				break
			}
		}

		allCategories.value = allCategoriesData.map(cat => ({
			id: cat.categoria_id ?? cat.id,
			name: cat.nombre
		}))
	} catch (error) {
		console.error('[ProductSelector] Error cargando categorías:', error)
		allCategories.value = []
	} finally {
		loadingCategories.value = false
	}
}

const filteredCategories = computed(() => {
	if (!categorySearchTerm.value.trim()) {
		return allCategories.value
	}

	const term = categorySearchTerm.value.toLowerCase()
	return allCategories.value.filter(cat => cat.name.toLowerCase().includes(term))
})

function selectCategory(categoryId, categoryName = '') {
	selectedCategory.value = categoryId
	categorySearchTerm.value = categoryName
	showCategoryDropdown.value = false
}

function handleCategoryBlur() {
	setTimeout(() => {
		showCategoryDropdown.value = false
	}, 200)
}

async function loadProducts(options = {}) {
	const { suppressLog = false, page = 1 } = options || {}
	loading.value = true

	try {
		let response = null
		let data = []
		let useLocalPagination = false

		if (searchTerm.value.trim()) {
			response = await apiService.get(`/api/products/search?query=${encodeURIComponent(searchTerm.value)}`)
			data = Array.isArray(response.data) ? response.data : []
			useLocalPagination = true
		} else if (selectedCategory.value) {
			response = await apiService.get(`/api/products?category_id=${selectedCategory.value}&page=${page}`)

			if (Array.isArray(response.data)) {
				data = response.data
				useLocalPagination = true
			} else if (response.data?.data) {
				data = Array.isArray(response.data.data) ? response.data.data : []
				if (response.data.pagination) {
					pagination.value = response.data.pagination
					totalPages.value = response.data.pagination.totalPages || 1
					currentPage.value = response.data.pagination.page || 1
					useLocalPagination = false
				} else {
					useLocalPagination = true
				}
			} else {
				data = []
				useLocalPagination = true
			}
		} else {
			response = await apiService.get(`/api/products?page=${page}`)
			data = Array.isArray(response.data)
				? response.data
				: (Array.isArray(response.data?.data) ? response.data.data : [])

			if (response?.data?.pagination) {
				pagination.value = response.data.pagination
				totalPages.value = response.data.pagination.totalPages || 1
				currentPage.value = response.data.pagination.page || 1
				useLocalPagination = false
			} else {
				totalPages.value = 1
				currentPage.value = 1
				useLocalPagination = false
			}
		}

		products.value = Array.isArray(data) ? data.map(mapProduct) : []

		if (useLocalPagination) {
			const totalItems = products.value.length
			totalPages.value = Math.ceil(totalItems / itemsPerPage) || 1
			currentPage.value = Math.min(page, totalPages.value)
		}

		usingLocalPagination.value = useLocalPagination
	} catch (error) {
		console.error('[ProductSelector] Error cargando productos:', error)
		if (!suppressLog) {
			console.warn('No se pudieron cargar los productos. Intente nuevamente más tarde.')
		}
		products.value = []
		totalPages.value = 1
		currentPage.value = 1
		usingLocalPagination.value = true
	} finally {
		loading.value = false
	}
}

const filteredProducts = computed(() => {
	const productsArray = Array.isArray(products.value) ? products.value : []

	if (searchTerm.value.trim() && selectedCategory.value) {
		return productsArray.filter(p => String(p.categoria_id) === String(selectedCategory.value))
	}

	return productsArray
})

const pagedProducts = computed(() => {
	if (usingLocalPagination.value) {
		const start = (currentPage.value - 1) * itemsPerPage
		const end = start + itemsPerPage
		return filteredProducts.value.slice(start, end)
	}

	return filteredProducts.value
})

function changePage(page) {
	if (page < 1 || page > totalPages.value) return
	currentPage.value = page

	if (!usingLocalPagination.value) {
		loadProducts({ suppressLog: true, page })
	}
}

function clearFilters() {
	searchTerm.value = ''
	selectedCategory.value = ''
	categorySearchTerm.value = ''
	currentPage.value = 1
	loadProducts({ suppressLog: true, page: 1 })
}

function selectProduct(prod) {
	emit('product-selected', prod)
}

watch(searchTerm, (newValue, oldValue) => {
	if (searchTimeout) {
		clearTimeout(searchTimeout)
	}

	if (newValue !== oldValue) {
		currentPage.value = 1
	}

	searchTimeout = setTimeout(() => {
		loadProducts({ suppressLog: true, page: 1 })
	}, 500)
})

watch(selectedCategory, (newValue, oldValue) => {
	if (newValue !== oldValue) {
		currentPage.value = 1
		loadProducts({ suppressLog: true, page: 1 })
	}
})

onMounted(() => {
	loadProducts()
	loadCategories()
})

onBeforeUnmount(() => {
	if (searchTimeout) clearTimeout(searchTimeout)
})
</script>

<style scoped>
.spin {
	animation: spin 1s linear infinite;
}

@keyframes spin {
	from { transform: rotate(0deg); }
	to { transform: rotate(360deg); }
}

.product-selector-table tbody tr.selectable-row {
	cursor: pointer;
	transition: background-color 0.15s ease-in-out;
}

.product-selector-table tbody tr.selectable-row:hover,
.product-selector-table tbody tr.selectable-row:focus {
	background-color: #f8f9fa;
	outline: none;
}

.category-dropdown {
	background: white;
	border: 1px solid #dee2e6;
	box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}

.dropdown-item {
	transition: background-color 0.15s ease-in-out;
	border-bottom: 1px solid #f8f9fa;
}

.dropdown-item:last-child {
	border-bottom: none;
}

.dropdown-item:hover,
.hover-bg-light:hover {
	background-color: #f8f9fa;
}

.cursor-pointer {
	cursor: pointer;
}

.category-dropdown::-webkit-scrollbar {
	width: 8px;
}

.category-dropdown::-webkit-scrollbar-track {
	background: #f1f1f1;
	border-radius: 4px;
}

.category-dropdown::-webkit-scrollbar-thumb {
	background: #888;
	border-radius: 4px;
}

.category-dropdown::-webkit-scrollbar-thumb:hover {
	background: #555;
}
</style>
