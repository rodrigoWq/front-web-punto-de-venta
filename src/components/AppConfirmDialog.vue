<template>
  <teleport to="body">
    <transition name="app-confirm-fade">
  <div v-if="current" class="app-confirm-overlay">
        <article class="app-confirm" role="alertdialog" aria-modal="true" :aria-labelledby="titleId" :aria-describedby="messageId">
          <header v-if="current.title" :id="titleId" class="app-confirm__title">
            {{ current.title }}
          </header>
          <div class="app-confirm__body">
            <p :id="messageId" class="app-confirm__message">
              {{ current.message }}
            </p>
          </div>
          <footer class="app-confirm__actions">
            <button type="button" class="btn btn-outline-secondary" @click="handleCancel">
              {{ current.cancelText }}
            </button>
            <button type="button" class="btn btn-dark" @click="handleConfirm">
              {{ current.confirmText }}
            </button>
          </footer>
        </article>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount } from 'vue'
import { storeToRefs } from 'pinia'
import { useConfirmStore } from '@/stores/confirm'

const confirmStore = useConfirmStore()
const { current } = storeToRefs(confirmStore)

const titleId = computed(() => (current.value ? `app-confirm-title-${current.value.meta?.id ?? 'default'}` : null))
const messageId = computed(() => (current.value ? `app-confirm-message-${current.value.meta?.id ?? 'default'}` : null))

const handleKeyUp = (event) => {
  if (!current.value) return
  if (event.key === 'Escape') {
    event.preventDefault()
    confirmStore.cancel()
  }
  if (event.key === 'Enter') {
    event.preventDefault()
    confirmStore.confirm(true)
  }
}

const handleConfirm = () => confirmStore.confirm(true)
const handleCancel = () => confirmStore.cancel()

onMounted(() => {
  window.addEventListener('keyup', handleKeyUp)
})

onBeforeUnmount(() => {
  window.removeEventListener('keyup', handleKeyUp)
})
</script>

<style scoped>
.app-confirm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.35);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  z-index: 2200;
}

.app-confirm {
  width: min(26rem, 100%);
  background: #fff;
  border-radius: 0.9rem;
  box-shadow: 0 22px 46px rgba(15, 23, 42, 0.2);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  border: 1px solid rgba(15, 23, 42, 0.08);
}

.app-confirm__title {
  font-size: 1.15rem;
  font-weight: 600;
  margin: 0;
  color: #0f172a;
}

.app-confirm__message {
  margin: 0;
  font-size: 1rem;
  color: #1f2937;
  line-height: 1.5;
}

.app-confirm__actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.app-confirm-fade-enter-active,
.app-confirm-fade-leave-active {
  transition: opacity 180ms ease;
}

.app-confirm-fade-enter-from,
.app-confirm-fade-leave-to {
  opacity: 0;
}
</style>
