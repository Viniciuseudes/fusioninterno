"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@/contexts/user-context";
import { blogService } from "@/services/blog-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // Ainda usado para excerpt
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast"; // Verifique se o caminho é hooks ou components/ui
import { ArrowLeft, Save, Loader2, Eye } from "lucide-react";
import Link from "next/link";
import RichTextEditor from "@/components/rich-text-editor"; // <--- NOVO IMPORT

function BlogEditorContent() {
  const { currentUser } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const postId = searchParams.get("id");
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "", // Aqui vai o HTML do editor
    category: "Carreira",
    cover_image: "",
    published: true,
  });

  useEffect(() => {
    if (postId) {
      const loadPost = async () => {
        setLoading(true);
        try {
          // Casting para garantir string
          const post = await blogService.getPostById(postId as string);
          if (post) {
            setFormData({
              title: post.title,
              slug: post.slug,
              excerpt: post.excerpt || "",
              content: post.content || "",
              category: post.category || "Carreira",
              cover_image: post.cover_image || "",
              published: post.published,
            });
          }
        } catch (error) {
          toast({
            title: "Erro ao carregar post",
            description: "Não foi possível buscar os dados.",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      };
      loadPost();
    }
  }, [postId, toast]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData((prev) => ({
      ...prev,
      title,
      slug: !postId
        ? title
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "")
        : prev.slug,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        author_name: currentUser?.name || "Equipe Fusion",
      };

      if (postId) {
        await blogService.updatePost(Number(postId), payload);
        toast({ title: "Post atualizado com sucesso!" });
      } else {
        await blogService.createPost(payload);
        toast({ title: "Post criado com sucesso!" });
      }
      router.push("/blog"); // Isso agora vai pro BlogView dentro do Dashboard se o router estiver configurado, ou redireciona
      // Como estamos numa SPA dashboard, idealmente chamariamos uma função de navegar,
      // mas o router.push("/blog") funciona se você tiver a rota configurada.
      // Se for SPA pura, você pode precisar ajustar para window.location ou usar um state global.
      // Assumindo que /blog no browser redireciona para o dashboard com a view blog ativa.
      window.location.href = "/?view=blog"; // Força a volta para o dashboard na view certa
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro ao salvar",
        description: "Verifique o console para mais detalhes.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur z-10 py-4 border-b">
        <div className="flex items-center gap-4">
          {/* Botão de Voltar ajustado para o Dashboard */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => (window.location.href = "/?view=blog")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">
            {postId ? "Editar Post" : "Novo Post"}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 mr-4 bg-muted px-3 py-1 rounded-full">
            <Label htmlFor="published" className="cursor-pointer">
              Publicado
            </Label>
            <Switch
              id="published"
              checked={formData.published}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, published: checked })
              }
            />
          </div>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="min-w-[140px]"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            Salvar Post
          </Button>
        </div>
      </div>

      <form className="grid gap-8">
        <div className="grid md:grid-cols-[2fr_1fr] gap-8">
          {/* Coluna Principal */}
          <div className="space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="title" className="text-lg">
                Título do Artigo
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={handleTitleChange}
                placeholder="Ex: 5 Dicas para alugar consultório"
                className="text-lg py-6 font-medium"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label className="text-lg">Conteúdo</Label>
              {/* AQUI ESTÁ O NOVO EDITOR */}
              <RichTextEditor
                content={formData.content}
                onChange={(html) => setFormData({ ...formData, content: html })}
              />
            </div>
          </div>

          {/* Coluna Lateral (Configurações) */}
          <div className="space-y-6">
            <div className="bg-card p-5 rounded-xl border space-y-4">
              <h3 className="font-semibold text-muted-foreground mb-2">
                Configurações de SEO
              </h3>

              <div className="grid gap-2">
                <Label htmlFor="slug">Slug (URL)</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  className="font-mono text-sm"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="category">Categoria</Label>
                <Select
                  value={formData.category}
                  onValueChange={(val) =>
                    setFormData({ ...formData, category: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Carreira">Carreira</SelectItem>
                    <SelectItem value="Gestão">Gestão</SelectItem>
                    <SelectItem value="Mercado">Mercado</SelectItem>
                    <SelectItem value="Dicas">Dicas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="excerpt">Resumo (Meta Description)</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) =>
                    setFormData({ ...formData, excerpt: e.target.value })
                  }
                  rows={4}
                  className="resize-none"
                />
              </div>
            </div>

            <div className="bg-card p-5 rounded-xl border space-y-4">
              <h3 className="font-semibold text-muted-foreground mb-2">
                Mídia
              </h3>
              <div className="grid gap-2">
                <Label htmlFor="cover">Imagem de Capa (URL)</Label>
                <Input
                  id="cover"
                  value={formData.cover_image}
                  onChange={(e) =>
                    setFormData({ ...formData, cover_image: e.target.value })
                  }
                  placeholder="https://..."
                />
                {formData.cover_image && (
                  <div className="mt-2 aspect-video relative rounded-lg overflow-hidden border">
                    <img
                      src={formData.cover_image}
                      alt="Preview"
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function BlogEditorPage() {
  return (
    <Suspense fallback={<div className="p-8">Carregando editor...</div>}>
      <BlogEditorContent />
    </Suspense>
  );
}
