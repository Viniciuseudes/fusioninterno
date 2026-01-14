"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { Sidebar } from "@/components/sidebar";
import { DashboardHeader } from "@/components/dashboard-header";
import { TaskTable } from "@/components/task-table";
import { KanbanBoard } from "@/components/kanban-board";
import { CalendarView } from "@/components/calendar-view";
import { TaskDetailModal } from "@/components/task-detail-modal";
import { MyTasksView } from "@/components/my-tasks-view";
import { InboxView } from "@/components/inbox-view";
import { TeamsView } from "@/components/teams-view";
import { FullCalendarView } from "@/components/full-calendar-view";
import { FindRoomView } from "@/components/find-room-view";
import { SettingsView } from "@/components/settings-view";
import { CreateTaskModal } from "@/components/create-task-modal";
import { type Task, sampleProject, getFilteredTasks } from "@/lib/data";
import { useUser } from "@/contexts/user-context";
import { Loader2 } from "lucide-react";
import { TaskService } from "@/services/task-service";
import { createClient } from "@/lib/supabase/client";

export default function Home() {
  const [activeView, setActiveView] = useState("dashboard");
  const [viewMode, setViewMode] = useState<"table" | "kanban" | "calendar">(
    "table"
  );
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);

  const { currentUser, isLoading: isUserLoading } = useUser();
  const supabase = createClient();

  const loadTasks = useCallback(async () => {
    if (!currentUser) return;
    try {
      const realTasks = await TaskService.getTasks(currentUser);
      setTasks(realTasks);
    } catch (error) {
      console.error("Falha ao carregar tarefas", error);
    } finally {
      setIsDataLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  useEffect(() => {
    if (!currentUser) return;

    const channel = supabase
      .channel("tasks-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tasks" },
        () => {
          loadTasks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser, supabase, loadTasks]);

  const filteredTasks = useMemo(() => {
    if (!currentUser) return [];
    return getFilteredTasks(tasks, currentUser);
  }, [tasks, currentUser]);

  const handleTaskUpdate = async (updatedTask: Task) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
    );

    if (selectedTask?.id === updatedTask.id) {
      setSelectedTask(updatedTask);
    }

    try {
      const current = tasks.find((t) => t.id === updatedTask.id);
      if (current?.status !== updatedTask.status) {
        await TaskService.updateStatus(updatedTask.id, updatedTask.status);
      } else {
        await TaskService.updateTask(updatedTask.id, updatedTask);
      }
    } catch (error) {
      console.error("Erro ao salvar atualização", error);
      loadTasks();
    }
  };

  const handleTaskDelete = async (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    setSelectedTask(null);
    try {
      await TaskService.deleteTask(taskId);
    } catch (error) {
      console.error("Erro ao deletar tarefa", error);
      loadTasks();
    }
  };

  const handleCreateTask = async (newTask: Task) => {
    if (!currentUser) return;

    // Optimistic add (se tiver ID temporário, senão espera o banco)
    // Aqui optamos por esperar o retorno do banco para garantir integridade do ID
    try {
      const createdTask = await TaskService.createTask(newTask, currentUser.id);
      setTasks((prev) => [createdTask, ...prev]);
    } catch (error) {
      alert("Erro ao criar tarefa no banco de dados.");
    }
  };

  const renderContent = () => {
    if (isDataLoading) {
      return (
        <div className="h-64 flex items-center justify-center">
          <Loader2 className="animate-spin text-muted-foreground" />
        </div>
      );
    }

    if (tasks.length === 0 && !isDataLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
          <p>Nenhuma tarefa encontrada.</p>
          <p className="text-sm">Crie uma nova demanda para começar.</p>
        </div>
      );
    }

    switch (activeView) {
      case "dashboard":
        return (
          <>
            <DashboardHeader
              projectName={sampleProject.name}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
            <div className="min-h-[500px]">
              {viewMode === "table" && (
                <TaskTable
                  tasks={filteredTasks}
                  onTaskClick={setSelectedTask}
                />
              )}
              {viewMode === "kanban" && (
                <KanbanBoard
                  tasks={filteredTasks}
                  onTaskClick={setSelectedTask}
                  onTaskUpdate={handleTaskUpdate}
                />
              )}
              {viewMode === "calendar" && (
                <CalendarView
                  tasks={filteredTasks}
                  onTaskClick={setSelectedTask}
                />
              )}
            </div>
          </>
        );
      case "tasks":
        return (
          <MyTasksView tasks={filteredTasks} onTaskClick={setSelectedTask} />
        );
      case "inbox":
        return <InboxView onTaskClick={setSelectedTask} />;
      case "calendar":
        return <FullCalendarView onTaskClick={setSelectedTask} />;
      case "teams":
        return <TeamsView />;
      case "rooms":
        return <FindRoomView />;
      case "settings":
        return <SettingsView />;
      default:
        return null;
    }
  };

  if (isUserLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!currentUser) return null;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        activeView={activeView}
        onViewChange={setActiveView}
        onCreateTask={() => setIsCreateTaskOpen(true)}
      />

      <main className="flex-1 overflow-y-auto bg-background">
        <div className="p-6 md:p-8 space-y-6">{renderContent()}</div>
      </main>

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={handleTaskUpdate}
          onDelete={handleTaskDelete}
        />
      )}

      <CreateTaskModal
        isOpen={isCreateTaskOpen}
        onClose={() => setIsCreateTaskOpen(false)}
        onCreateTask={handleCreateTask}
      />
    </div>
  );
}
