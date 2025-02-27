<template>
  <button :class="computedClass" @click="handleClick" :disabled="disabled">
    <slot></slot>
  </button>
</template>

<script>
export default {
  name: 'AppButton',
  props: {
    variant: {
      type: String,
      default: 'primary',
      validator: value =>
        ['primary', 'secondary', 'success', 'danger', 'link'].includes(value)
    },
    customClass: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    computedClass() {
      return `btn btn-${this.variant} ${this.customClass}`.trim();
    }
  },
  methods: {
    handleClick(event) {
      if (!this.disabled) {
        this.$emit('click', event);
      }
    }
  }
};
</script>

<style scoped>
/* Puedes agregar estilos adicionales si es necesario */
</style>
