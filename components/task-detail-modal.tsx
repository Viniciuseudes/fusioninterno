"use client";

import { useState, useRef, useEffect } from "react";
import { type Task } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // Importar Textarea
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  X,
  Flag,
  Calendar,
  Mic,
  Paperclip,
  Send,
  Loader2,
  Trash2,
  Save,
  Edit2,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useUser } from "@/contexts/user-context";
import { TaskService } from "@/services/task-service";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

interface TaskDetailModalProps {
  task: Task;
  onClose: () => void;
  onUpdate: (task: Task) => void;
  onDelete?: (taskId: string) => void; // Nova prop
}

const statusConfig = {
  done: {
    label: "Concluído",
    className: "bg-green-600 text-white hover:bg-green-700",
  },
  working: {
    label: "Em Andamento",
    className: "bg-blue-600 text-white hover:bg-blue-700",
  },
  stuck: {
    label: "Bloqueado",
    className: "bg-red-600 text-white hover:bg-red-700",
  },
  pending: {
    label: "Pendente",
    className: "bg-slate-500 text-white hover:bg-slate-600",
  },
};

export function TaskDetailModal({
  task,
  onClose,
  onUpdate,
  onDelete,
}: TaskDetailModalProps) {
  const { currentUser } = useUser();
  const [localTask, setLocalTask] = useState(task);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Estados de edição
  const [editName, setEditName] = useState(task.name);
  const [editDesc, setEditDesc] = useState(task.description || "");
  const [editDate, setEditDate] = useState<Date | undefined>(task.dueDate);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Atualiza estados locais se a prop task mudar
  useEffect(() => {
    setLocalTask(task);
    setEditName(task.name);
    setEditDesc(task.description || "");
    setEditDate(task.dueDate);
  }, [task]);

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      const updates: Partial<Task> = {
        name: editName,
        description: editDesc,
        dueDate: editDate,
      };

      await TaskService.updateTask(localTask.id, updates);

      const updatedTask = { ...localTask, ...updates };
      setLocalTask(updatedTask as Task);
      onUpdate(updatedTask as Task);
      setIsEditing(false);
    } catch (error) {
      console.error("Erro ao salvar", error);
      alert("Erro ao salvar alterações");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja excluir esta tarefa?")) return;

    setIsDeleting(true);
    try {
      await TaskService.deleteTask(localTask.id);
      if (onDelete) onDelete(localTask.id);
      onClose();
    } catch (error) {
      console.error("Erro ao excluir", error);
      alert("Erro ao excluir tarefa");
      setIsDeleting(false);
    }
  };

  const handleStatusChange = async (status: string) => {
    try {
      await TaskService.updateStatus(localTask.id, status);
      const updated = { ...localTask, status: status as Task["status"] };
      setLocalTask(updated);
      onUpdate(updated);
    } catch (error) {
      console.error("Erro ao atualizar status", error);
    }
  };

  const handlePriorityChange = async (priority: string) => {
    try {
      await TaskService.updatePriority(localTask.id, priority);
      const updated = { ...localTask, priority: priority as Task["priority"] };
      setLocalTask(updated);
      onUpdate(updated);
    } catch (error) {
      console.error("Erro ao atualizar prioridade", error);
    }
  };

  const handleSendMessage = async () => {
    if (!currentUser || !newMessage.trim()) return;
    setIsSending(true);
    try {
      const addedMessage = await TaskService.addMessage(
        localTask.id,
        currentUser.id,
        newMessage,
        "text"
      );
      const updated = {
        ...localTask,
        messages: [...localTask.messages, addedMessage],
      };
      setLocalTask(updated);
      onUpdate(updated);
      setNewMessage("");
    } catch (error) {
      console.error("Erro ao enviar mensagem", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;
    setIsSending(true);
    try {
      const publicUrl = await TaskService.uploadFile(file);
      const type = file.type.startsWith("image/") ? "image" : "audio";
      const addedMessage = await TaskService.addMessage(
        localTask.id,
        currentUser.id,
        file.name,
        type,
        publicUrl
      );
      const updated = {
        ...localTask,
        messages: [...localTask.messages, addedMessage],
      };
      setLocalTask(updated);
      onUpdate(updated);
    } catch (error) {
      console.error("Erro no upload", error);
    } finally {
      setIsSending(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const getUserInfo = (userId: string) => {
    const owner = localTask.owners.find((u) => u.id === userId);
    if (owner) return owner;
    if (currentUser?.id === userId) return currentUser;
    return { name: "Usuário", avatar: "/placeholder-user.jpg" };
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-card border-l border-border z-50 flex flex-col shadow-xl animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-muted/20">
          <div className="flex gap-2">
            {!isEditing ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Edit2 className="h-4 w-4 mr-2" /> Editar
              </Button>
            ) : (
              <>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleSaveChanges}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Salvar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(false)}
                  disabled={isSaving}
                >
                  Cancelar
                </Button>
              </>
            )}

            {/* Botão de Excluir (Só aparece se for o criador ou gestor - simplificado aqui para todos verem) */}
            <Button
              variant="destructive"
              size="icon"
              className="h-9 w-9"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-5 space-y-6">
            {/* Título e Descrição */}
            <div className="space-y-3">
              {isEditing ? (
                <div className="space-y-3 p-3 bg-muted/30 rounded-lg border">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground uppercase">
                      Título
                    </label>
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="font-semibold text-lg"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground uppercase">
                      Descrição
                    </label>
                    <Textarea
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-bold leading-tight">
                    {localTask.name}
                  </h2>
                  {localTask.description ? (
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {localTask.description}
                    </p>
                  ) : (
                    <p className="text-muted-foreground text-sm italic">
                      Sem descrição.
                    </p>
                  )}
                </>
              )}
            </div>

            <Separator />

            {/* Controles Principais */}
            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase">
                  Status
                </label>
                <Select
                  value={localTask.status}
                  onValueChange={handleStatusChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue>
                      <Badge
                        className={cn(
                          "px-2 py-0.5 rounded-sm font-normal",
                          statusConfig[localTask.status].className
                        )}
                      >
                        {statusConfig[localTask.status].label}
                      </Badge>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              "w-2 h-2 rounded-full",
                              config.className.split(" ")[0]
                            )}
                          />
                          {config.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase">
                  Prioridade
                </label>
                <Select
                  value={localTask.priority}
                  onValueChange={handlePriorityChange}
                >
                  <SelectTrigger>
                    <SelectValue>
                      <div className="flex items-center gap-2">
                        <Flag
                          className={cn(
                            "h-4 w-4",
                            localTask.priority === "high"
                              ? "text-red-500"
                              : localTask.priority === "medium"
                              ? "text-amber-500"
                              : "text-green-500"
                          )}
                        />
                        <span className="capitalize">
                          {localTask.priority === "high"
                            ? "Alta"
                            : localTask.priority === "medium"
                            ? "Média"
                            : "Baixa"}
                        </span>
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">
                      <div className="flex gap-2 items-center">
                        <Flag className="w-3 h-3 text-red-500" /> Alta
                      </div>
                    </SelectItem>
                    <SelectItem value="medium">
                      <div className="flex gap-2 items-center">
                        <Flag className="w-3 h-3 text-amber-500" /> Média
                      </div>
                    </SelectItem>
                    <SelectItem value="low">
                      <div className="flex gap-2 items-center">
                        <Flag className="w-3 h-3 text-green-500" /> Baixa
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase">
                  Data de Entrega
                </label>
                {isEditing ? (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {editDate
                          ? format(editDate, "dd/MM/yyyy")
                          : "Selecione"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={editDate}
                        onSelect={setEditDate}
                        locale={ptBR}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                ) : (
                  <div className="flex items-center gap-2 text-sm p-2 border rounded-md bg-muted/20">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {localTask.dueDate
                        ? format(localTask.dueDate, "dd 'de' MMM, yyyy", {
                            locale: ptBR,
                          })
                        : "Sem prazo"}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase">
                  Responsáveis
                </label>
                <div className="flex -space-x-2 pt-1 pl-1">
                  {localTask.owners.map((owner) => (
                    <Avatar
                      key={owner.id}
                      className="h-8 w-8 border-2 border-card"
                      title={owner.name}
                    >
                      <AvatarImage
                        src={owner.avatar || "/placeholder.svg"}
                        className="object-cover"
                      />
                      <AvatarFallback>{owner.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Chat Area */}
          <div className="p-4 bg-muted/10 min-h-[300px]">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-4">
              Atividade
            </h3>
            <div className="space-y-4">
              {localTask.messages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm italic border-2 border-dashed rounded-lg">
                  Nenhuma atualização ainda.
                </div>
              ) : (
                localTask.messages.map((message) => {
                  const user = getUserInfo(message.userId);
                  return (
                    <div key={message.id} className="flex gap-3 group">
                      <Avatar className="h-8 w-8 shrink-0 mt-0.5">
                        <AvatarImage
                          src={user.avatar || "/placeholder.svg"}
                          className="object-cover"
                        />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <span className="font-semibold text-sm">
                            {user.name}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {formatDistanceToNow(message.timestamp, {
                              addSuffix: true,
                              locale: ptBR,
                            })}
                          </span>
                        </div>

                        {message.type === "text" && (
                          <div className="mt-1 p-2.5 bg-card border rounded-lg rounded-tl-none shadow-sm text-sm">
                            <p className="whitespace-pre-wrap">
                              {message.content}
                            </p>
                          </div>
                        )}

                        {message.type === "image" && (
                          <div className="mt-1">
                            <a
                              href={message.imageUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <img
                                src={message.imageUrl}
                                alt="Anexo"
                                className="rounded-lg max-w-[200px] border hover:opacity-90 transition-opacity"
                              />
                            </a>
                          </div>
                        )}

                        {message.type === "audio" && (
                          <div className="mt-1 p-2 bg-card border rounded-lg rounded-tl-none flex items-center gap-2">
                            <Mic className="h-4 w-4 text-primary" />
                            <audio
                              controls
                              src={message.audioUrl}
                              className="h-8 w-48"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-border bg-background">
          <div className="flex items-end gap-2 bg-muted/30 rounded-xl p-2 border focus-within:ring-1 ring-primary/20 transition-all">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0 rounded-lg text-muted-foreground hover:text-primary"
              onClick={() => fileInputRef.current?.click()}
              disabled={isSending}
            >
              <Paperclip className="h-5 w-5" />
            </Button>
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Digite uma mensagem ou atualização..."
              className="flex-1 min-h-[36px] max-h-32 border-0 bg-transparent focus-visible:ring-0 shadow-none resize-none py-2 text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              disabled={isSending}
              rows={1}
            />
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*,audio/*,.pdf"
              onChange={handleFileUpload}
            />
            <Button
              size="icon"
              className="h-9 w-9 shrink-0 rounded-lg bg-primary hover:bg-primary/90 shadow-sm"
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || isSending}
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
