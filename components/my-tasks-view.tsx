"use client"

import type React from "react"

import type { Task } from "@/lib/data"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Flag, MessageCircle, Search, Calendar, Clock, CheckCircle2, AlertCircle, Globe } from "lucide-react"
import { format, isThisWeek, isToday, isPast } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useUser } from "@/contexts/user-context"
import { useMemo } from "react"

interface MyTasksViewProps {
  tasks: Task[]
  onTaskClick: (task: Task) => void
}

const statusConfig = {
  done: { label: "Concluído", className: "bg-status-done text-white" },
  working: { label: "Em Andamento", className: "bg-status-working text-white" },
  stuck: { label: "Bloqueado", className: "bg-status-stuck text-white" },
  pending: { label: "Pendente", className: "bg-status-pending text-white" },
}

const priorityConfig = {
  high: { label: "Alta", className: "text-status-stuck" },
  medium: { label: "Média", className: "text-status-working" },
  low: { label: "Baixa", className: "text-muted-foreground" },
}

export function MyTasksView({ tasks, onTaskClick }: MyTasksViewProps) {
  const { currentUser, isGestor } = useUser()

  const myTasks = useMemo(() => {
    return tasks.filter((task) => task.owners.some((owner) => owner.id === currentUser.id))
  }, [tasks, currentUser])

  const generalTasks = useMemo(() => {
    return myTasks.filter((t) => t.isGeneral && t.status !== "done")
  }, [myTasks])

  const overdueTasks = myTasks.filter(
    (t) => t.status !== "done" && !t.isGeneral && isPast(t.dueDate) && !isToday(t.dueDate),
  )
  const todayTasks = myTasks.filter((t) => t.status !== "done" && !t.isGeneral && isToday(t.dueDate))
  const thisWeekTasks = myTasks.filter(
    (t) => t.status !== "done" && !t.isGeneral && isThisWeek(t.dueDate) && !isToday(t.dueDate) && !isPast(t.dueDate),
  )
  const completedTasks = myTasks.filter((t) => t.status === "done")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Minhas Tarefas</h1>
          <p className="text-muted-foreground">
            {isGestor
              ? "Gerencie suas tarefas de todas as equipes"
              : "Tarefas do seu setor e demandas gerais da empresa"}
          </p>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar minhas tarefas..." className="pl-9" />
        </div>
      </div>

      {!isGestor && (
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-primary">Visão de Membro</p>
            <p className="text-sm text-muted-foreground">
              Você está visualizando tarefas do seu setor e demandas gerais da empresa.
            </p>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-status-stuck/20">
                <Clock className="h-5 w-5 text-status-stuck" />
              </div>
              <div>
                <p className="text-2xl font-bold">{overdueTasks.length}</p>
                <p className="text-sm text-muted-foreground">Atrasadas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{todayTasks.length}</p>
                <p className="text-sm text-muted-foreground">Para Hoje</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-status-working/20">
                <Flag className="h-5 w-5 text-status-working" />
              </div>
              <div>
                <p className="text-2xl font-bold">{thisWeekTasks.length}</p>
                <p className="text-sm text-muted-foreground">Esta Semana</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Globe className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{generalTasks.length}</p>
                <p className="text-sm text-muted-foreground">Gerais</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-status-done/20">
                <CheckCircle2 className="h-5 w-5 text-status-done" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedTasks.length}</p>
                <p className="text-sm text-muted-foreground">Concluídas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Task Sections */}
      <div className="space-y-6">
        {generalTasks.length > 0 && (
          <TaskSection
            title="Demandas Gerais da Empresa"
            tasks={generalTasks}
            onTaskClick={onTaskClick}
            borderColor="border-blue-500"
            icon={<Globe className="h-4 w-4 text-blue-500" />}
          />
        )}

        {/* Overdue */}
        {overdueTasks.length > 0 && (
          <TaskSection
            title="Atrasadas"
            tasks={overdueTasks}
            onTaskClick={onTaskClick}
            borderColor="border-status-stuck"
          />
        )}

        {/* Today */}
        {todayTasks.length > 0 && (
          <TaskSection title="Hoje" tasks={todayTasks} onTaskClick={onTaskClick} borderColor="border-primary" />
        )}

        {/* This Week */}
        {thisWeekTasks.length > 0 && (
          <TaskSection
            title="Esta Semana"
            tasks={thisWeekTasks}
            onTaskClick={onTaskClick}
            borderColor="border-status-working"
          />
        )}

        {/* Completed */}
        {completedTasks.length > 0 && (
          <TaskSection
            title="Concluídas"
            tasks={completedTasks}
            onTaskClick={onTaskClick}
            borderColor="border-status-done"
          />
        )}
      </div>
    </div>
  )
}

function TaskSection({
  title,
  tasks,
  onTaskClick,
  borderColor,
  icon,
}: {
  title: string
  tasks: Task[]
  onTaskClick: (task: Task) => void
  borderColor: string
  icon?: React.ReactNode
}) {
  return (
    <div className={cn("border-l-4 rounded-lg bg-card", borderColor)}>
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold flex items-center gap-2">
          {icon}
          {title}
          <Badge variant="secondary">{tasks.length}</Badge>
        </h3>
      </div>
      <div className="divide-y divide-border">
        {tasks.map((task) => (
          <div
            key={task.id}
            onClick={() => onTaskClick(task)}
            className="p-4 hover:bg-muted/30 cursor-pointer transition-colors"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium truncate">{task.name}</p>
                  {task.isGeneral && (
                    <Badge variant="outline" className="text-xs border-blue-500 text-blue-500">
                      Geral
                    </Badge>
                  )}
                </div>
                {task.description && (
                  <p className="text-sm text-muted-foreground truncate mt-0.5">{task.description}</p>
                )}
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Badge className={cn("text-xs", statusConfig[task.status].className)}>
                  {statusConfig[task.status].label}
                </Badge>
                <div className="flex items-center gap-1">
                  <Flag className={cn("h-4 w-4", priorityConfig[task.priority].className)} />
                </div>
                <span className="text-sm text-muted-foreground">{format(task.dueDate, "d MMM", { locale: ptBR })}</span>
                {task.messages.length > 0 && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MessageCircle className="h-4 w-4" />
                    <span className="text-xs">{task.messages.length}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
