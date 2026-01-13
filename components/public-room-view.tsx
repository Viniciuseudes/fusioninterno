"use client";

import { useEffect, useState } from "react";
import { RoomService } from "@/services/room-service";
import { Room, modalityLabels, specialtyLabels } from "@/lib/data";
import { Loader2, MapPin, Check, Ruler, Phone, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// Interface para as props
interface PublicRoomViewProps {
  roomId: string;
}

export function PublicRoomView({ roomId }: PublicRoomViewProps) {
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!roomId) return;
      try {
        const allRooms = await RoomService.getRooms();
        const found = allRooms.find((r) => r.id === roomId);
        setRoom(found || null);
      } catch (error) {
        console.error("Erro ao carregar sala:", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [roomId]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  if (!room) {
    return (
      <div className="h-screen flex items-center justify-center bg-background text-muted-foreground">
        Sala não encontrada ou indisponível.
      </div>
    );
  }

  // Links do WhatsApp
  const cleanPhone = room.manager.phone.replace(/\D/g, "");
  const whatsappLink = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(
    `Olá, vi a sala ${room.name} no Fusion e gostaria de mais informações.`
  )}`;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header Imersivo */}
      <div className="relative h-[45vh] md:h-[60vh] bg-black">
        <Carousel className="w-full h-full">
          <CarouselContent>
            {room.images.map((img, i) => (
              <CarouselItem key={i} className="h-[45vh] md:h-[60vh]">
                <img
                  src={img}
                  className="w-full h-full object-cover opacity-90"
                  alt={`Foto ${i + 1}`}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          {room.images.length > 1 && (
            <>
              <CarouselPrevious className="left-4 bg-black/20 hover:bg-black/40 text-white border-none" />
              <CarouselNext className="right-4 bg-black/20 hover:bg-black/40 text-white border-none" />
            </>
          )}
        </Carousel>
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-background via-background/60 to-transparent h-32" />
        <div className="absolute bottom-4 left-6 right-6">
          <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-2 shadow-sm">
            {room.name}
          </h1>
          <p className="flex items-center text-sm md:text-base text-muted-foreground">
            <MapPin className="h-4 w-4 mr-1 text-primary shrink-0" />
            {room.neighborhood} - {room.address}
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 relative z-10 space-y-8 mt-2">
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

        {/* Descrição e Ref */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold border-l-4 border-primary pl-3">
            Sobre o Espaço
          </h2>
          <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
            {room.description}
          </p>
          {room.referencePoint && (
            <div className="flex items-start gap-3 bg-muted/40 p-3 rounded-lg border border-border/50">
              <MapPin className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div>
                <span className="block font-medium text-foreground text-sm">
                  Ponto de Referência
                </span>
                <span className="text-sm text-muted-foreground">
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
              <div className="flex items-center gap-2 text-sm">
                <Ruler className="h-4 w-4 text-primary" />{" "}
                <span className="font-medium">{room.size}m²</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {room.modalities.map((m) => (
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
              {room.specialties.map((s) => (
                <Badge key={s} variant="outline" className="text-xs">
                  {specialtyLabels[s]}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Equipamentos */}
        <div>
          <h3 className="font-medium mb-3 text-muted-foreground uppercase text-xs tracking-wider">
            Infraestrutura Completa
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4">
            {[...room.equipment, ...room.amenities].map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <Check className="h-3 w-3 text-green-500 shrink-0" /> {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Fixo para Contato */}
      <div className="fixed bottom-0 inset-x-0 p-4 bg-background/95 backdrop-blur border-t z-50 shadow-lg">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <div className="hidden md:block">
            <p className="text-sm font-medium">Fale com {room.manager.name}</p>
            <p className="text-xs text-muted-foreground">
              Responsável pelo Espaço
            </p>
          </div>
          <Button
            className="w-full md:w-auto bg-[#25D366] hover:bg-[#128C7E] text-white font-semibold"
            onClick={() => window.open(whatsappLink, "_blank")}
          >
            <Phone className="h-4 w-4 mr-2" /> Entrar em Contato Agora
          </Button>
        </div>
      </div>
    </div>
  );
}
