"use client";

import { useState, useEffect } from "react";
import { X, Users, AlignLeft, Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Team, User } from "@/lib/data";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TaskService } from "@/services/task-service";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, description: string) => Promise<void>;
  teamToEdit?: Team | null;
}

export function CreateTeamModal({
  isOpen,
  onClose,
  onCreate,
  teamToEdit,
}: CreateTeamModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Gerenciamento de Membros
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedUserToAdd, setSelectedUserToAdd] = useState("");
  const [teamMembers, setTeamMembers] = useState<User[]>([]);

  useEffect(() => {
    if (isOpen) {
      const loadUsers = async () => {
        const users = await TaskService.getAllUsers();
        setAllUsers(users);
      };
      loadUsers();

      if (teamToEdit) {
        setName(teamToEdit.name);
        setDescription(teamToEdit.description);
        setTeamMembers(teamToEdit.members || []);
      } else {
        setName("");
        setDescription("");
        setTeamMembers([]);
      }
    }
  }, [isOpen, teamToEdit]);

  // Filtra usuários que NÃO estão na equipe (e não são gestores, pois gestores já estão em todas)
  const availableUsers = allUsers.filter(
    (u) => !teamMembers.some((m) => m.id === u.id) && u.role !== "gestor"
  );

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setIsSubmitting(true);
    try {
      await onCreate(name, description);
      handleClose();
    } catch (error) {
      console.error("Erro ao salvar equipe", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddMember = async () => {
    if (!selectedUserToAdd || !teamToEdit) return;

    try {
      await TaskService.addMemberToTeam(selectedUserToAdd, teamToEdit.id);

      // Atualiza estado local
      const user = allUsers.find((u) => u.id === selectedUserToAdd);
      if (user) {
        setTeamMembers([...teamMembers, user]);
        setSelectedUserToAdd("");
        toast.success(`${user.name} adicionado à equipe.`);
      }
    } catch (error) {
      toast.error("Erro ao adicionar membro.");
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!teamToEdit) return;

    try {
      await TaskService.removeMemberFromTeam(userId);
      setTeamMembers(teamMembers.filter((m) => m.id !== userId));
      toast.success("Membro removido da equipe.");
    } catch (error) {
      toast.error("Erro ao remover membro.");
    }
  };

  const handleClose = () => {
    setName("");
    setDescription("");
    setSelectedUserToAdd("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
      <div className="relative bg-card rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-border shrink-0">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              {teamToEdit ? "Gerenciar Equipe" : "Nova Equipe"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {teamToEdit ? "Edite detalhes e membros" : "Crie um novo setor"}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-6 space-y-6">
            {/* Dados Básicos */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="team-name" className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  Nome da Equipe *
                </Label>
                <Input
                  id="team-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Marketing"
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="team-desc" className="flex items-center gap-2">
                  <AlignLeft className="h-4 w-4 text-muted-foreground" />
                  Descrição
                </Label>
                <Textarea
                  id="team-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descrição da equipe..."
                  rows={2}
                  className="bg-background resize-none"
                />
              </div>
            </div>

            {/* Gestão de Membros (Apenas se estiver editando) */}
            {teamToEdit && (
              <div className="space-y-4 pt-4 border-t border-border">
                <h3 className="font-semibold text-sm">Membros da Equipe</h3>

                {/* Adicionar Membro */}
                <div className="flex gap-2">
                  <Select
                    value={selectedUserToAdd}
                    onValueChange={setSelectedUserToAdd}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Selecione um membro para adicionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableUsers.length === 0 ? (
                        <SelectItem value="none" disabled>
                          Nenhum membro disponível
                        </SelectItem>
                      ) : (
                        availableUsers.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleAddMember}
                    disabled={!selectedUserToAdd}
                    variant="secondary"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Lista de Membros */}
                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                  {teamMembers.filter((m) => m.role !== "gestor").length ===
                    0 && (
                    <p className="text-sm text-muted-foreground italic text-center py-2">
                      Nenhum membro exclusivo nesta equipe.
                    </p>
                  )}

                  {teamMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-2 rounded-lg border bg-muted/20"
                    >
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback>
                            {member.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">
                            {member.name}
                          </span>
                          <span className="text-[10px] text-muted-foreground uppercase">
                            {member.role}
                          </span>
                        </div>
                      </div>
                      {member.role !== "gestor" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:bg-destructive/10 h-8 w-8"
                          onClick={() => handleRemoveMember(member.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                      {member.role === "gestor" && (
                        <span className="text-xs text-muted-foreground pr-2">
                          (Padrão)
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

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
            disabled={!name.trim() || isSubmitting}
            className="bg-primary hover:bg-primary/90"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : teamToEdit ? (
              "Salvar Alterações"
            ) : (
              "Criar Equipe"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
