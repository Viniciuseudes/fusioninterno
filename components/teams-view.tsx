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
  Users,
  FolderKanban,
  Search,
  Plus,
  Settings,
  UserPlus,
  Shield,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useUser } from "@/contexts/user-context";
import { TaskService } from "@/services/task-service";
import { CreateTeamModal } from "@/components/create-team-modal";
import { CreateMemberModal } from "@/components/create-member-modal"; // Import novo

export function TeamsView() {
  const { currentUser, isGestor } = useUser();
  const [teams, setTeams] = useState<Team[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modais
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);
  const [isCreateMemberOpen, setIsCreateMemberOpen] = useState(false);

  // Função para recarregar dados
  const loadData = async () => {
    if (!currentUser) return;
    // Não ativa isLoading geral para não piscar a tela toda se for apenas refresh
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

  const handleCreateTeam = async (name: string, description: string) => {
    await TaskService.createTeam(name, description);
    loadData(); // Recarrega para mostrar a nova equipe
  };

  const handleCreateMember = async (member: any) => {
    await TaskService.createMember(member);
    loadData(); // Recarrega para mostrar o novo membro na lista
  };

  // Filtragem local
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">Equipes</h1>
            <Badge
              variant={isGestor ? "default" : "secondary"}
              className={isGestor ? "bg-primary" : ""}
            >
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
          <div className="relative w-64">
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
              onClick={() => setIsCreateTeamOpen(true)}
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
              Você está visualizando apenas sua equipe. Para ver todas as
              equipes, solicite acesso de gestor.
            </p>
          </div>
        </div>
      )}

      {/* Teams Grid */}
      {filteredTeams.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground border rounded-lg border-dashed">
          <Users className="h-10 w-10 mx-auto mb-2 opacity-50" />
          <p>Nenhuma equipe encontrada.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTeams.map((team) => (
            <TeamCard key={team.id} team={team} isGestor={isGestor} />
          ))}
        </div>
      )}

      {/* All Members Section */}
      <div className="bg-card rounded-lg border border-border p-6">
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
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
            >
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={user.avatar || "/placeholder.svg"}
                  alt={user.name}
                />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium truncate">{user.name}</p>
                  {user.role === "gestor" && (
                    <Shield className="h-3.5 w-3.5 text-primary" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
              <Badge
                variant={user.role === "gestor" ? "default" : "secondary"}
                className="text-xs"
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
        onCreate={handleCreateTeam}
      />

      <CreateMemberModal
        isOpen={isCreateMemberOpen}
        onClose={() => setIsCreateMemberOpen(false)}
        onCreate={handleCreateMember}
      />
    </div>
  );
}

function TeamCard({ team, isGestor }: { team: Team; isGestor: boolean }) {
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="p-2 rounded-lg bg-primary/10">
            <Users className="h-5 w-5 text-primary" />
          </div>
          {isGestor && (
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Settings className="h-4 w-4" />
            </Button>
          )}
        </div>
        <CardTitle className="mt-3">{team.name}</CardTitle>
        <CardDescription>{team.description || "Sem descrição"}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex -space-x-2">
            {team.members && team.members.length > 0 ? (
              <>
                {team.members.slice(0, 4).map((member) => (
                  <Avatar
                    key={member.id}
                    className="h-8 w-8 border-2 border-card"
                    title={member.name}
                  >
                    <AvatarImage
                      src={member.avatar || "/placeholder.svg"}
                      alt={member.name}
                    />
                    <AvatarFallback className="text-xs">
                      {member.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {team.members.length > 4 && (
                  <div className="h-8 w-8 rounded-full bg-muted border-2 border-card flex items-center justify-center text-xs">
                    +{team.members.length - 4}
                  </div>
                )}
              </>
            ) : (
              <span className="text-xs text-muted-foreground italic">
                Sem membros
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <FolderKanban className="h-4 w-4" />
            <span>{team.projectCount} projetos</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
