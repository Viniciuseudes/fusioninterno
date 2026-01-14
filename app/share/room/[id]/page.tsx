"use client";

import { Room, modalityLabels, specialtyLabels } from "@/lib/data";
import { MapPin, Check, Ruler, Phone, Share2, Navigation } from "lucide-react";
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

// Interface corrigida para receber o objeto Room completo
interface PublicRoomViewProps {
  room: Room;
}

export function PublicRoomView({ room }: PublicRoomViewProps) {
  // Tratamento de segurança para o telefone
  const cleanPhone = room.manager?.phone?.replace(/\D/g, "") || "";
  const whatsappLink = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(
    `Olá, vi a sala ${room.name} no Fusion e gostaria de mais informações.`
  )}`;

  const handleShare = () => {
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

  return (
    <div className="min-h-screen bg-background pb-24 animate-in fade-in duration-500">
      {/* Header Imersivo */}
      <div className="relative h-[40vh] md:h-[55vh] bg-black">
        <Carousel className="w-full h-full">
          <CarouselContent>
            {room.images.length > 0 ? (
              room.images.map((img, i) => (
                <CarouselItem key={i} className="h-[40vh] md:h-[55vh]">
                  <img
                    src={img}
                    className="w-full h-full object-cover opacity-90"
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
          {room.images.length > 1 && (
            <>
              <CarouselPrevious className="left-4 bg-black/20 hover:bg-black/40 text-white border-none" />
              <CarouselNext className="right-4 bg-black/20 hover:bg-black/40 text-white border-none" />
            </>
          )}
        </Carousel>

        {/* Gradiente e Título */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-background via-background/80 to-transparent h-40" />

        <div className="absolute bottom-4 left-4 right-4 md:left-8 md:right-8 flex items-end justify-between">
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

          <Button
            variant="secondary"
            size="icon"
            className="rounded-full shadow-lg shrink-0 mb-2"
            onClick={handleShare}
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
          {/* Coluna Principal */}
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
          </div>

          {/* Coluna Lateral (Infraestrutura) */}
          <div className="md:col-span-1">
            <div className="bg-card border rounded-xl p-5 shadow-sm space-y-4 sticky top-4">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                O que oferece
              </h3>

              {/* Equipamentos */}
              {room.equipment.length > 0 && (
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

              {/* Comodidades */}
              {room.amenities.length > 0 && (
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

      {/* Footer Fixo para Contato */}
      <div className="fixed bottom-0 inset-x-0 p-4 bg-background/80 backdrop-blur-lg border-t z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="hidden md:block">
            <p className="text-sm font-medium">
              Fale com {room.manager?.name || "o responsável"}
            </p>
            <p className="text-xs text-muted-foreground">
              Tire dúvidas ou agende uma visita
            </p>
          </div>
          <Button
            size="lg"
            className="w-full md:w-auto bg-[#25D366] hover:bg-[#128C7E] text-white font-bold shadow-green-900/20 shadow-lg transition-all active:scale-95"
            onClick={() => window.open(whatsappLink, "_blank")}
          >
            <Phone className="h-5 w-5 mr-2" />
            Chamar no WhatsApp
          </Button>
        </div>
      </div>
    </div>
  );
}
