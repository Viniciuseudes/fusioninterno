"use client";

import { useState, useEffect } from "react";
import {
  X,
  CalendarIcon,
  Users,
  Flag,
  FileText,
  Building2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { type Task, type User, type Team } from "@/lib/data";
import { useUser } from "@/contexts/user-context";
import { TaskService } from "@/services/task-service";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTask: (task: Task) => void;
}

export function CreateTaskModal({
  isOpen,
  onClose,
  onCreateTask,
}: CreateTaskModalProps) {
  const { currentUser, isGestor } = useUser();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"high" | "medium" | "low">("medium");
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [selectedOwners, setSelectedOwners] = useState<User[]>([]);
  const [isGeneral, setIsGeneral] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados para dados reais do banco
  const [teams, setTeams] = useState<Team[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Carregar dados ao abrir o modal
  useEffect(() => {
    if (isOpen && currentUser) {
      setSelectedOwners([currentUser]);
      setSelectedTeam(currentUser.teamId || "");

      const fetchData = async () => {
        setIsLoadingData(true);
        try {
          const [fetchedTeams, fetchedUsers] = await Promise.all([
            TaskService.getTeams(),
            TaskService.getAllUsers(),
          ]);
          setTeams(fetchedTeams);
          setAllUsers(fetchedUsers);
        } catch (error) {
          console.error("Erro ao carregar dados", error);
        } finally {
          setIsLoadingData(false);
        }
      };
      fetchData();
    }
  }, [isOpen, currentUser]);

  // Filtrar equipes disponíveis
  const availableTeams = isGestor
    ? teams
    : teams.filter((t) => t.id === currentUser?.teamId);

  // Filtrar membros: se for geral, mostra todos; senão, mostra só da equipe selecionada + gestores
  const availableMembers = isGeneral
    ? allUsers
    : allUsers.filter((u) => u.teamId === selectedTeam || u.role === "gestor");

  const toggleOwner = (user: User) => {
    setSelectedOwners((prev) => {
      const exists = prev.find((o) => o.id === user.id);
      if (exists) return prev.filter((o) => o.id !== user.id);
      return [...prev, user];
    });
  };

  const handleSubmit = async () => {
    if (!name.trim() || !dueDate) return;
    setIsSubmitting(true);

    // Prepara objeto limpo para envio
    const newTask: Task = {
      id: "", // Será gerado pelo banco
      name,
      description,
      status: "pending",
      priority,
      owners: selectedOwners,
      dueDate,
      teamId: isGeneral ? "general" : selectedTeam,
      isGeneral,
      messages: [],
    };

    await onCreateTask(newTask); // A função pai (Home) lida com a chamada ao serviço
    setIsSubmitting(false);
    handleClose();
  };

  const handleClose = () => {
    setName("");
    setDescription("");
    setPriority("medium");
    setDueDate(undefined);
    if (currentUser) setSelectedTeam(currentUser.teamId || "");
    if (currentUser) setSelectedOwners([currentUser]);
    setIsGeneral(false);
    onClose();
  };

  if (!isOpen || !currentUser) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
      <div className="relative bg-card rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border shrink-0">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Criar Nova Demanda
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Crie uma tarefa para você ou para outras equipes
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {isLoadingData ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Nome da demanda */}
              <div className="space-y-2">
                <Label htmlFor="task-name" className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  Nome da Demanda *
                </Label>
                <Input
                  id="task-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Elaborar relatório mensal de vendas"
                  className="bg-background"
                />
              </div>

              {/* Descrição */}
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descreva os detalhes da demanda..."
                  rows={3}
                  className="bg-background resize-none"
                />
              </div>

              {/* Demanda Geral */}
              <div className="flex items-center space-x-3 p-4 rounded-lg bg-muted/50">
                <Checkbox
                  id="is-general"
                  checked={isGeneral}
                  onCheckedChange={(checked) => {
                    setIsGeneral(checked as boolean);
                    if (checked) {
                      setSelectedTeam("general");
                    } else {
                      setSelectedTeam(currentUser.teamId || "");
                    }
                  }}
                />
                <div className="flex-1">
                  <Label
                    htmlFor="is-general"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Building2 className="h-4 w-4 text-primary" />
                    Demanda Geral da Empresa
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Visível para todos os colaboradores, independente do setor
                  </p>
                </div>
              </div>

              {/* Equipe destino */}
              {!isGeneral && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    Equipe Destino
                  </Label>
                  <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Selecione a equipe" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTeams.length === 0 ? (
                        <div className="p-2 text-sm text-muted-foreground">
                          Nenhuma equipe encontrada
                        </div>
                      ) : (
                        availableTeams.map((team) => (
                          <SelectItem key={team.id} value={team.id}>
                            <div className="flex items-center gap-2">
                              <span>{team.name}</span>
                              {team.id === currentUser.teamId && (
                                <Badge variant="outline" className="text-xs">
                                  Sua equipe
                                </Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Responsáveis */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  Responsáveis
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {availableMembers.map((user) => {
                    const isSelected = selectedOwners.find(
                      (o) => o.id === user.id
                    );
                    return (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => toggleOwner(user)}
                        className={`flex items-center gap-2 p-2 rounded-lg border transition-colors text-left ${
                          isSelected
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50 bg-background"
                        }`}
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={user.avatar || "/placeholder.svg"}
                            alt={user.name}
                          />
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {user.name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {teams.find((t) => t.id === user.teamId)?.name ||
                              "Geral"}
                          </p>
                        </div>
                        {isSelected && (
                          <div className="h-2 w-2 rounded-full bg-primary" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Prioridade */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Flag className="h-4 w-4 text-muted-foreground" />
                    Prioridade
                  </Label>
                  <Select
                    value={priority}
                    onValueChange={(v) =>
                      setPriority(v as "high" | "medium" | "low")
                    }
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="low">Baixa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Data de entrega */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    Data de Entrega *
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={`w-full justify-start text-left font-normal bg-background ${
                          !dueDate && "text-muted-foreground"
                        }`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dueDate
                          ? format(dueDate, "dd/MM/yyyy", { locale: ptBR })
                          : "Selecione"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dueDate}
                        onSelect={setDueDate}
                        locale={ptBR}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border bg-muted/30 shrink-0">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!name.trim() || !dueDate || isSubmitting}
            className="bg-primary hover:bg-primary/90"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando...
              </>
            ) : (
              "Criar Demanda"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
