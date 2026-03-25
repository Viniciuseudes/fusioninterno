export interface FotoCaixaSala {
  id: string;
  name: string;
  is_active: boolean;
  calendar_room_id?: string | null;
  created_at?: string;
}

// A nova estrutura de horário para cada dia
export interface DailySchedule {
  active: boolean;
  start: string; // Ex: "08:00"
  end: string;   // Ex: "18:00"
}

export interface FotoCaixaSetup {
  id: string;
  foto_caixa_sala_id: string;
  month: number;
  year: number;
  base_price_per_hour: number;
  
  // Substituímos os campos antigos por este JSON
  daily_schedule: Record<string, DailySchedule>; // Chaves de "0" (Dom) a "6" (Sáb)
  
  total_available_hours: number;
  monthly_goal_hours: number;
  monthly_goal_revenue: number;
  
  sala?: FotoCaixaSala;
  booked_hours?: number;
  booked_revenue?: number;
  remaining_hours?: number;
  revenue_progress_percentage?: number;
}

export interface FotoCaixaLancamento {
  id: string;
  foto_caixa_setup_id: string;
  data_lancamento: string;
  horas_consumidas: number;
  valor_faturado: number;
  descricao?: string;
  created_at?: string;
}