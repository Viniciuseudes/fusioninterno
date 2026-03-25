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
import { Switch } from "@/components/ui/switch";
import { saveSetupMes } from "@/services/foto-caixa-service";
import { useToast } from "@/components/ui/use-toast";
import { DailySchedule } from "@/types";

interface SetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  salaId: string;
  salaName: string;
  month: number;
  year: number;
  onSuccess: () => void;
}

const DIAS_SEMANA = [
  { id: "0", label: "Dom" },
  { id: "1", label: "Seg" },
  { id: "2", label: "Ter" },
  { id: "3", label: "Qua" },
  { id: "4", label: "Qui" },
  { id: "5", label: "Sex" },
  { id: "6", label: "Sáb" },
];

const DEFAULT_SCHEDULE: Record<string, DailySchedule> = {
  "0": { active: false, start: "08:00", end: "18:00" },
  "1": { active: true, start: "08:00", end: "18:00" },
  "2": { active: true, start: "08:00", end: "18:00" },
  "3": { active: true, start: "08:00", end: "18:00" },
  "4": { active: true, start: "08:00", end: "18:00" },
  "5": { active: true, start: "08:00", end: "18:00" },
  "6": { active: true, start: "08:00", end: "13:00" },
};

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
  const [goalHours, setGoalHours] = useState("150");
  const [goalRevenue, setGoalRevenue] = useState("6000");
  const [schedule, setSchedule] =
    useState<Record<string, DailySchedule>>(DEFAULT_SCHEDULE);

  const updateSchedule = (
    dayId: string,
    field: keyof DailySchedule,
    value: any,
  ) => {
    setSchedule((prev) => ({
      ...prev,
      [dayId]: { ...prev[dayId], [field]: value },
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await saveSetupMes({
        foto_caixa_sala_id: salaId,
        month,
        year,
        base_price_per_hour: Number(basePrice),
        daily_schedule: schedule,
        monthly_goal_hours: Number(goalHours),
        monthly_goal_revenue: Number(goalRevenue),
      });
      toast({
        title: "Sucesso!",
        description: "Mês configurado com a nova grade.",
      });
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Setup do Mês: {month}/{year} - {salaName}
          </DialogTitle>
          <DialogDescription>
            Defina a grelha de horários exata e as metas.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-3 gap-4 border-b pb-4">
            <div className="flex flex-col gap-2">
              <Label>Preço/Hora (R$)</Label>
              <Input
                type="number"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
              />
            </div>
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

          <div className="flex flex-col gap-3">
            <Label className="font-bold">Grade de Horários</Label>
            {DIAS_SEMANA.map((day) => (
              <div
                key={day.id}
                className="flex items-center gap-4 bg-muted/30 p-2 rounded-md"
              >
                <div className="flex items-center gap-2 w-20">
                  <Switch
                    checked={schedule[day.id]?.active}
                    onCheckedChange={(checked) =>
                      updateSchedule(day.id, "active", checked)
                    }
                  />
                  <Label
                    className={
                      schedule[day.id]?.active
                        ? "font-bold"
                        : "text-muted-foreground"
                    }
                  >
                    {day.label}
                  </Label>
                </div>

                {schedule[day.id]?.active ? (
                  <div className="flex items-center gap-2 flex-1">
                    <Input
                      type="time"
                      value={schedule[day.id]?.start}
                      onChange={(e) =>
                        updateSchedule(day.id, "start", e.target.value)
                      }
                      className="w-24 h-8 text-sm"
                    />
                    <span className="text-sm">até</span>
                    <Input
                      type="time"
                      value={schedule[day.id]?.end}
                      onChange={(e) =>
                        updateSchedule(day.id, "end", e.target.value)
                      }
                      className="w-24 h-8 text-sm"
                    />
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground flex-1">
                    Fechado
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "A guardar..." : "Guardar Setup"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
