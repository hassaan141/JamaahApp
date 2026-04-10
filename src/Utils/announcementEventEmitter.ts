type AnnouncementChangeType = 'created' | 'updated' | 'deleted'

type AnnouncementChangeEvent = {
  type: AnnouncementChangeType
  announcementId?: string
  organizationId?: string | null
}

type Listener = (event: AnnouncementChangeEvent) => void

class AnnouncementEventEmitter {
  private listeners = new Set<Listener>()

  subscribe(listener: Listener) {
    this.listeners.add(listener)

    return () => {
      this.listeners.delete(listener)
    }
  }

  emit(event: AnnouncementChangeEvent) {
    this.listeners.forEach((listener) => {
      try {
        listener(event)
      } catch (error) {
        console.error('[announcementEventEmitter] Listener error:', error)
      }
    })
  }
}

export const announcementEventEmitter = new AnnouncementEventEmitter()
export type { AnnouncementChangeEvent, AnnouncementChangeType }
