"use client";

import { useEffect, useState } from "react";
import { type Task, type InboxItem } from "@/lib/data"; // Usamos a interface InboxItem
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bell,
  MessageSquare,
  UserPlus,
  CheckCircle2,
  Clock,
  Check,
  Loader2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useUser } from "@/contexts/user-context";
import { TaskService } from "@/services/task-service";

interface InboxViewProps {
  onTaskClick: (task: Task) => void;
}

export function InboxView({ onTaskClick }: InboxViewProps) {
  const { currentUser } = useUser();
  const [items, setItems] = useState<InboxItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const data = await TaskService.getNotifications(currentUser.id);
      setItems(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [currentUser]);

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await TaskService.markNotificationRead(id);
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item))
    );
  };

  const handleMarkAllRead = async () => {
    if (!currentUser) return;
    await TaskService.markAllRead(currentUser.id);
    setItems((prev) => prev.map((item) => ({ ...item, read: true })));
  };

  const unreadCount = items.filter((i) => !i.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case "assignment":
        return <UserPlus className="h-4 w-4 text-blue-500" />;
      case "comment":
        return <MessageSquare className="h-4 w-4 text-green-500" />;
      case "mention":
        return <Bell className="h-4 w-4 text-amber-500" />;
      case "update":
        return <CheckCircle2 className="h-4 w-4 text-purple-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="animate-spin text-primary h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Caixa de Entrada</h1>
          <Badge
            variant="secondary"
            className="bg-primary/10 text-primary hover:bg-primary/20"
          >
            {unreadCount} não lidas
          </Badge>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleMarkAllRead}
          disabled={unreadCount === 0}
        >
          <Check className="h-4 w-4 mr-2" />
          Marcar todas como lidas
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground border rounded-lg border-dashed">
          <Bell className="h-10 w-10 mb-2 opacity-20" />
          <p>Você não tem notificações.</p>
        </div>
      ) : (
        <ScrollArea className="flex-1">
          <div className="space-y-2 pr-4">
            {items.map((item) => (
              <Card
                key={item.id}
                className={`p-4 transition-all hover:shadow-md cursor-pointer group ${
                  !item.read
                    ? "bg-card border-l-4 border-l-primary"
                    : "bg-muted/30 opacity-70"
                }`}
                onClick={async () => {
                  if (!item.read) handleMarkAsRead(item.id, {} as any);
                  // Busca a tarefa completa para abrir o modal
                  // Nota: Num cenário ideal, teríamos getTaskById, mas aqui podemos tentar filtrar do contexto ou buscar
                  // Por simplicidade, vamos só marcar como lido por enquanto.
                  // Se quiser abrir o modal, precisaria implementar getTaskById no Service e chamar aqui.
                }}
              >
                <div className="flex gap-4">
                  <div className="mt-1">{getIcon(item.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <p className="text-sm">
                          <span className="font-semibold">
                            {item.fromUser?.name || "Sistema"}
                          </span>{" "}
                          <span className="text-muted-foreground">
                            {item.content}
                          </span>{" "}
                          <span className="font-medium text-foreground">
                            {item.taskName}
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(item.timestamp, {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </p>
                      </div>
                      {!item.read && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => handleMarkAsRead(item.id, e)}
                          title="Marcar como lida"
                        >
                          <div className="h-2 w-2 rounded-full bg-primary" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
