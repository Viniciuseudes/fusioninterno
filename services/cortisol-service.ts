import { SupabaseClient } from '@supabase/supabase-js';

// Função auxiliar para delegar o disparo do Web Push para uma rota de API (Server-Side)
async function dispararPush(supabase: SupabaseClient, userId: string, title: string, body: string, url: string) {
  try {
    // Aqui chamamos uma API route que irá executar a biblioteca 'web-push' no servidor
    await fetch('/api/push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, title, body, url }),
    });
  } catch (err) {
    console.error("Erro ao chamar a API de Push:", err);
  }
}

export const Cortisol = {
  // 1. NOVA TAREFA
  async notifyNewTask(supabase: SupabaseClient, assignedUserId: string, fromUserId: string, taskId: string, taskName: string, assignerName: string) {
    if (assignedUserId === fromUserId) return;

    const content = `${assignerName} delegou a tarefa "${taskName}" para você. O Cortisol já está subindo! ⚠️`;
    
    await supabase.from('notifications').insert({
      user_id: assignedUserId, from_user_id: fromUserId, task_id: taskId, type: 'assignment', content, read: false
    });

    await dispararPush(supabase, assignedUserId, '⚠️ Novo Fogo no Parquinho!', content, `/`);
  },

  // 2. NOVO COMENTÁRIO NA TAREFA
  async notifyNewComment(supabase: SupabaseClient, taskOwnerId: string, commenterId: string, taskId: string, taskName: string, commenterName: string) {
    if (taskOwnerId === commenterId) return;

    const content = `${commenterName} mandou mensagem na tarefa "${taskName}". Vai lá responder antes que acumule! 💬`;

    await supabase.from('notifications').insert({
      user_id: taskOwnerId, from_user_id: commenterId, task_id: taskId, type: 'comment', content, read: false
    });

    await dispararPush(supabase, taskOwnerId, '💬 Nova Mensagem', content, `/`);
  },

  // 3. TAREFA VENCE HOJE
  async notifyDueToday(supabase: SupabaseClient, userId: string, taskId: string, taskName: string) {
    const content = `Atenção! A tarefa "${taskName}" vence HOJE. Mexa-se! 🏃‍♂️💨`;

    await supabase.from('notifications').insert({
      user_id: userId, task_id: taskId, type: 'deadline', content, read: false
    });

    await supabase.from('task_messages').insert({
      task_id: taskId,
      content: `🤖 *Cortisol Bot:* Pessoal, passando para lembrar que esta tarefa VENCE HOJE! Não me decepcionem.`,
      type: 'text',
      user_id: null 
    });

    await dispararPush(supabase, userId, '⏰ Prazo Esgotando!', content, `/`);
  },

  // 4. TAREFA ATRASADA
  async notifyOverdue(supabase: SupabaseClient, userId: string, taskId: string, taskName: string) {
    const content = `Péssimas notícias! A tarefa "${taskName}" ESTÁ ATRASADA. O chefe já sabe? 🚨`;

    await supabase.from('notifications').insert({
      user_id: userId, task_id: taskId, type: 'deadline', content, read: false
    });

    await supabase.from('task_messages').insert({
      task_id: taskId,
      content: `🤖 *Cortisol Bot:* ALARME DE ATRASO! 🚨 Esta tarefa passou do prazo. Precisamos resolver isso urgente.`,
      type: 'text'
    });

    await dispararPush(supabase, userId, '🚨 TAREFA ATRASADA!', content, `/`);
  }
};