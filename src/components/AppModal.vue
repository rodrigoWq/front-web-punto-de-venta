<template>
  <div v-if="showModal" class="modal fade show" style="display: block;" :id="modalId">
    <div class="modal-dialog" :class="dialogClass">
      <div class="modal-content" :class="contentClass">
        <div class="modal-header">
          <h5 class="modal-title" :id="modalLabelId">{{ title }}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click="$emit('close')"></button>
        </div>
        <div class="modal-body">
          <slot name="body"></slot>
        </div>
        <div class="modal-footer">
          <slot name="footer"></slot>
        </div>
      </div>
    </div>
  </div>
  <div v-if="showModal && withBackdrop" class="modal-backdrop fade show"></div>
</template>
  
  <script>
  export default {
    name: 'AppModal',
    props: {
      modalId: {
        type: String,
        required: true
      },
      showModal: { type: Boolean, default: false },
      title: {
        type: String,
        required: true
      },
      dialogClass: { type: [String, Array, Object], default: '' },
      contentClass: { type: [String, Array, Object], default: '' },
      withBackdrop: { type: Boolean, default: false }
    },
    emits: ['close'],
    computed: {
      modalLabelId() {
        return `${this.modalId}Label`;
      }
    }
  };
  </script>
  
  <style scoped>
  /* Add any modal-specific styles here if needed */
  </style>
  