"use client"

import { useState, useMemo } from "react"
import { Sidebar } from "@/components/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { TaskTable } from "@/components/task-table"
import { KanbanBoard } from "@/components/kanban-board"
import { CalendarView } from "@/components/calendar-view"
import { TaskDetailModal } from "@/components/task-detail-modal"
import { MyTasksView } from "@/components/my-tasks-view"
import { InboxView } from "@/components/inbox-view"
import { TeamsView } from "@/components/teams-view"
import { FullCalendarView } from "@/components/full-calendar-view"
import { FindRoomView } from "@/components/find-room-view"
import { SettingsView } from "@/components/settings-view"
import { CreateTaskModal } from "@/components/create-task-modal"
import { type Task, sampleProject, sampleTasks, getFilteredTasks } from "@/lib/data"
import { useUser } from "@/contexts/user-context"

export default function Home() {
  const [activeView, setActiveView] = useState("dashboard")
  const [viewMode, setViewMode] = useState<"table" | "kanban" | "calendar">("table")
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [tasks, setTasks] = useState<Task[]>(sampleTasks)
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false) // Estado do modal
  const { currentUser, isGestor } = useUser()

  const filteredTasks = useMemo(() => {
    return getFilteredTasks(tasks, currentUser)
  }, [tasks, currentUser])

  const handleTaskUpdate = (updatedTask: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)))
  }

  const handleCreateTask = (newTask: Task) => {
    setTasks((prev) => [newTask, ...prev])
  }

  const renderContent = () => {
    switch (activeView) {
      case "dashboard":
        return (
          <>
            <DashboardHeader projectName={sampleProject.name} viewMode={viewMode} onViewModeChange={setViewMode} />
            <div className="min-h-[500px]">
              {viewMode === "table" && <TaskTable tasks={filteredTasks} onTaskClick={setSelectedTask} />}
              {viewMode === "kanban" && <KanbanBoard tasks={filteredTasks} onTaskClick={setSelectedTask} />}
              {viewMode === "calendar" && <CalendarView tasks={filteredTasks} onTaskClick={setSelectedTask} />}
            </div>
          </>
        )
      case "tasks":
        return <MyTasksView tasks={filteredTasks} onTaskClick={setSelectedTask} />
      case "inbox":
        return <InboxView onTaskClick={setSelectedTask} />
      case "calendar":
        return <FullCalendarView onTaskClick={setSelectedTask} />
      case "teams":
        return <TeamsView />
      case "rooms":
        return <FindRoomView />
      case "settings": // Nova view de configurações
        return <SettingsView />
      default:
        return null
    }
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        activeView={activeView}
        onViewChange={setActiveView}
        onCreateTask={() => setIsCreateTaskOpen(true)} // Passa função para abrir modal
      />

      <main className="flex-1 overflow-y-auto">
        <div className="p-6 md:p-8 space-y-6">{renderContent()}</div>
      </main>

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={(updated) => {
            handleTaskUpdate(updated)
            setSelectedTask(updated)
          }}
        />
      )}

      <CreateTaskModal
        isOpen={isCreateTaskOpen}
        onClose={() => setIsCreateTaskOpen(false)}
        onCreateTask={handleCreateTask}
      />
    </div>
  )
}
