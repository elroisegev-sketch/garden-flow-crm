export interface Client {
  id: string
  name: string
  email: string
  phone: string
  address: string
  notes: string
  createdAt: string
}

export type JobStatus = 'lead' | 'scheduled' | 'in_progress' | 'completed'

export interface Job {
  id: string
  title: string
  clientId: string
  status: JobStatus
  scheduledDate: string
  price: number
  description: string
  createdAt: string
}

export const JOB_STATUSES: { value: JobStatus; label: string }[] = [
  { value: 'lead', label: 'Lead' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
]
