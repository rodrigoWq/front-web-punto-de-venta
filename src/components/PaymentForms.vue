<template>
  <div class="card p-3 mb-4">
    <h5><i class="bi bi-credit-card-2-front me-2"></i>Formas de Pago</h5>
    <p class="text-muted">Configure cómo se realizará el cobro</p>

    <div class="bg-success bg-opacity-10 p-3 rounded mb-3">
      <div class="d-flex justify-content-between">
        <div>Monto Total:</div>
        <div class="fw-bold">{{ formatCurrency(total) }}</div>
      </div>
      <div class="d-flex justify-content-between">
        <div>Total Asignado:</div>
        <div class="fw-bold">{{ formatCurrency(assigned) }}</div>
      </div>
      <div class="d-flex justify-content-between">
        <div>Restante:</div>
        <div :class="remaining > 0 ? 'text-danger fw-bold' : 'text-success fw-bold'">
          {{ formatCurrency(remaining) }}
        </div>
      </div>
    </div>

    <hr />

    <div class="row g-2 align-items-center mb-3">
      <div class="col-md-4">
        <select v-model="type" class="form-select">
          <option disabled value="">Tipo</option>
          <option v-for="t in types" :key="t" :value="t">{{ t }}</option>
        </select>
      </div>
      <div class="col-md-4">
        <input
          v-model.number="amount"
          type="number"
          class="form-control"
          placeholder="Monto"
        />
      </div>
      <div class="col-md-4 d-grid">
        <button class="btn btn-dark" :disabled="!canAdd" @click="add">
          <i class="bi bi-plus-lg me-1"></i>Agregar
        </button>
      </div>
    </div>

    <ul class="list-group list-group-flush mt-3">
      <li
        v-for="(p, i) in payments"
        :key="i"
        class="list-group-item d-flex justify-content-between align-items-center"
      >
        <div>{{ p.type }}</div>
        <div>{{ formatCurrency(p.amount) }}</div>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'PaymentForms',
  props: {
    total: {
      type: Number,
      required: true
    },
    types: {
      type: Array,
      default: () => ['Efectivo', 'Tarjeta', 'Cheque', 'Transferencia']
    },
    payments: {
      type: Array,
      default: () => []
    }
  },
  emits: ['update:payments'],
  data() {
    return { type: '', amount: 0 }
  },
  computed: {
    assigned() {
      return this.payments.reduce((sum, p) => sum + p.amount, 0)
    },
    remaining() {
      return this.total - this.assigned
    },
    canAdd() {
      return this.type && this.amount > 0 && this.amount <= this.remaining
    }
  },
  methods: {
    add() {
      const nuevo = [...this.payments, { type: this.type, amount: this.amount }]
      this.$emit('update:payments', nuevo) 
      this.type = ''
      this.amount = 0
    },
    formatCurrency(val) {
      return new Intl.NumberFormat('es-PY', {
        style: 'currency',
        currency: 'PYG'
      }).format(val)
    }
  }
}
</script>


<style scoped>
.list-group-item {
  border: 1px solid #e9ecef;
  border-radius: 0.5rem;
}
</style>
