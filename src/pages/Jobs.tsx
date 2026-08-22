import { useState } from 'react'
import { CalendarDays, Pencil, Plus, Trash2 } from 'lucide-react'
import { useData } from '../context/DataContext'
import ConfirmDialog from '../components/ConfirmDialog'
import Modal from '../components/Modal'
import StatusBadge from '../components/StatusBadge'
import { formatDate } from '../lib/format'
import {
  JOB_STATUSES,
  JOB_TYPES,
  type Job,
  type JobStatus,
  type JobType,
} from '../types'

interface FormState {
  title: string
  clientId: string
  jobType: JobType
  assignee: string
  status: JobStatus
  scheduledDate: string
  scheduledTime: string
  address: string
  description: string
}

function emptyForm(clientId: string): FormState {
  return {
    title: '',
    clientId,
    jobType: 'monthly_maintenance',
    assignee: '',
    status: 'scheduled',
    scheduledDate: new Date().toISOString().slice(0, 10),
    scheduledTime: '08:00',
    address: '',
    description: '',
  }
}

export default function Jobs() {
  const { jobs, clients, addJob, updateJob, deleteJob, clientName } = useData()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Job | null>(null)
  const [pendingDelete, setPendingDelete] = useState<Job | null>(null)
  const [filter, setFilter] = useState<JobStatus | 'all'>('all')
  const [form, setForm] = useState<FormState>(() => emptyForm(clients[0]?.id ?? ''))

  const visible =
    filter === 'all' ? jobs : jobs.filter((j) => j.status === filter)

  function openCreate() {
    setEditing(null)
    setForm(emptyForm(clients[0]?.id ?? ''))
    setOpen(true)
  }

  function openEdit(job: Job) {
    setEditing(job)
    setForm({
      title: job.title,
      clientId: job.clientId,
      jobType: job.jobType,
      assignee: job.assignee,
      status: job.status,
      scheduledDate: job.scheduledDate,
      scheduledTime: job.scheduledTime,
      address: job.address,
      description: job.description,
    })
    setOpen(true)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim() || !form.clientId) return
    const payload = {
      title: form.title,
      clientId: form.clientId,
      jobType: form.jobType,
      assignee: form.assignee,
      status: form.status,
      scheduledDate: form.scheduledDate,
      scheduledTime: form.scheduledTime,
      address: form.address,
      price: Number(form.description) || 0,
      description: form.description,
    }
    if (editing) {
      updateJob(editing.id, payload)
    } else {
      addJob(payload)
    }
    setOpen(false)
  }

  function requestDelete(job: Job) {
    setPendingDelete(job)
  }

  function confirmDelete() {
    if (!pendingDelete) return
    deleteJob(pendingDelete.id)
    if (editing?.id === pendingDelete.id) {
      setOpen(false)
      setEditing(null)
    }
    setPendingDelete(null)
  }

  const noClients = clients.length === 0

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">עבודות</h1>
          <p className="mt-1 text-slate-500">
            {jobs.length} עבודות בצינור
          </p>
        </div>
        <button className="btn-primary" onClick={openCreate} disabled={noClients}>
          <Plus size={18} /> עבודה חדשה
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {(['all', ...JOB_STATUSES.map((s) => s.value)] as const).map((value) => {
          const label =
            value === 'all'
              ? 'הכל'
              : JOB_STATUSES.find((s) => s.value === value)?.label
          const active = filter === value
          return (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`rounded-full px-3 py-1 text-sm font-medium transition ${
                active
                  ? 'bg-brand-600 text-white'
                  : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100'
              }`}
            >
              {label}
            </button>
          )
        })}
      </div>

      {noClients && (
        <div className="card mt-6 p-6 text-center text-sm text-slate-500">
          קודם מוסיפים לקוח, ואז אפשר לפתוח לו עבודה.
        </div>
      )}

      <div className="mt-4 card overflow-hidden">
        {visible.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-slate-500">
            אין עבודות להצגה.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500">
                <tr>
                  <th className="px-5 py-3">עבודה</th>
                  <th className="px-5 py-3">לקוח</th>
                  <th className="px-5 py-3">תאריך</th>
                  <th className="px-5 py-3">סטטוס</th>
                  <th className="px-5 py-3 text-left">פעולות</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visible.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3 font-medium text-slate-900">
                      {job.title}
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      {clientName(job.clientId)}
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      {formatDate(job.scheduledDate)}
                      {job.scheduledTime ? ` · ${job.scheduledTime}` : ''}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={job.status} />
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-start gap-1">
                        <button
                          className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                          aria-label={`עריכת ${job.title}`}
                          onClick={() => openEdit(job)}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          className="rounded-md p-1.5 text-red-500 hover:bg-red-50"
                          aria-label={`מחיקת ${job.title}`}
                          onClick={() => requestDelete(job)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        open={open}
        title={editing ? 'עריכת עבודה' : 'עבודה חדשה'}
        onClose={() => setOpen(false)}
        icon={
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-white">
            <CalendarDays size={18} />
          </span>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label" htmlFor="job-client">
              לקוח
            </label>
            <select
              id="job-client"
              className="input"
              value={form.clientId}
              onChange={(e) => setForm({ ...form, clientId: e.target.value })}
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="job-title">
              כותרת העבודה
            </label>
            <input
              id="job-title"
              className="input"
              value={form.title}
              autoFocus
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="ניקוי"
            />
          </div>
          <div>
            <label className="label" htmlFor="job-type">
              סוג עבודה
            </label>
            <select
              id="job-type"
              className="input"
              value={form.jobType}
              onChange={(e) =>
                setForm({ ...form, jobType: e.target.value as JobType })
              }
            >
              {JOB_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="job-assignee">
              אחראי ביצוע
            </label>
            <input
              id="job-assignee"
              className="input"
              value={form.assignee}
              onChange={(e) => setForm({ ...form, assignee: e.target.value })}
              placeholder="אלרועי + אמיתי"
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="job-date">
                תאריך
              </label>
              <input
                id="job-date"
                type="date"
                className="input"
                value={form.scheduledDate}
                onChange={(e) =>
                  setForm({ ...form, scheduledDate: e.target.value })
                }
              />
            </div>
            <div>
              <label className="label" htmlFor="job-time">
                שעה
              </label>
              <input
                id="job-time"
                type="time"
                className="input"
                value={form.scheduledTime}
                onChange={(e) =>
                  setForm({ ...form, scheduledTime: e.target.value })
                }
              />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="job-address">
              כתובת / מיקום
            </label>
            <input
              id="job-address"
              className="input"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="רעננה"
            />
          </div>
          <div>
            <label className="label" htmlFor="job-status">
              סטטוס
            </label>
            <select
              id="job-status"
              className="input"
              value={form.status}
              onChange={(e) =>
                setForm({ ...form, status: e.target.value as JobStatus })
              }
            >
              {JOB_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="job-description">
              הערות
            </label>
            <textarea
              id="job-description"
              className="input"
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>
          <div className="flex items-center justify-between pt-2">
            {editing ? (
              <button
                type="button"
                className="rounded-lg border border-red-300 bg-white p-2.5 text-red-600 hover:bg-red-50"
                aria-label="מחיקת עבודה"
                onClick={() => requestDelete(editing)}
              >
                <Trash2 size={18} />
              </button>
            ) : (
              <span />
            )}
            <button type="submit" className="btn-primary">
              {editing ? 'שמירת שינויים' : 'הוספת עבודה'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="למחוק את העבודה?"
        message={
          pendingDelete
            ? `בטוח למחוק את "${pendingDelete.title}"? אי אפשר לבטל.`
            : ''
        }
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  )
}
