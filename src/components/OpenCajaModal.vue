<template>
  <div class="modal fade" :class="{ show: showModal }" :style="{ display: showModal ? 'block' : 'none' }" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Abrir Caja</h5>
          <button type="button" class="btn-close" @click="close"></button>
        </div>
        <div class="modal-body">
          <input v-model.number="monto" type="number" class="form-control" placeholder="Monto de apertura" />
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="close">Cancelar</button>
          <button type="button" class="btn btn-primary" @click="emitOpen">Abrir</button>
        </div>
      </div>
    </div>
  </div>
  <div class="modal-backdrop fade show" v-if="showModal"></div>
</template>

<script>
export default {
  name: 'OpenCajaModal',
  emits: ['update:showModal', 'open'],
  props: {
    showModal: { type: Boolean, default: false }
  },
  data() {
    return { monto: 0 };
  },
  methods: {
    close() {
      this.$emit('update:showModal', false);
    },
    emitOpen() {
      this.$emit('open', this.monto);
      this.monto = 0;
      this.close();
    }
  }
};
</script>

<style scoped>
</style>
