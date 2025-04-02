<template>
  <div class="filter-section" :class="customClasses">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <input type="text" class="form-control w-25" :placeholder="placeholder" v-model="inputValue" />
      <div class="filters">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

  
<script>
export default {
  name: "AppFilter",
  props: {
    modelValue: { type: String, default: '' },
    placeholder: { type: String, default: 'Search...' },
    customClasses: { type: String, default: '' }
  },
  computed: {
    inputValue: {
      get() { return this.modelValue; },
      set(value) { this.$emit('update:modelValue', value); }
    }
  }
};
</script>

  
  <style scoped>
  .filter-section {
    margin-top: 1rem;
    margin-bottom: 1rem;
  }
 </style>
  