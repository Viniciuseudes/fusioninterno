"use client";

import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, ChevronRight, MapPin, Loader2 } from "lucide-react";
import { format, isSameDay, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { type Task, type CalendarEvent } from "@/lib/data";
import { useUser } from "@/contexts/user-context";
import { TaskService } from "@/services/task-service";
import { EventModal } from "@/components/event-modal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface FullCalendarViewProps {
  onTaskClick: (task: Task) => void;
}

export function FullCalendarView({ onTaskClick }: FullCalendarViewProps) {
  const { currentUser } = useUser();

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );

  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);

  const loadData = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      const [fetchedTasks, fetchedEvents] = await Promise.all([
        TaskService.getTasks(currentUser),
        TaskService.getEvents(currentUser),
      ]);
      setTasks(fetchedTasks);
      setEvents(fetchedEvents);
    } catch (e) {
      console.error("Erro ao carregar dados do calendário", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  // Filtrar itens do dia selecionado
  const selectedDayItems = {
    tasks: tasks.filter(
      (t) => selectedDate && t.dueDate && isSameDay(t.dueDate, selectedDate)
    ),
    events: events.filter(
      (e) => selectedDate && e.date && isSameDay(e.date, selectedDate)
    ),
  };

  // Função para renderizar as "bolinhas" no calendário
  const renderDayIndicators = (day: Date) => {
    const dayTasks = tasks.filter(
      (t) => t.dueDate && isSameDay(t.dueDate, day)
    );
    const dayEvents = events.filter((e) => e.date && isSameDay(e.date, day));

    if (dayTasks.length === 0 && dayEvents.length === 0) return null;

    return (
      <div className="flex gap-1 justify-center mt-1 absolute bottom-1 left-0 right-0">
        {dayEvents.slice(0, 3).map((_, i) => (
          <div
            key={`evt-${i}`}
            className="h-1.5 w-1.5 rounded-full bg-blue-500"
          />
        ))}
        {dayTasks.slice(0, 3).map((_, i) => (
          <div
            key={`tsk-${i}`}
            className="h-1.5 w-1.5 rounded-full bg-amber-500"
          />
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="animate-spin text-primary h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {/* Coluna Esquerda: Calendário Navegável */}
      <Card className="flex-1 lg:max-w-md h-fit shadow-sm">
        <CardContent className="p-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            locale={ptBR}
            className="rounded-md border shadow-sm w-full flex justify-center"
            classNames={{
              day: "h-12 w-12 p-0 font-normal aria-selected:opacity-100 relative",
              day_selected:
                "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
              day_today: "bg-accent text-accent-foreground",
            }}
            // CORREÇÃO AQUI: Casting "as any" para resolver o conflito de tipo
            components={
              {
                DayContent: ({ date }: any) => (
                  <div className="w-full h-full flex items-center justify-center relative z-10">
                    <span>{date.getDate()}</span>
                    {renderDayIndicators(date)}
                  </div>
                ),
              } as any
            }
          />

          <div className="mt-6 space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
              Legenda
            </h3>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-blue-500" />
                <span>Eventos / Reuniões</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-amber-500" />
                <span>Entregas de Tarefas</span>
              </div>
            </div>

            <Button
              className="w-full mt-4"
              onClick={() => setIsEventModalOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" /> Novo Evento
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Coluna Direita: Agenda do Dia */}
      <div className="flex-1 space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <h2 className="text-2xl font-bold capitalize">
            {selectedDate
              ? format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })
              : "Selecione uma data"}
          </h2>
          {selectedDate && isToday(selectedDate) && <Badge>Hoje</Badge>}
        </div>

        <div className="space-y-8">
          {/* Seção de Eventos */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              Agenda
            </h3>

            {selectedDayItems.events.length === 0 ? (
              <div className="p-4 border border-dashed rounded-lg text-center text-muted-foreground text-sm">
                Nenhum evento agendado para este dia.
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDayItems.events.map((event) => (
                  <Card
                    key={event.id}
                    className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-4 flex gap-4">
                      <div className="flex flex-col items-center justify-center px-2 border-r pr-4 min-w-[80px]">
                        <span className="text-sm font-bold text-foreground">
                          {event.startTime}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {event.endTime}
                        </span>
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-base">{event.title}</h4>
                          <Badge
                            variant="outline"
                            className="capitalize text-xs"
                          >
                            {event.type}
                          </Badge>
                        </div>

                        {event.location && (
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5" />
                            <span>{event.location}</span>
                          </div>
                        )}

                        {event.description && (
                          <p className="text-sm text-muted-foreground border-l-2 pl-2 border-muted">
                            {event.description}
                          </p>
                        )}

                        {event.participants &&
                          event.participants.length > 0 && (
                            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-dashed">
                              <span className="text-xs text-muted-foreground">
                                Participantes:
                              </span>
                              <div className="flex -space-x-2">
                                {event.participants.map((p, idx) => (
                                  <Avatar
                                    key={idx}
                                    className="h-6 w-6 border-2 border-background"
                                    title={p.name}
                                  >
                                    <AvatarImage src={p.avatar} />
                                    <AvatarFallback className="text-[9px]">
                                      {p.name?.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                ))}
                              </div>
                            </div>
                          )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Seção de Tarefas */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-amber-500" />
              Entregas de Tarefas
            </h3>

            {selectedDayItems.tasks.length === 0 ? (
              <div className="p-4 border border-dashed rounded-lg text-center text-muted-foreground text-sm">
                Nenhuma tarefa para entregar hoje.
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDayItems.tasks.map((task) => (
                  <Card
                    key={task.id}
                    className="border-l-4 border-l-amber-500 cursor-pointer hover:bg-muted/50 transition-colors shadow-sm"
                    onClick={() => onTaskClick(task)}
                  >
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="space-y-1">
                        <h4 className="font-medium text-base">{task.name}</h4>
                        <div className="flex items-center gap-3">
                          <Badge
                            variant={
                              task.status === "done" ? "default" : "secondary"
                            }
                            className="text-xs capitalize"
                          >
                            {task.status === "done"
                              ? "Concluído"
                              : task.status === "working"
                              ? "Em Andamento"
                              : task.status === "stuck"
                              ? "Bloqueado"
                              : "Pendente"}
                          </Badge>

                          {task.owners && task.owners.length > 0 && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              Responsável: {task.owners[0].name}
                              {task.owners.length > 1 &&
                                ` +${task.owners.length - 1}`}
                            </span>
                          )}
                        </div>
                      </div>
                      <Button variant="ghost" size="icon">
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <EventModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        onSave={loadData}
      />
    </div>
  );
}
