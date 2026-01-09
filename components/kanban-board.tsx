"use client"

import type { Task } from "@/lib/data"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Flag, MessageCircle } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface KanbanBoardProps {
  tasks: Task[]
  onTaskClick: (task: Task) => void
}

const columns = [
  { id: "pending", title: "Pendente", color: "bg-status-pending" },
  { id: "working", title: "Em Andamento", color: "bg-status-working" },
  { id: "stuck", title: "Bloqueado", color: "bg-status-stuck" },
  { id: "done", title: "Concluído", color: "bg-status-done" },
]

const priorityConfig = {
  high: { className: "text-status-stuck", label: "Alta" },
  medium: { className: "text-status-working", label: "Média" },
  low: { className: "text-muted-foreground", label: "Baixa" },
}

export function KanbanBoard({ tasks, onTaskClick }: KanbanBoardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {columns.map((column) => {
        const columnTasks = tasks.filter((t) => t.status === column.id)
        return (
          <div key={column.id} className="flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <div className={cn("w-3 h-3 rounded-full", column.color)} />
              <h3 className="font-medium">{column.title}</h3>
              <Badge variant="secondary" className="ml-auto">
                {columnTasks.length}
              </Badge>
            </div>
            <div className="flex-1 space-y-3">
              {columnTasks.map((task) => (
                <Card
                  key={task.id}
                  className="cursor-pointer hover:shadow-md transition-shadow bg-card"
                  onClick={() => onTaskClick(task)}
                >
                  <CardHeader className="p-3 pb-2">
                    <CardTitle className="text-sm font-medium">{task.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-0 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Flag className={cn("h-3.5 w-3.5", priorityConfig[task.priority].className)} />
                        <span className={cn("text-xs", priorityConfig[task.priority].className)}>
                          {priorityConfig[task.priority].label}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {format(task.dueDate, "d MMM", { locale: ptBR })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex -space-x-1.5">
                        {task.owners.slice(0, 2).map((owner) => (
                          <Avatar key={owner.id} className="h-6 w-6 border-2 border-card">
                            <AvatarImage src={owner.avatar || "/placeholder.svg"} alt={owner.name} />
                            <AvatarFallback className="text-xs">{owner.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                      {task.messages.length > 0 && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <MessageCircle className="h-3.5 w-3.5" />
                          <span className="text-xs">{task.messages.length}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
