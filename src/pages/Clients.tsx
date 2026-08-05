import { useState } from 'react'
import { Plus, Pencil, Trash2, Mail, Phone, MapPin } from 'lucide-react'
import { useData } from '../context/DataContext'
import Modal from '../components/Modal'
import { formatDate } from '../lib/format'
import type { Client } from '../types'

interface FormState {
  name: string
  email: string
  phone: string
  address: string
  notes: string
}

const EMPTY: FormState = {
  name: '',
  email: '',
  phone: '',
  address: '',
  notes: '',
}

export default function Clients() {
  const { clients, jobs, addClient, updateClient, deleteClient } = useData()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Client | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY)

  function openCreate() {
    setEditing(null)
    setForm(EMPTY)
    setOpen(true)
  }

  function openEdit(client: Client) {
    setEditing(client)
    setForm({
      name: client.name,
      email: client.email,
      phone: client.phone,
      address: client.address,
      notes: client.notes,
    })
    setOpen(true)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    if (editing) {
      updateClient(editing.id, form)
    } else {
      addClient(form)
    }
    setOpen(false)
  }

  function handleDelete(client: Client) {
    const count = jobs.filter((j) => j.clientId === client.id).length
    const msg =
      count > 0
        ? `Delete ${client.name} and their ${count} job(s)?`
        : `Delete ${client.name}?`
    if (window.confirm(msg)) deleteClient(client.id)
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Clients</h1>
          <p className="mt-1 text-slate-500">
            {clients.length} client{clients.length === 1 ? '' : 's'}
          </p>
        </div>
        <button className="btn-primary" onClick={openCreate}>
          <Plus size={18} /> Add client
        </button>
      </div>

      {clients.length === 0 ? (
        <div className="card mt-6 p-10 text-center text-slate-500">
          No clients yet. Add your first client to get started.
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {clients.map((client) => {
            const jobCount = jobs.filter((j) => j.clientId === client.id).length
            return (
              <div key={client.id} className="card flex flex-col p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      {client.name}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Added {formatDate(client.createdAt)}
                    </p>
                  </div>
                  <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700">
                    {jobCount} job{jobCount === 1 ? '' : 's'}
                  </span>
                </div>
                <dl className="mt-3 space-y-1.5 text-sm text-slate-600">
                  {client.email && (
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="text-slate-400" />
                      <span className="truncate">{client.email}</span>
                    </div>
                  )}
                  {client.phone && (
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-slate-400" />
                      <span>{client.phone}</span>
                    </div>
                  )}
                  {client.address && (
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-slate-400" />
                      <span className="truncate">{client.address}</span>
                    </div>
                  )}
                </dl>
                {client.notes && (
                  <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
                    {client.notes}
                  </p>
                )}
                <div className="mt-4 flex gap-2 border-t border-slate-100 pt-3">
                  <button
                    className="btn-secondary flex-1"
                    onClick={() => openEdit(client)}
                  >
                    <Pencil size={15} /> Edit
                  </button>
                  <button
                    className="btn-secondary text-red-600 hover:bg-red-50"
                    aria-label={`Delete ${client.name}`}
                    onClick={() => handleDelete(client)}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Modal
        open={open}
        title={editing ? 'Edit client' : 'Add client'}
        onClose={() => setOpen(false)}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label" htmlFor="client-name">
              Name
            </label>
            <input
              id="client-name"
              className="input"
              value={form.name}
              autoFocus
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Jane Gardener"
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="client-email">
                Email
              </label>
              <input
                id="client-email"
                type="email"
                className="input"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="jane@example.com"
              />
            </div>
            <div>
              <label className="label" htmlFor="client-phone">
                Phone
              </label>
              <input
                id="client-phone"
                className="input"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="(555) 123-4567"
              />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="client-address">
              Address
            </label>
            <input
              id="client-address"
              className="input"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="123 Garden Way"
            />
          </div>
          <div>
            <label className="label" htmlFor="client-notes">
              Notes
            </label>
            <textarea
              id="client-notes"
              className="input"
              rows={3}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Preferences, gate codes, etc."
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
              {editing ? 'Save changes' : 'Add client'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
