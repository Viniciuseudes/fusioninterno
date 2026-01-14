"use server";

import { createClient } from "@supabase/supabase-js";

// Verifica se as chaves existem antes de tentar conectar
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("ERRO CRÍTICO: Variáveis de ambiente faltando para createAdminClient");
}

const supabaseAdmin = createClient(
  supabaseUrl!,
  serviceRoleKey!,
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
  console.log("Tentando criar usuário:", data.email);

  try {
    // 1. Criar usuário no Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { name: data.name },
    });

    if (authError) {
      console.error("Erro no Auth:", authError);
      throw new Error(`Erro Auth: ${authError.message}`);
    }

    if (!authData.user) {
      throw new Error("Erro desconhecido: Usuário não foi criado.");
    }

    console.log("Usuário Auth criado. ID:", authData.user.id);

    // 2. Criar Profile
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
      console.error("Erro no Profile:", profileError);
      // Opcional: deletar o usuário do Auth se falhar no profile para não ficar "manco"
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      throw new Error(`Erro Profile: ${profileError.message}`);
    }

    console.log("Sucesso total.");
    return { success: true };

  } catch (error: any) {
    console.error("ERRO FINAL na Server Action:", error);
    // Repassa o erro para o frontend ver
    throw new Error(error.message || "Falha interna no servidor");
  }
}