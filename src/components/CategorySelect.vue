<template>
    <div class="col-md-6">
      <label class="form-label">Categoría</label>
      <select
        class="form-select"
        :disabled="disabled"
        v-model.number="internalValue"
      >
        <option value="" disabled>Seleccione categoría</option>
        <option
          v-for="cat in categories"
          :key="cat.categoria_id"
          :value="cat.categoria_id"
        >
          {{ cat.nombre }}
        </option>
      </select>
    </div>
</template>
  
<script>
  import apiService from '../services/apiService.js';
  
  export default {
    name: 'CategorySelect',
    props: {
      modelValue: {
        type: [Number, String],
        default: null
      },
      disabled: {
        type: Boolean,
        default: false
      }
    },
    emits: ['update:modelValue'],
    data() {
      return {
        categories: []
      };
    },
    computed: {
      internalValue: {
        get() {
          return this.modelValue;
        },
        set(val) {
          this.$emit('update:modelValue', val);
        }
      }
    },
    mounted() {
      this.fetchCategories();
    },
    methods: {
      async fetchCategories() {
        try {
          const url = `${process.env.VUE_APP_API_BASE_URL}/api/categories`;
          const response = await apiService.get(url);
          if (
            response.data.success &&
            response.data.data &&
            Array.isArray(response.data.data.data)
          ) {
            this.categories = response.data.data.data;
          } else {
            console.error('Invalid categories response:', response.data);
          }
        } catch (error) {
          console.error('Error fetching categories:', error);
        }
      }
    }
  };
  </script>
  