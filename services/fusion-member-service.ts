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

export const FusionMemberService = {
  async getMembers(): Promise<FusionMember[]> {
    const supabase = createClient(); // Instanciado dentro da função
    const { data, error } = await supabase
      .from('fusion_members')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  },

  async createMember(memberData: Omit<FusionMember, 'id' | 'hours_used' | 'status' | 'created_at'>): Promise<FusionMember> {
    const supabase = createClient(); // Instanciado dentro da função
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
    const supabase = createClient(); // Instanciado dentro da função
    const { error } = await supabase
      .from('fusion_members')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
  },

  async deductHours(memberId: string, hoursToDeduct: number): Promise<FusionMember> {
    const supabase = createClient(); // Instanciado dentro da função
    const { data: member, error: fetchError } = await supabase
      .from('fusion_members')
      .select('hours_used, package_type')
      .eq('id', memberId)
      .single();

    if (fetchError) throw new Error(fetchError.message);

    const newHoursUsed = Number(member.hours_used) + hoursToDeduct;

    if (newHoursUsed > member.package_type) {
      throw new Error('Horas insuficientes no pacote deste assinante.');
    }

    const { data, error: updateError } = await supabase
      .from('fusion_members')
      .update({ hours_used: newHoursUsed })
      .eq('id', memberId)
      .select()
      .single();

    if (updateError) throw new Error(updateError.message);
    return data;
  }
};