"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { type User } from "@/lib/data";
import { createClient } from "@/lib/supabase/client";
import { useRouter, usePathname } from "next/navigation";

interface UserContextType {
  currentUser: User | null;
  setCurrentUser: (user: User) => void;
  isGestor: boolean;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // 1. Definição das rotas públicas
    const publicRoutes = ["/login", "/register", "/forgot-password"];

    // 2. A MÁGICA ACONTECE AQUI:
    // Verifica se está na lista exata OU se começa com "/share" (para as salas compartilhadas)
    const isPublicRoute =
      publicRoutes.includes(pathname) || pathname?.startsWith("/share");

    const fetchUser = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          setCurrentUser(null);
          setIsLoading(false);

          // Se NÃO tem sessão e NÃO está em rota pública, manda pro login
          if (!isPublicRoute) {
            router.push("/login");
          }
          return;
        }

        const { data: profile, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (error || !profile) {
          console.error("Erro ao buscar perfil:", error);
          setCurrentUser(null);
          // Mesmo com erro, se for rota pública, deixa ficar
          if (!isPublicRoute) router.push("/login");
        } else {
          const adaptedUser: User = {
            id: profile.id,
            name: profile.name,
            avatar: profile.avatar_url || "/placeholder-user.jpg",
            email: profile.email,
            role: profile.role as "gestor" | "membro",
            teamId: profile.team_id || "",
          };
          setCurrentUser(adaptedUser);

          // Se já está logado e tenta ir pro login, manda pra home
          if (pathname === "/login") {
            router.push("/");
          }
        }
      } catch (error) {
        console.error("Erro inesperado:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchUser();
      } else {
        setCurrentUser(null);
        setIsLoading(false);

        // Recalcula se é rota pública dentro do evento de mudança de auth
        const currentIsPublic =
          publicRoutes.includes(pathname) || pathname?.startsWith("/share");

        if (!currentIsPublic) {
          router.push("/login");
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [router, supabase, pathname]);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <UserContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        isGestor: currentUser?.role === "gestor",
        isLoading,
        signOut,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
