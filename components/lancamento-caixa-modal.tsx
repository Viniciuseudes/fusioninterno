"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registrarLancamentoCaixa } from "@/services/foto-caixa-service";
import { useToast } from "@/components/ui/use-toast";

interface LancamentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  setupId: string;
  salaName: string;
  onSuccess: () => void;
}

export function LancamentoCaixaModal({
  isOpen,
  onClose,
  setupId,
  salaName,
  onSuccess,
}: LancamentoModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [dataLancamento, setDataLancamento] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [horas, setHoras] = useState("");
  const [valor, setValor] = useState("");
  const [descricao, setDescricao] = useState("");

  const handleSave = async () => {
    if (!horas || !valor || !dataLancamento) {
      toast({
        title: "Atenção",
        description: "Preencha a data, as horas e o valor.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await registrarLancamentoCaixa({
        foto_caixa_setup_id: setupId,
        data_lancamento: dataLancamento,
        horas_consumidas: Number(horas),
        valor_faturado: Number(valor),
        descricao: descricao || undefined,
      });

      toast({
        title: "Sucesso!",
        description: "Lançamento registado e stock atualizado.",
      });
      setHoras("");
      setValor("");
      setDescricao("");
      onSuccess();
      onClose();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível registar o lançamento.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Lançar Venda - {salaName}</DialogTitle>
          <DialogDescription>
            Registe uma venda manual. O sistema abaterá as horas do stock e
            somará ao faturamento.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Label>Data do Consumo</Label>
            <Input
              type="date"
              value={dataLancamento}
              onChange={(e) => setDataLancamento(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label>Horas Consumidas (Ex: 1.5)</Label>
              <Input
                type="number"
                step="0.5"
                placeholder="Ex: 2"
                value={horas}
                onChange={(e) => setHoras(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Valor Faturado (R$)</Label>
              <Input
                type="number"
                placeholder="Ex: 80"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Descrição (Opcional)</Label>
            <Input
              placeholder="Ex: Cliente João - 15h às 17h"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "A guardar..." : "Registar Lançamento"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
