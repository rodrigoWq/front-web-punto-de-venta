<template>
  <table :class="tableClass">
    <thead>
      <tr>
        <th v-for="(header, index) in headers" :key="index">{{ header }}</th>
      </tr>
    </thead>
    <tbody>
      <slot></slot>
    </tbody>
  </table>
</template>

<script>
export default {
  name: 'AppTable',
  props: {
    headers: {
      type: Array,
      required: true
    },
    tableClass: {
      type: String,
      default: 'table table-hover'
    }
  }
};
</script>

<style scoped>
/* Estilos específicos para la tabla si los requieres */
</style>
