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
      .insert([{
        ...memberData,
        hours_used: 0,
        status: 'active'
      }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async deleteMember(id: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase
      .from('fusion_members')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
  },

  // NOVO: Busca o histórico de um membro
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

  // ATUALIZADO: Deduz as horas E cria o registo de histórico
  async deductHours(memberId: string, hoursToDeduct: number, usageDate: string, notes: string): Promise<FusionMember> {
    const supabase = createClient();
    
    // 1. Pega as horas atuais
    const { data: member, error: fetchError } = await supabase
      .from('fusion_members')
      .select('hours_used, package_type')
      .eq('id', memberId)
      .single();

    if (fetchError) throw new Error(fetchError.message);

    const newHoursUsed = Number(member.hours_used) + Number(hoursToDeduct);

    if (newHoursUsed > member.package_type) {
      throw new Error('Horas insuficientes no pacote deste assinante.');
    }

    // 2. Atualiza o total de horas na tabela principal
    const { data: updatedMember, error: updateError } = await supabase
      .from('fusion_members')
      .update({ hours_used: newHoursUsed })
      .eq('id', memberId)
      .select()
      .single();

    if (updateError) throw new Error(updateError.message);

    // 3. Insere o registo na tabela de histórico
    const { error: historyError } = await supabase
      .from('fusion_member_usage')
      .insert([{
        member_id: memberId,
        hours_deducted: hoursToDeduct,
        usage_date: usageDate,
        notes: notes
      }]);

    if (historyError) {
      console.error("Erro ao salvar histórico:", historyError);
      // Não quebramos a função principal se o histórico falhar, mas logamos o erro
    }

    return updatedMember;
  }
};