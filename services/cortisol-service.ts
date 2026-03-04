import webpush from 'web-push';
import { SupabaseClient } from '@supabase/supabase-js';

// Configuração de segurança do Web Push
webpush.setVapidDetails(
  'mailto:contato@fusioninterno.com.br', // Pode colocar seu email aqui
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export const Cortisol = {
  async notifyNewTask(
    supabase: SupabaseClient, 
    assignedUserId: string, 
    fromUserId: string, 
    taskId: string, 
    taskName: string,
    assignerName: string
  ) {
    if (assignedUserId === fromUserId) return;

    const content = `${assignerName} delegou a tarefa "${taskName}" para você. O Cortisol já está subindo! ⚠️`;

    // 1. Salva a notificação In-App no banco de dados (O que fizemos na Etapa 1)
    const { error } = await supabase.from('notifications').insert({
      user_id: assignedUserId,
      from_user_id: fromUserId,
      task_id: taskId,
      type: 'assignment',
      content: content,
      read: false
    });

    if (error) {
      console.error("Erro do Cortisol ao salvar notificação:", error);
      return;
    }

    // --- NOVIDADE DA ETAPA 2: DISPARO PUSH ---
    
    // 2. Busca todos os aparelhos registrados desse usuário
    const { data: subs } = await supabase
      .from('push_subscriptions')
      .select('subscription')
      .eq('user_id', assignedUserId);

    // 3. Se ele tiver aparelhos registrados, dispara o Push!
    if (subs && subs.length > 0) {
      const payload = JSON.stringify({
        title: '⚠️ Novo Fogo no Parquinho!',
        body: content,
        url: `/` // Mais pra frente podemos colocar a URL exata da tarefa aqui
      });

      const pushPromises = subs.map(sub =>
        webpush.sendNotification(sub.subscription, payload).catch(async (err) => {
          console.error("Erro ao enviar push. O usuário pode ter revogado a permissão.", err);
          // Opcional: Se der erro (ex: 410 Gone), poderíamos deletar a subscription do banco aqui.
        })
      );
      
      await Promise.all(pushPromises);
    }
  }
};