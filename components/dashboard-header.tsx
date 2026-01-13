"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table2,
  LayoutGrid,
  Calendar,
  ChevronDown,
  Search,
  Filter,
  UserPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/contexts/user-context";
import { Badge } from "@/components/ui/badge";

interface DashboardHeaderProps {
  projectName: string;
  viewMode: "table" | "kanban" | "calendar";
  onViewModeChange: (mode: "table" | "kanban" | "calendar") => void;
}

export function DashboardHeader({
  projectName,
  viewMode,
  onViewModeChange,
}: DashboardHeaderProps) {
  const { isGestor } = useUser();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge
            variant={isGestor ? "default" : "secondary"}
            className={isGestor ? "bg-primary" : ""}
          >
            {isGestor ? "Visão Completa" : "Visão do Setor"}
          </Badge>
        </div>
      </div>

      {/* Breadcrumbs & Title */}
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <span>Área de Trabalho</span>
          <span>/</span>
          <span>Projetos</span>
          <span>/</span>
          <span className="text-foreground">{projectName}</span>
        </div>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{projectName}</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <UserPlus className="h-4 w-4 mr-2" />
              Convidar
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Opções
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Exportar</DropdownMenuItem>
                <DropdownMenuItem>Arquivar</DropdownMenuItem>
                <DropdownMenuItem>Configurações</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          {/* View toggles */}
          <div className="flex items-center bg-muted rounded-lg p-1">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "px-3",
                viewMode === "table" && "bg-background shadow-sm"
              )}
              onClick={() => onViewModeChange("table")}
            >
              <Table2 className="h-4 w-4 mr-2" />
              Tabela
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "px-3",
                viewMode === "kanban" && "bg-background shadow-sm"
              )}
              onClick={() => onViewModeChange("kanban")}
            >
              <LayoutGrid className="h-4 w-4 mr-2" />
              Kanban
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "px-3",
                viewMode === "calendar" && "bg-background shadow-sm"
              )}
              onClick={() => onViewModeChange("calendar")}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Calendário
            </Button>
          </div>

          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtrar
          </Button>
        </div>

        {/* Search */}
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar tarefas..." className="pl-9" />
        </div>
      </div>
    </div>
  );
}
