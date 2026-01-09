"use client"

import { useState, useRef } from "react"
import { type Task, type Message, currentUser, users } from "@/lib/data"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Flag, Calendar, Mic, Paperclip, Send, Play, Pause } from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

interface TaskDetailModalProps {
  task: Task
  onClose: () => void
  onUpdate: (task: Task) => void
}

const statusConfig = {
  done: { label: "Concluído", className: "bg-status-done text-white" },
  working: { label: "Em Andamento", className: "bg-status-working text-white" },
  stuck: { label: "Bloqueado", className: "bg-status-stuck text-white" },
  pending: { label: "Pendente", className: "bg-status-pending text-white" },
}

export function TaskDetailModal({ task, onClose, onUpdate }: TaskDetailModalProps) {
  const [localTask, setLocalTask] = useState(task)
  const [newMessage, setNewMessage] = useState("")
  const [playingAudio, setPlayingAudio] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleStatusChange = (status: string) => {
    const updated = { ...localTask, status: status as Task["status"] }
    setLocalTask(updated)
    onUpdate(updated)
  }

  const handlePriorityChange = (priority: string) => {
    const updated = { ...localTask, priority: priority as Task["priority"] }
    setLocalTask(updated)
    onUpdate(updated)
  }

  const handleSendMessage = () => {
    if (!newMessage.trim()) return

    const message: Message = {
      id: `m-${Date.now()}`,
      userId: currentUser.id,
      content: newMessage,
      timestamp: new Date(),
      type: "text",
    }

    const updated = {
      ...localTask,
      messages: [...localTask.messages, message],
    }
    setLocalTask(updated)
    onUpdate(updated)
    setNewMessage("")
  }

  const getUserById = (id: string) => users.find((u) => u.id === id) || currentUser

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      {/* Slide-over panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-card border-l border-border z-50 flex flex-col shadow-xl animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold truncate pr-4">{localTask.name}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Task Details */}
          <div className="p-4 space-y-4">
            {localTask.description && <p className="text-muted-foreground">{localTask.description}</p>}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={localTask.status} onValueChange={handleStatusChange}>
                  <SelectTrigger>
                    <SelectValue>
                      <Badge className={cn(statusConfig[localTask.status].className)}>
                        {statusConfig[localTask.status].label}
                      </Badge>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        <Badge className={cn(config.className)}>{config.label}</Badge>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Prioridade</label>
                <Select value={localTask.priority} onValueChange={handlePriorityChange}>
                  <SelectTrigger>
                    <SelectValue>
                      <div className="flex items-center gap-2">
                        <Flag
                          className={cn(
                            "h-4 w-4",
                            localTask.priority === "high"
                              ? "text-status-stuck"
                              : localTask.priority === "medium"
                                ? "text-status-working"
                                : "text-muted-foreground",
                          )}
                        />
                        <span className="capitalize">
                          {localTask.priority === "high" ? "Alta" : localTask.priority === "medium" ? "Média" : "Baixa"}
                        </span>
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">
                      <div className="flex items-center gap-2">
                        <Flag className="h-4 w-4 text-status-stuck" />
                        <span>Alta</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="medium">
                      <div className="flex items-center gap-2">
                        <Flag className="h-4 w-4 text-status-working" />
                        <span>Média</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="low">
                      <div className="flex items-center gap-2">
                        <Flag className="h-4 w-4 text-muted-foreground" />
                        <span>Baixa</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Prazo:</span>
              <span className="font-medium">
                {format(localTask.dueDate, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </span>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Responsáveis</label>
              <div className="flex -space-x-2">
                {localTask.owners.map((owner) => (
                  <Avatar key={owner.id} className="h-8 w-8 border-2 border-card">
                    <AvatarImage src={owner.avatar || "/placeholder.svg"} alt={owner.name} />
                    <AvatarFallback>{owner.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                ))}
              </div>
            </div>
          </div>

          <Separator />

          {/* Activity/Chat section - Textos em português */}
          <div className="p-4">
            <h3 className="font-medium mb-4">Atualizações e Atividade</h3>
            <div className="space-y-4">
              {localTask.messages.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-8">
                  Nenhuma atualização ainda. Inicie uma conversa!
                </p>
              ) : (
                localTask.messages.map((message) => {
                  const user = getUserById(message.userId)
                  return (
                    <div key={message.id} className="flex gap-3">
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <span className="font-medium text-sm">{user.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(message.timestamp, { addSuffix: true, locale: ptBR })}
                          </span>
                        </div>
                        {message.type === "text" && (
                          <div className="mt-1 p-3 bg-muted rounded-lg rounded-tl-none">
                            <p className="text-sm">{message.content}</p>
                          </div>
                        )}
                        {message.type === "audio" && (
                          <div className="mt-1 p-3 bg-muted rounded-lg rounded-tl-none">
                            <p className="text-sm mb-2">{message.content}</p>
                            <AudioPlayer
                              isPlaying={playingAudio === message.id}
                              onToggle={() => setPlayingAudio(playingAudio === message.id ? null : message.id)}
                            />
                          </div>
                        )}
                        {message.type === "image" && (
                          <div className="mt-1">
                            <p className="text-sm mb-2">{message.content}</p>
                            <img
                              src={message.imageUrl || "/placeholder.svg"}
                              alt="Anexo"
                              className="rounded-lg max-w-[200px]"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>

        {/* Message input - Placeholder em português */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-2 bg-muted rounded-lg p-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Escreva uma atualização..."
              className="flex-1 border-0 bg-transparent focus-visible:ring-0"
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*,audio/*" />
            <Button variant="ghost" size="icon" className="shrink-0">
              <Mic className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="shrink-0" onClick={() => fileInputRef.current?.click()}>
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              className="shrink-0 bg-primary hover:bg-primary/90"
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

function AudioPlayer({
  isPlaying,
  onToggle,
}: {
  isPlaying: boolean
  onToggle: () => void
}) {
  return (
    <div className="flex items-center gap-3 p-2 bg-background rounded-lg">
      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={onToggle}>
        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </Button>
      {/* Waveform visualization */}
      <div className="flex-1 flex items-center gap-0.5 h-8">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "w-1 rounded-full transition-all duration-150",
              isPlaying ? "bg-primary" : "bg-muted-foreground/30",
            )}
            style={{
              height: `${Math.random() * 100}%`,
              animationDelay: `${i * 50}ms`,
            }}
          />
        ))}
      </div>
      <span className="text-xs text-muted-foreground shrink-0">0:42</span>
    </div>
  )
}
