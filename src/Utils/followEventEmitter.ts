class FollowEventEmitter {
  private listeners: { [orgId: string]: ((isFollowing: boolean) => void)[] } =
    {}

  subscribe(orgId: string, callback: (isFollowing: boolean) => void) {
    if (!this.listeners[orgId]) {
      this.listeners[orgId] = []
    }
    this.listeners[orgId].push(callback)

    // Return unsubscribe function
    return () => {
      if (this.listeners[orgId]) {
        this.listeners[orgId] = this.listeners[orgId].filter(
          (cb) => cb !== callback,
        )
        if (this.listeners[orgId].length === 0) {
          delete this.listeners[orgId]
        }
      }
    }
  }

  emit(orgId: string, isFollowing: boolean) {
    if (this.listeners[orgId]) {
      this.listeners[orgId].forEach((callback) => {
        try {
          callback(isFollowing)
        } catch (err) {
          console.error('Error in follow event callback:', err)
        }
      })
    }
  }

  // Helper method for debugging
  getListenerCount(orgId?: string): number {
    if (orgId) {
      return this.listeners[orgId]?.length || 0
    }
    return Object.values(this.listeners).reduce(
      (total, arr) => total + arr.length,
      0,
    )
  }
}

export const followEventEmitter = new FollowEventEmitter()
