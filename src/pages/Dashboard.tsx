import { Users, Sprout, DollarSign, CalendarClock } from 'lucide-react'
import { useData } from '../context/DataContext'
import { formatCurrency, formatDate } from '../lib/format'
import StatusBadge from '../components/StatusBadge'
import type { ComponentType } from 'react'

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string
  value: string
  icon: ComponentType<{ size?: number }>
  accent: string
}) {
  return (
    <div className="card flex items-center gap-4 p-5">
      <span
        className={`flex h-11 w-11 items-center justify-center rounded-lg ${accent}`}
      >
        <Icon size={22} />
      </span>
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { clients, jobs, clientName } = useData()

  const activeJobs = jobs.filter((j) => j.status !== 'completed')
  const pipeline = activeJobs.reduce((sum, j) => sum + j.price, 0)
  const upcoming = [...jobs]
    .filter((j) => j.status !== 'completed')
    .sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate))
    .slice(0, 5)

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-bold text-slate-900">לוח בקרה</h1>
      <p className="mt-1 text-slate-500">מבט מהיר על העבודות והלקוחות.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="לקוחות"
          value={String(clients.length)}
          icon={Users}
          accent="bg-blue-100 text-blue-700"
        />
        <StatCard
          label="עבודות פעילות"
          value={String(activeJobs.length)}
          icon={Sprout}
          accent="bg-amber-100 text-amber-700"
        />
        <StatCard
          label="שווי צנרת"
          value={formatCurrency(pipeline)}
          icon={DollarSign}
          accent="bg-brand-100 text-brand-700"
        />
        <StatCard
          label="סה״כ עבודות"
          value={String(jobs.length)}
          icon={CalendarClock}
          accent="bg-purple-100 text-purple-700"
        />
      </div>

      <div className="mt-8 card">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="font-semibold text-slate-900">עבודות קרובות</h2>
        </div>
        {upcoming.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-slate-500">
            אין עבודות קרובות.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {upcoming.map((job) => (
              <li
                key={job.id}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
              >
                <div className="min-w-0">
                  <p className="font-medium text-slate-900">{job.title}</p>
                  <p className="text-sm text-slate-500">
                    {clientName(job.clientId)} · {formatDate(job.scheduledDate)}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold text-slate-700">
                    {formatCurrency(job.price)}
                  </span>
                  <StatusBadge status={job.status} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
