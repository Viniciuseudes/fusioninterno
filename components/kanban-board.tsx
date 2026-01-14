"use client";

import { useMemo, useState } from "react";
import { Task } from "@/lib/data";
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  DragEndEvent,
  DragStartEvent,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface KanbanBoardProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onTaskUpdate?: (task: Task) => void;
}

const columns = [
  { id: "pending", title: "Pendente", color: "bg-status-pending" },
  { id: "working", title: "Em Andamento", color: "bg-status-working" },
  { id: "stuck", title: "Bloqueado", color: "bg-status-stuck" },
  { id: "done", title: "Concluído", color: "bg-status-done" },
];

export function KanbanBoard({
  tasks,
  onTaskClick,
  onTaskUpdate,
}: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const tasksByStatus = useMemo(() => {
    const acc: Record<string, Task[]> = {
      pending: [],
      working: [],
      stuck: [],
      done: [],
    };
    tasks.forEach((task) => {
      if (acc[task.status]) {
        acc[task.status].push(task);
      }
    });
    return acc;
  }, [tasks]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      return;
    }

    const taskId = active.id as string;
    const newStatus = over.id as any;

    const currentTask = tasks.find((t) => t.id === taskId);

    if (currentTask && currentTask.status !== newStatus) {
      if (["pending", "working", "stuck", "done"].includes(newStatus)) {
        if (onTaskUpdate) {
          onTaskUpdate({ ...currentTask, status: newStatus });
        }
      }
    }

    setActiveId(null);
  };

  const activeTask = tasks.find((t) => t.id === activeId);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-full gap-4 overflow-x-auto pb-4">
        {columns.map((column) => (
          <div
            key={column.id}
            className="flex h-full min-w-[280px] w-[280px] flex-col rounded-lg bg-muted/50 border border-border"
          >
            <div className="flex items-center justify-between p-4 border-b border-border bg-card/50 rounded-t-lg">
              <div className="flex items-center gap-2">
                <div className={cn("h-3 w-3 rounded-full", column.color)} />
                <span className="font-medium text-sm">{column.title}</span>
                <Badge variant="secondary" className="ml-1 text-xs">
                  {tasksByStatus[column.id]?.length || 0}
                </Badge>
              </div>
            </div>

            <DroppableColumn id={column.id}>
              <div className="flex flex-col gap-3 p-3 min-h-[150px]">
                {tasksByStatus[column.id]?.map((task) => (
                  <KanbanCard
                    key={task.id}
                    task={task}
                    onClick={() => onTaskClick(task)}
                  />
                ))}
              </div>
            </DroppableColumn>
          </div>
        ))}
      </div>

      <DragOverlay>
        {activeTask ? <KanbanCard task={activeTask} isOverlay /> : null}
      </DragOverlay>
    </DndContext>
  );
}

function DroppableColumn({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  const { setNodeRef } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className="flex-1 overflow-y-auto">
      {children}
    </div>
  );
}

function KanbanCard({
  task,
  onClick,
  isOverlay,
}: {
  task: Task;
  onClick?: () => void;
  isOverlay?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: task.id,
      data: { task },
    });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={onClick}
      className={cn(
        "cursor-grab active:cursor-grabbing hover:shadow-md transition-all",
        isDragging ? "opacity-50" : "",
        isOverlay ? "shadow-xl rotate-2 cursor-grabbing" : ""
      )}
    >
      <CardContent className="p-3 space-y-3">
        <div className="flex justify-between items-start gap-2">
          <span
            className={cn(
              "text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase",
              task.priority === "high"
                ? "bg-red-500/10 text-red-500 border-red-500/20"
                : task.priority === "medium"
                ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                : "bg-green-500/10 text-green-500 border-green-500/20"
            )}
          >
            {task.priority === "high"
              ? "Alta"
              : task.priority === "medium"
              ? "Média"
              : "Baixa"}
          </span>
          {task.teamId === "general" && (
            <Badge variant="outline" className="text-[10px] h-5">
              Geral
            </Badge>
          )}
        </div>

        <p className="text-sm font-medium leading-snug line-clamp-2">
          {task.name}
        </p>

        <div className="flex items-center justify-between pt-1">
          <div className="flex -space-x-1.5">
            {task.owners.slice(0, 3).map((owner) => (
              <Avatar
                key={owner.id}
                className="h-5 w-5 border border-background"
              >
                <AvatarImage src={owner.avatar} />
                <AvatarFallback className="text-[9px]">
                  {owner.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>

          <div className="flex items-center gap-3 text-muted-foreground">
            {task.messages.length > 0 && (
              <div className="flex items-center gap-1 text-xs">
                <MessageSquare className="h-3 w-3" />
                <span>{task.messages.length}</span>
              </div>
            )}
            <div className="flex items-center gap-1 text-xs">
              <Calendar className="h-3 w-3" />
              <span>{format(task.dueDate, "dd/MM")}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
