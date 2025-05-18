<template>
    <div class="modal d-block" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Poner Venta en Espera</h5>
            <button type="button" class="btn-close" @click="$emit('close')"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label for="modalReferencia" class="form-label">Referencia</label>
              <input type="text" id="modalReferencia" class="form-control" v-model="localReferencia" />
            </div>
            <div class="mb-3">
              <label for="modalNombre" class="form-label">Nombre</label>
              <input type="text" id="modalNombre" class="form-control" v-model="localNombre" />
            </div>
            <div class="mb-3">
              <label for="modalNroDocumento" class="form-label">Nro Documento</label>
              <input type="text" id="modalNroDocumento" class="form-control" v-model="localNroDocumento" />
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="$emit('close')">Cerrar</button>
            <button type="button" class="btn btn-primary" @click="onSubmit">Guardar</button>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade show"></div>
</template>
  
<script>
  export default {
    name: 'PendingSaleModal',
    props: {
      initialReferencia: { type: String, default: '' },
      initialNombre: { type: String, default: '' },
      initialNroDocumento: { type: String, default: '' }
    },
    emits: ['close', 'submit'],

    data() {
      return {
        localReferencia: this.initialReferencia,
        localNombre: this.initialNombre,
        localNroDocumento: this.initialNroDocumento
      };
    },
    methods: {
      onSubmit() {
        if (!this.localReferencia.trim() && !this.localNombre.trim() && !this.localNroDocumento.trim()) {
          alert('Por favor, completa al menos uno de los campos: referencia, nombre o nro documento.');
          return;
        }
        this.$emit('submit', {
          referencia: this.localReferencia,
          nombre: this.localNombre,
          nroDocumento: this.localNroDocumento
        });
      }
    },
    watch: {
      initialReferencia(v) { this.localReferencia = v },
      initialNombre(v)     { this.localNombre     = v },
      initialNroDocumento(v){ this.localNroDocumento = v }
    }
  };
</script>
  