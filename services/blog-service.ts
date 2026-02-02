import { createClient } from "@/lib/supabase/client";

// CORREÇÃO: Instanciamos o cliente executando a função exportada
const supabase = createClient();

export type Post = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string;
  category: string;
  author_name: string;
  published: boolean;
  created_at: string;
};

export const blogService = {
  // Listar todos os posts
  async getAllPosts() {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as Post[];
  },

  // Buscar um post para edição
  async getPostById(id: string) {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as Post;
  },

  // Criar novo post
  async createPost(post: Partial<Post>) {
    const { data, error } = await supabase.from("posts").insert([post]).select();
    if (error) throw error;
    return data;
  },

  // Atualizar post
  async updatePost(id: number, updates: Partial<Post>) {
    const { data, error } = await supabase
      .from("posts")
      .update(updates)
      .eq("id", id)
      .select();

    if (error) throw error;
    return data;
  },

  // Deletar post
  async deletePost(id: number) {
    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (error) throw error;
  },
};