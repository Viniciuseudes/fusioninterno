import { createClient } from '@/lib/supabase/client';
import { FotoCaixaSala, FotoCaixaSetup } from '@/types'; 

// ==========================================
// 1. GESTÃO DE SALAS INTERNAS
// ==========================================

export async function getSalasInternas() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('foto_caixa_salas')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (error) throw error;
  return data as FotoCaixaSala[];
}

export async function criarSalaInterna(name: string, calendar_room_id?: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('foto_caixa_salas')
    .insert({ name, calendar_room_id: calendar_room_id || null })
    .select()
    .single();

  if (error) throw error;
  return data as FotoCaixaSala;
}

// ==========================================
// 2. MOTOR DE CÁLCULO E SETUPS MENSAIS
// ==========================================

export function calculateAvailableHours(year: number, month: number, hoursPerDay: number, blockedWeekdays: number[]): number {
  let validDays = 0;
  const daysInMonth = new Date(year, month, 0).getDate(); 

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    const weekDay = date.getDay();
    if (!blockedWeekdays.includes(weekDay)) {
      validDays++;
    }
  }
  return validDays * hoursPerDay;
}

// CORREÇÃO FEITA AQUI: Adicionado 'total_available_hours' no Omit
export async function saveSetupMes(data: Omit<FotoCaixaSetup, 'id' | 'sala' | 'booked_hours' | 'booked_revenue' | 'remaining_hours' | 'revenue_progress_percentage' | 'total_available_hours'>) {
  const supabase = createClient();

  // Calcula o stock real do mês
  const total_available_hours = calculateAvailableHours(
    data.year,
    data.month,
    data.operational_hours_per_day,
    data.blocked_weekdays || []
  );

  const payload = { ...data, total_available_hours };

  const { data: result, error } = await supabase
    .from('foto_caixa_setups')
    .upsert(payload, { onConflict: 'foto_caixa_sala_id, month, year' })
    .select()
    .single();

  if (error) throw error;
  return result;
}

// ==========================================
// 3. A FOTO DO CAIXA (O CRUZAMENTO DE DADOS)
// ==========================================

export async function getDashboardFotoCaixa(year: number, month: number) {
  const supabase = createClient();

  // 1. Buscar todas as salas internas
  const { data: salas, error: salasError } = await supabase.from('foto_caixa_salas').select('*').eq('is_active', true);
  if (salasError) throw salasError;

  // 2. Buscar os setups configurados para o mês
  const { data: setups, error: setupsError } = await supabase
    .from('foto_caixa_setups')
    .select('*')
    .eq('year', year)
    .eq('month', month);
  if (setupsError) throw setupsError;

  // 3. Buscar agendamentos reais (Events) para abater do stock
  const startDate = new Date(year, month - 1, 1).toISOString();
  const endDate = new Date(year, month, 0, 23, 59, 59).toISOString();
  
  const { data: events, error: eventsError } = await supabase
    .from('events')
    .select('*')
    .gte('start_time', startDate)
    .lte('start_time', endDate);
  
  if (eventsError) console.error("Erro ao buscar eventos do calendário", eventsError);

  // 4. Montar o Relatório Final
  const relatorio: FotoCaixaSetup[] = (salas || []).map((sala) => {
    const setup = setups?.find(s => s.foto_caixa_sala_id === sala.id);
    
    let bookedHours = 0;
    if (sala.calendar_room_id && events) {
      const roomEvents = events.filter(e => e.room_id === sala.calendar_room_id);
      roomEvents.forEach(event => {
        const start = new Date(event.start_time).getTime();
        const end = new Date(event.end_time).getTime();
        bookedHours += (end - start) / (1000 * 60 * 60);
      });
    }

    if (!setup) {
      return {
        id: 'pendente',
        foto_caixa_sala_id: sala.id,
        sala: sala,
        month, year, base_price_per_hour: 0, operational_hours_per_day: 0, blocked_weekdays: [], total_available_hours: 0, monthly_goal_hours: 0, monthly_goal_revenue: 0
      } as FotoCaixaSetup;
    }

    const bookedRevenue = bookedHours * setup.base_price_per_hour;

    return {
      ...setup,
      sala: sala,
      booked_hours: bookedHours,
      booked_revenue: bookedRevenue,
      remaining_hours: setup.total_available_hours - bookedHours,
      revenue_progress_percentage: setup.monthly_goal_revenue > 0 ? (bookedRevenue / setup.monthly_goal_revenue) * 100 : 0
    };
  });

  return relatorio;
}