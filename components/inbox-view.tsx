"use client"

import { useState } from "react"
import { type InboxItem, sampleInboxItems, sampleTasks } from "@/lib/data"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AtSign, UserPlus, MessageSquare, RefreshCw, Search, Check, Bell, BellOff } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import type { Task } from "@/lib/data"

interface InboxViewProps {
  onTaskClick: (task: Task) => void
}

const typeConfig = {
  mention: { icon: AtSign, label: "Menção", color: "text-primary" },
  assignment: { icon: UserPlus, label: "Atribuição", color: "text-status-working" },
  comment: { icon: MessageSquare, label: "Comentário", color: "text-status-pending" },
  update: { icon: RefreshCw, label: "Atualização", color: "text-status-done" },
}

export function InboxView({ onTaskClick }: InboxViewProps) {
  const [inboxItems, setInboxItems] = useState<InboxItem[]>(sampleInboxItems)
  const [filter, setFilter] = useState<"all" | "unread">("all")

  const unreadCount = inboxItems.filter((item) => !item.read).length
  const filteredItems = filter === "all" ? inboxItems : inboxItems.filter((item) => !item.read)

  const markAsRead = (id: string) => {
    setInboxItems((prev) => prev.map((item) => (item.id === id ? { ...item, read: true } : item)))
  }

  const markAllAsRead = () => {
    setInboxItems((prev) => prev.map((item) => ({ ...item, read: true })))
  }

  const handleItemClick = (item: InboxItem) => {
    markAsRead(item.id)
    const task = sampleTasks.find((t) => t.id === item.taskId)
    if (task) {
      onTaskClick(task)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            Caixa de Entrada
            {unreadCount > 0 && <Badge className="bg-primary text-primary-foreground">{unreadCount}</Badge>}
          </h1>
          <p className="text-muted-foreground">Acompanhe menções, atribuições e atualizações</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar notificações..." className="pl-9" />
          </div>
          <Button variant="outline" onClick={markAllAsRead} disabled={unreadCount === 0}>
            <Check className="h-4 w-4 mr-2" />
            Marcar tudo como lido
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={filter} onValueChange={(v) => setFilter(v as "all" | "unread")}>
        <TabsList>
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Todas
          </TabsTrigger>
          <TabsTrigger value="unread" className="flex items-center gap-2">
            <BellOff className="h-4 w-4" />
            Não lidas
            {unreadCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-4">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-lg border border-border">
              <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium mb-1">
                {filter === "unread" ? "Nenhuma notificação não lida" : "Caixa de entrada vazia"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {filter === "unread"
                  ? "Você está em dia com todas as suas notificações!"
                  : "Você receberá notificações aqui quando houver atividade."}
              </p>
            </div>
          ) : (
            <div className="bg-card rounded-lg border border-border divide-y divide-border">
              {filteredItems.map((item) => {
                const TypeIcon = typeConfig[item.type].icon
                return (
                  <div
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className={cn(
                      "p-4 hover:bg-muted/30 cursor-pointer transition-colors flex items-start gap-4",
                      !item.read && "bg-primary/5",
                    )}
                  >
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarImage src={item.fromUser.avatar || "/placeholder.svg"} alt={item.fromUser.name} />
                      <AvatarFallback>{item.fromUser.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <TypeIcon className={cn("h-4 w-4", typeConfig[item.type].color)} />
                        <Badge variant="outline" className="text-xs">
                          {typeConfig[item.type].label}
                        </Badge>
                        {!item.read && <div className="w-2 h-2 rounded-full bg-primary" />}
                      </div>
                      <p className="text-sm">
                        <span className="font-medium">{item.fromUser.name}</span>{" "}
                        <span className="text-muted-foreground">{item.content}</span>
                      </p>
                      <p className="text-sm text-primary font-medium mt-1">{item.taskName}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(item.timestamp, { addSuffix: true, locale: ptBR })}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
