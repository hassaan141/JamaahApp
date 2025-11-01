export type ToastKind = 'success' | 'error'
type ToastEvent = { type: ToastKind; message: string; title?: string }
type Listener = (e: ToastEvent) => void

const listeners: Listener[] = []

export const toast = {
  success(message: string, title?: string) {
    emit({ type: 'success', message, title })
  },
  error(message: string, title?: string) {
    emit({ type: 'error', message, title })
  },
  subscribe(fn: Listener) {
    listeners.push(fn)
    return () => {
      const idx = listeners.indexOf(fn)
      if (idx >= 0) listeners.splice(idx, 1)
    }
  },
}

function emit(e: ToastEvent) {
  listeners.forEach((l) => l(e))
}

export type { ToastEvent, Listener }
