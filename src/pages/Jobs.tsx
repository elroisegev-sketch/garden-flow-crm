import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { useData } from '../context/DataContext'
import Modal from '../components/Modal'
import StatusBadge from '../components/StatusBadge'
import { formatCurrency, formatDate } from '../lib/format'
import { JOB_STATUSES, type Job, type JobStatus } from '../types'

interface FormState {
  title: string
  clientId: string
  status: JobStatus
  scheduledDate: string
  price: string
  description: string
}

function emptyForm(clientId: string): FormState {
  return {
    title: '',
    clientId,
    status: 'lead',
    scheduledDate: new Date().toISOString().slice(0, 10),
    price: '',
    description: '',
  }
}

export default function Jobs() {
  const { jobs, clients, addJob, updateJob, deleteJob, clientName } = useData()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Job | null>(null)
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
      status: job.status,
      scheduledDate: job.scheduledDate,
      price: String(job.price),
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
      status: form.status,
      scheduledDate: form.scheduledDate,
      price: Number(form.price) || 0,
      description: form.description,
    }
    if (editing) {
      updateJob(editing.id, payload)
    } else {
      addJob(payload)
    }
    setOpen(false)
  }

  function handleDelete(job: Job) {
    if (window.confirm(`Delete "${job.title}"?`)) deleteJob(job.id)
  }

  const noClients = clients.length === 0

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Jobs</h1>
          <p className="mt-1 text-slate-500">
            {jobs.length} job{jobs.length === 1 ? '' : 's'} in your pipeline
          </p>
        </div>
        <button className="btn-primary" onClick={openCreate} disabled={noClients}>
          <Plus size={18} /> Add job
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {(['all', ...JOB_STATUSES.map((s) => s.value)] as const).map((value) => {
          const label =
            value === 'all'
              ? 'All'
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
          Add a client first, then you can create jobs for them.
        </div>
      )}

      <div className="mt-4 card overflow-hidden">
        {visible.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-slate-500">
            No jobs to show.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">Job</th>
                  <th className="px-5 py-3">Client</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Price</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
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
                    </td>
                    <td className="px-5 py-3 font-semibold text-slate-700">
                      {formatCurrency(job.price)}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={job.status} />
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                          aria-label={`Edit ${job.title}`}
                          onClick={() => openEdit(job)}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          className="rounded-md p-1.5 text-red-500 hover:bg-red-50"
                          aria-label={`Delete ${job.title}`}
                          onClick={() => handleDelete(job)}
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
        title={editing ? 'Edit job' : 'Add job'}
        onClose={() => setOpen(false)}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label" htmlFor="job-title">
              Job title
            </label>
            <input
              id="job-title"
              className="input"
              value={form.title}
              autoFocus
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Backyard redesign"
            />
          </div>
          <div>
            <label className="label" htmlFor="job-client">
              Client
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="label" htmlFor="job-status">
                Status
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
              <label className="label" htmlFor="job-date">
                Date
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
              <label className="label" htmlFor="job-price">
                Price ($)
              </label>
              <input
                id="job-price"
                type="number"
                min="0"
                className="input"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="1200"
              />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="job-description">
              Description
            </label>
            <textarea
              id="job-description"
              className="input"
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Scope of work, materials, notes..."
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {editing ? 'Save changes' : 'Add job'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
