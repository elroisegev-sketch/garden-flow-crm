import { useEffect, useId, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
  icon?: ReactNode
  zIndexClass?: string
}

export default function Modal({
  open,
  title,
  onClose,
  children,
  icon,
  zIndexClass = 'z-50',
}: ModalProps) {
  const titleId = useId()

  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  if (!open) return null

  return createPortal(
    <div
      className={`fixed inset-0 ${zIndexClass} flex items-start justify-center overflow-y-auto bg-slate-900/40 p-4 sm:items-center`}
      onClick={onClose}
      role="presentation"
    >
      <div
        className="card w-full max-w-xl p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {icon}
            <h2 id={titleId} className="text-lg font-bold text-slate-900">
              {title}
            </h2>
          </div>
          <button
            type="button"
            aria-label="סגירה"
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  )
}
