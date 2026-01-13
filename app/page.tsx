"use client";

import { useState, useMemo, useEffect } from "react";
import { Sidebar } from "@/components/sidebar";
import { DashboardHeader } from "@/components/dashboard-header";
import { TaskTable } from "@/components/task-table";
import { KanbanBoard } from "@/components/kanban-board";
import { CalendarView } from "@/components/calendar-view"; // Certifique-se que este componente recebe as tasks
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

  useEffect(() => {
    async function loadTasks() {
      if (currentUser) {
        setIsDataLoading(true);
        try {
          const realTasks = await TaskService.getTasks(currentUser);
          setTasks(realTasks);
        } catch (error) {
          console.error("Falha ao carregar tarefas", error);
        } finally {
          setIsDataLoading(false);
        }
      }
    }
    loadTasks();
  }, [currentUser]);

  const filteredTasks = useMemo(() => {
    if (!currentUser) return [];
    return getFilteredTasks(tasks, currentUser);
  }, [tasks, currentUser]);

  const handleTaskUpdate = async (updatedTask: Task) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
    );

    try {
      if (selectedTask?.status !== updatedTask.status) {
        await TaskService.updateStatus(updatedTask.id, updatedTask.status);
      }
    } catch (error) {
      console.error("Erro ao salvar atualização de status", error);
    }
  };

  // NOVA FUNÇÃO: Remove tarefa da lista local após exclusão no modal
  const handleTaskDelete = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    setSelectedTask(null); // Fecha o modal
  };

  const handleCreateTask = async (newTask: Task) => {
    if (!currentUser) return;
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
                />
              )}
              {/* O CalendarView aqui agora recebe tarefas reais */}
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
        // FullCalendarView também deve ser atualizado para receber `tasks` se ainda não estiver
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
          onUpdate={(updated) => {
            handleTaskUpdate(updated);
            setSelectedTask(updated);
          }}
          // Passamos a função de deletar
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
