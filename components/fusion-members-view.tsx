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
  CreditCard,
  Plus,
  Search,
  User,
  CalendarClock,
  Phone,
  Trash2,
  Loader2,
  MinusCircle,
  History,
  Edit2,
  Check,
  X,
} from "lucide-react";
import {
  FusionMemberService,
  FusionMember,
  FusionMemberUsage,
} from "@/services/fusion-member-service";
import { useToast } from "@/hooks/use-toast";

export function FusionMembersView() {
  const [members, setMembers] = useState<FusionMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { toast } = useToast();

  const [selectedMemberForUsage, setSelectedMemberForUsage] =
    useState<FusionMember | null>(null);
  const [isUsageModalOpen, setIsUsageModalOpen] = useState(false);
  const [usageData, setUsageData] = useState({
    hours: "",
    date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const [selectedMemberHistory, setSelectedMemberHistory] =
    useState<FusionMember | null>(null);
  const [historyRecords, setHistoryRecords] = useState<FusionMemberUsage[]>([]);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const [editingUsageId, setEditingUsageId] = useState<string | null>(null);
  const [editUsageData, setEditUsageData] = useState({
    hours: "",
    date: "",
    notes: "",
    oldHours: 0,
  });

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    package_type: "10",
    start_date: new Date().toISOString().split("T")[0],
    payment_method: "Asaas",
  });

  const loadMembers = async () => {
    try {
      setIsLoading(true);
      setMembers(await FusionMemberService.getMembers());
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao carregar.",
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
    if (!formData.name || !formData.phone)
      return toast({
        title: "Atenção",
        description: "Preencha nome e telefone.",
        variant: "destructive",
      });
    try {
      setIsSubmitting(true);
      const start = new Date(formData.start_date);
      const end = new Date(start);
      end.setDate(end.getDate() + 30);
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
      setFormData({ ...formData, name: "", phone: "" });
      loadMembers();
    } catch (error: any) {
      toast({
        title: "Erro",
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
        toast({ title: "Excluído", description: "Membro removido." });
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

  const handleDeductUsage = async () => {
    if (!selectedMemberForUsage || !usageData.hours || !usageData.notes)
      return toast({
        title: "Atenção",
        description: "Preencha horas e descrição.",
        variant: "destructive",
      });
    try {
      setIsSubmitting(true);
      await FusionMemberService.deductHours(
        selectedMemberForUsage.id,
        Number(usageData.hours),
        usageData.date,
        usageData.notes,
      );
      toast({ title: "Sucesso", description: "Horas descontadas." });
      setIsUsageModalOpen(false);
      setUsageData({
        hours: "",
        date: new Date().toISOString().split("T")[0],
        notes: "",
      });
      loadMembers();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenHistory = async (member: FusionMember) => {
    setSelectedMemberHistory(member);
    setIsHistoryModalOpen(true);
    setIsLoadingHistory(true);
    setEditingUsageId(null);
    try {
      setHistoryRecords(await FusionMemberService.getMemberUsage(member.id));
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar histórico.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const startEditing = (record: FusionMemberUsage) => {
    setEditingUsageId(record.id);
    setEditUsageData({
      hours: String(record.hours_deducted),
      date: record.usage_date,
      notes: record.notes,
      oldHours: Number(record.hours_deducted),
    });
  };

  const handleSaveEdit = async () => {
    if (!selectedMemberHistory || !editingUsageId) return;
    try {
      setIsLoadingHistory(true);
      await FusionMemberService.updateUsage(
        editingUsageId,
        selectedMemberHistory.id,
        editUsageData.oldHours,
        Number(editUsageData.hours),
        editUsageData.date,
        editUsageData.notes,
      );
      toast({ title: "Atualizado", description: "Registro corrigido." });
      setEditingUsageId(null);
      loadMembers();
      setHistoryRecords(
        await FusionMemberService.getMemberUsage(selectedMemberHistory.id),
      );
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleDeleteRecord = async (record: FusionMemberUsage) => {
    if (!selectedMemberHistory) return;
    if (confirm(`Estornar ${record.hours_deducted}h para o cliente?`)) {
      try {
        setIsLoadingHistory(true);
        await FusionMemberService.deleteUsage(
          record.id,
          selectedMemberHistory.id,
          Number(record.hours_deducted),
        );
        toast({ title: "Estornado", description: "Horas devolvidas." });
        loadMembers();
        setHistoryRecords(
          await FusionMemberService.getMemberUsage(selectedMemberHistory.id),
        );
      } catch (error: any) {
        toast({
          title: "Erro",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setIsLoadingHistory(false);
      }
    }
  };

  const today = new Date("2026-03-16");
  const getMemberHealth = (member: FusionMember) => {
    const start = new Date(member.start_date);
    const end = new Date(member.end_date);
    const daysElapsed = Math.floor(
      (today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
    );
    const daysRemaining = Math.max(0, 30 - daysElapsed);
    const timeProgress = Math.min(100, Math.max(0, (daysElapsed / 30) * 100));
    const usageProgress = Math.min(
      100,
      (Number(member.hours_used) / member.package_type) * 100,
    );
    const remainingHours = member.package_type - Number(member.hours_used);

    let status: "healthy" | "expiring" | "underutilized" = "healthy";
    if (daysRemaining <= 5 && remainingHours > 0) status = "expiring";
    else if (timeProgress > 50 && usageProgress < 30) status = "underutilized";

    return {
      daysRemaining,
      timeProgress,
      usageProgress,
      status,
      remainingHours,
    };
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
            <Button className="bg-primary text-white">
              <Plus className="mr-2 h-4 w-4" /> Novo Pacote
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Novo Fusion Member</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Nome</Label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>WhatsApp</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Pacote</Label>
                <Select
                  value={formData.package_type}
                  onValueChange={(val) =>
                    setFormData({ ...formData, package_type: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6">6H</SelectItem>
                    <SelectItem value="10">10H</SelectItem>
                    <SelectItem value="15">15H</SelectItem>
                    <SelectItem value="20">20H</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Início</Label>
                  <Input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) =>
                      setFormData({ ...formData, start_date: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Pagamento</Label>
                  <Select
                    value={formData.payment_method}
                    onValueChange={(val) =>
                      setFormData({ ...formData, payment_method: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asaas">Asaas</SelectItem>
                      <SelectItem value="Pix">Pix Direto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreateMember} disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}{" "}
                Salvar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar profissional..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
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
            const {
              daysRemaining,
              timeProgress,
              usageProgress,
              status,
              remainingHours,
            } = getMemberHealth(member);

            return (
              <Card
                key={member.id}
                className="flex flex-col border-l-4 shadow-sm hover:shadow-md transition-shadow"
                style={{
                  borderLeftColor:
                    status === "underutilized"
                      ? "#f59e0b"
                      : status === "expiring"
                        ? "#ef4444"
                        : "#10b981",
                }}
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="overflow-hidden">
                      <CardTitle className="text-base font-bold flex items-center gap-2 truncate">
                        <User className="h-4 w-4 shrink-0 text-muted-foreground" />{" "}
                        {member.name}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1 text-xs">
                        <CreditCard className="h-3 w-3" />{" "}
                        {member.payment_method}
                      </CardDescription>
                    </div>
                    <div className="flex gap-1 shrink-0 ml-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-blue-500 hover:text-blue-700 hover:bg-blue-50/50"
                        onClick={() => handleOpenHistory(member)}
                      >
                        <History className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-50/50"
                        onClick={() => handleDelete(member.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 pb-4">
                  {/* 👇 DESIGN UI/UX PREMIUM PARA O SALDO 👇 */}
                  <div className="flex items-center justify-between p-3 bg-muted/40 rounded-lg mb-5 border border-border/50">
                    <div className="flex flex-col items-start">
                      <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider mb-0.5">
                        Total
                      </span>
                      <span className="text-sm font-semibold">
                        {member.package_type}h
                      </span>
                    </div>
                    <div className="h-8 w-px bg-border/60"></div>
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider mb-0.5">
                        Uso
                      </span>
                      <span className="text-sm font-semibold text-muted-foreground">
                        {member.hours_used}h
                      </span>
                    </div>
                    <div className="h-8 w-px bg-border/60"></div>
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] uppercase font-bold text-primary tracking-wider mb-0.5">
                        Restante
                      </span>
                      <span className="text-xl font-black text-primary leading-none">
                        {remainingHours}h
                      </span>
                    </div>
                  </div>

                  {status === "underutilized" && (
                    <div className="mb-4 flex items-center gap-2 text-xs text-amber-600 bg-amber-50/80 p-2.5 rounded-md border border-amber-200/50">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>Uso baixo. Sugira um agendamento!</span>
                    </div>
                  )}
                  {status === "expiring" && (
                    <div className="mb-4 flex items-center gap-2 text-xs text-red-600 bg-red-50/80 p-2.5 rounded-md border border-red-200/50">
                      <CalendarClock className="h-4 w-4 shrink-0" />
                      <span>Atenção: Expira em {daysRemaining} dias.</span>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground font-medium">
                          Progresso do Uso
                        </span>
                        <span className="font-semibold">
                          {usageProgress.toFixed(0)}%
                        </span>
                      </div>
                      <Progress value={usageProgress} className="h-1.5" />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground font-medium">
                          Validade ({daysRemaining} dias restantes)
                        </span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-slate-400 h-full rounded-full transition-all"
                          style={{ width: `${timeProgress}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-muted-foreground/80 font-medium pt-0.5">
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
                    className="flex-1 text-xs h-9 bg-transparent"
                    onClick={() =>
                      window.open(
                        `https://wa.me/55${member.phone.replace(/\D/g, "")}?text=Olá Dr(a). ${member.name.split(" ")[0]}, tudo bem? Vi que você tem ${remainingHours}h de saldo no seu pacote Fusion...`,
                        "_blank",
                      )
                    }
                  >
                    <Phone className="h-3 w-3 mr-1.5 text-green-600" /> WhatsApp
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    className="flex-1 text-xs h-9 shadow-sm"
                    onClick={() => {
                      setSelectedMemberForUsage(member);
                      setIsUsageModalOpen(true);
                    }}
                  >
                    <MinusCircle className="h-3.5 w-3.5 mr-1.5" /> Usar Horas
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* MODAL DE USO */}
      <Dialog open={isUsageModalOpen} onOpenChange={setIsUsageModalOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Registrar Uso</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Data</Label>
                <Input
                  type="date"
                  value={usageData.date}
                  onChange={(e) =>
                    setUsageData({ ...usageData, date: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Horas gastas</Label>
                <Input
                  type="number"
                  step="0.5"
                  value={usageData.hours}
                  onChange={(e) =>
                    setUsageData({ ...usageData, hours: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Descrição / Sala</Label>
              <Input
                value={usageData.notes}
                onChange={(e) =>
                  setUsageData({ ...usageData, notes: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleDeductUsage} disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}{" "}
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL HISTÓRICO */}
      <Dialog open={isHistoryModalOpen} onOpenChange={setIsHistoryModalOpen}>
        <DialogContent className="sm:max-w-[550px] max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-blue-500" />
              Histórico - {selectedMemberHistory?.name}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto pr-2 mt-4 space-y-4">
            {isLoadingHistory ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : historyRecords.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhum uso registrado ainda.
              </p>
            ) : (
              <div className="space-y-3">
                {historyRecords.map((record) => (
                  <div
                    key={record.id}
                    className="p-3 bg-muted/30 rounded-lg border border-border/50 transition-all hover:bg-muted/50"
                  >
                    {editingUsageId === record.id ? (
                      <div className="flex flex-col gap-3">
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            step="0.5"
                            className="w-20 h-8 text-sm"
                            value={editUsageData.hours}
                            onChange={(e) =>
                              setEditUsageData({
                                ...editUsageData,
                                hours: e.target.value,
                              })
                            }
                          />
                          <Input
                            type="date"
                            className="h-8 text-sm flex-1"
                            value={editUsageData.date}
                            onChange={(e) =>
                              setEditUsageData({
                                ...editUsageData,
                                date: e.target.value,
                              })
                            }
                          />
                        </div>
                        <Input
                          className="h-8 text-sm"
                          value={editUsageData.notes}
                          onChange={(e) =>
                            setEditUsageData({
                              ...editUsageData,
                              notes: e.target.value,
                            })
                          }
                        />
                        <div className="flex justify-end gap-2 mt-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => setEditingUsageId(null)}
                          >
                            <X className="h-3 w-3 mr-1" /> Cancelar
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            className="h-7 text-xs bg-green-600 hover:bg-green-700"
                            onClick={handleSaveEdit}
                          >
                            <Check className="h-3 w-3 mr-1" /> Salvar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{record.notes}</p>
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <CalendarClock className="h-3 w-3" />{" "}
                            {new Date(record.usage_date).toLocaleDateString(
                              "pt-BR",
                            )}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge
                            variant="secondary"
                            className="font-bold border-muted-foreground/20 text-foreground"
                          >
                            - {record.hours_deducted}h
                          </Badge>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-slate-400 hover:text-blue-600"
                              onClick={() => startEditing(record)}
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-slate-400 hover:text-red-600"
                              onClick={() => handleDeleteRecord(record)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
