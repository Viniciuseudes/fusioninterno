// 1. A Sala Interna (Apenas para o seu controlo financeiro)
export interface FotoCaixaSala {
  id: string;
  name: string;
  is_active: boolean;
  calendar_room_id?: string | null; // O elo de ligação opcional com o calendário real
  created_at?: string;
}

// 2. O Setup do Mês para aquela Sala
export interface FotoCaixaSetup {
  id: string;
  foto_caixa_sala_id: string;
  month: number;
  year: number;
  base_price_per_hour: number;
  operational_hours_per_day: number;
  blocked_weekdays: number[];
  total_available_hours: number;
  monthly_goal_hours: number;
  monthly_goal_revenue: number;
  
  // Campos calculados dinamicamente que o nosso motor vai preencher para a Interface
  sala?: FotoCaixaSala;
  booked_hours?: number;
  booked_revenue?: number;
  remaining_hours?: number;
  revenue_progress_percentage?: number;
}