export interface User {
  id: string
  name: string
  avatar: string
  email: string
  role: "gestor" | "membro"
  teamId: string // ID da equipe do usuário
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
  teamId: string // Adicionando teamId para filtrar por equipe
  isGeneral?: boolean // Flag para demandas gerais da empresa
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

export interface RoomHost {
  id: string
  name: string
  avatar: string
  phone: string
  whatsapp: string
}

export interface Room {
  id: string
  name: string
  images: string[]
  neighborhood: string
  address: string
  modalities: RoomModality[]
  specialties: RoomSpecialty[]
  pricePerHour: number
  pricePerShift?: number
  priceFixed?: number
  amenities: string[]
  equipment: string[]
  nightShiftAvailable: boolean
  weekendAvailable: boolean
  host: RoomHost
  description: string
  size: number // em m²
}

export const users: User[] = [
  {
    id: "1",
    name: "Ana Silva",
    avatar: "/professional-woman-avatar.png",
    email: "ana@empresa.com",
    role: "gestor",
    teamId: "team-1",
  },
  {
    id: "2",
    name: "Carlos Oliveira",
    avatar: "/professional-man-avatar.png",
    email: "carlos@empresa.com",
    role: "membro",
    teamId: "team-3",
  },
  {
    id: "3",
    name: "Beatriz Santos",
    avatar: "/professional-woman-headshot.png",
    email: "beatriz@empresa.com",
    role: "membro",
    teamId: "team-1",
  },
  {
    id: "4",
    name: "Lucas Pereira",
    avatar: "/professional-avatar.png",
    email: "lucas@empresa.com",
    role: "membro",
    teamId: "team-2",
  },
  {
    id: "5",
    name: "Mariana Costa",
    avatar: "/young-professional-avatar.png",
    email: "mariana@empresa.com",
    role: "membro",
    teamId: "team-4",
  },
]

export const currentUser = users[0]

export const sampleTasks: Task[] = [
  {
    id: "1",
    name: "Documentação do sistema de design",
    status: "done",
    priority: "high",
    owners: [users[0], users[1]],
    dueDate: new Date("2026-01-10"),
    description: "Completar a documentação do sistema de design para a nova biblioteca de componentes",
    teamId: "team-1",
    isGeneral: false,
    messages: [
      {
        id: "m1",
        userId: "1",
        content: "Comecei a trabalhar na seção de paleta de cores",
        timestamp: new Date("2026-01-03T09:00:00"),
        type: "text",
      },
      {
        id: "m2",
        userId: "2",
        content: "Ótimo progresso! Aqui está o feedback de áudio da revisão de design.",
        timestamp: new Date("2026-01-03T14:30:00"),
        type: "audio",
        audioUrl: "/audio-sample.mp3",
      },
      {
        id: "m3",
        userId: "1",
        content: "Mockups atualizados em anexo",
        timestamp: new Date("2026-01-04T10:00:00"),
        type: "image",
        imageUrl: "/design-mockup.jpg",
      },
    ],
  },
  {
    id: "2",
    name: "Integração de API de pagamentos",
    status: "working",
    priority: "high",
    owners: [users[2]],
    dueDate: new Date("2026-01-15"),
    description: "Integrar gateway de pagamento Stripe para gerenciamento de assinaturas",
    teamId: "team-3",
    isGeneral: false,
    messages: [
      {
        id: "m4",
        userId: "3",
        content: "Integração de webhook concluída",
        timestamp: new Date("2026-01-04T11:00:00"),
        type: "text",
      },
    ],
  },
  {
    id: "3",
    name: "Fluxo de onboarding de usuários",
    status: "stuck",
    priority: "medium",
    owners: [users[3], users[4]],
    dueDate: new Date("2026-01-08"),
    description: "Bloqueado aguardando aprovação de design das telas de boas-vindas",
    teamId: "team-2",
    isGeneral: false,
    messages: [
      {
        id: "m5",
        userId: "4",
        content: "Aguardando feedback dos stakeholders",
        timestamp: new Date("2026-01-02T16:00:00"),
        type: "text",
      },
    ],
  },
  {
    id: "4",
    name: "Otimização de performance",
    status: "pending",
    priority: "low",
    owners: [users[1]],
    dueDate: new Date("2026-01-20"),
    description: "Otimizar tamanho do bundle e implementar lazy loading",
    teamId: "team-3",
    isGeneral: false,
    messages: [],
  },
  {
    id: "5",
    name: "Correções de responsividade mobile",
    status: "working",
    priority: "medium",
    owners: [users[0], users[2]],
    dueDate: new Date("2026-01-12"),
    description: "Corrigir problemas de layout em viewports tablet e mobile",
    teamId: "team-1",
    isGeneral: false,
    messages: [
      {
        id: "m6",
        userId: "1",
        content: "Identificados 15 problemas de responsividade",
        timestamp: new Date("2026-01-04T09:30:00"),
        type: "text",
      },
    ],
  },
  {
    id: "6",
    name: "Preparação para auditoria de segurança",
    status: "done",
    priority: "high",
    owners: [users[4]],
    dueDate: new Date("2026-01-05"),
    description: "Preparar documentação para a próxima auditoria de segurança",
    teamId: "team-4",
    isGeneral: true, // Demanda geral
    messages: [],
  },
  {
    id: "7",
    name: "Widgets de analytics do dashboard",
    status: "working",
    priority: "medium",
    owners: [users[2], users[3]],
    dueDate: new Date("2026-01-18"),
    description: "Construir gráficos interativos e widgets de KPI para o dashboard principal",
    teamId: "team-2",
    isGeneral: false,
    messages: [],
  },
  {
    id: "8",
    name: "Sistema de notificação por email",
    status: "pending",
    priority: "low",
    owners: [users[1], users[4]],
    dueDate: new Date("2026-01-25"),
    description: "Implementar notificações por email para atualizações de tarefas e menções",
    teamId: "team-3",
    isGeneral: true, // Demanda geral
    messages: [],
  },
  {
    id: "9",
    name: "Reunião trimestral de planejamento",
    status: "pending",
    priority: "high",
    owners: users,
    dueDate: new Date("2026-01-30"),
    description: "Planejamento estratégico Q1 2026 - todos os setores",
    teamId: "general",
    isGeneral: true, // Demanda geral
    messages: [],
  },
  {
    id: "10",
    name: "Atualização de políticas internas",
    status: "working",
    priority: "medium",
    owners: [users[0]],
    dueDate: new Date("2026-01-22"),
    description: "Revisar e atualizar políticas de segurança e compliance",
    teamId: "general",
    isGeneral: true, // Demanda geral
    messages: [],
  },
]

export const sampleProject: Project = {
  id: "proj-1",
  name: "Lançamento Produto Q1",
  tasks: sampleTasks,
}

export const sampleInboxItems: InboxItem[] = [
  {
    id: "inbox-1",
    type: "mention",
    taskId: "2",
    taskName: "Integração de API de pagamentos",
    fromUser: users[2],
    content: "mencionou você em um comentário",
    timestamp: new Date("2026-01-05T10:30:00"),
    read: false,
  },
  {
    id: "inbox-2",
    type: "assignment",
    taskId: "5",
    taskName: "Correções de responsividade mobile",
    fromUser: users[1],
    content: "atribuiu uma tarefa para você",
    timestamp: new Date("2026-01-05T09:15:00"),
    read: false,
  },
  {
    id: "inbox-3",
    type: "comment",
    taskId: "1",
    taskName: "Documentação do sistema de design",
    fromUser: users[1],
    content: 'comentou: "Ótimo trabalho na paleta de cores!"',
    timestamp: new Date("2026-01-04T16:45:00"),
    read: true,
  },
  {
    id: "inbox-4",
    type: "update",
    taskId: "3",
    taskName: "Fluxo de onboarding de usuários",
    fromUser: users[3],
    content: 'alterou o status para "Bloqueado"',
    timestamp: new Date("2026-01-04T14:20:00"),
    read: true,
  },
  {
    id: "inbox-5",
    type: "mention",
    taskId: "7",
    taskName: "Widgets de analytics do dashboard",
    fromUser: users[2],
    content: 'mencionou você: "@Ana você pode revisar isso?"',
    timestamp: new Date("2026-01-04T11:00:00"),
    read: true,
  },
]

export const sampleTeams: Team[] = [
  {
    id: "team-1",
    name: "Equipe de Produto",
    description: "Responsável pelo desenvolvimento e evolução dos produtos",
    members: [users[0], users[2]],
    projectCount: 5,
  },
  {
    id: "team-2",
    name: "Equipe de Design",
    description: "UI/UX e experiência do usuário",
    members: [users[3]],
    projectCount: 3,
  },
  {
    id: "team-3",
    name: "Equipe de Engenharia",
    description: "Desenvolvimento técnico e infraestrutura",
    members: [users[1]],
    projectCount: 8,
  },
  {
    id: "team-4",
    name: "Equipe de Marketing",
    description: "Comunicação e estratégia de mercado",
    members: [users[4]],
    projectCount: 4,
  },
]

export const sampleCalendarEvents: CalendarEvent[] = [
  {
    id: "evt-1",
    title: "Exame de Saúde Ocupacional",
    type: "saude",
    date: new Date("2026-01-08"),
    startTime: "09:00",
    endTime: "10:00",
    description: "Exame periódico obrigatório - Medicina do Trabalho",
    location: "Clínica Vida Saudável",
    createdBy: users[0],
    isGeneral: true,
  },
  {
    id: "evt-2",
    title: "Reunião de Alinhamento Semanal",
    type: "reuniao",
    date: new Date("2026-01-06"),
    startTime: "10:00",
    endTime: "11:00",
    description: "Alinhamento de metas e prioridades da semana",
    location: "Sala de Reuniões A",
    participants: [users[0], users[1], users[2]],
    createdBy: users[0],
    teamId: "team-1",
  },
  {
    id: "evt-3",
    title: "Happy Hour de Aniversariantes",
    type: "evento",
    date: new Date("2026-01-10"),
    startTime: "18:00",
    endTime: "20:00",
    description: "Celebração dos aniversariantes do mês de Janeiro",
    location: "Área de Convivência",
    createdBy: users[0],
    isGeneral: true,
  },
  {
    id: "evt-4",
    title: "Campanha de Vacinação",
    type: "saude",
    date: new Date("2026-01-15"),
    startTime: "08:00",
    endTime: "17:00",
    description: "Vacinação contra gripe - gratuito para todos os colaboradores",
    location: "Ambulatório - Térreo",
    createdBy: users[0],
    isGeneral: true,
  },
  {
    id: "evt-5",
    title: "Workshop de Inovação",
    type: "evento",
    date: new Date("2026-01-20"),
    startTime: "14:00",
    endTime: "17:00",
    description: "Workshop sobre metodologias ágeis e inovação",
    location: "Auditório Principal",
    createdBy: users[0],
    isGeneral: true,
  },
  {
    id: "evt-6",
    title: "Reunião de Sprint Review",
    type: "reuniao",
    date: new Date("2026-01-12"),
    startTime: "15:00",
    endTime: "16:30",
    description: "Apresentação dos resultados da sprint atual",
    participants: [users[1], users[2]],
    createdBy: users[1],
    teamId: "team-3",
  },
  {
    id: "evt-7",
    title: "Ginástica Laboral",
    type: "saude",
    date: new Date("2026-01-07"),
    startTime: "10:00",
    endTime: "10:15",
    description: "Sessão de ginástica laboral - todos os dias",
    location: "Cada setor",
    createdBy: users[0],
    isGeneral: true,
  },
]

export const roomHosts: RoomHost[] = [
  {
    id: "host-1",
    name: "Dra. Patricia Lima",
    avatar: "/professional-woman-doctor.png",
    phone: "(11) 99999-1111",
    whatsapp: "5511999991111",
  },
  {
    id: "host-2",
    name: "Dr. Roberto Mendes",
    avatar: "/professional-man-doctor.png",
    phone: "(11) 99999-2222",
    whatsapp: "5511999992222",
  },
  {
    id: "host-3",
    name: "Clínica Bem Estar",
    avatar: "/clinic-logo-medical.jpg",
    phone: "(11) 99999-3333",
    whatsapp: "5511999993333",
  },
  {
    id: "host-4",
    name: "Espaço Saúde Premium",
    avatar: "/health-center-logo.png",
    phone: "(11) 99999-4444",
    whatsapp: "5511999994444",
  },
]

export const sampleRooms: Room[] = [
  {
    id: "room-1",
    name: "Sala Premium Jardins",
    images: ["/modern-medical-office-white-elegant.jpg", "/medical-examination-room-clean.jpg", "/medical-waiting-room-modern.jpg"],
    neighborhood: "Jardins",
    address: "Rua Oscar Freire, 1200 - Sala 401",
    modalities: ["hourly", "shift"],
    specialties: ["dermatologia", "estetica", "nutricao"],
    pricePerHour: 120,
    pricePerShift: 450,
    amenities: ["ar-condicionado", "wifi", "recepcionista", "estacionamento"],
    equipment: ["maca", "pia", "autoclave", "laser"],
    nightShiftAvailable: true,
    weekendAvailable: true,
    host: roomHosts[0],
    description:
      "Sala ampla e moderna, ideal para procedimentos estéticos e consultas. Localização privilegiada nos Jardins.",
    size: 25,
  },
  {
    id: "room-2",
    name: "Consultório Moema",
    images: ["/cozy-therapy-office-plants.jpg", "/psychology-office-comfortable.jpg", "/counseling-room-warm-lighting.jpg"],
    neighborhood: "Moema",
    address: "Av. Moema, 850 - Conj. 12",
    modalities: ["hourly", "shift", "fixed"],
    specialties: ["psicologia", "nutricao", "fonoaudiologia"],
    pricePerHour: 80,
    pricePerShift: 300,
    priceFixed: 2500,
    amenities: ["ar-condicionado", "wifi", "copa"],
    equipment: ["mesa", "poltrona", "som-ambiente"],
    nightShiftAvailable: true,
    weekendAvailable: false,
    host: roomHosts[1],
    description: "Ambiente acolhedor e silencioso, perfeito para atendimentos de psicologia e terapias.",
    size: 18,
  },
  {
    id: "room-3",
    name: "Studio Dermatológico VN",
    images: ["/dermatology-clinic-modern-equipment.jpg", "/aesthetic-treatment-room-laser.jpg", "/medical-spa-room-luxury.jpg"],
    neighborhood: "Vila Nova Conceição",
    address: "Rua Afonso Braz, 475 - Sala 802",
    modalities: ["hourly", "shift"],
    specialties: ["dermatologia", "estetica"],
    pricePerHour: 180,
    pricePerShift: 650,
    amenities: ["ar-condicionado", "wifi", "recepcionista", "estacionamento", "copa"],
    equipment: ["maca", "pia", "autoclave", "laser", "eletrocauterio", "luz-pulsada"],
    nightShiftAvailable: false,
    weekendAvailable: true,
    host: roomHosts[2],
    description:
      "Equipado com tecnologia de ponta para procedimentos dermatológicos e estéticos. Infraestrutura completa.",
    size: 35,
  },
  {
    id: "room-4",
    name: "Espaço Terapêutico Pinheiros",
    images: ["/physiotherapy-room-equipment.jpg", "/rehabilitation-clinic-modern.jpg", "/physical-therapy-space.jpg"],
    neighborhood: "Pinheiros",
    address: "Rua dos Pinheiros, 1500 - Sala 205",
    modalities: ["hourly", "fixed"],
    specialties: ["fisioterapia", "fonoaudiologia"],
    pricePerHour: 70,
    priceFixed: 2000,
    amenities: ["ar-condicionado", "wifi", "acessibilidade"],
    equipment: ["maca", "bolas-pilates", "faixas-elasticas", "espelho"],
    nightShiftAvailable: true,
    weekendAvailable: true,
    host: roomHosts[3],
    description: "Espaço amplo para fisioterapia e reabilitação. Totalmente acessível e com equipamentos modernos.",
    size: 40,
  },
  {
    id: "room-5",
    name: "Clínica Médica Paulista",
    images: ["/medical-clinic-consultation-room.jpg", "/doctor-office-professional.jpg", "/placeholder.svg?height=300&width=400"],
    neighborhood: "Paulista",
    address: "Av. Paulista, 1800 - Conj. 1505",
    modalities: ["hourly", "shift", "fixed"],
    specialties: ["medicina", "nutricao", "psicologia"],
    pricePerHour: 100,
    pricePerShift: 380,
    priceFixed: 3200,
    amenities: ["ar-condicionado", "wifi", "recepcionista", "copa", "estacionamento"],
    equipment: ["maca", "pia", "esfigmomanometro", "balanca"],
    nightShiftAvailable: true,
    weekendAvailable: false,
    host: roomHosts[0],
    description:
      "Localização central na Av. Paulista. Ideal para médicos e nutricionistas. Recepção compartilhada inclusa.",
    size: 22,
  },
  {
    id: "room-6",
    name: "Gabinete Odontológico Itaim",
    images: [
      "/placeholder.svg?height=300&width=400",
      "/placeholder.svg?height=300&width=400",
      "/placeholder.svg?height=300&width=400",
    ],
    neighborhood: "Itaim Bibi",
    address: "Rua João Cachoeira, 300 - Sala 1001",
    modalities: ["shift", "fixed"],
    specialties: ["odontologia"],
    pricePerShift: 500,
    priceFixed: 4500,
    amenities: ["ar-condicionado", "wifi", "recepcionista", "estacionamento"],
    equipment: ["cadeira-odontologica", "raio-x", "autoclave", "compressor"],
    nightShiftAvailable: false,
    weekendAvailable: true,
    host: roomHosts[1],
    description: "Gabinete completo com cadeira odontológica, raio-x panorâmico e todos os equipamentos necessários.",
    size: 28,
  },
  {
    id: "room-7",
    name: "Sala Multiuso Brooklin",
    images: [
      "/placeholder.svg?height=300&width=400",
      "/placeholder.svg?height=300&width=400",
      "/placeholder.svg?height=300&width=400",
    ],
    neighborhood: "Brooklin",
    address: "Rua Flórida, 200 - Conj. 304",
    modalities: ["hourly", "shift"],
    specialties: ["psicologia", "nutricao", "fonoaudiologia", "fisioterapia"],
    pricePerHour: 60,
    pricePerShift: 220,
    amenities: ["ar-condicionado", "wifi", "copa"],
    equipment: ["mesa", "maca", "balanca", "espelho"],
    nightShiftAvailable: true,
    weekendAvailable: true,
    host: roomHosts[3],
    description: "Sala versátil que se adapta a diversas especialidades. Ótimo custo-benefício no Brooklin.",
    size: 20,
  },
  {
    id: "room-8",
    name: "Centro Estético Alto Padrão",
    images: [
      "/placeholder.svg?height=300&width=400",
      "/placeholder.svg?height=300&width=400",
      "/placeholder.svg?height=300&width=400",
    ],
    neighborhood: "Jardins",
    address: "Alameda Lorena, 1650 - Sala 501",
    modalities: ["hourly", "shift"],
    specialties: ["estetica", "dermatologia"],
    pricePerHour: 200,
    pricePerShift: 750,
    amenities: ["ar-condicionado", "wifi", "recepcionista", "estacionamento", "copa", "vestiario"],
    equipment: [
      "maca",
      "pia",
      "autoclave",
      "laser",
      "eletrocauterio",
      "luz-pulsada",
      "radiofrequencia",
      "criolipolise",
    ],
    nightShiftAvailable: false,
    weekendAvailable: true,
    host: roomHosts[2],
    description: "Centro estético de alto padrão com os equipamentos mais modernos do mercado. Clientela seleta.",
    size: 45,
  },
]

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

export const neighborhoods = [
  "Todos",
  "Jardins",
  "Moema",
  "Vila Nova Conceição",
  "Pinheiros",
  "Paulista",
  "Itaim Bibi",
  "Brooklin",
]

export const amenityLabels: Record<string, string> = {
  "ar-condicionado": "Ar Condicionado",
  wifi: "Wi-Fi",
  recepcionista: "Recepcionista",
  estacionamento: "Estacionamento",
  copa: "Copa",
  acessibilidade: "Acessibilidade",
  vestiario: "Vestiário",
}

export const equipmentLabels: Record<string, string> = {
  maca: "Maca",
  pia: "Pia/Lavabo",
  autoclave: "Autoclave",
  laser: "Laser",
  eletrocauterio: "Eletrocautério",
  "luz-pulsada": "Luz Pulsada",
  mesa: "Mesa/Escrivaninha",
  poltrona: "Poltrona",
  "som-ambiente": "Som Ambiente",
  "bolas-pilates": "Bolas de Pilates",
  "faixas-elasticas": "Faixas Elásticas",
  espelho: "Espelho Grande",
  "cadeira-odontologica": "Cadeira Odontológica",
  "raio-x": "Raio-X",
  compressor: "Compressor",
  esfigmomanometro: "Esfigmomanômetro",
  balanca: "Balança",
  radiofrequencia: "Radiofrequência",
  criolipolise: "Criolipólise",
}

export function getFilteredTasks(tasks: Task[], user: User): Task[] {
  if (user.role === "gestor") {
    // Gestor vê todas as tarefas
    return tasks
  }
  // Membro vê apenas tarefas do seu setor e demandas gerais
  return tasks.filter(
    (task) => task.teamId === user.teamId || task.isGeneral || task.owners.some((o) => o.id === user.id),
  )
}

export function getFilteredTeams(teams: Team[], user: User): Team[] {
  if (user.role === "gestor") {
    // Gestor vê todas as equipes
    return teams
  }
  // Membro vê apenas sua equipe
  return teams.filter((team) => team.id === user.teamId)
}

export function getFilteredCalendarEvents(events: CalendarEvent[], user: User): CalendarEvent[] {
  if (user.role === "gestor") {
    return events
  }
  return events.filter(
    (event) =>
      event.isGeneral ||
      event.teamId === user.teamId ||
      event.createdBy.id === user.id ||
      event.participants?.some((p) => p.id === user.id),
  )
}
