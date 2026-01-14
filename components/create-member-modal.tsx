"use client";

import { useState, useEffect } from "react";
import { X, User, Mail, Shield, Users, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TaskService } from "@/services/task-service";
import { Team } from "@/lib/data";
import { toast } from "sonner"; // Usando Sonner para feedback melhor

interface CreateMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (member: any) => Promise<void>;
}

export function CreateMemberModal({
  isOpen,
  onClose,
  onCreate,
}: CreateMemberModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"gestor" | "membro">("membro");
  const [teamId, setTeamId] = useState("");
  const [teams, setTeams] = useState<Team[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingTeams, setIsLoadingTeams] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const loadTeams = async () => {
        setIsLoadingTeams(true);
        try {
          const data = await TaskService.getTeams();
          setTeams(data);
          if (data.length > 0) setTeamId(data[0].id);
        } catch (error) {
          console.error(error);
        } finally {
          setIsLoadingTeams(false);
        }
      };
      loadTeams();
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim() || !teamId) return;
    setIsSubmitting(true);
    try {
      await onCreate({ name, email, role, teamId });
      handleClose();
    } catch (error: any) {
      console.error("Erro ao cadastrar membro", error);
      // Feedback mais específico para o usuário
      if (error.code === "23505") {
        toast.error("Este e-mail já está cadastrado.");
      } else if (error.code === "23503") {
        toast.error(
          "Erro de permissão no banco de dados (FK). Contate o suporte."
        );
      } else {
        toast.error("Erro ao cadastrar membro. Tente novamente.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setName("");
    setEmail("");
    setRole("membro");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
      <div className="relative bg-card rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Cadastrar Membro
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Adicione um novo colaborador manualmente
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              Nome Completo *
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: João Silva"
              className="bg-background"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              E-mail Corporativo *
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="joao@empresa.com"
              className="bg-background"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                Permissão
              </Label>
              <Select
                value={role}
                onValueChange={(v) => setRole(v as "gestor" | "membro")}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="membro">Membro</SelectItem>
                  <SelectItem value="gestor">Gestor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                Equipe
              </Label>
              <Select
                value={teamId}
                onValueChange={setTeamId}
                disabled={isLoadingTeams}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue
                    placeholder={isLoadingTeams ? "Carregando..." : "Selecione"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-border bg-muted/30">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!name.trim() || !email.trim() || !teamId || isSubmitting}
            className="bg-primary hover:bg-primary/90"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              "Cadastrar"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
