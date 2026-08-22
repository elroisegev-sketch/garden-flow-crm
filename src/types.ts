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

export type JobType =
  | 'monthly_maintenance'
  | 'cleanup'
  | 'install'
  | 'pruning'
  | 'other'

export interface Job {
  id: string
  title: string
  clientId: string
  status: JobStatus
  jobType: JobType
  assignee: string
  scheduledDate: string
  scheduledTime: string
  address: string
  price: number
  description: string
  createdAt: string
}

export const JOB_STATUSES: { value: JobStatus; label: string }[] = [
  { value: 'lead', label: 'ליד' },
  { value: 'scheduled', label: 'מתוזמן' },
  { value: 'in_progress', label: 'בביצוע' },
  { value: 'completed', label: 'הושלם' },
]

export const JOB_TYPES: { value: JobType; label: string }[] = [
  { value: 'monthly_maintenance', label: 'תחזוקה חודשית' },
  { value: 'cleanup', label: 'ניקיון' },
  { value: 'install', label: 'הקמה' },
  { value: 'pruning', label: 'גיזום' },
  { value: 'other', label: 'אחר' },
]
