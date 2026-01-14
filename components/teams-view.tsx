"use client";

import { useEffect, useState } from "react";
import { type Team, type User } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Users,
  FolderKanban,
  Search,
  Plus,
  Settings,
  UserPlus,
  Shield,
  AlertCircle,
  Loader2,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import { useUser } from "@/contexts/user-context";
import { TaskService } from "@/services/task-service";
import { CreateTeamModal } from "@/components/create-team-modal";
import { CreateMemberModal } from "@/components/create-member-modal";
import { toast } from "sonner";

export function TeamsView() {
  const { currentUser, isGestor } = useUser();
  const [teams, setTeams] = useState<Team[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Estado para Edição
  const [teamToEdit, setTeamToEdit] = useState<Team | null>(null);
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);
  const [isCreateMemberOpen, setIsCreateMemberOpen] = useState(false);

  const loadData = async () => {
    if (!currentUser) return;
    try {
      const [fetchedTeams, fetchedUsers] = await Promise.all([
        TaskService.getTeams(),
        TaskService.getAllUsers(),
      ]);

      const teamsWithMembers = fetchedTeams.map((team) => ({
        ...team,
        members: fetchedUsers.filter((u) => u.teamId === team.id),
      }));

      setTeams(teamsWithMembers);
      setUsers(fetchedUsers);
    } catch (error) {
      console.error("Erro ao carregar equipes", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    loadData();
  }, [currentUser]);

  // Criação e Edição de Equipe unificadas
  const handleSaveTeam = async (name: string, description: string) => {
    try {
      if (teamToEdit) {
        await TaskService.updateTeam(teamToEdit.id, { name, description });
        toast.success("Equipe atualizada com sucesso!");
      } else {
        await TaskService.createTeam(name, description);
        toast.success("Equipe criada com sucesso!");
      }
      loadData();
      setIsCreateTeamOpen(false);
      setTeamToEdit(null);
    } catch (error) {
      toast.error("Erro ao salvar equipe.");
    }
  };

  const handleDeleteTeam = async (id: string) => {
    if (
      confirm(
        "Tem certeza que deseja excluir esta equipe? As tarefas associadas podem ficar órfãs."
      )
    ) {
      try {
        await TaskService.deleteTeam(id);
        toast.success("Equipe excluída.");
        loadData();
      } catch (error) {
        toast.error("Erro ao excluir equipe.");
      }
    }
  };

  const handleCreateMember = async (member: any) => {
    try {
      await TaskService.createMember(member);
      toast.success("Membro cadastrado com sucesso!");
      loadData();
    } catch (error) {
      // O erro real já é tratado no modal, mas garantimos aqui também
      console.error(error);
    }
  };

  // Abre modal de criação (limpo)
  const openCreateModal = () => {
    setTeamToEdit(null);
    setIsCreateTeamOpen(true);
  };

  // Abre modal de edição (com dados)
  const openEditModal = (team: Team) => {
    setTeamToEdit(team);
    setIsCreateTeamOpen(true);
  };

  const filteredTeams = teams.filter((team) => {
    const matchesSearch = team.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    if (isGestor) return matchesSearch;
    return matchesSearch && team.id === currentUser?.teamId;
  });

  const visibleMembers = isGestor
    ? users
    : users.filter((u) => u.teamId === currentUser?.teamId);

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">Equipes</h1>
            <Badge variant={isGestor ? "default" : "secondary"}>
              {isGestor ? "Todas as Equipes" : "Minha Equipe"}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            {isGestor
              ? "Gerencie todas as equipes e colaboradores"
              : "Visualize sua equipe e colaboradores"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-64 hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar equipes..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {isGestor && (
            <Button
              className="bg-primary hover:bg-primary/90"
              onClick={openCreateModal}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Equipe
            </Button>
          )}
        </div>
      </div>

      {!isGestor && (
        <div className="bg-muted/50 border border-border rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Acesso Limitado</p>
            <p className="text-sm text-muted-foreground">
              Você está visualizando apenas sua equipe. Para ver todas, solicite
              acesso de gestor.
            </p>
          </div>
        </div>
      )}

      {/* Teams Grid */}
      {filteredTeams.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground border rounded-lg border-dashed bg-muted/10">
          <Users className="h-10 w-10 mx-auto mb-2 opacity-50" />
          <p>Nenhuma equipe encontrada.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTeams.map((team) => (
            <TeamCard
              key={team.id}
              team={team}
              isGestor={isGestor}
              onEdit={() => openEditModal(team)}
              onDelete={() => handleDeleteTeam(team.id)}
            />
          ))}
        </div>
      )}

      {/* All Members Section */}
      <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">
              {isGestor ? "Todos os Membros" : "Membros da Minha Equipe"}
            </h2>
            <Badge variant="outline">{visibleMembers.length}</Badge>
          </div>
          {isGestor && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCreateMemberOpen(true)}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Cadastrar Membro
            </Button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleMembers.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-3 p-3 rounded-lg border border-transparent hover:border-border hover:bg-muted/50 transition-all cursor-pointer group"
            >
              <Avatar className="h-10 w-10 border border-background shadow-sm">
                <AvatarImage
                  src={user.avatar || "/placeholder.svg"}
                  alt={user.name}
                />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium truncate text-sm">{user.name}</p>
                  {user.role === "gestor" && (
                    <Shield className="h-3 w-3 text-primary" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
              <Badge
                variant={user.role === "gestor" ? "default" : "secondary"}
                className="text-[10px] h-5 px-1.5"
              >
                {user.role === "gestor" ? "Gestor" : "Membro"}
              </Badge>
            </div>
          ))}
        </div>
      </div>

      <CreateTeamModal
        isOpen={isCreateTeamOpen}
        onClose={() => setIsCreateTeamOpen(false)}
        onCreate={handleSaveTeam}
        teamToEdit={teamToEdit}
      />

      <CreateMemberModal
        isOpen={isCreateMemberOpen}
        onClose={() => setIsCreateMemberOpen(false)}
        onCreate={handleCreateMember}
      />
    </div>
  );
}

function TeamCard({
  team,
  isGestor,
  onEdit,
  onDelete,
}: {
  team: Team;
  isGestor: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Card className="group hover:shadow-md transition-all border-l-4 border-l-primary/50 hover:border-l-primary">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            <Users className="h-5 w-5" />
          </div>
          {isGestor && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 -mr-2 text-muted-foreground hover:text-foreground"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>
                  <Pencil className="mr-2 h-4 w-4" /> Editar
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={onDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        <CardTitle className="mt-3 text-lg">{team.name}</CardTitle>
        <CardDescription className="line-clamp-2 min-h-[40px]">
          {team.description || "Sem descrição definida para esta equipe."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex -space-x-2">
            {team.members && team.members.length > 0 ? (
              <>
                {team.members.slice(0, 4).map((member) => (
                  <Avatar
                    key={member.id}
                    className="h-7 w-7 border-2 border-background"
                    title={member.name}
                  >
                    <AvatarImage src={member.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="text-[10px]">
                      {member.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {team.members.length > 4 && (
                  <div className="h-7 w-7 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[10px] font-medium">
                    +{team.members.length - 4}
                  </div>
                )}
              </>
            ) : (
              <span className="text-xs text-muted-foreground italic">
                Vazio
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-md">
            <FolderKanban className="h-3.5 w-3.5" />
            <span>{team.projectCount} projs</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
