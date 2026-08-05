import type { Client, Job } from '../types'

const CLIENTS_KEY = 'gardenflow.clients'
const JOBS_KEY = 'gardenflow.jobs'

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

export function loadClients(): Client[] {
  return read<Client>(CLIENTS_KEY) ?? seedClients()
}

export function saveClients(clients: Client[]): void {
  write(CLIENTS_KEY, clients)
}

export function loadJobs(): Job[] {
  return read<Job>(JOBS_KEY) ?? seedJobs()
}

export function saveJobs(jobs: Job[]): void {
  write(JOBS_KEY, jobs)
}

function daysFromNow(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

const SEED_CLIENTS: Client[] = [
  {
    id: 'c-oakview',
    name: 'Oakview Residence',
    email: 'hello@oakview.com',
    phone: '(555) 210-4433',
    address: '18 Oakview Lane, Portland, OR',
    notes: 'Large backyard, wants a native pollinator garden.',
    createdAt: daysFromNow(-40),
  },
  {
    id: 'c-riverside',
    name: 'Riverside Cafe',
    email: 'manager@riversidecafe.com',
    phone: '(555) 887-1200',
    address: '42 River St, Portland, OR',
    notes: 'Commercial patio planters, monthly maintenance.',
    createdAt: daysFromNow(-25),
  },
  {
    id: 'c-hensley',
    name: 'Hensley Family',
    email: 'j.hensley@example.com',
    phone: '(555) 664-9821',
    address: '7 Maple Court, Beaverton, OR',
    notes: 'New sod install plus irrigation.',
    createdAt: daysFromNow(-10),
  },
]

const SEED_JOBS: Job[] = [
  {
    id: 'j-1',
    title: 'Pollinator garden design',
    clientId: 'c-oakview',
    status: 'in_progress',
    scheduledDate: daysFromNow(2),
    price: 3200,
    description: 'Design and plant a native pollinator bed along the back fence.',
    createdAt: daysFromNow(-12),
  },
  {
    id: 'j-2',
    title: 'Patio planter refresh',
    clientId: 'c-riverside',
    status: 'scheduled',
    scheduledDate: daysFromNow(5),
    price: 850,
    description: 'Seasonal replant of 12 patio planters with fall annuals.',
    createdAt: daysFromNow(-6),
  },
  {
    id: 'j-3',
    title: 'Sod + irrigation install',
    clientId: 'c-hensley',
    status: 'lead',
    scheduledDate: daysFromNow(9),
    price: 5400,
    description: 'Front and back sod install with a 6-zone drip system.',
    createdAt: daysFromNow(-3),
  },
  {
    id: 'j-4',
    title: 'Spring cleanup',
    clientId: 'c-oakview',
    status: 'completed',
    scheduledDate: daysFromNow(-15),
    price: 620,
    description: 'Bed cleanup, mulch, and pruning.',
    createdAt: daysFromNow(-30),
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
