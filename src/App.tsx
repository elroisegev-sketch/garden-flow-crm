import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Clients from './pages/Clients'
import Jobs from './pages/Jobs'
import Schedule from './pages/Schedule'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="clients" element={<Clients />} />
        <Route path="jobs" element={<Jobs />} />
        <Route path="schedule" element={<Schedule />} />
      </Route>
    </Routes>
  )
}
