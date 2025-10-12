import React, { useEffect, useState } from 'react'
import ToastSuccess from './ToastSuccess'
import ToastError from './ToastError'
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
  return evt.type === 'success' ? (
    <ToastSuccess
      visible
      title={evt.title}
      message={evt.message}
      onHide={hide}
    />
  ) : (
    <ToastError visible title={evt.title} message={evt.message} onHide={hide} />
  )
}
