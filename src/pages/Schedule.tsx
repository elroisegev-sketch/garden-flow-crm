import { useData } from '../context/DataContext'
import StatusBadge from '../components/StatusBadge'
import { formatCurrency, formatDate } from '../lib/format'

export default function Schedule() {
  const { jobs, clientName } = useData()

  const sorted = [...jobs].sort((a, b) =>
    a.scheduledDate.localeCompare(b.scheduledDate),
  )

  const grouped = sorted.reduce<Record<string, typeof jobs>>((acc, job) => {
    ;(acc[job.scheduledDate] ??= []).push(job)
    return acc
  }, {})

  const dates = Object.keys(grouped)

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-bold text-slate-900">Schedule</h1>
      <p className="mt-1 text-slate-500">Jobs organized by date.</p>

      {dates.length === 0 ? (
        <div className="card mt-6 p-10 text-center text-slate-500">
          Nothing scheduled yet.
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          {dates.map((date) => (
            <div key={date}>
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
                {formatDate(date)}
              </h2>
              <div className="card divide-y divide-slate-100">
                {grouped[date].map((job) => (
                  <div
                    key={job.id}
                    className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900">{job.title}</p>
                      <p className="text-sm text-slate-500">
                        {clientName(job.clientId)}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-semibold text-slate-700">
                        {formatCurrency(job.price)}
                      </span>
                      <StatusBadge status={job.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
