"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { editarSalaInterna } from "@/services/foto-caixa-service";
import { useToast } from "@/components/ui/use-toast";
import { FotoCaixaSala } from "@/types";

interface EditSalaModalProps {
  isOpen: boolean;
  onClose: () => void;
  sala: FotoCaixaSala | null;
  onSuccess: () => void;
}

export function EditFotoCaixaSalaModal({
  isOpen,
  onClose,
  sala,
  onSuccess,
}: EditSalaModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [calendarRoomId, setCalendarRoomId] = useState("");

  useEffect(() => {
    if (sala) {
      setName(sala.name);
      setCalendarRoomId(sala.calendar_room_id || "");
    }
  }, [sala]);

  const handleSave = async () => {
    if (!sala || !name.trim()) return;
    setLoading(true);
    try {
      await editarSalaInterna(sala.id, name, calendarRoomId || undefined);
      toast({ title: "Sucesso!", description: "Sala atualizada com sucesso." });
      onSuccess();
      onClose();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a sala.",
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
          <DialogTitle>Editar Sala Interna</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Label>Nome da Sala</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label>ID da Sala no Calendário (Opcional)</Label>
            <Input
              value={calendarRoomId}
              onChange={(e) => setCalendarRoomId(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading || !name.trim()}>
            Guardar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
