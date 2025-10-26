import { defineStore } from 'pinia'

const normalizePayload = (input = '', maybeOptions) => {
  let options = maybeOptions

  if (typeof maybeOptions === 'string') {
    options = { title: maybeOptions }
  }

  if (input && typeof input === 'object' && !Array.isArray(input)) {
    options = { ...input }
    input = options.message ?? options.text ?? ''
  }

  return {
    message: input == null ? '' : String(input),
    title: options?.title ?? null,
    confirmText: options?.confirmText ?? 'Aceptar',
    cancelText: options?.cancelText ?? 'Cancelar',
    type: options?.type ?? 'default',
    meta: options?.meta ?? null,
    resolve: null
  }
}

export const useConfirmStore = defineStore('confirm', {
  state: () => ({
    current: null,
    queue: []
  }),
  actions: {
    request(payload, options) {
      return new Promise((resolve) => {
        const request = {
          ...normalizePayload(payload, options),
          resolve
        }

        if (this.current) {
          this.queue.push(request)
        } else {
          this.current = request
        }
      })
    },
    confirm(result = true) {
      if (!this.current) return
      this.current.resolve(result)
      this.advance()
    },
    cancel() {
      this.confirm(false)
    },
    advance() {
      if (this.queue.length > 0) {
        this.current = this.queue.shift()
      } else {
        this.current = null
      }
    }
  }
})

export const useConfirm = (piniaOrStore) => {
  const store = typeof piniaOrStore?.request === 'function'
    ? piniaOrStore
    : useConfirmStore(piniaOrStore)
  return store.request
}
