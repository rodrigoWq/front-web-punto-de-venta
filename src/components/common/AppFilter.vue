<template>
    <div class="filter-section" :class="customClasses">
      <div class="d-flex justify-content-start mb-3">
        <input
          type="text"
          class="form-control w-25"
          :placeholder="placeholder"
          :value="modelValue"
          @input="onInput"
        />
      </div>
      <div class="filters d-flex justify-content-end">
        <slot></slot>
      </div>
    </div>
</template>
  
<script>
  export default {
    name: "AppFilter",
    props: {
      modelValue: {
        type: String,
        default: ''
      },
      placeholder: {
        type: String,
        default: 'Search...'
      },
      customClasses: {
        type: String,
        default: ''
      }
    },
    methods: {
      onInput(event) {
        this.$emit('update:modelValue', event.target.value);
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
  