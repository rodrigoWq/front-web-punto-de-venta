<template>
    <div class="modal fade" :id="modalId" tabindex="-1" :aria-labelledby="modalLabelId" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" :id="modalLabelId">{{ title }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
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
  </template>
  
  <script>
  export default {
    name: 'AppModal',
    props: {
      modalId: {
        type: String,
        required: true
      },
      title: {
        type: String,
        required: true
      }
    },
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
  