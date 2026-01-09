"use client"

import type { Task } from "@/lib/data"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Flag, MessageCircle, ChevronDown, ChevronRight } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useState } from "react"

interface TaskTableProps {
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

export function TaskTable({ tasks, onTaskClick }: TaskTableProps) {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    active: true,
    completed: true,
  })

  const activeTasks = tasks.filter((t) => t.status !== "done")
  const completedTasks = tasks.filter((t) => t.status === "done")

  const toggleGroup = (group: string) => {
    setExpandedGroups((prev) => ({ ...prev, [group]: !prev[group] }))
  }

  return (
    <div className="w-full">
      {/* Table Header - Headers em português */}
      <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-muted/50 rounded-t-lg text-sm font-medium text-muted-foreground">
        <div className="col-span-4">Nome da Tarefa</div>
        <div className="col-span-2">Status</div>
        <div className="col-span-2">Prioridade</div>
        <div className="col-span-2">Responsáveis</div>
        <div className="col-span-1">Prazo</div>
        <div className="col-span-1"></div>
      </div>

      {/* Active Tasks Group - Labels em português */}
      <div className="border-l-4 border-primary">
        <button
          onClick={() => toggleGroup("active")}
          className="w-full flex items-center gap-2 px-4 py-2 bg-card hover:bg-muted/30 transition-colors"
        >
          {expandedGroups.active ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          <span className="font-medium">Tarefas Ativas</span>
          <Badge variant="secondary" className="ml-2">
            {activeTasks.length}
          </Badge>
        </button>
        {expandedGroups.active && (
          <div className="divide-y divide-border">
            {activeTasks.map((task) => (
              <TaskRow key={task.id} task={task} onClick={() => onTaskClick(task)} />
            ))}
          </div>
        )}
      </div>

      {/* Completed Tasks Group - Labels em português */}
      <div className="border-l-4 border-status-done mt-2">
        <button
          onClick={() => toggleGroup("completed")}
          className="w-full flex items-center gap-2 px-4 py-2 bg-card hover:bg-muted/30 transition-colors"
        >
          {expandedGroups.completed ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          <span className="font-medium">Concluídas</span>
          <Badge variant="secondary" className="ml-2">
            {completedTasks.length}
          </Badge>
        </button>
        {expandedGroups.completed && (
          <div className="divide-y divide-border">
            {completedTasks.map((task) => (
              <TaskRow key={task.id} task={task} onClick={() => onTaskClick(task)} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function TaskRow({ task, onClick }: { task: Task; onClick: () => void }) {
  const status = statusConfig[task.status]
  const priority = priorityConfig[task.priority]

  return (
    <div
      onClick={onClick}
      className="grid grid-cols-12 gap-4 px-4 py-3 bg-card hover:bg-muted/30 cursor-pointer transition-colors items-center"
    >
      <div className="col-span-4">
        <span className="font-medium">{task.name}</span>
      </div>
      <div className="col-span-2">
        <Badge className={cn("text-xs", status.className)}>{status.label}</Badge>
      </div>
      <div className="col-span-2">
        <div className="flex items-center gap-1.5">
          <Flag className={cn("h-4 w-4", priority.className)} />
          <span className={cn("text-sm", priority.className)}>{priority.label}</span>
        </div>
      </div>
      <div className="col-span-2">
        <div className="flex -space-x-2">
          {task.owners.slice(0, 3).map((owner) => (
            <Avatar key={owner.id} className="h-7 w-7 border-2 border-card">
              <AvatarImage src={owner.avatar || "/placeholder.svg"} alt={owner.name} />
              <AvatarFallback className="text-xs">{owner.name.charAt(0)}</AvatarFallback>
            </Avatar>
          ))}
          {task.owners.length > 3 && (
            <div className="h-7 w-7 rounded-full bg-muted border-2 border-card flex items-center justify-center text-xs">
              +{task.owners.length - 3}
            </div>
          )}
        </div>
      </div>
      <div className="col-span-1">
        <span className="text-sm text-muted-foreground">{format(task.dueDate, "d MMM", { locale: ptBR })}</span>
      </div>
      <div className="col-span-1 flex justify-end">
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MessageCircle className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
