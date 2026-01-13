import { Metadata } from "next";
import { PublicRoomView } from "@/components/public-room-view";

// Tipagem correta para Next.js 16 (params é Promise)
type Props = {
  params: Promise<{ id: string }>;
};

// Função auxiliar para buscar dados APENAS para o Metadata
// (O componente visual buscará novamente no cliente de forma segura)
async function getRoomDataForMetadata(id: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) return null;

  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/rooms?id=eq.${id}&select=name,neighborhood,description,images`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
        next: { revalidate: 60 }, // Cache por 60 segundos
      }
    );

    if (!res.ok) return null;
    const data = await res.json();
    return data && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error("Erro ao gerar metadata:", error);
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const room = await getRoomDataForMetadata(id);

  if (!room) {
    return {
      title: "Sala Fusion Clinic",
      description: "Confira esta sala disponível para locação.",
    };
  }

  const imageUrl =
    room.images && room.images.length > 0 ? room.images[0] : null;

  return {
    title: `${room.name} | Fusion Clinic`,
    description: `Locação em ${room.neighborhood}. ${
      room.description ? room.description.slice(0, 100) + "..." : ""
    }`,
    openGraph: {
      title: `${room.name} - ${room.neighborhood}`,
      description: room.description || "Sala incrível disponível no Fusion.",
      images: imageUrl ? [imageUrl] : [],
      type: "website",
    },
  };
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  return <PublicRoomView roomId={id} />;
}
