"use server";

import { createClient } from "@supabase/supabase-js";

// Você precisa adicionar SUPABASE_SERVICE_ROLE_KEY no seu .env.local
// Essa chave tem poder total, nunca exponha ela no frontend!
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || "", 
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function createUserWithPassword(data: {
  email: string;
  password: string;
  name: string;
  role: string;
  teamId: string | null;
}) {
  // 1. Criar usuário no Auth (Login)
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: data.email,
    password: data.password,
    email_confirm: true, // Já confirma o email automaticamente
    user_metadata: { name: data.name },
  });

  if (authError) {
    throw new Error(authError.message);
  }

  if (!authData.user) {
    throw new Error("Erro ao criar usuário.");
  }

  // 2. Criar ou Atualizar o Profile (Dados públicos)
  // O trigger do Supabase geralmente cria o profile, mas vamos garantir/atualizar com os dados certos
  const { error: profileError } = await supabaseAdmin
    .from("profiles")
    .upsert({
      id: authData.user.id,
      email: data.email,
      name: data.name,
      role: data.role,
      team_id: data.teamId === "general" ? null : data.teamId,
    });

  if (profileError) {
    // Se der erro no profile, tentamos limpar o auth para não ficar órfão (opcional)
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
    throw new Error(profileError.message);
  }

  return { success: true };
}