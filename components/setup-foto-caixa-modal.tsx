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
import { Checkbox } from "@/components/ui/checkbox";
import { saveSetupMes } from "@/services/foto-caixa-service";
import { useToast } from "@/components/ui/use-toast";

interface SetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  salaId: string;
  salaName: string;
  month: number;
  year: number;
  onSuccess: () => void;
}

const WEEKDAYS = [
  { id: 0, label: "Dom" },
  { id: 1, label: "Seg" },
  { id: 2, label: "Ter" },
  { id: 3, label: "Qua" },
  { id: 4, label: "Qui" },
  { id: 5, label: "Sex" },
  { id: 6, label: "Sáb" },
];

export function SetupFotoCaixaModal({
  isOpen,
  onClose,
  salaId,
  salaName,
  month,
  year,
  onSuccess,
}: SetupModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [basePrice, setBasePrice] = useState("40");
  const [hoursPerDay, setHoursPerDay] = useState("10");
  const [blockedDays, setBlockedDays] = useState<number[]>([]);
  const [goalHours, setGoalHours] = useState("150");
  const [goalRevenue, setGoalRevenue] = useState("6000");

  const toggleDay = (dayId: number) => {
    setBlockedDays((prev) =>
      prev.includes(dayId) ? prev.filter((d) => d !== dayId) : [...prev, dayId],
    );
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await saveSetupMes({
        foto_caixa_sala_id: salaId,
        month,
        year,
        base_price_per_hour: Number(basePrice),
        operational_hours_per_day: Number(hoursPerDay),
        blocked_weekdays: blockedDays,
        monthly_goal_hours: Number(goalHours),
        monthly_goal_revenue: Number(goalRevenue),
      });
      toast({ title: "Sucesso!", description: "Mês configurado com sucesso." });
      onSuccess();
      onClose();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao guardar configuração.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            Setup do Mês: {month}/{year}
          </DialogTitle>
          <DialogDescription>
            Configurar as regras e metas para <strong>{salaName}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label>Preço por Hora (R$)</Label>
              <Input
                type="number"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Horas Abertas/Dia</Label>
              <Input
                type="number"
                value={hoursPerDay}
                onChange={(e) => setHoursPerDay(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Dias da semana BLOQUEADOS</Label>
            <div className="grid grid-cols-4 gap-2 mt-1">
              {WEEKDAYS.map((day) => (
                <div key={day.id} className="flex items-center space-x-2">
                  <Checkbox
                    checked={blockedDays.includes(day.id)}
                    onCheckedChange={() => toggleDay(day.id)}
                  />
                  <Label className="text-xs">{day.label}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-2">
            <div className="flex flex-col gap-2">
              <Label>Meta Mensal (Horas)</Label>
              <Input
                type="number"
                value={goalHours}
                onChange={(e) => setGoalHours(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Meta Mensal (R$)</Label>
              <Input
                type="number"
                value={goalRevenue}
                onChange={(e) => setGoalRevenue(e.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "A guardar..." : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
