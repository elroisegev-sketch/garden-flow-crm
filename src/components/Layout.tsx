import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, Users, Sprout, CalendarDays, Leaf } from 'lucide-react'

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/clients', label: 'Clients', icon: Users, end: false },
  { to: '/jobs', label: 'Jobs', icon: Sprout, end: false },
  { to: '/schedule', label: 'Schedule', icon: CalendarDays, end: false },
]

export default function Layout() {
  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 flex-shrink-0 flex-col border-r border-slate-200 bg-white sm:flex">
        <div className="flex items-center gap-2 px-6 py-5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
            <Leaf size={20} />
          </span>
          <div>
            <p className="text-sm font-bold leading-tight text-slate-900">
              GardenFlow
            </p>
            <p className="text-xs text-slate-500">Landscaping CRM</p>
          </div>
        </div>
        <nav className="flex flex-col gap-1 px-3">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-2 border-b border-slate-200 bg-white px-4 py-3 sm:hidden">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
            <Leaf size={18} />
          </span>
          <span className="font-bold text-slate-900">GardenFlow</span>
        </header>
        <main className="flex-1 p-4 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
