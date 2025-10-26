import { defineStore } from 'pinia'

const DEFAULT_DURATION = 4000
let sequence = 0

const normalizePayload = (input = '', maybeOptions) => {
  let options = typeof maybeOptions === 'string'
    ? { type: maybeOptions }
    : (typeof maybeOptions === 'number' ? { duration: maybeOptions } : (maybeOptions || {}))

  if (input && typeof input === 'object' && !Array.isArray(input)) {
    options = { ...input, ...options }
    input = options.message ?? options.text ?? ''
  }

  return {
    message: input == null ? '' : String(input),
    type: options.type,
    title: options.title,
    duration: options.duration,
    dismissible: options.dismissible,
    meta: options.meta
  }
}

const sanitizeType = (type) => {
  const allowed = ['info', 'success', 'warning', 'error']
  if (!type || !allowed.includes(type)) return 'info'
  return type
}

const resolveDuration = (duration) => {
  if (duration === 0) return 0
  if (Number.isFinite(duration) && duration > 0) return duration
  return DEFAULT_DURATION
}

export const useNotificationStore = defineStore('notifications', {
  state: () => ({
    notifications: []
  }),
  actions: {
    notify(payload, options) {
      const normalized = normalizePayload(payload, options)
      const notification = {
        id: ++sequence,
        message: normalized.message,
        type: sanitizeType(normalized.type),
        title: normalized.title ?? null,
        duration: resolveDuration(normalized.duration),
        dismissible: normalized.dismissible !== false,
        meta: normalized.meta ?? null,
        createdAt: Date.now()
      }

      this.notifications.push(notification)

      if (notification.duration > 0) {
        setTimeout(() => {
          this.remove(notification.id)
        }, notification.duration)
      }

      return notification.id
    },
    remove(id) {
      this.notifications = this.notifications.filter((item) => item.id !== id)
    },
    clear() {
      this.notifications = []
    }
  }
})

export const useNotify = (piniaOrStore) => {
  const store = typeof piniaOrStore?.notify === 'function'
    ? piniaOrStore
    : useNotificationStore(piniaOrStore)
  return store.notify
}
