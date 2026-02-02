import { createClient } from "@/lib/supabase/client";

// Instancia o cliente
const supabase = createClient();

export type Post = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string; // HTML do Rich Text
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

    if (error) {
      console.error("Erro ao buscar posts:", error);
      throw error;
    }
    return data as Post[];
  },

  // Buscar um post para edição
  async getPostById(id: string) {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Erro ao buscar post por ID:", error);
      throw error;
    }
    return data as Post;
  },

  // Criar novo post
  async createPost(post: Partial<Post>) {
    // Remove campos undefined/vazios que podem quebrar o banco
    const cleanPost = Object.fromEntries(
      Object.entries(post).filter(([_, v]) => v != null)
    );

    console.log("Enviando Payload Criar:", cleanPost);

    const { data, error } = await supabase
      .from("posts")
      .insert([cleanPost])
      .select();

    if (error) {
      console.error("Erro Supabase Create:", error.message, error.details);
      throw error;
    }
    return data;
  },

  // Atualizar post
  async updatePost(id: number, updates: Partial<Post>) {
    // Remove campos undefined
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v != null)
    );

    console.log("Enviando Payload Atualizar:", cleanUpdates);

    const { data, error } = await supabase
      .from("posts")
      .update(cleanUpdates)
      .eq("id", id)
      .select();

    if (error) {
      console.error("Erro Supabase Update:", error.message, error.details);
      throw error;
    }
    return data;
  },

  // Deletar post
  async deletePost(id: number) {
    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (error) {
      console.error("Erro Supabase Delete:", error);
      throw error;
    }
  },
};