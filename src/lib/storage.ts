import type { Client, Job, JobType } from '../types'

const CLIENTS_KEY = 'gardenflow.v2.clients'
const JOBS_KEY = 'gardenflow.v2.jobs'

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}

function read<T>(key: string): T[] | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T[]) : null
  } catch {
    return null
  }
}

function write<T>(key: string, value: T[]): void {
  localStorage.setItem(key, JSON.stringify(value))
}

function normalizeJob(job: Job): Job {
  return {
    ...job,
    jobType: (job.jobType ?? 'other') as JobType,
    assignee: job.assignee ?? '',
    scheduledTime: job.scheduledTime ?? '08:00',
    address: job.address ?? '',
  }
}

export function loadClients(): Client[] {
  return read<Client>(CLIENTS_KEY) ?? seedClients()
}

export function saveClients(clients: Client[]): void {
  write(CLIENTS_KEY, clients)
}

export function loadJobs(): Job[] {
  const stored = read<Job>(JOBS_KEY)
  if (!stored) return seedJobs()
  return stored.map(normalizeJob)
}

export function saveJobs(jobs: Job[]): void {
  write(JOBS_KEY, jobs)
}

const SEED_CLIENTS: Client[] = [
  {
    id: 'c-rubi',
    name: 'רובי לוי',
    email: 'rubi@example.com',
    phone: '050-0000000',
    address: 'רעננה',
    notes: '',
    createdAt: '2026-08-01T00:00:00.000Z',
  },
  {
    id: 'c-oakview',
    name: 'משפחת כהן',
    email: 'cohen@example.com',
    phone: '052-1112233',
    address: 'הרצליה',
    notes: '',
    createdAt: '2026-07-20T00:00:00.000Z',
  },
]

const SEED_JOBS: Job[] = [
  {
    id: 'j-rubi-clean',
    title: 'ניקוי',
    clientId: 'c-rubi',
    status: 'scheduled',
    jobType: 'monthly_maintenance',
    assignee: 'אלרועי + אמיתי',
    scheduledDate: '2026-08-25',
    scheduledTime: '07:00',
    address: 'רעננה',
    price: 400,
    description: '400',
    createdAt: '2026-08-20T00:00:00.000Z',
  },
  {
    id: 'j-cohen-prune',
    title: 'גיזום עצים',
    clientId: 'c-oakview',
    status: 'in_progress',
    jobType: 'pruning',
    assignee: 'אלרועי',
    scheduledDate: '2026-08-24',
    scheduledTime: '08:30',
    address: 'הרצליה',
    price: 850,
    description: '',
    createdAt: '2026-08-18T00:00:00.000Z',
  },
]

function seedClients(): Client[] {
  saveClients(SEED_CLIENTS)
  return SEED_CLIENTS
}

function seedJobs(): Job[] {
  saveJobs(SEED_JOBS)
  return SEED_JOBS
}
