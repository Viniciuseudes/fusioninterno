"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/user-context"; // Contexto correto
import { blogService, Post } from "@/services/blog-service";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, ExternalLink, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast"; // Verifique se o caminho é hooks ou components/ui
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function BlogListPage() {
  // AJUSTE: Usando a estrutura do seu user-context atual
  const { currentUser, isGestor, isLoading } = useUser();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // 1. Verificação de Permissão (Apenas Gestores)
    if (!isLoading) {
      if (!currentUser || !isGestor) {
        toast({
          title: "Acesso Negado",
          description: "Apenas gestores podem acessar o blog.",
          variant: "destructive",
        });
        router.push("/"); // Redireciona para home se não for gestor
      } else {
        // Só busca os posts se tiver permissão
        fetchPosts();
      }
    }
  }, [currentUser, isGestor, isLoading, router, toast]);

  const fetchPosts = async () => {
    try {
      const data = await blogService.getAllPosts();
      setPosts(data);
    } catch (error) {
      toast({
        title: "Erro ao carregar posts",
        description: "Não foi possível buscar os posts.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await blogService.deletePost(id);
      setPosts(posts.filter((p) => p.id !== id));
      toast({ title: "Post excluído com sucesso" });
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  };

  if (loading || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Se não for gestor, não renderiza nada (o useEffect vai redirecionar)
  if (!isGestor) return null;

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gerenciar Blog</h1>
          <p className="text-muted-foreground">
            Crie conteúdo para atrair mais clientes para a Fusion Clinic.
          </p>
        </div>
        <Button asChild>
          <Link href="/blog/editor">
            <Plus className="mr-2 h-4 w-4" /> Novo Post
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Todos os Artigos</CardTitle>
          <CardDescription>
            Gerencie seus posts publicados e rascunhos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="font-medium">
                    {post.title}
                    <div className="text-xs text-muted-foreground truncate max-w-[300px]">
                      /{post.slug}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{post.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        post.published ? "bg-green-500" : "bg-yellow-500"
                      }
                    >
                      {post.published ? "Publicado" : "Rascunho"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(post.created_at).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell className="text-right flex justify-end gap-2">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/blog/editor?id=${post.id}`}>
                        <Pencil className="h-4 w-4 text-blue-500" />
                      </Link>
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita. O post será
                            removido permanentemente.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-500 hover:bg-red-600"
                            onClick={() => handleDelete(post.id)}
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
              {posts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10">
                    Nenhum post encontrado. Crie o primeiro!
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
