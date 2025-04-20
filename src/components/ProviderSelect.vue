<template>
    <div class="col-md-6">
      <label class="form-label">Proveedor</label>
      <input
        list="providers-list"
        v-model="inputValue"
        @input="onInput"
        :readonly="disabled"
        class="form-control"
        placeholder="Buscar o crear proveedor..."
      />
      <datalist id="providers-list">
        <option
          v-for="prov in filteredProviders"
          :key="prov.id"
          :value="`${prov.nro_documento} – ${prov.nombre}`"
        />
        <option value="Registrar proveedor…" />

      </datalist>
      <small
        v-if="inputValue && !isMatched"
        @click="onRegister"
        class="text-primary"
        style="cursor: pointer; margin-top: .25rem; display: block;"
      >
        Registrar proveedor…
      </small>
    </div>
</template>
  
<script>
  import apiService from '@/services/apiService.js';
  
  export default {
    name: 'ProviderSelect',
    emits: ['provider-selected', 'register', 'update:modelValue'],
    model: { prop: 'modelValue', event: 'update:modelValue' },
    props: {
      modelValue: { type: String, default: '' },
      disabled: { type: Boolean, default: false }
    },
    data() {
      return {
        providers: [],
        //inputValue: ''
      };
    },
    computed: {
      filteredProviders() {
        const q = this.inputValue.trim().toLowerCase();
        return this.providers
          // 1) sólo los que coinciden con la búsqueda
          .filter(p =>
            !q ||
            p.nro_documento.toLowerCase().includes(q) ||
            p.nombre.toLowerCase().includes(q)
          )
          // 2) luego excluye el que ya está seleccionado
          .filter(p =>
            p.nro_documento !== this.modelValue &&
            `${p.nro_documento} – ${p.nombre}` !== this.modelValue
          );
      },
      inputValue: {
        get() { return this.modelValue; },
        set(val) { this.$emit('update:modelValue', val); }
      },
      isMatched() {
        return this.providers.some(
          p => p.nro_documento === this.inputValue ||
               `${p.nro_documento} – ${p.nombre}` === this.inputValue
        );
      }
    },
    methods: {
      async loadProviders() {
        try {
          const { data } = await apiService.get(
            `${process.env.VUE_APP_API_BASE_URL}/api/providers/`
          );
          this.providers = Array.isArray(data) ? data : [];
        } catch (err) {
          console.error('Error al cargar proveedores:', err);
        }
      },
      onInput() {
        console.log('onInput Call', this.inputValue);
        if (this.inputValue === 'Registrar proveedor…') {
            this.onRegister();
            return;
        }
        const prov = this.providers.find(
          p => p.nro_documento === this.inputValue ||
               `${p.nro_documento} – ${p.nombre}` === this.inputValue
        );
        if (prov) {
          this.$emit('provider-selected', prov);
          // normalize input to RUC only
          this.inputValue = prov.nro_documento;
        }
      },
      onRegister() {
        this.$emit('register');
        this.inputValue = '' 
      }
    },
    async mounted() {
      await this.loadProviders();
    }
  };
</script>

<style scoped>

.form-label {
      font-weight: bold;
  }
  
</style>
  