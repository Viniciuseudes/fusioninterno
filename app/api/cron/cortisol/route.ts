import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Cortisol } from '@/services/cortisol-service';

// Usamos o Admin Client para ter poder total de leitura (ignorar RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  // Segurança recomendada pela Vercel para garantir que só eles chamam isto
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Não autorizado', { status: 401 });
  }

  try {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    // Busca todas as tarefas que NÃO ESTÃO CONCLUÍDAS ('done')
    const { data: tasks } = await supabaseAdmin
      .from('tasks')
      .select('id, name, due_date, status, task_owners(user_id)')
      .neq('status', 'done')
      .not('due_date', 'is', null);

    if (!tasks) return NextResponse.json({ success: true, message: "Nenhuma tarefa ativa." });

    let alertasEnviados = 0;

    for (const task of tasks) {
      const dataVencimento = new Date(task.due_date);
      dataVencimento.setHours(0, 0, 0, 0);

      const donos = task.task_owners.map((owner: any) => owner.user_id);

      // Se vence HOJE
      if (dataVencimento.getTime() === hoje.getTime()) {
        for (const userId of donos) {
          await Cortisol.notifyDueToday(supabaseAdmin, userId, task.id, task.name);
          alertasEnviados++;
        }
      } 
      // Se já passou de HOJE (Atrasada)
      else if (dataVencimento.getTime() < hoje.getTime()) {
        for (const userId of donos) {
          await Cortisol.notifyOverdue(supabaseAdmin, userId, task.id, task.name);
          alertasEnviados++;
        }
      }
    }

    return NextResponse.json({ success: true, message: `Cortisol atacou! ${alertasEnviados} alertas enviados.` });
  } catch (error) {
    console.error("Erro no Cron do Cortisol:", error);
    return NextResponse.json({ error: "Falha na matriz" }, { status: 500 });
  }
}
