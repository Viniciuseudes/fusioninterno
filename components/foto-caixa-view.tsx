"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { getDashboardFotoCaixa } from "@/services/foto-caixa-service";
import { FotoCaixaSetup } from "@/types";
import { Target, Clock, Plus, Settings } from "lucide-react";
import { CreateFotoCaixaSalaModal } from "./create-foto-caixa-sala-modal";
import { SetupFotoCaixaModal } from "./setup-foto-caixa-modal";

export function FotoCaixaView() {
  const [metrics, setMetrics] = useState<FotoCaixaSetup[]>([]);
  const [loading, setLoading] = useState(true);

  // Controlo de tempo
  const dataAtual = new Date();
  const [currentMonth, setCurrentMonth] = useState(dataAtual.getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(dataAtual.getFullYear());

  // Controlo dos Modais
  const [isCreateSalaOpen, setIsCreateSalaOpen] = useState(false);
  const [setupModalConfig, setSetupModalConfig] = useState<{
    isOpen: boolean;
    salaId: string;
    salaName: string;
  }>({
    isOpen: false,
    salaId: "",
    salaName: "",
  });

  const fetchDados = async () => {
    setLoading(true);
    try {
      const dados = await getDashboardFotoCaixa(currentYear, currentMonth);
      setMetrics(dados);
    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDados();
  }, [currentMonth, currentYear]);

  // Cálculos Globais (Apenas das salas que já têm setup feito)
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
            className="flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
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
            <Plus className="mr-2 h-4 w-4" /> Nova Sala Interna
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-muted-foreground">
          A carregar o Motor de Cálculos...
        </div>
      ) : (
        <>
          {/* Visão Global */}
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
                <p className="text-xs text-muted-foreground">
                  de R$ {metaGlobalRendimento.toFixed(2)}
                </p>
                <Progress value={progressoGlobal} className="mt-3" />
                <p className="text-xs text-right mt-1">
                  {progressoGlobal.toFixed(1)}%
                </p>
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
                <p className="text-xs text-muted-foreground">
                  de {estoqueTotalGlobal}h disponíveis no mês
                </p>
                <Progress value={progressoEstoque} className="mt-3" />
                <p className="text-xs text-right mt-1">
                  {progressoEstoque.toFixed(1)}%
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Análise por Sala */}
          <h2 className="text-xl font-bold mt-8 mb-4">
            Salas Internas ({metrics.length})
          </h2>
          {metrics.length === 0 ? (
            <div className="text-center p-8 border border-dashed rounded-lg">
              <p className="text-muted-foreground mb-4">
                Ainda não tem salas internas registadas.
              </p>
              <Button
                variant="outline"
                onClick={() => setIsCreateSalaOpen(true)}
              >
                Criar a primeira sala
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {metrics.map((item) => (
                <Card
                  key={item.sala?.id}
                  className={`flex flex-col ${item.id === "pendente" ? "border-dashed border-yellow-500/50 bg-yellow-50/50 dark:bg-yellow-900/10" : ""}`}
                >
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">{item.sala?.name}</CardTitle>
                    {item.id === "pendente" && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                        Sem Setup
                      </span>
                    )}
                  </CardHeader>

                  <CardContent className="flex-1 flex flex-col justify-between">
                    {item.id === "pendente" ? (
                      <div className="flex flex-col items-center justify-center h-full py-6 space-y-4">
                        <p className="text-sm text-center text-muted-foreground">
                          O mês de {currentMonth}/{currentYear} não foi
                          configurado para esta sala.
                        </p>
                        <Button
                          variant="secondary"
                          size="sm"
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
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Modais */}
      <CreateFotoCaixaSalaModal
        isOpen={isCreateSalaOpen}
        onClose={() => setIsCreateSalaOpen(false)}
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
    </div>
  );
}
