"use client";

import { useState, useRef } from "react";
import { useUser } from "@/contexts/user-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Upload, Save, User as UserIcon } from "lucide-react";
import { TaskService } from "@/services/task-service";

export function SettingsView() {
  const { currentUser, setCurrentUser } = useUser();
  // Estado local para o formulário
  const [name, setName] = useState(currentUser?.name || "");
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      await TaskService.updateProfile(currentUser.id, { name });
      // Atualiza o contexto localmente para refletir na hora sem precisar de refresh
      setCurrentUser({ ...currentUser, name });
      alert("Perfil atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar perfil", error);
      alert("Erro ao salvar alterações.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    setIsLoading(true);
    try {
      // 1. Upload para o bucket 'attachments' (ou 'avatars' se você tiver criado separado)
      const publicUrl = await TaskService.uploadFile(file);

      // 2. Atualiza o perfil no banco
      await TaskService.updateProfile(currentUser.id, { avatarUrl: publicUrl });

      // 3. Atualiza contexto para a UI mudar instantaneamente
      setCurrentUser({ ...currentUser, avatar: publicUrl });
    } catch (error) {
      console.error("Erro no upload do avatar", error);
      alert("Falha ao atualizar foto de perfil.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie suas preferências e perfil
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Perfil Público</CardTitle>
          <CardDescription>
            Essas informações serão visíveis para sua equipe
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24 border-4 border-muted">
              {/* CORREÇÃO: Usando className="object-cover" em vez de prop inválida */}
              <AvatarImage src={currentUser.avatar} className="object-cover" />
              <AvatarFallback className="text-2xl">
                {currentUser.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 h-4 w-4" />
                )}
                Alterar Foto
              </Button>
              <p className="text-xs text-muted-foreground">
                Recomendado: 400x400px (JPG ou PNG)
              </p>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleAvatarUpload}
              />
            </div>
          </div>

          {/* Form Section */}
          <div className="grid gap-4 max-w-md">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                value={currentUser.email}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                O e-mail não pode ser alterado.
              </p>
            </div>

            <Button
              onClick={handleSave}
              disabled={isLoading || name === currentUser.name}
              className="w-fit"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" />
              Salvar Alterações
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
