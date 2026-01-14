"use client";

import { useEffect, useState } from "react";
import { RoomService } from "@/services/room-service";
import { Room, modalityLabels, specialtyLabels } from "@/lib/data";
import {
  Loader2,
  MapPin,
  Check,
  Ruler,
  Navigation,
  Share2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button"; // Mantido para o botão de compartilhar
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// Interface para receber o ID
interface PublicRoomViewProps {
  roomId: string;
}

export function PublicRoomView({ roomId }: PublicRoomViewProps) {
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      if (!roomId) return;
      try {
        const data = await RoomService.getRoomById(roomId);
        if (isMounted) setRoom(data);
      } catch (error) {
        console.error("Erro ao carregar sala:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();

    return () => {
      isMounted = false;
    };
  }, [roomId]);

  const handleShare = () => {
    if (!room) return;
    if (navigator.share) {
      navigator.share({
        title: `Fusion Clinic - ${room.name}`,
        text: `Confira esta sala em ${room.neighborhood}: ${room.name}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copiado!");
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  if (!room) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-background text-muted-foreground gap-4">
        <p>Sala não encontrada ou indisponível.</p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Tentar Novamente
        </Button>
      </div>
    );
  }

  return (
    // Reduzi o padding-bottom (pb-10) já que não tem mais footer fixo
    <div className="min-h-screen bg-background pb-10 animate-in fade-in duration-500">
      {/* Header Imersivo */}
      <div className="relative h-[40vh] md:h-[55vh] bg-black flex items-center justify-center overflow-hidden">
        <Carousel className="w-full h-full">
          <CarouselContent>
            {room.images && room.images.length > 0 ? (
              room.images.map((img, i) => (
                <CarouselItem
                  key={i}
                  className="h-[40vh] md:h-[55vh] flex items-center justify-center bg-black"
                >
                  {/* ALTERADO: object-contain para não cortar a imagem e removido opacity */}
                  <img
                    src={img}
                    className="max-w-full max-h-full object-contain"
                    alt={`Foto ${i + 1}`}
                  />
                </CarouselItem>
              ))
            ) : (
              <CarouselItem className="h-[40vh] md:h-[55vh] bg-muted flex items-center justify-center">
                <span className="text-muted-foreground">
                  Sem fotos disponíveis
                </span>
              </CarouselItem>
            )}
          </CarouselContent>
          {room.images && room.images.length > 1 && (
            <>
              <CarouselPrevious className="left-4 bg-black/50 hover:bg-black/70 text-white border-none" />
              <CarouselNext className="right-4 bg-black/50 hover:bg-black/70 text-white border-none" />
            </>
          )}
        </Carousel>

        {/* Gradiente para garantir leitura do texto sobre fotos claras */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-background via-background/80 to-transparent h-32 pointer-events-none" />

        <div className="absolute bottom-4 left-4 right-4 md:left-8 md:right-8 flex items-end justify-between z-10">
          <div className="space-y-1">
            <Badge
              variant="secondary"
              className="mb-2 bg-primary/20 text-primary border-primary/20 backdrop-blur-md"
            >
              {room.neighborhood}
            </Badge>
            <h1 className="text-2xl md:text-4xl font-bold text-foreground shadow-sm">
              {room.name}
            </h1>
            <p className="flex items-center text-sm md:text-base text-muted-foreground">
              <MapPin className="h-4 w-4 mr-1 text-primary shrink-0" />
              {room.address}
            </p>
          </div>

          {/* Mantive apenas o botão de compartilhar, discreto */}
          <Button
            variant="secondary"
            size="icon"
            className="rounded-full shadow-lg shrink-0 mb-2 hover:bg-primary hover:text-primary-foreground transition-colors"
            onClick={handleShare}
            title="Compartilhar Sala"
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-8 relative z-10 space-y-8 mt-6">
        {/* Cards de Preço */}
        <div className="grid grid-cols-3 gap-2 md:gap-4">
          {room.pricePerHour && (
            <Card className="bg-card/50 backdrop-blur border-primary/20 shadow-sm">
              <CardContent className="p-3 md:p-4 text-center">
                <span className="block text-lg md:text-xl font-bold text-primary">
                  R$ {room.pricePerHour}
                </span>
                <span className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wide">
                  / Hora
                </span>
              </CardContent>
            </Card>
          )}
          {room.pricePerShift && (
            <Card className="bg-card/50 backdrop-blur border-primary/20 shadow-sm">
              <CardContent className="p-3 md:p-4 text-center">
                <span className="block text-lg md:text-xl font-bold text-primary">
                  R$ {room.pricePerShift}
                </span>
                <span className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wide">
                  / Turno
                </span>
              </CardContent>
            </Card>
          )}
          {room.priceFixed && (
            <Card className="bg-card/50 backdrop-blur border-primary/20 shadow-sm">
              <CardContent className="p-3 md:p-4 text-center">
                <span className="block text-lg md:text-xl font-bold text-primary">
                  R$ {room.priceFixed}
                </span>
                <span className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wide">
                  / Mês
                </span>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            {/* Descrição e Ref */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold border-l-4 border-primary pl-3">
                Sobre o Espaço
              </h2>
              <p className="text-muted-foreground leading-relaxed text-sm md:text-base whitespace-pre-line">
                {room.description}
              </p>

              {room.referencePoint && (
                <div className="flex items-start gap-3 bg-amber-500/10 p-3 rounded-lg border border-amber-500/20 text-amber-700 dark:text-amber-400">
                  <Navigation className="h-5 w-5 mt-0.5 shrink-0" />
                  <div>
                    <span className="block font-medium text-sm">
                      Ponto de Referência
                    </span>
                    <span className="text-sm opacity-90">
                      {room.referencePoint}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Detalhes Técnicos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-3 text-muted-foreground uppercase text-xs tracking-wider">
                  Características
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm bg-muted/30 p-2 rounded">
                    <Ruler className="h-4 w-4 text-primary" />{" "}
                    <span className="font-medium">{room.size}m²</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {room.modalities &&
                      room.modalities.map((m) => (
                        <Badge key={m} variant="secondary" className="text-xs">
                          {modalityLabels[m]}
                        </Badge>
                      ))}
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-3 text-muted-foreground uppercase text-xs tracking-wider">
                  Ideal Para
                </h3>
                <div className="flex flex-wrap gap-2">
                  {room.specialties &&
                    room.specialties.map((s) => (
                      <Badge key={s} variant="outline" className="text-xs">
                        {specialtyLabels[s]}
                      </Badge>
                    ))}
                </div>
              </div>
            </div>
          </div>

          {/* Coluna Lateral (Infraestrutura) */}
          <div className="md:col-span-1">
            <div className="bg-card border rounded-xl p-5 shadow-sm space-y-4 sticky top-4">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                O que oferece
              </h3>

              {room.equipment && room.equipment.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-primary">
                    Equipamentos
                  </span>
                  <ul className="space-y-2">
                    {room.equipment.map((item, idx) => (
                      <li
                        key={`eq-${idx}`}
                        className="flex items-start gap-2 text-sm text-foreground/80"
                      >
                        <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                        <span className="leading-tight">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {room.amenities && room.amenities.length > 0 && (
                <div className="space-y-2 mt-4 pt-4 border-t">
                  <span className="text-xs font-semibold text-primary">
                    Comodidades
                  </span>
                  <ul className="space-y-2">
                    {room.amenities.map((item, idx) => (
                      <li
                        key={`am-${idx}`}
                        className="flex items-start gap-2 text-sm text-foreground/80"
                      >
                        <Check className="h-4 w-4 text-primary/60 shrink-0 mt-0.5" />
                        <span className="leading-tight">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* RODAPÉ REMOVIDO CONFORME SOLICITADO */}
    </div>
  );
}
