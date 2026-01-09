"use client"

import type { Task, CalendarEvent, CalendarEventType } from "@/lib/data"
import { sampleTasks, sampleCalendarEvents, getFilteredCalendarEvents } from "@/lib/data"
import { useUser } from "@/contexts/user-context"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, Clock, Plus, HeartPulse, PartyPopper, Users, Filter, MapPin } from "lucide-react"
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
} from "date-fns"
import { ptBR } from "date-fns/locale"
import { useState } from "react"
import { EventModal, EventDetailModal } from "@/components/event-modal"

interface FullCalendarViewProps {
  onTaskClick: (task: Task) => void
}

const statusColors = {
  done: "bg-status-done",
  working: "bg-status-working",
  stuck: "bg-status-stuck",
  pending: "bg-status-pending",
}

const eventTypeConfig = {
  saude: {
    label: "Saúde",
    icon: HeartPulse,
    color: "bg-emerald-500",
    textColor: "text-emerald-400",
  },
  evento: {
    label: "Evento",
    icon: PartyPopper,
    color: "bg-purple-500",
    textColor: "text-purple-400",
  },
  reuniao: {
    label: "Reunião",
    icon: Users,
    color: "bg-blue-500",
    textColor: "text-blue-400",
  },
}

type ViewMode = "month" | "week" | "day"

export function FullCalendarView({ onTaskClick }: FullCalendarViewProps) {
  const { currentUser } = useUser()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>("month")
  const [showEventModal, setShowEventModal] = useState(false)
  const [selectedDateForEvent, setSelectedDateForEvent] = useState<Date | undefined>()
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(sampleCalendarEvents)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [showEventDetail, setShowEventDetail] = useState(false)
  const [activeFilters, setActiveFilters] = useState<CalendarEventType[]>(["saude", "evento", "reuniao"])

  const tasks = sampleTasks
  const filteredEvents = getFilteredCalendarEvents(calendarEvents, currentUser).filter((e) =>
    activeFilters.includes(e.type),
  )

  const getTasksForDay = (day: Date) => {
    return tasks.filter((task) => isSameDay(task.dueDate, day))
  }

  const getEventsForDay = (day: Date) => {
    return filteredEvents.filter((event) => isSameDay(event.date, day))
  }

  const navigatePrevious = () => {
    switch (viewMode) {
      case "month":
        setCurrentDate(subMonths(currentDate, 1))
        break
      case "week":
        setCurrentDate(subWeeks(currentDate, 1))
        break
      case "day":
        setCurrentDate(new Date(currentDate.getTime() - 86400000))
        break
    }
  }

  const navigateNext = () => {
    switch (viewMode) {
      case "month":
        setCurrentDate(addMonths(currentDate, 1))
        break
      case "week":
        setCurrentDate(addWeeks(currentDate, 1))
        break
      case "day":
        setCurrentDate(new Date(currentDate.getTime() + 86400000))
        break
    }
  }

  const getTitle = () => {
    switch (viewMode) {
      case "month":
        return format(currentDate, "MMMM yyyy", { locale: ptBR })
      case "week":
        const weekStart = startOfWeek(currentDate, { locale: ptBR })
        const weekEnd = endOfWeek(currentDate, { locale: ptBR })
        return `${format(weekStart, "d MMM", { locale: ptBR })} - ${format(weekEnd, "d MMM yyyy", { locale: ptBR })}`
      case "day":
        return format(currentDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })
    }
  }

  const handleAddEvent = (eventData: Omit<CalendarEvent, "id" | "createdBy">) => {
    const newEvent: CalendarEvent = {
      ...eventData,
      id: `evt-${Date.now()}`,
      createdBy: currentUser,
    }
    setCalendarEvents([...calendarEvents, newEvent])
  }

  const handleDeleteEvent = (id: string) => {
    setCalendarEvents(calendarEvents.filter((e) => e.id !== id))
  }

  const toggleFilter = (type: CalendarEventType) => {
    if (activeFilters.includes(type)) {
      setActiveFilters(activeFilters.filter((f) => f !== type))
    } else {
      setActiveFilters([...activeFilters, type])
    }
  }

  const openNewEventModal = (date?: Date) => {
    setSelectedDateForEvent(date)
    setShowEventModal(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Calendário</h1>
          <p className="text-muted-foreground">Visualize tarefas, reuniões, eventos e datas de saúde</p>
        </div>
        <Button onClick={() => openNewEventModal()} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Evento
        </Button>
      </div>

      {/* Filtros de Tipo de Evento */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground mr-2">Filtrar:</span>
        {(Object.keys(eventTypeConfig) as CalendarEventType[]).map((type) => {
          const config = eventTypeConfig[type]
          const Icon = config.icon
          const isActive = activeFilters.includes(type)
          return (
            <button
              key={type}
              onClick={() => toggleFilter(type)}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                isActive ? config.color + " text-white" : "bg-muted text-muted-foreground hover:bg-muted/80",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {config.label}
            </button>
          )
        })}
        <button
          onClick={() => setActiveFilters(["saude", "evento", "reuniao"])}
          className="text-xs text-primary hover:underline ml-2"
        >
          Mostrar todos
        </button>
      </div>

      {/* Calendar Card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle className="capitalize">{getTitle()}</CardTitle>
            <div className="flex items-center gap-2">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-muted rounded-lg p-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn("px-3", viewMode === "month" && "bg-background shadow-sm")}
                  onClick={() => setViewMode("month")}
                >
                  Mês
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn("px-3", viewMode === "week" && "bg-background shadow-sm")}
                  onClick={() => setViewMode("week")}
                >
                  Semana
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn("px-3", viewMode === "day" && "bg-background shadow-sm")}
                  onClick={() => setViewMode("day")}
                >
                  Dia
                </Button>
              </div>

              {/* Navigation */}
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" onClick={navigatePrevious}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" onClick={() => setCurrentDate(new Date())}>
                  Hoje
                </Button>
                <Button variant="outline" size="icon" onClick={navigateNext}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {viewMode === "month" && (
            <MonthView
              currentDate={currentDate}
              tasks={tasks}
              events={filteredEvents}
              onTaskClick={onTaskClick}
              onEventClick={(event) => {
                setSelectedEvent(event)
                setShowEventDetail(true)
              }}
              onDayClick={(day) => openNewEventModal(day)}
              getTasksForDay={getTasksForDay}
              getEventsForDay={getEventsForDay}
            />
          )}
          {viewMode === "week" && (
            <WeekView
              currentDate={currentDate}
              tasks={tasks}
              events={filteredEvents}
              onTaskClick={onTaskClick}
              onEventClick={(event) => {
                setSelectedEvent(event)
                setShowEventDetail(true)
              }}
              getTasksForDay={getTasksForDay}
              getEventsForDay={getEventsForDay}
            />
          )}
          {viewMode === "day" && (
            <DayView
              currentDate={currentDate}
              tasks={tasks}
              events={filteredEvents}
              onTaskClick={onTaskClick}
              onEventClick={(event) => {
                setSelectedEvent(event)
                setShowEventDetail(true)
              }}
              getTasksForDay={getTasksForDay}
              getEventsForDay={getEventsForDay}
            />
          )}
        </CardContent>
      </Card>

      {/* Legenda */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center gap-6 flex-wrap">
            <span className="text-sm font-medium">Legenda:</span>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-status-done" />
              <span className="text-xs text-muted-foreground">Tarefa Concluída</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-status-working" />
              <span className="text-xs text-muted-foreground">Em Andamento</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-status-stuck" />
              <span className="text-xs text-muted-foreground">Bloqueado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-status-pending" />
              <span className="text-xs text-muted-foreground">Pendente</span>
            </div>
            <div className="border-l border-border pl-4 flex items-center gap-4">
              {(Object.keys(eventTypeConfig) as CalendarEventType[]).map((type) => {
                const config = eventTypeConfig[type]
                const Icon = config.icon
                return (
                  <div key={type} className="flex items-center gap-2">
                    <div className={cn("w-3 h-3 rounded", config.color)} />
                    <Icon className={cn("h-3 w-3", config.textColor)} />
                    <span className="text-xs text-muted-foreground">{config.label}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Novo Evento */}
      <EventModal
        open={showEventModal}
        onClose={() => setShowEventModal(false)}
        onSave={handleAddEvent}
        selectedDate={selectedDateForEvent}
      />

      {/* Modal de Detalhes do Evento */}
      <EventDetailModal
        event={selectedEvent}
        open={showEventDetail}
        onClose={() => {
          setShowEventDetail(false)
          setSelectedEvent(null)
        }}
        onDelete={handleDeleteEvent}
      />
    </div>
  )
}

function MonthView({
  currentDate,
  onTaskClick,
  onEventClick,
  onDayClick,
  getTasksForDay,
  getEventsForDay,
}: {
  currentDate: Date
  tasks: Task[]
  events: CalendarEvent[]
  onTaskClick: (task: Task) => void
  onEventClick: (event: CalendarEvent) => void
  onDayClick: (day: Date) => void
  getTasksForDay: (day: Date) => Task[]
  getEventsForDay: (day: Date) => CalendarEvent[]
}) {
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarStart = startOfWeek(monthStart, { locale: ptBR })
  const calendarEnd = endOfWeek(monthEnd, { locale: ptBR })
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })
  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

  return (
    <>
      <div className="grid grid-cols-7 gap-px mb-2">
        {weekDays.map((day) => (
          <div key={day} className="py-2 text-center text-sm font-medium text-muted-foreground">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
        {days.map((day) => {
          const dayTasks = getTasksForDay(day)
          const dayEvents = getEventsForDay(day)
          const isCurrentMonth = isSameMonth(day, currentDate)
          const isCurrentDay = isToday(day)
          const allItems = [...dayEvents, ...dayTasks]

          return (
            <div
              key={day.toISOString()}
              className={cn(
                "min-h-[100px] p-2 bg-card cursor-pointer hover:bg-muted/30 transition-colors",
                !isCurrentMonth && "bg-muted/30",
              )}
              onDoubleClick={() => onDayClick(day)}
            >
              <div
                className={cn(
                  "w-7 h-7 flex items-center justify-center rounded-full text-sm mb-1",
                  isCurrentDay && "bg-primary text-primary-foreground font-medium",
                  !isCurrentMonth && "text-muted-foreground/50",
                )}
              >
                {format(day, "d")}
              </div>
              <div className="space-y-1">
                {/* Eventos primeiro */}
                {dayEvents.slice(0, 2).map((event) => {
                  const config = eventTypeConfig[event.type]
                  const Icon = config.icon
                  return (
                    <button
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation()
                        onEventClick(event)
                      }}
                      className={cn(
                        "w-full text-left text-xs px-1.5 py-0.5 rounded truncate text-white flex items-center gap-1",
                        config.color,
                      )}
                    >
                      <Icon className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{event.title}</span>
                    </button>
                  )
                })}
                {/* Tarefas depois */}
                {dayTasks.slice(0, 2 - Math.min(dayEvents.length, 2)).map((task) => (
                  <button
                    key={task.id}
                    onClick={(e) => {
                      e.stopPropagation()
                      onTaskClick(task)
                    }}
                    className={cn(
                      "w-full text-left text-xs px-1.5 py-0.5 rounded truncate text-white",
                      statusColors[task.status],
                    )}
                  >
                    {task.name}
                  </button>
                ))}
                {allItems.length > 2 && (
                  <span className="text-xs text-muted-foreground px-1.5">+{allItems.length - 2} mais</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}

function WeekView({
  currentDate,
  onTaskClick,
  onEventClick,
  getTasksForDay,
  getEventsForDay,
}: {
  currentDate: Date
  tasks: Task[]
  events: CalendarEvent[]
  onTaskClick: (task: Task) => void
  onEventClick: (event: CalendarEvent) => void
  getTasksForDay: (day: Date) => Task[]
  getEventsForDay: (day: Date) => CalendarEvent[]
}) {
  const weekStart = startOfWeek(currentDate, { locale: ptBR })
  const weekEnd = endOfWeek(currentDate, { locale: ptBR })
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd })

  return (
    <div className="grid grid-cols-7 gap-4">
      {days.map((day) => {
        const dayTasks = getTasksForDay(day)
        const dayEvents = getEventsForDay(day)
        const isCurrentDay = isToday(day)

        return (
          <div key={day.toISOString()} className="min-h-[300px]">
            <div
              className={cn(
                "text-center p-2 rounded-t-lg mb-2",
                isCurrentDay ? "bg-primary text-primary-foreground" : "bg-muted",
              )}
            >
              <p className="text-xs font-medium uppercase">{format(day, "EEE", { locale: ptBR })}</p>
              <p className="text-lg font-bold">{format(day, "d")}</p>
            </div>
            <div className="space-y-2">
              {/* Eventos */}
              {dayEvents.map((event) => {
                const config = eventTypeConfig[event.type]
                const Icon = config.icon
                return (
                  <div
                    key={event.id}
                    onClick={() => onEventClick(event)}
                    className={cn(
                      "p-2 rounded-lg text-white cursor-pointer hover:opacity-90 transition-opacity",
                      config.color,
                    )}
                  >
                    <div className="flex items-center gap-1 mb-1">
                      <Icon className="h-3 w-3" />
                      {event.startTime && <span className="text-[10px] opacity-80">{event.startTime}</span>}
                    </div>
                    <p className="text-xs font-medium truncate">{event.title}</p>
                  </div>
                )
              })}
              {/* Tarefas */}
              {dayTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => onTaskClick(task)}
                  className={cn(
                    "p-2 rounded-lg text-white cursor-pointer hover:opacity-90 transition-opacity",
                    statusColors[task.status],
                  )}
                >
                  <p className="text-xs font-medium truncate">{task.name}</p>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function DayView({
  currentDate,
  onTaskClick,
  onEventClick,
  getTasksForDay,
  getEventsForDay,
}: {
  currentDate: Date
  tasks: Task[]
  events: CalendarEvent[]
  onTaskClick: (task: Task) => void
  onEventClick: (event: CalendarEvent) => void
  getTasksForDay: (day: Date) => Task[]
  getEventsForDay: (day: Date) => CalendarEvent[]
}) {
  const dayTasks = getTasksForDay(currentDate)
  const dayEvents = getEventsForDay(currentDate)

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "text-center p-4 rounded-lg",
          isToday(currentDate) ? "bg-primary text-primary-foreground" : "bg-muted",
        )}
      >
        <p className="text-sm font-medium uppercase">{format(currentDate, "EEEE", { locale: ptBR })}</p>
        <p className="text-3xl font-bold">{format(currentDate, "d")}</p>
        <p className="text-sm capitalize">{format(currentDate, "MMMM yyyy", { locale: ptBR })}</p>
      </div>

      {dayEvents.length === 0 && dayTasks.length === 0 ? (
        <div className="text-center py-12">
          <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-medium mb-1">Nenhum compromisso para este dia</h3>
          <p className="text-sm text-muted-foreground">Aproveite o dia livre ou adicione novos eventos!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Eventos */}
          {dayEvents.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Eventos</h3>
              <div className="space-y-3">
                {dayEvents.map((event) => {
                  const config = eventTypeConfig[event.type]
                  const Icon = config.icon
                  return (
                    <div
                      key={event.id}
                      onClick={() => onEventClick(event)}
                      className="p-4 bg-card border border-border rounded-lg cursor-pointer hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <div className={cn("p-1.5 rounded", config.color)}>
                              <Icon className="h-4 w-4 text-white" />
                            </div>
                            <p className="font-medium">{event.title}</p>
                          </div>
                          {event.description && (
                            <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            {event.startTime && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {event.startTime}
                                {event.endTime && ` - ${event.endTime}`}
                              </div>
                            )}
                            {event.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {event.location}
                              </div>
                            )}
                          </div>
                        </div>
                        <Badge className={cn("text-xs text-white flex-shrink-0", config.color)}>{config.label}</Badge>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Tarefas */}
          {dayTasks.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Tarefas</h3>
              <div className="space-y-3">
                {dayTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => onTaskClick(task)}
                    className="p-4 bg-card border border-border rounded-lg cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{task.name}</p>
                        {task.description && <p className="text-sm text-muted-foreground mt-1">{task.description}</p>}
                      </div>
                      <Badge className={cn("text-xs", statusColors[task.status], "text-white")}>
                        {task.status === "done"
                          ? "Concluído"
                          : task.status === "working"
                            ? "Em Andamento"
                            : task.status === "stuck"
                              ? "Bloqueado"
                              : "Pendente"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
