<template>
    <div class="col-md-6">
      <label class="form-label">Unidad Medida</label>
      <select
        class="form-select"
        :disabled="disabled"
        v-model.number="internalValue"
      >
        <option value="" disabled>Seleccione unidad de medida</option>
        <option
          v-for="unit in units"
          :key="unit.unidad_medida_id"
          :value="unit.unidad_medida_id"
        >
          {{ unit.nombre }}
        </option>
      </select>
    </div>
</template>
  
<script>
  import apiService from '../services/apiService.js';
  
  export default {
    name: 'MeasureUnitSelect',
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
        units: []
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
      this.fetchUnits();
    },
    methods: {
      async fetchUnits() {
        try {
          const url = `${process.env.VUE_APP_API_BASE_URL}/api/measure-units`;
          const response = await apiService.get(url);
          if (
            response.data.success &&
            response.data.data &&
            Array.isArray(response.data.data.data)
          ) {
            this.units = response.data.data.data;
          } else {
            console.error('Invalid units response:', response.data);
          }
        } catch (error) {
          console.error('Error fetching measure units:', error);
        }
      }
    }
  };
</script>
  