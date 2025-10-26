<template>
  <div id="app">
    <router-view />
    <AppNotifications />
    <AppConfirmDialog />
  </div>
</template>

<script>
import AppNotifications from '@/components/AppNotifications.vue'
import AppConfirmDialog from '@/components/AppConfirmDialog.vue'

export default {
  name: 'App',
  components: {
    AppNotifications,
    AppConfirmDialog
  }
}
</script>

<style>
/* Estilos globales, si tienes alguno */
</style>

