"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  LayoutDashboard,
  CheckSquare,
  Inbox,
  Calendar,
  Users,
  Plus,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Flame,
  Shield,
  DoorOpen,
} from "lucide-react"
import { useUser } from "@/contexts/user-context"

interface SidebarProps {
  activeView: string
  onViewChange: (view: string) => void
  onCreateTask: () => void // Adicionado prop para abrir modal de criar demanda
  className?: string
}

const navItems = [
  { id: "dashboard", label: "Painel", icon: LayoutDashboard },
  { id: "tasks", label: "Minhas Tarefas", icon: CheckSquare },
  { id: "inbox", label: "Caixa de Entrada", icon: Inbox, badge: 3 },
  { id: "calendar", label: "Calendário", icon: Calendar },
  { id: "teams", label: "Equipes", icon: Users },
  { id: "rooms", label: "Encontre uma Sala", icon: DoorOpen },
]

export function Sidebar({ activeView, onViewChange, onCreateTask, className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { currentUser, isGestor } = useUser()

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden text-foreground"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile overlay */}
      {mobileOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMobileOpen(false)} />}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed md:relative z-50 h-screen bg-sidebar text-sidebar-foreground flex flex-col transition-all duration-300",
          collapsed ? "w-16" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          className,
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Flame className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-semibold text-lg">Fucion Interno</span>
            </div>
          )}
          {collapsed && (
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center mx-auto">
              <Flame className="h-5 w-5 text-primary-foreground" />
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:flex text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        <div className="p-3">
          <Button
            onClick={onCreateTask}
            className={cn("w-full bg-primary hover:bg-primary/90 text-primary-foreground", collapsed && "px-2")}
          >
            <Plus className="h-4 w-4" />
            {!collapsed && <span className="ml-2">Criar Demanda</span>}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => {
                    onViewChange(item.id)
                    setMobileOpen(false)
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                    activeView === item.id
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.badge && (
                        <Badge variant="secondary" className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5">
                          {item.badge}
                        </Badge>
                      )}
                    </>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* User section */}
        <div className="border-t border-sidebar-border p-3">
          <div
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-sidebar-accent/50 cursor-pointer transition-colors",
              collapsed && "justify-center px-0",
            )}
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={currentUser.avatar || "/placeholder.svg"} alt={currentUser.name} />
              <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate">{currentUser.name}</p>
                  {isGestor && <Shield className="h-3.5 w-3.5 text-primary" />}
                </div>
                <p className="text-xs text-sidebar-foreground/60 truncate">{isGestor ? "Gestor" : "Membro"}</p>
              </div>
            )}
          </div>
          <button
            onClick={() => {
              onViewChange("settings")
              setMobileOpen(false)
            }}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 mt-1 rounded-lg transition-colors",
              activeView === "settings"
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
              collapsed && "justify-center",
            )}
          >
            <Settings className="h-5 w-5" />
            {!collapsed && <span>Configurações</span>}
          </button>
        </div>
      </aside>
    </>
  )
}
