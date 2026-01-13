"use client";

import { useState, useEffect } from "react";
import { X, Calendar as CalendarIcon, MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useUser } from "@/contexts/user-context";
import { TaskService } from "@/services/task-service";
import { type User } from "@/lib/data"; // Importando User diretamente

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

type EventType = "reuniao" | "evento" | "saude";

export function EventModal({ isOpen, onClose, onSave }: EventModalProps) {
  const { currentUser } = useUser();
  const [title, setTitle] = useState("");
  const [type, setType] = useState<EventType>("reuniao");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [selectedParticipants, setSelectedParticipants] = useState<User[]>([]);

  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      TaskService.getAllUsers().then(setAllUsers);
      if (currentUser && selectedParticipants.length === 0) {
        setSelectedParticipants([currentUser]);
      }
    }
  }, [isOpen, currentUser]); // Removido selectedParticipants do array de dependência para evitar loop

  const toggleParticipant = (user: User) => {
    setSelectedParticipants((prev) => {
      const exists = prev.find((p) => p.id === user.id);
      if (exists) return prev.filter((p) => p.id !== user.id);
      return [...prev, user];
    });
  };

  const handleSubmit = async () => {
    if (!title || !date || !currentUser) return;
    setIsSubmitting(true);

    try {
      await TaskService.createEvent(
        {
          title,
          type,
          date,
          startTime,
          endTime,
          location,
          description,
          participants: selectedParticipants,
          isGeneral: type === "evento",
          teamId: currentUser.teamId,
        },
        currentUser.id
      );

      onSave();
      handleClose();
    } catch (error) {
      console.error(error);
      alert("Erro ao criar evento");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Limpar formulário ao fechar
    setTitle("");
    setDescription("");
    setLocation("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
      <div className="relative bg-card rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Novo Evento</h2>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          <div className="space-y-2">
            <Label>Título *</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Reunião de Alinhamento"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo</Label>
              {/* Correção do erro de tipo no Select */}
              <Select
                value={type}
                onValueChange={(v) => setType(v as EventType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reuniao">Reunião</SelectItem>
                  <SelectItem value="evento">Evento</SelectItem>
                  <SelectItem value="saude">Saúde</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Data *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "dd/MM/yyyy") : "Selecione"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    locale={ptBR}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Início</Label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Fim</Label>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Local / Link</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Sala 1 ou Google Meet"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Participantes</Label>
            <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[3rem] bg-muted/20">
              {allUsers.map((user) => {
                const isSelected = selectedParticipants.some(
                  (p) => p.id === user.id
                );
                return (
                  <Badge
                    key={user.id}
                    variant={isSelected ? "default" : "outline"}
                    className="cursor-pointer flex items-center gap-1 hover:bg-primary/80"
                    onClick={() => toggleParticipant(user)}
                  >
                    {user.name}
                    {isSelected && <X className="h-3 w-3 ml-1" />}
                  </Badge>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>
        </div>

        <div className="p-4 border-t flex justify-end gap-2 bg-muted/20">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!title || !date || isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Criar Evento"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
