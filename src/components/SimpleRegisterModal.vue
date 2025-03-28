<template>
    <div class="modal-container" v-if="showModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title" style="color: red;">{{ title }}</h3>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="$emit('close')">Cerrar</button>
          <button type="button" class="btn btn-primary" @click="$emit('register')">Registrar</button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'SimpleRegisterModal',
    props: {
      showModal: {
        type: Boolean,
        default: false,
      },
      title: {
        type: String,
        default: '',
      },
    },
  };
  </script>
<style scoped>
.modal-container {
  position: fixed;
  top: 10%;
  left: 50%;
  transform: translateX(-50%);
  /* El contenedor solo ocupa el espacio del modal, sin cubrir toda la pantalla */
  z-index: 1050;
}

.modal-content {
  background: #fff;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  display: inline-block;
  min-width: 300px;
}

.modal-header {
  text-align: center;
}

.modal-footer {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 10px;
}
</style>