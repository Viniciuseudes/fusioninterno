"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  AlertCircle,
  Clock,
  CreditCard,
  Plus,
  Search,
  User,
  CalendarClock,
  Phone,
  Trash2,
  Loader2,
} from "lucide-react";
import {
  FusionMemberService,
  FusionMember,
} from "@/services/fusion-member-service";
import { useToast } from "@/hooks/use-toast";

export function FusionMembersView() {
  const [members, setMembers] = useState<FusionMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    package_type: "10",
    start_date: new Date().toISOString().split("T")[0], // Hoje
    payment_method: "asaas",
  });

  const loadMembers = async () => {
    try {
      setIsLoading(true);
      const data = await FusionMemberService.getMembers();
      setMembers(data);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os membros.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const handleCreateMember = async () => {
    if (!formData.name || !formData.phone) {
      toast({
        title: "Atenção",
        description: "Preencha o nome e telefone.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const start = new Date(formData.start_date);
      const end = new Date(start);
      end.setDate(end.getDate() + 30); // 30 dias de validade

      await FusionMemberService.createMember({
        name: formData.name,
        phone: formData.phone,
        package_type: Number(formData.package_type) as any,
        start_date: start.toISOString().split("T")[0],
        end_date: end.toISOString().split("T")[0],
        payment_method: formData.payment_method,
      });

      toast({ title: "Sucesso!", description: "Assinatura cadastrada." });
      setIsAddModalOpen(false);
      setFormData({ ...formData, name: "", phone: "" }); // Limpa os campos
      loadMembers();
    } catch (error: any) {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta assinatura?")) {
      try {
        await FusionMemberService.deleteMember(id);
        toast({
          title: "Excluído",
          description: "Membro removido com sucesso.",
        });
        loadMembers();
      } catch (error: any) {
        toast({
          title: "Erro",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  };

  // Data base fixada para a realidade do projeto (2026) ou "hoje"
  const today = new Date("2026-03-16");

  const getMemberHealth = (member: FusionMember) => {
    const start = new Date(member.start_date);
    const end = new Date(member.end_date);
    const totalDays = 30;
    const daysElapsed = Math.floor(
      (today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
    );
    const daysRemaining = Math.max(0, totalDays - daysElapsed);

    const timeProgress = Math.min(
      100,
      Math.max(0, (daysElapsed / totalDays) * 100),
    );
    const usageProgress = Math.min(
      100,
      (Number(member.hours_used) / member.package_type) * 100,
    );

    let status: "healthy" | "expiring" | "underutilized" = "healthy";

    if (daysRemaining <= 5 && Number(member.hours_used) < member.package_type) {
      status = "expiring";
    } else if (timeProgress > 50 && usageProgress < 30) {
      status = "underutilized";
    }

    return { daysRemaining, timeProgress, usageProgress, status };
  };

  const filteredMembers = members.filter((m) =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="flex flex-col h-full space-y-6 p-4 md:p-8 pt-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">
            Fusion Members
          </h2>
          <p className="text-muted-foreground">
            Controle de pacotes de horas e retenção de clientes.
          </p>
        </div>

        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-white">
              <Plus className="mr-2 h-4 w-4" /> Novo Pacote
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Novo Fusion Member</DialogTitle>
              <DialogDescription>
                Cadastre a venda de um pacote de horas.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome do Profissional</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Ex: Dr. João Silva"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">WhatsApp (Apenas números)</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="Ex: 84999999999"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="package">Pacote de Horas</Label>
                <Select
                  value={formData.package_type}
                  onValueChange={(val) =>
                    setFormData({ ...formData, package_type: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o pacote" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6">6 horas - R$ 240,00</SelectItem>
                    <SelectItem value="10">10 horas - R$ 320,00</SelectItem>
                    <SelectItem value="15">15 horas - R$ 450,00</SelectItem>
                    <SelectItem value="20">20 horas - R$ 580,00</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="start">Data Inicial</Label>
                  <Input
                    id="start"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) =>
                      setFormData({ ...formData, start_date: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="method">Origem/Pagamento</Label>
                  <Select
                    value={formData.payment_method}
                    onValueChange={(val) =>
                      setFormData({ ...formData, payment_method: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asaas">Asaas</SelectItem>
                      <SelectItem value="Pix">Pix Direto</SelectItem>
                      <SelectItem value="Cartão">
                        Cartão (Maquininha)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                onClick={handleCreateMember}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Salvar Assinatura
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar profissional..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          Nenhum membro encontrado.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredMembers.map((member) => {
            const { daysRemaining, timeProgress, usageProgress, status } =
              getMemberHealth(member);

            return (
              <Card
                key={member.id}
                className="flex flex-col border-l-4 shadow-sm"
                style={{
                  borderLeftColor:
                    status === "underutilized"
                      ? "#f59e0b"
                      : status === "expiring"
                        ? "#ef4444"
                        : "#10b981",
                }}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {member.name}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <CreditCard className="h-3 w-3" />{" "}
                        {member.payment_method}
                      </CardDescription>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge
                        variant="outline"
                        className="font-bold bg-muted/50"
                      >
                        {member.package_type}H
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-red-400 hover:text-red-600"
                        onClick={() => handleDelete(member.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 pb-4">
                  {status === "underutilized" && (
                    <div className="mb-4 flex items-center gap-2 text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/50 p-2 rounded-md border border-amber-200">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>
                        Risco de Churn: Uso muito baixo. Mande uma mensagem!
                      </span>
                    </div>
                  )}
                  {status === "expiring" && (
                    <div className="mb-4 flex items-center gap-2 text-xs text-red-600 bg-red-50 dark:bg-red-950/50 p-2 rounded-md border border-red-200">
                      <CalendarClock className="h-4 w-4 shrink-0" />
                      <span>
                        Expira em {daysRemaining} dias com horas sobrando.
                      </span>
                    </div>
                  )}

                  <div className="space-y-4 mt-2">
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Uso ({member.hours_used}h)
                        </span>
                        <span className="font-medium">
                          {usageProgress.toFixed(0)}%
                        </span>
                      </div>
                      <Progress value={usageProgress} className="h-2" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Tempo Restante
                        </span>
                        <span className="font-medium text-xs">
                          {daysRemaining} dias
                        </span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-1.5 mt-1 overflow-hidden">
                        <div
                          className="bg-slate-400 h-1.5 rounded-full"
                          style={{ width: `${timeProgress}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span>
                          {new Date(member.start_date).toLocaleDateString(
                            "pt-BR",
                          )}
                        </span>
                        <span>
                          {new Date(member.end_date).toLocaleDateString(
                            "pt-BR",
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="pt-0 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() =>
                      window.open(
                        `https://wa.me/55${member.phone.replace(/\D/g, "")}?text=Olá Dr(a). ${member.name.split(" ")[0]}, tudo bem? Vi que seu pacote de horas no Fusion...`,
                        "_blank",
                      )
                    }
                  >
                    <Phone className="h-3 w-3 mr-2 text-green-600" /> WhatsApp
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
