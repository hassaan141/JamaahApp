import React, { useEffect, useState } from 'react'
import ToastSuccess from './ToastSuccess'
import ToastError from './ToastError'
import ToastInfo from './ToastInfo'
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

  if (evt.type === 'success') {
    return (
      <ToastSuccess
        visible
        title={evt.title}
        message={evt.message}
        onHide={hide}
      />
    )
  }
  if (evt.type === 'info') {
    return (
      <ToastInfo
        visible
        title={evt.title}
        message={evt.message}
        onHide={hide}
      />
    )
  }
  return (
    <ToastError visible title={evt.title} message={evt.message} onHide={hide} />
  )
}
