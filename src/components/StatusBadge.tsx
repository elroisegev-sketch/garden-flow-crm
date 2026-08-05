import type { JobStatus } from '../types'

const STYLES: Record<JobStatus, string> = {
  lead: 'bg-slate-100 text-slate-700',
  scheduled: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-amber-100 text-amber-700',
  completed: 'bg-brand-100 text-brand-700',
}

const LABELS: Record<JobStatus, string> = {
  lead: 'Lead',
  scheduled: 'Scheduled',
  in_progress: 'In Progress',
  completed: 'Completed',
}

export default function StatusBadge({ status }: { status: JobStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${STYLES[status]}`}
    >
      {LABELS[status]}
    </span>
  )
}
