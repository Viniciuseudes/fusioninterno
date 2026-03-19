"use client";

import { createClient } from '@/lib/supabase/client';

export type PackageType = 6 | 10 | 15 | 20;

export interface FusionMember {
  id: string;
  name: string;
  phone: string;
  package_type: PackageType;
  hours_used: number;
  start_date: string;
  end_date: string;
  payment_method: string;
  status: 'active' | 'expired' | 'cancelled';
  created_at?: string;
}

export interface FusionMemberUsage {
  id: string;
  member_id: string;
  hours_deducted: number;
  usage_date: string;
  notes: string;
  created_at?: string;
}

export const FusionMemberService = {
  async getMembers(): Promise<FusionMember[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('fusion_members')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  },

  async createMember(memberData: Omit<FusionMember, 'id' | 'hours_used' | 'status' | 'created_at'>): Promise<FusionMember> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('fusion_members')
      .insert([{ ...memberData, hours_used: 0, status: 'active' }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async deleteMember(id: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from('fusion_members').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  async getMemberUsage(memberId: string): Promise<FusionMemberUsage[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('fusion_member_usage')
      .select('*')
      .eq('member_id', memberId)
      .order('usage_date', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  },

  async deductHours(memberId: string, hoursToDeduct: number, usageDate: string, notes: string): Promise<FusionMember> {
    const supabase = createClient();
    
    const { data: member, error: fetchError } = await supabase
      .from('fusion_members')
      .select('hours_used, package_type')
      .eq('id', memberId)
      .single();

    if (fetchError) throw new Error(fetchError.message);

    const newHoursUsed = Number(member.hours_used) + Number(hoursToDeduct);

    if (newHoursUsed > member.package_type) {
      throw new Error('As horas inseridas ultrapassam o limite do pacote.');
    }

    const { data: updatedMember, error: updateError } = await supabase
      .from('fusion_members')
      .update({ hours_used: newHoursUsed })
      .eq('id', memberId)
      .select()
      .single();

    if (updateError) throw new Error(updateError.message);

    const { error: historyError } = await supabase
      .from('fusion_member_usage')
      .insert([{ member_id: memberId, hours_deducted: hoursToDeduct, usage_date: usageDate, notes: notes }]);

    if (historyError) console.error("Erro ao salvar histórico:", historyError);

    return updatedMember;
  },

  // --- NOVAS FUNÇÕES: EDITAR E EXCLUIR HISTÓRICO ---

  async updateUsage(usageId: string, memberId: string, oldHours: number, newHours: number, usageDate: string, notes: string): Promise<void> {
    const supabase = createClient();
    
    // Calcula a diferença para ajustar o total do pacote
    const difference = Number(newHours) - Number(oldHours);
    
    const { data: member, error: fetchError } = await supabase
      .from('fusion_members')
      .select('hours_used, package_type')
      .eq('id', memberId)
      .single();
      
    if (fetchError) throw new Error(fetchError.message);
    
    const newTotalHours = Number(member.hours_used) + difference;
    if (newTotalHours < 0) throw new Error('O total de horas usadas não pode ser menor que zero.');
    if (newTotalHours > member.package_type) throw new Error('A alteração ultrapassa o limite do pacote.');
    
    // Atualiza o histórico
    const { error: historyError } = await supabase
      .from('fusion_member_usage')
      .update({ hours_deducted: newHours, usage_date: usageDate, notes: notes })
      .eq('id', usageId);
    if (historyError) throw new Error(historyError.message);
    
    // Atualiza o total do membro
    const { error: memberError } = await supabase
      .from('fusion_members')
      .update({ hours_used: newTotalHours })
      .eq('id', memberId);
    if (memberError) throw new Error(memberError.message);
  },

  async deleteUsage(usageId: string, memberId: string, hoursToRestore: number): Promise<void> {
    const supabase = createClient();
    
    const { data: member, error: fetchError } = await supabase
      .from('fusion_members')
      .select('hours_used')
      .eq('id', memberId)
      .single();
      
    if (fetchError) throw new Error(fetchError.message);
    
    // Subtrai as horas que foram deletadas do total usado (estorno)
    const newTotalHours = Math.max(0, Number(member.hours_used) - Number(hoursToRestore));
    
    const { error: historyError } = await supabase
      .from('fusion_member_usage')
      .delete()
      .eq('id', usageId);
    if (historyError) throw new Error(historyError.message);
    
    const { error: memberError } = await supabase
      .from('fusion_members')
      .update({ hours_used: newTotalHours })
      .eq('id', memberId);
    if (memberError) throw new Error(memberError.message);
  }
};