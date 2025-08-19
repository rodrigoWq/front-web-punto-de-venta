<template>
    <div class="d-flex justify-content-center mt-3">
      <button class="btn btn-secondary me-2" @click="goToPage(currentPage - 1)" :disabled="currentPage === 1">Anterior</button>
      <button v-for="page in pages" :key="page" class="btn btn-outline-secondary me-2" @click="goToPage(page)" :disabled="page === currentPage">{{ page }}</button>
      <button class="btn btn-secondary" @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages">Siguiente</button>
    </div>
  </template>
  
  <script>
  export default {
    name: 'AppPagination',
    props: { currentPage: { type: Number, required: true }, totalPages: { type: Number, required: true } },
    computed: {
      pages() { return Array.from({ length: this.totalPages }, (_, i) => i + 1); }
    },
    methods: {
      goToPage(page) {
        if (page < 1 || page > this.totalPages) return;
        this.$emit('page-changed', page);
      }
    }
  };
  </script>
  
  <style scoped>
  /* Customize pagination styles if needed */
  </style>
  