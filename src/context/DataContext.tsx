import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Client, Job } from '../types'
import {
  loadClients,
  loadJobs,
  saveClients,
  saveJobs,
  uid,
} from '../lib/storage'

interface DataContextValue {
  clients: Client[]
  jobs: Job[]
  addClient: (data: Omit<Client, 'id' | 'createdAt'>) => Client
  updateClient: (id: string, data: Partial<Omit<Client, 'id' | 'createdAt'>>) => void
  deleteClient: (id: string) => void
  addJob: (data: Omit<Job, 'id' | 'createdAt'>) => Job
  updateJob: (id: string, data: Partial<Omit<Job, 'id' | 'createdAt'>>) => void
  deleteJob: (id: string) => void
  clientName: (id: string) => string
}

const DataContext = createContext<DataContextValue | null>(null)

export function DataProvider({ children }: { children: ReactNode }) {
  const [clients, setClients] = useState<Client[]>(() => loadClients())
  const [jobs, setJobs] = useState<Job[]>(() => loadJobs())

  useEffect(() => {
    saveClients(clients)
  }, [clients])

  useEffect(() => {
    saveJobs(jobs)
  }, [jobs])

  const addClient = useCallback(
    (data: Omit<Client, 'id' | 'createdAt'>) => {
      const client: Client = {
        ...data,
        id: uid(),
        createdAt: new Date().toISOString(),
      }
      setClients((prev) => [client, ...prev])
      return client
    },
    [],
  )

  const updateClient = useCallback(
    (id: string, data: Partial<Omit<Client, 'id' | 'createdAt'>>) => {
      setClients((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...data } : c)),
      )
    },
    [],
  )

  const deleteClient = useCallback((id: string) => {
    setClients((prev) => prev.filter((c) => c.id !== id))
    setJobs((prev) => prev.filter((j) => j.clientId !== id))
  }, [])

  const addJob = useCallback((data: Omit<Job, 'id' | 'createdAt'>) => {
    const job: Job = {
      ...data,
      id: uid(),
      createdAt: new Date().toISOString(),
    }
    setJobs((prev) => [job, ...prev])
    return job
  }, [])

  const updateJob = useCallback(
    (id: string, data: Partial<Omit<Job, 'id' | 'createdAt'>>) => {
      setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, ...data } : j)))
    },
    [],
  )

  const deleteJob = useCallback((id: string) => {
    setJobs((prev) => prev.filter((j) => j.id !== id))
  }, [])

  const clientName = useCallback(
    (id: string) => clients.find((c) => c.id === id)?.name ?? 'לקוח לא ידוע',
    [clients],
  )

  const value = useMemo<DataContextValue>(
    () => ({
      clients,
      jobs,
      addClient,
      updateClient,
      deleteClient,
      addJob,
      updateJob,
      deleteJob,
      clientName,
    }),
    [
      clients,
      jobs,
      addClient,
      updateClient,
      deleteClient,
      addJob,
      updateJob,
      deleteJob,
      clientName,
    ],
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useData(): DataContextValue {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within a DataProvider')
  return ctx
}
