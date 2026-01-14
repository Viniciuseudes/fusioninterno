"use client";

import { useState, useEffect } from "react";
import { X, Users, AlignLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Team } from "@/lib/data";

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, description: string) => Promise<void>;
  teamToEdit?: Team | null; // Adicionado para suportar edição
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

  // Preenche o formulário se estiver editando
  useEffect(() => {
    if (isOpen) {
      if (teamToEdit) {
        setName(teamToEdit.name);
        setDescription(teamToEdit.description);
      } else {
        setName("");
        setDescription("");
      }
    }
  }, [isOpen, teamToEdit]);

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

  const handleClose = () => {
    setName("");
    setDescription("");
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
              {teamToEdit ? "Editar Equipe" : "Nova Equipe"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {teamToEdit
                ? "Altere os dados da equipe"
                : "Crie um novo setor ou time"}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="team-name" className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              Nome da Equipe *
            </Label>
            <Input
              id="team-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Marketing Digital"
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
              placeholder="Descreva as responsabilidades desta equipe..."
              rows={3}
              className="bg-background resize-none"
            />
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
