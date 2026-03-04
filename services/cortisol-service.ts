import webpush from 'web-push';
import { SupabaseClient } from '@supabase/supabase-js';

webpush.setVapidDetails(
  'mailto:contato@fusioninterno.com.br',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

// Função interna auxiliar para disparar o Push para todos os aparelhos
async function dispararPush(supabase: SupabaseClient, userId: string, title: string, body: string, url: string) {
  const { data: subs } = await supabase.from('push_subscriptions').select('subscription').eq('user_id', userId);
  
  if (subs && subs.length > 0) {
    const payload = JSON.stringify({ title, body, url });
    const pushPromises = subs.map(sub =>
      webpush.sendNotification(sub.subscription, payload).catch(err => console.error("Erro Push:", err))
    );
    await Promise.all(pushPromises);
  }
}

export const Cortisol = {
  // 1. NOVA TAREFA (O que já tínhamos)
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
    if (taskOwnerId === commenterId) return; // Não notifica se fui eu que comentei

    const content = `${commenterName} mandou mensagem na tarefa "${taskName}". Vai lá responder antes que acumule! 💬`;

    await supabase.from('notifications').insert({
      user_id: taskOwnerId, from_user_id: commenterId, task_id: taskId, type: 'comment', content, read: false
    });

    await dispararPush(supabase, taskOwnerId, '💬 Nova Mensagem', content, `/`);
  },

  // 3. TAREFA VENCE HOJE (Aviso do Cron)
  async notifyDueToday(supabase: SupabaseClient, userId: string, taskId: string, taskName: string) {
    const content = `Atenção! A tarefa "${taskName}" vence HOJE. Mexa-se! 🏃‍♂️💨`;

    await supabase.from('notifications').insert({
      user_id: userId, task_id: taskId, type: 'deadline', content, read: false
    });

    // Cortisol coloca uma mensagem dentro da própria tarefa (Chat) simulando um Bot!
    await supabase.from('task_messages').insert({
      task_id: taskId,
      content: `🤖 *Cortisol Bot:* Pessoal, passando para lembrar que esta tarefa VENCE HOJE! Não me decepcionem.`,
      type: 'text',
      user_id: null // Se o seu BD permitir null, ele aparece como sistema
    });

    await dispararPush(supabase, userId, '⏰ Prazo Esgotando!', content, `/`);
  },

  // 4. TAREFA ATRASADA (Aviso do Cron)
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