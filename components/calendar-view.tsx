"use client"

import type { Task } from "@/lib/data"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
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
} from "date-fns"
import { ptBR } from "date-fns/locale"
import { useState } from "react"

interface CalendarViewProps {
  tasks: Task[]
  onTaskClick: (task: Task) => void
}

const statusColors = {
  done: "bg-status-done",
  working: "bg-status-working",
  stuck: "bg-status-stuck",
  pending: "bg-status-pending",
}

export function CalendarView({ tasks, onTaskClick }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calendarStart = startOfWeek(monthStart, { locale: ptBR })
  const calendarEnd = endOfWeek(monthEnd, { locale: ptBR })

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const getTasksForDay = (day: Date) => {
    return tasks.filter((task) => isSameDay(task.dueDate, day))
  }

  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

  return (
    <div className="bg-card rounded-lg border border-border p-4">
      {/* Calendar Header - Texto em português */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold capitalize">{format(currentMonth, "MMMM yyyy", { locale: ptBR })}</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={() => setCurrentMonth(new Date())}>
            Hoje
          </Button>
          <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-px mb-2">
        {weekDays.map((day) => (
          <div key={day} className="py-2 text-center text-sm font-medium text-muted-foreground">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
        {days.map((day) => {
          const dayTasks = getTasksForDay(day)
          const isCurrentMonth = isSameMonth(day, currentMonth)
          const isCurrentDay = isToday(day)

          return (
            <div key={day.toISOString()} className={cn("min-h-[100px] p-2 bg-card", !isCurrentMonth && "bg-muted/30")}>
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
                {dayTasks.slice(0, 3).map((task) => (
                  <button
                    key={task.id}
                    onClick={() => onTaskClick(task)}
                    className={cn(
                      "w-full text-left text-xs px-1.5 py-0.5 rounded truncate text-white",
                      statusColors[task.status],
                    )}
                  >
                    {task.name}
                  </button>
                ))}
                {dayTasks.length > 3 && (
                  <span className="text-xs text-muted-foreground px-1.5">+{dayTasks.length - 3} mais</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
