"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  getDashboardFotoCaixa,
  deletarSalaInterna,
} from "@/services/foto-caixa-service";
import { FotoCaixaSetup, FotoCaixaSala } from "@/types";
import {
  Target,
  Clock,
  Plus,
  Settings,
  MoreVertical,
  Edit,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import { CreateFotoCaixaSalaModal } from "./create-foto-caixa-sala-modal";
import { SetupFotoCaixaModal } from "./setup-foto-caixa-modal";
import { EditFotoCaixaSalaModal } from "./edit-foto-caixa-sala-modal";
import { LancamentoCaixaModal } from "./lancamento-caixa-modal";
import { useToast } from "@/components/ui/use-toast";

export function FotoCaixaView() {
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<FotoCaixaSetup[]>([]);
  const [loading, setLoading] = useState(true);

  const dataAtual = new Date();
  const [currentMonth, setCurrentMonth] = useState(dataAtual.getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(dataAtual.getFullYear());

  // Controlo dos Modais
  const [isCreateSalaOpen, setIsCreateSalaOpen] = useState(false);
  const [salaToEdit, setSalaToEdit] = useState<FotoCaixaSala | null>(null);
  const [setupModalConfig, setSetupModalConfig] = useState<{
    isOpen: boolean;
    salaId: string;
    salaName: string;
  }>({ isOpen: false, salaId: "", salaName: "" });
  const [lancamentoConfig, setLancamentoConfig] = useState<{
    isOpen: boolean;
    setupId: string;
    salaName: string;
  }>({ isOpen: false, setupId: "", salaName: "" });

  const fetchDados = async () => {
    setLoading(true);
    try {
      const dados = await getDashboardFotoCaixa(currentYear, currentMonth);
      setMetrics(dados);
    } catch (error) {
      console.error("Erro:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDados();
  }, [currentMonth, currentYear]);

  const handleDeleteSala = async (salaId: string) => {
    if (
      confirm(
        "Tem certeza que deseja apagar esta sala e todo o seu histórico da Foto do Caixa?",
      )
    ) {
      try {
        await deletarSalaInterna(salaId);
        toast({ title: "Excluída", description: "A sala foi apagada." });
        fetchDados();
      } catch (error) {
        toast({
          title: "Erro",
          description: "Falha ao apagar sala.",
          variant: "destructive",
        });
      }
    }
  };

  const setupsValidos = metrics.filter((m) => m.id !== "pendente");
  const metaGlobalRendimento = setupsValidos.reduce(
    (acc, curr) => acc + curr.monthly_goal_revenue,
    0,
  );
  const totalRendimentoRealizado = setupsValidos.reduce(
    (acc, curr) => acc + (curr.booked_revenue || 0),
    0,
  );
  const progressoGlobal =
    metaGlobalRendimento > 0
      ? (totalRendimentoRealizado / metaGlobalRendimento) * 100
      : 0;

  const estoqueTotalGlobal = setupsValidos.reduce(
    (acc, curr) => acc + curr.total_available_hours,
    0,
  );
  const estoqueVendidoGlobal = setupsValidos.reduce(
    (acc, curr) => acc + (curr.booked_hours || 0),
    0,
  );
  const progressoEstoque =
    estoqueTotalGlobal > 0
      ? (estoqueVendidoGlobal / estoqueTotalGlobal) * 100
      : 0;

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Foto do Caixa</h1>
          <p className="text-muted-foreground">
            Gestão de Yield e Stock de Horas
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            className="flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={currentMonth}
            onChange={(e) => setCurrentMonth(Number(e.target.value))}
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                Mês {m}
              </option>
            ))}
          </select>
          <Button onClick={() => setIsCreateSalaOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Nova Sala
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-muted-foreground">
          A carregar dados...
        </div>
      ) : (
        <>
          {/* Visão Global - Omitida aqui para focar nos cartões, mas igual à anterior */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Meta de Faturação Global
                </CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  R$ {totalRendimentoRealizado.toFixed(2)}
                </div>
                <Progress value={progressoGlobal} className="mt-3" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Stock de Horas Global
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {estoqueVendidoGlobal.toFixed(1)}h vendidas
                </div>
                <Progress value={progressoEstoque} className="mt-3" />
              </CardContent>
            </Card>
          </div>

          <h2 className="text-xl font-bold mt-8 mb-4">Salas Internas</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {metrics.map((item) => (
              <Card
                key={item.sala?.id}
                className={`flex flex-col relative ${item.id === "pendente" ? "border-dashed" : ""}`}
              >
                <CardHeader className="pb-2 flex flex-row items-start justify-between pr-10">
                  <CardTitle className="text-lg leading-tight">
                    {item.sala?.name}
                  </CardTitle>

                  {/* Menu de Edição / Exclusão */}
                  <div className="absolute top-4 right-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => setSalaToEdit(item.sala!)}
                        >
                          <Edit className="mr-2 h-4 w-4" /> Editar Sala
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            setSetupModalConfig({
                              isOpen: true,
                              salaId: item.sala!.id,
                              salaName: item.sala!.name,
                            })
                          }
                        >
                          <Settings className="mr-2 h-4 w-4" /> Editar Setup
                          (Mês)
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDeleteSala(item.sala!.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Excluir Sala
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col justify-between">
                  {item.id === "pendente" ? (
                    <div className="flex flex-col items-center py-4 space-y-4">
                      <Button
                        variant="secondary"
                        onClick={() =>
                          setSetupModalConfig({
                            isOpen: true,
                            salaId: item.sala!.id,
                            salaName: item.sala!.name,
                          })
                        }
                      >
                        <Settings className="h-4 w-4 mr-2" /> Configurar Mês
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">
                            Faturação
                          </span>
                          <span className="font-medium">
                            R$ {item.booked_revenue?.toFixed(2)} / R${" "}
                            {item.monthly_goal_revenue}
                          </span>
                        </div>
                        <Progress
                          value={item.revenue_progress_percentage}
                          className="h-2"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-4 border-t text-sm">
                        <div>
                          <p className="text-muted-foreground">
                            Stock Restante
                          </p>
                          <p className="font-bold text-lg">
                            {item.remaining_hours?.toFixed(1)}h
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-muted-foreground">Preço/Hora</p>
                          <p className="font-bold text-lg">
                            R$ {item.base_price_per_hour}
                          </p>
                        </div>
                      </div>

                      {/* Botão de Lançamento Manual Rápido */}
                      <Button
                        variant="default"
                        className="w-full mt-2"
                        onClick={() =>
                          setLancamentoConfig({
                            isOpen: true,
                            setupId: item.id,
                            salaName: item.sala!.name,
                          })
                        }
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" /> Lançar Venda
                        Manual
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Renders dos Modais */}
      <CreateFotoCaixaSalaModal
        isOpen={isCreateSalaOpen}
        onClose={() => setIsCreateSalaOpen(false)}
        onSuccess={fetchDados}
      />
      <EditFotoCaixaSalaModal
        isOpen={!!salaToEdit}
        onClose={() => setSalaToEdit(null)}
        sala={salaToEdit}
        onSuccess={fetchDados}
      />
      <SetupFotoCaixaModal
        isOpen={setupModalConfig.isOpen}
        onClose={() =>
          setSetupModalConfig((prev) => ({ ...prev, isOpen: false }))
        }
        salaId={setupModalConfig.salaId}
        salaName={setupModalConfig.salaName}
        month={currentMonth}
        year={currentYear}
        onSuccess={fetchDados}
      />
      <LancamentoCaixaModal
        isOpen={lancamentoConfig.isOpen}
        onClose={() =>
          setLancamentoConfig((prev) => ({ ...prev, isOpen: false }))
        }
        setupId={lancamentoConfig.setupId}
        salaName={lancamentoConfig.salaName}
        onSuccess={fetchDados}
      />
    </div>
  );
}
