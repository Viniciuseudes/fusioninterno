"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, HeartPulse, PartyPopper, Users, MapPin, Clock } from "lucide-react"
import type { CalendarEvent, CalendarEventType } from "@/lib/data"
import { cn } from "@/lib/utils"

interface EventModalProps {
  open: boolean
  onClose: () => void
  onSave: (event: Omit<CalendarEvent, "id" | "createdBy">) => void
  selectedDate?: Date
}

const eventTypeConfig = {
  saude: {
    label: "Saúde",
    icon: HeartPulse,
    color: "bg-emerald-500",
    lightColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  },
  evento: {
    label: "Evento",
    icon: PartyPopper,
    color: "bg-purple-500",
    lightColor: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  },
  reuniao: {
    label: "Reunião",
    icon: Users,
    color: "bg-blue-500",
    lightColor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  },
}

export function EventModal({ open, onClose, onSave, selectedDate }: EventModalProps) {
  const [title, setTitle] = useState("")
  const [type, setType] = useState<CalendarEventType>("reuniao")
  const [date, setDate] = useState(selectedDate ? selectedDate.toISOString().split("T")[0] : "")
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState("")
  const [isGeneral, setIsGeneral] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !date) return

    onSave({
      title,
      type,
      date: new Date(date),
      startTime: startTime || undefined,
      endTime: endTime || undefined,
      description: description || undefined,
      location: location || undefined,
      isGeneral,
    })

    // Reset form
    setTitle("")
    setType("reuniao")
    setDate("")
    setStartTime("")
    setEndTime("")
    setDescription("")
    setLocation("")
    setIsGeneral(false)
    onClose()
  }

  const TypeIcon = eventTypeConfig[type].icon

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Novo Evento no Calendário
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tipo de Evento */}
          <div className="space-y-2">
            <Label>Tipo de Evento</Label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(eventTypeConfig) as CalendarEventType[]).map((eventType) => {
                const config = eventTypeConfig[eventType]
                const Icon = config.icon
                return (
                  <button
                    key={eventType}
                    type="button"
                    onClick={() => setType(eventType)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-3 rounded-lg border transition-all",
                      type === eventType ? config.lightColor + " border-2" : "bg-muted/50 border-border hover:bg-muted",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-xs font-medium">{config.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                type === "saude"
                  ? "Ex: Exame de Saúde Ocupacional"
                  : type === "evento"
                    ? "Ex: Confraternização de Fim de Ano"
                    : "Ex: Reunião de Alinhamento"
              }
              required
            />
          </div>

          {/* Data e Horário */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="date">Data *</Label>
              <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startTime">Início</Label>
              <Input id="startTime" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">Término</Label>
              <Input id="endTime" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </div>
          </div>

          {/* Local */}
          <div className="space-y-2">
            <Label htmlFor="location">Local</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ex: Sala de Reuniões A, Auditório, Online"
                className="pl-10"
              />
            </div>
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalhes adicionais sobre o evento..."
              rows={3}
            />
          </div>

          {/* Visibilidade */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isGeneral"
              checked={isGeneral}
              onChange={(e) => setIsGeneral(e.target.checked)}
              className="h-4 w-4 rounded border-border bg-muted accent-primary"
            />
            <Label htmlFor="isGeneral" className="text-sm cursor-pointer">
              Evento geral (visível para toda a empresa)
            </Label>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="gap-2">
              <TypeIcon className="h-4 w-4" />
              Criar {eventTypeConfig[type].label}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Componente para visualizar detalhes de um evento
interface EventDetailModalProps {
  event: CalendarEvent | null
  open: boolean
  onClose: () => void
  onDelete?: (id: string) => void
}

export function EventDetailModal({ event, open, onClose, onDelete }: EventDetailModalProps) {
  if (!event) return null

  const config = eventTypeConfig[event.type]
  const Icon = config.icon

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] bg-card border-border">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className={cn("p-2 rounded-lg w-fit", config.lightColor)}>
              <Icon className="h-5 w-5" />
            </div>
          </div>
          <DialogTitle className="text-xl mt-2">{event.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Badge de tipo */}
          <div
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
              config.lightColor,
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {config.label}
            {event.isGeneral && (
              <span className="ml-1 px-1.5 py-0.5 bg-primary/20 text-primary rounded text-[10px]">Geral</span>
            )}
          </div>

          {/* Data e Horário */}
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>
              {event.date.toLocaleDateString("pt-BR", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>

          {(event.startTime || event.endTime) && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>
                {event.startTime && event.startTime}
                {event.startTime && event.endTime && " - "}
                {event.endTime && event.endTime}
              </span>
            </div>
          )}

          {event.location && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{event.location}</span>
            </div>
          )}

          {event.description && (
            <div className="pt-2 border-t border-border">
              <p className="text-sm text-muted-foreground">{event.description}</p>
            </div>
          )}

          {event.participants && event.participants.length > 0 && (
            <div className="pt-2 border-t border-border">
              <p className="text-xs font-medium text-muted-foreground mb-2">Participantes</p>
              <div className="flex flex-wrap gap-2">
                {event.participants.map((participant) => (
                  <div key={participant.id} className="flex items-center gap-2 px-2 py-1 bg-muted rounded-full text-xs">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-medium">
                      {participant.name.charAt(0)}
                    </div>
                    {participant.name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          {onDelete && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => {
                onDelete(event.id)
                onClose()
              }}
            >
              Excluir
            </Button>
          )}
          <Button type="button" variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
