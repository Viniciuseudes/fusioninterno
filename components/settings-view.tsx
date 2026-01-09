"use client"

import { useState } from "react"
import {
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Key,
  Building2,
  Mail,
  Smartphone,
  Moon,
  Sun,
  Monitor,
  Check,
  Camera,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useUser } from "@/contexts/user-context"
import { sampleTeams } from "@/lib/data"

export function SettingsView() {
  const { currentUser, isGestor } = useUser()
  const [theme, setTheme] = useState<"light" | "dark" | "system">("dark")
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    mentions: true,
    taskUpdates: true,
    weeklyDigest: false,
  })
  const [saved, setSaved] = useState(false)

  const userTeam = sampleTeams.find((t) => t.id === currentUser.teamId)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground mt-1">Gerencie suas preferências e configurações da conta</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Notificações
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2">
            <Palette className="h-4 w-4" />
            Aparência
          </TabsTrigger>
          {isGestor && (
            <TabsTrigger value="admin" className="gap-2">
              <Shield className="h-4 w-4" />
              Administração
            </TabsTrigger>
          )}
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Informações do Perfil
            </h3>

            <div className="flex items-start gap-6 mb-6">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={currentUser.avatar || "/placeholder.svg"} alt={currentUser.name} />
                  <AvatarFallback className="text-2xl">{currentUser.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <Button size="icon" variant="secondary" className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full">
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1 space-y-1">
                <h4 className="text-xl font-semibold">{currentUser.name}</h4>
                <p className="text-muted-foreground">{currentUser.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant={isGestor ? "default" : "secondary"}>{isGestor ? "Gestor" : "Membro"}</Badge>
                  <Badge variant="outline">{userTeam?.name || "Sem equipe"}</Badge>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input id="name" defaultValue={currentUser.name} className="bg-background" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" defaultValue={currentUser.email} className="bg-background" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input id="phone" type="tel" placeholder="(11) 99999-9999" className="bg-background" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Departamento</Label>
                <Input id="department" defaultValue={userTeam?.name || ""} disabled className="bg-muted" />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              Segurança
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium">Alterar Senha</p>
                  <p className="text-sm text-muted-foreground">Última alteração há 30 dias</p>
                </div>
                <Button variant="outline">Alterar</Button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium">Autenticação de Dois Fatores</p>
                  <p className="text-sm text-muted-foreground">Adicione uma camada extra de segurança</p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium">Sessões Ativas</p>
                  <p className="text-sm text-muted-foreground">2 dispositivos conectados</p>
                </div>
                <Button variant="outline">Gerenciar</Button>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Preferências de Notificação
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Notificações por E-mail</p>
                    <p className="text-sm text-muted-foreground">Receba atualizações no seu e-mail</p>
                  </div>
                </div>
                <Switch
                  checked={notifications.email}
                  onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, email: checked }))}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Notificações Push</p>
                    <p className="text-sm text-muted-foreground">Receba alertas no navegador</p>
                  </div>
                </div>
                <Switch
                  checked={notifications.push}
                  onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, push: checked }))}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Menções</p>
                    <p className="text-sm text-muted-foreground">Quando alguém mencionar você</p>
                  </div>
                </div>
                <Switch
                  checked={notifications.mentions}
                  onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, mentions: checked }))}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Atualizações de Tarefas</p>
                    <p className="text-sm text-muted-foreground">Mudanças de status e comentários</p>
                  </div>
                </div>
                <Switch
                  checked={notifications.taskUpdates}
                  onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, taskUpdates: checked }))}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Resumo Semanal</p>
                    <p className="text-sm text-muted-foreground">Relatório semanal por e-mail</p>
                  </div>
                </div>
                <Switch
                  checked={notifications.weeklyDigest}
                  onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, weeklyDigest: checked }))}
                />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-6">
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
              Aparência
            </h3>

            <div className="space-y-6">
              <div className="space-y-3">
                <Label>Tema</Label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: "light", label: "Claro", icon: Sun },
                    { value: "dark", label: "Escuro", icon: Moon },
                    { value: "system", label: "Sistema", icon: Monitor },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setTheme(option.value as typeof theme)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-lg border transition-colors ${
                        theme === option.value
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <option.icon className="h-6 w-6" />
                      <span className="text-sm font-medium">{option.label}</span>
                      {theme === option.value && <Check className="h-4 w-4 text-primary" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label>Idioma</Label>
                <Select defaultValue="pt-BR">
                  <SelectTrigger className="bg-background w-full md:w-64">
                    <Globe className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                    <SelectItem value="en-US">English (US)</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>Formato de Data</Label>
                <Select defaultValue="dd/MM/yyyy">
                  <SelectTrigger className="bg-background w-full md:w-64">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dd/MM/yyyy">DD/MM/AAAA</SelectItem>
                    <SelectItem value="MM/dd/yyyy">MM/DD/AAAA</SelectItem>
                    <SelectItem value="yyyy-MM-dd">AAAA-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Admin Tab (only for gestor) */}
        {isGestor && (
          <TabsContent value="admin" className="space-y-6">
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Configurações da Empresa
              </h3>

              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Nome da Empresa</Label>
                    <Input defaultValue="Fucion Interno" className="bg-background" />
                  </div>
                  <div className="space-y-2">
                    <Label>CNPJ</Label>
                    <Input placeholder="00.000.000/0000-00" className="bg-background" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Logo da Empresa</Label>
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-lg bg-primary flex items-center justify-center">
                      <span className="text-2xl font-bold text-primary-foreground">F</span>
                    </div>
                    <Button variant="outline">Alterar Logo</Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Permissões e Acessos
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium">Membros podem criar demandas gerais</p>
                    <p className="text-sm text-muted-foreground">
                      Permitir que membros criem tarefas visíveis para toda empresa
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium">Membros podem enviar demandas para outras equipes</p>
                    <p className="text-sm text-muted-foreground">Permitir colaboração entre setores</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium">Aprovar demandas antes de criar</p>
                    <p className="text-sm text-muted-foreground">Demandas passam por aprovação do gestor</p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium">Notificar gestores sobre novas demandas</p>
                    <p className="text-sm text-muted-foreground">Enviar alerta quando uma nova demanda for criada</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Gerenciamento de Usuários
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-muted-foreground">Total de usuários: 5</p>
                  <Button>Convidar Usuário</Button>
                </div>

                <div className="border border-border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-3 text-sm font-medium">Usuário</th>
                        <th className="text-left p-3 text-sm font-medium">Equipe</th>
                        <th className="text-left p-3 text-sm font-medium">Função</th>
                        <th className="text-right p-3 text-sm font-medium">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {[
                        { name: "Ana Silva", team: "Produto", role: "Gestor" },
                        { name: "Carlos Oliveira", team: "Engenharia", role: "Membro" },
                        { name: "Beatriz Santos", team: "Produto", role: "Membro" },
                        { name: "Lucas Pereira", team: "Design", role: "Membro" },
                        { name: "Mariana Costa", team: "Marketing", role: "Membro" },
                      ].map((user) => (
                        <tr key={user.name}>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{user.name}</span>
                            </div>
                          </td>
                          <td className="p-3 text-muted-foreground">{user.team}</td>
                          <td className="p-3">
                            <Badge variant={user.role === "Gestor" ? "default" : "secondary"}>{user.role}</Badge>
                          </td>
                          <td className="p-3 text-right">
                            <Button variant="ghost" size="sm">
                              Editar
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </TabsContent>
        )}
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <Button variant="outline">Cancelar</Button>
        <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
          {saved ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Salvo!
            </>
          ) : (
            "Salvar Alterações"
          )}
        </Button>
      </div>
    </div>
  )
}
