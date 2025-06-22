<template>
  <div class="modal fade" :class="{ show: showModal }" :style="{ display: showModal ? 'block' : 'none' }" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Cerrar Caja</h5>
          <button type="button" class="btn-close" @click="close"></button>
        </div>
        <div class="modal-body">
          <input v-model.number="monto" type="number" class="form-control" placeholder="Monto de cierre" />
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="close">Cancelar</button>
          <button type="button" class="btn btn-danger" @click="emitClose">Cerrar</button>
        </div>
      </div>
    </div>
  </div>
  <div class="modal-backdrop fade show" v-if="showModal"></div>
</template>

<script>
export default {
  name: 'CloseCajaModal',
  emits: ['update:showModal', 'close'],
  props: { showModal: { type: Boolean, default: false } },
  data() {
    return { monto: 0 };
  },
  methods: {
    close() {
      this.$emit('update:showModal', false);
    },
    emitClose() {
      this.$emit('close', this.monto);
      this.monto = 0;
      this.close();
    }
  }
};
</script>

<style scoped>
</style>
