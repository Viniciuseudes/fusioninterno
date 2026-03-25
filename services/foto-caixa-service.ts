import { createClient } from '@/lib/supabase/client';
import { FotoCaixaSala, FotoCaixaSetup, FotoCaixaLancamento, DailySchedule } from '@/types'; 

// ==========================================
// 1. GESTÃO DE SALAS INTERNAS
// ==========================================

export async function getSalasInternas() {
  const supabase = createClient();
  const { data, error } = await supabase.from('foto_caixa_salas').select('*').eq('is_active', true).order('name');
  if (error) throw error;
  return data as FotoCaixaSala[];
}

export async function criarSalaInterna(name: string, calendar_room_id?: string) {
  const supabase = createClient();
  const { data, error } = await supabase.from('foto_caixa_salas').insert({ name, calendar_room_id: calendar_room_id || null }).select().single();
  if (error) throw error;
  return data as FotoCaixaSala;
}

export async function editarSalaInterna(id: string, name: string, calendar_room_id?: string) {
  const supabase = createClient();
  const { error } = await supabase.from('foto_caixa_salas').update({ name, calendar_room_id: calendar_room_id || null }).eq('id', id);
  if (error) throw error;
}

export async function deletarSalaInterna(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from('foto_caixa_salas').delete().eq('id', id);
  if (error) throw error;
}

// ==========================================
// 2. MOTOR DE CÁLCULO E SETUPS MENSAIS
// ==========================================

// Função auxiliar para converter "13:30" em 13.5 horas
function timeToHours(timeStr: string): number {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours + (minutes / 60);
}

export function calculateAvailableHours(year: number, month: number, schedule: Record<string, DailySchedule>): number {
  let totalHours = 0;
  const daysInMonth = new Date(year, month, 0).getDate(); 

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    const weekDay = date.getDay().toString();
    const dayConfig = schedule[weekDay];

    if (dayConfig && dayConfig.active) {
      const startHours = timeToHours(dayConfig.start);
      const endHours = timeToHours(dayConfig.end);
      if (endHours > startHours) {
        totalHours += (endHours - startHours);
      }
    }
  }
  return totalHours;
}

export async function saveSetupMes(data: Omit<FotoCaixaSetup, 'id' | 'sala' | 'booked_hours' | 'booked_revenue' | 'remaining_hours' | 'revenue_progress_percentage' | 'total_available_hours'>) {
  const supabase = createClient();

  const total_available_hours = calculateAvailableHours(data.year, data.month, data.daily_schedule);
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
// 3. LANÇAMENTOS DE VENDAS MANUAIS
// ==========================================

export async function registrarLancamentoCaixa(lancamento: Omit<FotoCaixaLancamento, 'id' | 'created_at'>) {
  const supabase = createClient();
  const { error } = await supabase.from('foto_caixa_lancamentos').insert(lancamento);
  if (error) throw error;
}

// ==========================================
// 4. A FOTO DO CAIXA (O CRUZAMENTO DE DADOS)
// ==========================================

export async function getDashboardFotoCaixa(year: number, month: number) {
  const supabase = createClient();

  // 1. Salas e Setups
  const { data: salas } = await supabase.from('foto_caixa_salas').select('*').eq('is_active', true);
  const { data: setups } = await supabase.from('foto_caixa_setups').select('*').eq('year', year).eq('month', month);

  // 2. Busca Lançamentos Manuais daquele mês
  const setupIds = setups?.map(s => s.id) || [];
  let lancamentos: FotoCaixaLancamento[] = [];
  if (setupIds.length > 0) {
    const { data: lancs } = await supabase.from('foto_caixa_lancamentos').select('*').in('foto_caixa_setup_id', setupIds);
    lancamentos = lancs || [];
  }

  // 3. Busca Eventos do Calendário (Para as salas conectadas)
  const startDate = new Date(year, month - 1, 1).toISOString();
  const endDate = new Date(year, month, 0, 23, 59, 59).toISOString();
  const { data: events } = await supabase.from('events').select('*').gte('start_time', startDate).lte('start_time', endDate);

  // 4. Cruzamento
  const relatorio: FotoCaixaSetup[] = (salas || []).map((sala) => {
    const setup = setups?.find(s => s.foto_caixa_sala_id === sala.id);
    
    let bookedHours = 0;
    let bookedRevenue = 0;

    if (!setup) {
      return { id: 'pendente', foto_caixa_sala_id: sala.id, sala: sala, month, year, base_price_per_hour: 0, daily_schedule: {}, total_available_hours: 0, monthly_goal_hours: 0, monthly_goal_revenue: 0 } as FotoCaixaSetup;
    }

    // A. Soma as horas do Calendário Real (se configurado)
    if (sala.calendar_room_id && events) {
      const roomEvents = events.filter(e => e.room_id === sala.calendar_room_id);
      roomEvents.forEach(event => {
        const start = new Date(event.start_time).getTime();
        const end = new Date(event.end_time).getTime();
        const hrs = (end - start) / (1000 * 60 * 60);
        bookedHours += hrs;
        bookedRevenue += (hrs * setup.base_price_per_hour);
      });
    }

    // B. Soma os Lançamentos Manuais (A nova funcionalidade)
    const meusLancamentos = lancamentos.filter(l => l.foto_caixa_setup_id === setup.id);
    meusLancamentos.forEach(l => {
      bookedHours += Number(l.horas_consumidas);
      bookedRevenue += Number(l.valor_faturado);
    });

    return {
      ...setup,
      sala: sala,
      booked_hours: bookedHours,
      booked_revenue: bookedRevenue,
      remaining_hours: Math.max(0, setup.total_available_hours - bookedHours),
      revenue_progress_percentage: setup.monthly_goal_revenue > 0 ? (bookedRevenue / setup.monthly_goal_revenue) * 100 : 0
    };
  });

  return relatorio;
}