"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { criarSalaInterna } from "@/services/foto-caixa-service";
import { useToast } from "@/components/ui/use-toast";

interface CreateSalaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateFotoCaixaSalaModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateSalaModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [calendarRoomId, setCalendarRoomId] = useState("");

  const handleSave = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      await criarSalaInterna(name, calendarRoomId || undefined);
      toast({
        title: "Sucesso!",
        description: "Sala interna criada com sucesso.",
      });
      setName("");
      setCalendarRoomId("");
      onSuccess();
      onClose();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível criar a sala.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova Sala Interna</DialogTitle>
          <DialogDescription>
            Crie uma sala para o seu controlo de stock e faturação. Esta sala
            não aparecerá no site público.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Nome da Sala (ex: Sala 01 - Estética)</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Sala 01"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="calendarId">
              ID da Sala no Calendário (Opcional)
            </Label>
            <Input
              id="calendarId"
              value={calendarRoomId}
              onChange={(e) => setCalendarRoomId(e.target.value)}
              placeholder="Cole o ID real da sala para puxar as horas vendidas..."
            />
            <p className="text-xs text-muted-foreground">
              Se deixar em branco, o sistema não vai abater as horas
              automaticamente do calendário.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading || !name.trim()}>
            {loading ? "A guardar..." : "Criar Sala"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
