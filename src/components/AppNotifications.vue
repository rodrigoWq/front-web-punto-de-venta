<template>
  <teleport to="body">
    <transition-group name="app-notification" tag="div" class="app-notifications" v-if="notifications.length">
      <article
        v-for="notification in notifications"
        :key="notification.id"
        class="app-notification"
        :class="`app-notification--${notification.type}`"
      >
        <div class="app-notification__content">
          <header v-if="notification.title" class="app-notification__title">
            {{ notification.title }}
          </header>
          <p class="app-notification__message">
            {{ notification.message }}
          </p>
        </div>
        <button
          v-if="notification.dismissible"
          type="button"
          class="app-notification__close"
          aria-label="Cerrar notificación"
          @click="remove(notification.id)"
        >
          <span aria-hidden="true">&times;</span>
        </button>
      </article>
    </transition-group>
  </teleport>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useNotificationStore } from '@/stores/notifications'

const notificationStore = useNotificationStore()
const { notifications } = storeToRefs(notificationStore)
const remove = notificationStore.remove
</script>

<style scoped>
.app-notifications {
  position: fixed;
  top: calc(var(--app-navbar-height, 4rem) + 1rem);
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: min(26rem, calc(100vw - 2.5rem));
  z-index: 2100;
  pointer-events: none;
  align-items: center;
}

.app-notification-enter-from,
.app-notification-leave-to {
  opacity: 0;
  transform: translateY(-12px) scale(0.98);
}

.app-notification-enter-active,
.app-notification-leave-active {
  transition: opacity 180ms ease, transform 180ms ease;
}

.app-notification {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  border-radius: 0.75rem;
  border: 1px solid transparent;
  background-color: rgba(255, 255, 255, 0.98);
  box-shadow: 0 14px 40px rgba(15, 23, 42, 0.16);
  pointer-events: auto;
  color: #0f172a;
}

.app-notification__title {
  margin: 0 0 0.25rem 0;
  font-weight: 600;
  font-size: 0.95rem;
}

.app-notification__message {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.4;
}

.app-notification__close {
  margin-left: auto;
  border: none;
  background: transparent;
  color: inherit;
  font-size: 1.25rem;
  line-height: 1;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 120ms ease;
}

.app-notification__close:hover,
.app-notification__close:focus {
  opacity: 1;
}

.app-notification--info {
  border-color: rgba(59, 130, 246, 0.35);
  background-image: linear-gradient(145deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.04));
}

.app-notification--success {
  border-color: rgba(34, 197, 94, 0.35);
  background-image: linear-gradient(145deg, rgba(34, 197, 94, 0.12), rgba(34, 197, 94, 0.04));
}

.app-notification--warning {
  border-color: rgba(251, 191, 36, 0.35);
  background-image: linear-gradient(145deg, rgba(251, 191, 36, 0.18), rgba(251, 191, 36, 0.06));
}

.app-notification--error {
  border-color: rgba(239, 68, 68, 0.35);
  background-image: linear-gradient(145deg, rgba(239, 68, 68, 0.12), rgba(239, 68, 68, 0.05));
}

.app-notification--info ::selection {
  background: rgba(59, 130, 246, 0.2);
}

.app-notification--success ::selection {
  background: rgba(34, 197, 94, 0.2);
}

.app-notification--warning ::selection {
  background: rgba(251, 191, 36, 0.25);
}

.app-notification--error ::selection {
  background: rgba(239, 68, 68, 0.2);
}
</style>
