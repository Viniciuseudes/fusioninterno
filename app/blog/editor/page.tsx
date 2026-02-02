"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@/contexts/user-context";
import { blogService } from "@/services/blog-service"; // Removido Post daqui se não for usado explicitamente como tipo no state
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast"; // Correção no caminho do toast se necessário
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";

function BlogEditorContent() {
  const { currentUser } = useUser(); // Ajustado para currentUser se for o nome no seu contexto
  const router = useRouter();
  const searchParams = useSearchParams();
  const postId = searchParams.get("id");
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    category: "Carreira",
    cover_image: "",
    published: true,
  });

  useEffect(() => {
    if (postId) {
      const loadPost = async () => {
        setLoading(true);
        try {
          // Casting explícito para garantir string
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
      router.push("/blog");
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
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/blog">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">
            {postId ? "Editar Post" : "Novo Post"}
          </h1>
        </div>
        <Button onClick={handleSubmit} disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Save className="mr-2 h-4 w-4" />
          Salvar Post
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-8">
        <div className="grid gap-4 bg-card p-6 rounded-xl border">
          <div className="grid gap-2">
            <Label htmlFor="title">Título do Artigo</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={handleTitleChange}
              placeholder="Ex: Como abrir um consultório em Natal"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="slug">Slug (URL Amigável)</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value })
                }
                placeholder="como-abrir-consultorio-natal"
                required
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
          </div>

          <div className="grid gap-2">
            <Label htmlFor="cover">URL da Imagem de Capa</Label>
            <Input
              id="cover"
              value={formData.cover_image}
              onChange={(e) =>
                setFormData({ ...formData, cover_image: e.target.value })
              }
              placeholder="https://..."
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="excerpt">Resumo (Excerpt)</Label>
            <Textarea
              id="excerpt"
              value={formData.excerpt}
              onChange={(e) =>
                setFormData({ ...formData, excerpt: e.target.value })
              }
              placeholder="Um breve resumo..."
              rows={3}
            />
          </div>
        </div>

        <div className="grid gap-4 bg-card p-6 rounded-xl border">
          <div className="flex items-center justify-between">
            <Label htmlFor="content" className="text-lg">
              Conteúdo (HTML)
            </Label>
            <div className="flex items-center gap-2">
              <Label htmlFor="published">Publicado?</Label>
              <Switch
                id="published"
                checked={formData.published}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, published: checked })
                }
              />
            </div>
          </div>
          <Textarea
            id="content"
            value={formData.content}
            onChange={(e) =>
              setFormData({ ...formData, content: e.target.value })
            }
            placeholder="<p>Escreva seu conteúdo aqui...</p>"
            className="font-mono text-sm min-h-[400px]"
          />
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
