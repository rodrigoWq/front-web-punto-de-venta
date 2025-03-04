<template>
    <header class="d-flex justify-content-between align-items-center">
      <h1>{{ title }}</h1>
      <div class="header-buttons">
        <slot name="buttons"></slot>
      </div>
    </header>
  </template>
  
  <script>
  export default {
    name: 'AppHeader',
    props: {
      title: {
        type: String,
        required: true
      }
    }
  };
  </script>
  
  <style scoped>
  /* You can add custom styles here if needed */
  </style>
  