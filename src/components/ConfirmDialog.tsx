import { useEffect } from 'react'
import Modal from './Modal'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'מחיקה',
  cancelLabel = 'ביטול',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return
    function onKey(event: KeyboardEvent) {
      if (event.key !== 'Escape') return
      event.preventDefault()
      event.stopImmediatePropagation()
      onCancel()
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [open, onCancel])

  return (
    <Modal open={open} title={title} onClose={onCancel} zIndexClass="z-[80]">
      <p className="text-sm text-slate-600">{message}</p>
      <div className="mt-6 flex justify-start gap-2">
        <button type="button" className="btn-danger" onClick={onConfirm} autoFocus>
          {confirmLabel}
        </button>
        <button type="button" className="btn-secondary" onClick={onCancel}>
          {cancelLabel}
        </button>
      </div>
    </Modal>
  )
}
