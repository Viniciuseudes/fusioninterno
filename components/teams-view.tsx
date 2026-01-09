"use client"

import { type Team, sampleTeams, users, getFilteredTeams } from "@/lib/data"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, FolderKanban, Search, Plus, Settings, UserPlus, Shield, AlertCircle } from "lucide-react"
import { useUser } from "@/contexts/user-context"
import { useMemo } from "react"

export function TeamsView() {
  const { currentUser, isGestor } = useUser()

  const filteredTeams = useMemo(() => {
    return getFilteredTeams(sampleTeams, currentUser)
  }, [currentUser])

  const visibleMembers = useMemo(() => {
    if (isGestor) {
      return users
    }
    // Membro só vê colegas da sua equipe
    const userTeam = sampleTeams.find((t) => t.id === currentUser.teamId)
    return userTeam?.members || []
  }, [currentUser, isGestor])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">Equipes</h1>
            <Badge variant={isGestor ? "default" : "secondary"} className={isGestor ? "bg-primary" : ""}>
              {isGestor ? "Todas as Equipes" : "Minha Equipe"}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            {isGestor ? "Gerencie todas as equipes e colaboradores" : "Visualize sua equipe e colaboradores"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar equipes..." className="pl-9" />
          </div>
          {isGestor && (
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Nova Equipe
            </Button>
          )}
        </div>
      </div>

      {/* Aviso para membros */}
      {!isGestor && (
        <div className="bg-muted/50 border border-border rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Acesso Limitado</p>
            <p className="text-sm text-muted-foreground">
              Você está visualizando apenas sua equipe. Para ver todas as equipes, solicite acesso de gestor.
            </p>
          </div>
        </div>
      )}

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTeams.map((team) => (
          <TeamCard key={team.id} team={team} isGestor={isGestor} />
        ))}
      </div>

      {/* All Members Section */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">{isGestor ? "Todos os Membros" : "Membros da Minha Equipe"}</h2>
            <Badge variant="outline">{visibleMembers.length}</Badge>
          </div>
          {isGestor && (
            <Button variant="outline" size="sm">
              <UserPlus className="h-4 w-4 mr-2" />
              Convidar Membro
            </Button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleMembers.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium truncate">{user.name}</p>
                  {user.role === "gestor" && <Shield className="h-3.5 w-3.5 text-primary" />}
                </div>
                <p className="text-sm text-muted-foreground truncate">{user.email}</p>
              </div>
              <Badge variant={user.role === "gestor" ? "default" : "secondary"} className="text-xs">
                {user.role === "gestor" ? "Gestor" : "Membro"}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
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
        <CardDescription>{team.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex -space-x-2">
            {team.members.slice(0, 4).map((member) => (
              <Avatar key={member.id} className="h-8 w-8 border-2 border-card">
                <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                <AvatarFallback className="text-xs">{member.name.charAt(0)}</AvatarFallback>
              </Avatar>
            ))}
            {team.members.length > 4 && (
              <div className="h-8 w-8 rounded-full bg-muted border-2 border-card flex items-center justify-center text-xs">
                +{team.members.length - 4}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <FolderKanban className="h-4 w-4" />
            <span>{team.projectCount} projetos</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
