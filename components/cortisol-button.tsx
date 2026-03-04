"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bell, BellRing, Loader2 } from "lucide-react";
import { useUser } from "@/contexts/user-context";
import { savePushSubscription } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function CortisolButton() {
  const { currentUser: user } = useUser(); // <--- CORREÇÃO AQUI
  const { toast } = useToast();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setIsSubscribed(Notification.permission === "granted");
    }
  }, []);

  const handleSubscribe = async () => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não encontrado.",
        variant: "destructive",
      });
      return;
    }

    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      toast({
        title: "Não suportado",
        description:
          "Seu navegador não suporta notificações (Tente no Chrome ou instale o PWA no iOS).",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const permission = await Notification.requestPermission();

      if (permission !== "granted") {
        toast({
          title: "Aviso",
          description:
            "Você bloqueou o Cortisol! Libere nas permissões do site.",
        });
        setIsLoading(false);
        return;
      }

      const registration = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        throw new Error("Chave Pública VAPID não configurada no .env");
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      const result = await savePushSubscription(user.id, subscription);

      if (result.success) {
        setIsSubscribed(true);
        toast({
          title: "Cortisol Ativado! 🚨",
          description: "Prepare-se, você será notificado quando o bicho pegar.",
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      console.error("Erro ao ativar Cortisol:", error);
      toast({
        title: "Erro",
        description: error.message || "Falha ao se conectar com o Cortisol.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleSubscribe}
      disabled={isSubscribed || isLoading}
      variant={isSubscribed ? "outline" : "default"}
      className="gap-2"
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : isSubscribed ? (
        <BellRing className="w-4 h-4 text-green-500" />
      ) : (
        <Bell className="w-4 h-4" />
      )}
      {isLoading
        ? "Ativando..."
        : isSubscribed
          ? "Cortisol Ativado"
          : "Ativar Cortisol"}
    </Button>
  );
}
