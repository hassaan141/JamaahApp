import React, { useEffect, useState } from 'react'
import ToastMessage from './ToastMessage'
import { toast, type ToastEvent } from './toast'

export default function ToastHost() {
  const [evt, setEvt] = useState<ToastEvent | null>(null)

  useEffect(() => {
    const unsub = toast.subscribe((e) => {
      setEvt(e)
    })
    return () => unsub()
  }, [])

  const hide = () => setEvt(null)
  if (!evt) return null

  return (
    <ToastMessage
      visible
      variant={evt.type}
      title={evt.title}
      message={evt.message}
      onHide={hide}
    />
  )
}
