import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface User {
  id: string
  name: string
  avatar: string
  email: string
  role: "gestor" | "membro"
  teamId: string
}

export interface Message {
  id: string
  userId: string
  content: string
  timestamp: Date
  type: "text" | "audio" | "image"
  audioUrl?: string
  imageUrl?: string
}

export interface Task {
  id: string
  name: string
  status: "done" | "working" | "stuck" | "pending"
  priority: "high" | "medium" | "low"
  owners: User[]
  dueDate: Date
  description?: string
  messages: Message[]
  teamId: string
  isGeneral?: boolean
}

export interface Project {
  id: string
  name: string
  tasks: Task[]
}

export interface InboxItem {
  id: string
  type: "mention" | "assignment" | "comment" | "update"
  taskId: string
  taskName: string
  fromUser: User
  content: string
  timestamp: Date
  read: boolean
}

export type CalendarEventType = "saude" | "evento" | "reuniao"

export interface CalendarEvent {
  id: string
  title: string
  type: CalendarEventType
  date: Date
  startTime?: string
  endTime?: string
  description?: string
  location?: string
  participants?: User[]
  createdBy: User
  teamId?: string
  isGeneral?: boolean
}

export interface Team {
  id: string
  name: string
  description: string
  members: User[]
  projectCount: number
}

// --- ROOMS ---

export type RoomModality = "hourly" | "shift" | "fixed"
export type RoomSpecialty =
  | "psicologia"
  | "nutricao"
  | "dermatologia"
  | "estetica"
  | "fisioterapia"
  | "medicina"
  | "odontologia"
  | "fonoaudiologia"

export interface RoomContactInfo {
  name: string
  phone: string
}

export interface Room {
  id: string
  name: string
  images: string[]
  neighborhood: string
  address: string
  referencePoint: string // Novo campo
  modalities: RoomModality[]
  specialties: RoomSpecialty[]
  pricePerHour?: number
  pricePerShift?: number
  priceFixed?: number
  amenities: string[]
  equipment: string[]
  nightShiftAvailable: boolean
  weekendAvailable: boolean
  host: RoomContactInfo // Atualizado
  manager: RoomContactInfo // Novo campo
  description: string
  size: number
}

export const specialtyLabels: Record<RoomSpecialty, string> = {
  psicologia: "Psicologia",
  nutricao: "Nutrição",
  dermatologia: "Dermatologia",
  estetica: "Estética",
  fisioterapia: "Fisioterapia",
  medicina: "Medicina",
  odontologia: "Odontologia",
  fonoaudiologia: "Fonoaudiologia",
}

export const modalityLabels: Record<RoomModality, string> = {
  hourly: "Por Hora",
  shift: "Por Turno",
  fixed: "Fixo Mensal",
}

export const amenityLabels: Record<string, string> = {
  "ar-condicionado": "Ar Condicionado",
  wifi: "Wi-Fi",
  recepcionista: "Recepcionista",
  estacionamento: "Estacionamento",
  copa: "Copa",
  acessibilidade: "Acessibilidade",
  vestiario: "Vestiário",
}

export const sampleProject = { name: "Fusion Interno", tasks: [] }
export const sampleTasks: Task[] = [] 

export function getFilteredTasks(tasks: Task[], user: User | null): Task[] {
  if (!user) return []
  if (user.role === "gestor") return tasks
  return tasks.filter(
    (task) => task.teamId === user.teamId || task.isGeneral || task.owners.some((o) => o.id === user.id),
  )
}