import { createClient } from "@/lib/supabase/client"
import { Task, User, Team, CalendarEvent } from "@/lib/data"

const supabase = createClient()

// --- ADAPTERS (Não alterar para manter compatibilidade) ---

function adaptTask(dbTask: any): Task {
  return {
    id: dbTask.id,
    name: dbTask.name,
    description: dbTask.description || "",
    status: dbTask.status as any,
    priority: dbTask.priority as any,
    dueDate: new Date(dbTask.due_date),
    teamId: dbTask.team_id || (dbTask.is_general ? "general" : ""),
    isGeneral: dbTask.is_general,
    owners: dbTask.task_owners?.map((to: any) => ({
      id: to.profiles.id,
      name: to.profiles.name,
      avatar: to.profiles.avatar_url || "/placeholder-user.jpg",
      email: to.profiles.email,
      role: to.profiles.role,
      teamId: to.profiles.team_id
    })) || [],
    messages: dbTask.task_messages?.map((msg: any) => ({
      id: msg.id,
      userId: msg.user_id,
      content: msg.content,
      timestamp: new Date(msg.created_at),
      type: msg.type,
      audioUrl: msg.type === 'audio' ? msg.media_url : undefined,
      imageUrl: msg.type === 'image' ? msg.media_url : undefined
    })) || []
  }
}

function adaptNotification(dbNote: any): any {
  return {
    id: dbNote.id,
    type: dbNote.type,
    taskId: dbNote.task_id,
    taskName: dbNote.tasks?.name || "Tarefa desconhecida",
    fromUser: dbNote.from_user_id ? {
      id: dbNote.profiles.id,
      name: dbNote.profiles.name,
      avatar: dbNote.profiles.avatar_url || "/placeholder-user.jpg"
    } : null,
    content: dbNote.content,
    timestamp: new Date(dbNote.created_at),
    read: dbNote.read
  }
}

export const TaskService = {
  
  // --- LEITURA DE DADOS ---

  // ATUALIZADO: Lógica para incluir Gestores em todas as equipes
  async getTeams(): Promise<Team[]> {
    const { data: teamsData, error: teamsError } = await supabase.from('teams').select('*').order('name');
    if (teamsError) return [];

    // Busca todos os usuários para distribuir nas equipes
    const { data: usersData, error: usersError } = await supabase.from('profiles').select('*');
    if (usersError) return [];

    const allUsers = usersData.map((p: any) => ({
      id: p.id,
      name: p.name,
      avatar: p.avatar_url || "/placeholder-user.jpg",
      email: p.email,
      role: p.role,
      teamId: p.team_id
    }));

    // Separa os gestores
    const gestores = allUsers.filter((u: any) => u.role === 'gestor');

    // Mapeia as equipes incluindo: Membros fixos + Gestores (em todas)
    return teamsData.map((t: any) => {
       const regularMembers = allUsers.filter((u: any) => u.teamId === t.id && u.role !== 'gestor');
       
       // Map para remover duplicatas (caso um gestor tenha o ID da equipe explícito)
       const membersMap = new Map();
       [...regularMembers, ...gestores].forEach(m => membersMap.set(m.id, m));

       return {
          id: t.id,
          name: t.name,
          description: t.description,
          members: Array.from(membersMap.values()),
          projectCount: 0 
       };
    });
  },

  async getAllUsers(): Promise<User[]> {
    const { data, error } = await supabase.from('profiles').select('*')
    if (error) return []
    return data.map((p: any) => ({
      id: p.id,
      name: p.name,
      avatar: p.avatar_url || "/placeholder-user.jpg",
      email: p.email,
      role: p.role,
      teamId: p.team_id
    }))
  },

  async getTasks(currentUser: User) {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        task_owners (
          profiles (*)
        ),
        task_messages (
          *
        )
      `)
      .order('created_at', { ascending: false })

    if (error) return []
    return data.map(adaptTask)
  },

  // --- GESTÃO DE TAREFAS (Core) ---

  async createTask(task: Partial<Task>, creatorId: string) {
    const { data: newTask, error } = await supabase
      .from('tasks')
      .insert({
        name: task.name,
        description: task.description,
        status: task.status,
        priority: task.priority,
        due_date: task.dueDate?.toISOString(),
        team_id: task.teamId === 'general' ? null : task.teamId,
        is_general: task.isGeneral,
        created_by: creatorId
      })
      .select()
      .single()

    if (error) throw error

    // Adiciona os donos da tarefa
    if (task.owners && task.owners.length > 0) {
      const ownersData = task.owners.map(owner => ({
        task_id: newTask.id,
        user_id: owner.id
      }))
      await supabase.from('task_owners').insert(ownersData)

      // Gera notificações
      const notifications = task.owners
        .filter(owner => owner.id !== creatorId)
        .map(owner => ({
          user_id: owner.id,
          from_user_id: creatorId,
          task_id: newTask.id,
          type: 'assignment',
          content: 'atribuiu uma tarefa para você'
        }))
      
      if (notifications.length > 0) {
        await supabase.from('notifications').insert(notifications)
      }
    }

    return adaptTask({ ...newTask, task_owners: [], task_messages: [] })
  },

  async updateStatus(taskId: string, newStatus: string) {
    const { error } = await supabase.from('tasks').update({ status: newStatus }).eq('id', taskId)
    if (error) throw error
  },

  async updatePriority(taskId: string, newPriority: string) {
    const { error } = await supabase.from('tasks').update({ priority: newPriority }).eq('id', taskId)
    if (error) throw error
  },

  async updateTask(taskId: string, updates: Partial<Task>) {
    const dbUpdates: any = {}
    if (updates.name) dbUpdates.name = updates.name
    if (updates.description) dbUpdates.description = updates.description
    if (updates.dueDate) dbUpdates.due_date = updates.dueDate.toISOString()
    if (updates.priority) dbUpdates.priority = updates.priority
    
    if (updates.teamId) {
       dbUpdates.team_id = updates.teamId === 'general' ? null : updates.teamId
       dbUpdates.is_general = updates.teamId === 'general'
    }

    const { error } = await supabase
      .from('tasks')
      .update(dbUpdates)
      .eq('id', taskId)

    if (error) throw error
  },

  async deleteTask(taskId: string) {
    const { error } = await supabase.from('tasks').delete().eq('id', taskId)
    if (error) throw error
  },

  // --- ARQUIVOS E MENSAGENS ---

  async uploadFile(file: File): Promise<string> {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random()}.${fileExt}`
    const filePath = `${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('attachments')
      .upload(filePath, file)

    if (uploadError) throw uploadError

    const { data } = supabase.storage.from('attachments').getPublicUrl(filePath)
    return data.publicUrl
  },

  async addMessage(taskId: string, userId: string, content: string, type: 'text' | 'audio' | 'image', mediaUrl?: string) {
    const { data, error } = await supabase
      .from('task_messages')
      .insert({
        task_id: taskId,
        user_id: userId,
        content,
        type,
        media_url: mediaUrl
      })
      .select()
      .single()

    if (error) throw error
    
    // Notifica outros participantes
    const { data: owners } = await supabase
      .from('task_owners')
      .select('user_id')
      .eq('task_id', taskId)

    if (owners) {
      const recipients = owners
        .map(o => o.user_id)
        .filter(id => id !== userId)
      
      const notifications = recipients.map(recipientId => ({
        user_id: recipientId,
        from_user_id: userId,
        task_id: taskId,
        type: 'comment',
        content: type === 'audio' ? 'enviou um áudio' : type === 'image' ? 'enviou um anexo' : 'comentou na tarefa'
      }))

      if (notifications.length > 0) {
        await supabase.from('notifications').insert(notifications)
      }
    }
    
    return {
      id: data.id,
      userId: data.user_id,
      content: data.content,
      timestamp: new Date(data.created_at),
      type: data.type,
      audioUrl: data.type === 'audio' ? data.media_url : undefined,
      imageUrl: data.type === 'image' ? data.media_url : undefined
    }
  },

  // --- GESTÃO DE EQUIPES (NOVO CRUD) ---

  async createTeam(name: string, description: string) {
    const { data, error } = await supabase
      .from('teams')
      .insert({ name, description })
      .select()
      .single()

    if (error) throw error
    return { 
      id: data.id, 
      name: data.name, 
      description: data.description, 
      members: [], 
      projectCount: 0 
    }
  },

  // Nova função para Editar Equipe
  async updateTeam(id: string, updates: { name: string; description: string }) {
    const { error } = await supabase
      .from('teams')
      .update(updates)
      .eq('id', id)
    if (error) throw error
  },

  // Nova função para Excluir Equipe
  async deleteTeam(id: string) {
    const { error } = await supabase
      .from('teams')
      .delete()
      .eq('id', id)
    if (error) throw error
  },

  // --- GESTÃO DE MEMBROS E PERFIL ---

  // Mantido para compatibilidade, cria perfil sem Auth (usuário fantasma)
  // O novo modal usa a Server Action, mas mantemos isso aqui para não quebrar referências antigas
  async createMember(member: { name: string; email: string; role: 'gestor' | 'membro'; teamId: string }) {
    const fakeId = crypto.randomUUID(); 
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: fakeId,
        name: member.name,
        email: member.email,
        role: member.role,
        team_id: member.teamId === 'general' ? null : member.teamId
      })
      .select()
      .single()

    if (error) throw error

    return {
      id: data.id,
      name: data.name,
      avatar: data.avatar_url || "/placeholder-user.jpg",
      email: data.email,
      role: data.role,
      teamId: data.team_id
    }
  },
  
  // NOVO: Adicionar membro existente a uma equipe
  async addMemberToTeam(userId: string, teamId: string) {
    const { error } = await supabase
      .from('profiles')
      .update({ team_id: teamId })
      .eq('id', userId)
    if (error) throw error
  },

  // NOVO: Remover membro de uma equipe
  async removeMemberFromTeam(userId: string) {
    const { error } = await supabase
      .from('profiles')
      .update({ team_id: null })
      .eq('id', userId)
    if (error) throw error
  },

  async updateProfile(userId: string, updates: { name?: string; avatarUrl?: string }) {
    const { error } = await supabase
      .from('profiles')
      .update({
        name: updates.name,
        avatar_url: updates.avatarUrl
      })
      .eq('id', userId)

    if (error) throw error
  },

  // --- CALENDÁRIO ---

  async getEvents(currentUser: User): Promise<CalendarEvent[]> {
    const { data, error } = await supabase
      .from('calendar_events')
      .select(`
        *,
        event_participants (
           profiles (*)
        ),
        created_by_profile:created_by (*)
      `)
    
    if (error) {
      console.error("Erro ao buscar eventos", error)
      return []
    }

    return data.map((evt: any) => ({
      id: evt.id,
      title: evt.title,
      type: evt.type,
      date: new Date(evt.date),
      startTime: evt.start_time,
      endTime: evt.end_time,
      description: evt.description,
      location: evt.location,
      teamId: evt.team_id,
      isGeneral: evt.is_general,
      createdBy: evt.created_by_profile ? {
        id: evt.created_by_profile.id,
        name: evt.created_by_profile.name,
        avatar: evt.created_by_profile.avatar_url || "/placeholder-user.jpg",
        email: evt.created_by_profile.email || "",
        role: evt.created_by_profile.role || "membro",
        teamId: evt.created_by_profile.team_id || ""
      } : { 
        id: "system", 
        name: "Sistema", 
        avatar: "/placeholder-user.jpg",
        email: "system@app.com",
        role: "gestor",
        teamId: ""
      },
      participants: evt.event_participants?.map((ep: any) => ({
        id: ep.profiles.id,
        name: ep.profiles.name,
        avatar: ep.profiles.avatar_url || "/placeholder-user.jpg",
        email: ep.profiles.email || "",
        role: ep.profiles.role || "membro",
        teamId: ep.profiles.team_id || ""
      })) || []
    }))
  },

  async createEvent(event: any, creatorId: string) {
    const { data: newEvent, error } = await supabase
      .from('calendar_events')
      .insert({
        title: event.title,
        type: event.type,
        date: event.date.toISOString(),
        start_time: event.startTime,
        end_time: event.endTime,
        description: event.description,
        location: event.location,
        team_id: event.teamId === 'general' ? null : event.teamId,
        is_general: event.isGeneral,
        created_by: creatorId
      })
      .select()
      .single()

    if (error) throw error

    if (event.participants && event.participants.length > 0) {
      const participantsData = event.participants.map((p: any) => ({
        event_id: newEvent.id,
        user_id: p.id
      }))
      await supabase.from('event_participants').insert(participantsData)
    }

    return newEvent
  },

  // --- NOTIFICAÇÕES ---

  async getNotifications(userId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .select(`
        *,
        tasks (name),
        profiles:from_user_id (id, name, avatar_url)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) return []
    return data.map(adaptNotification)
  },

  async markNotificationRead(notificationId: string) {
    await supabase.from('notifications').update({ read: true }).eq('id', notificationId)
  },

  async markAllRead(userId: string) {
    await supabase.from('notifications').update({ read: true }).eq('user_id', userId)
  }
}