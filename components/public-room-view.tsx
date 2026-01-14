"use client";

import {
  Room,
  amenityLabels,
  modalityLabels,
  specialtyLabels,
} from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Check,
  Calendar,
  Clock,
  DollarSign,
  User,
  Share2,
  Navigation,
} from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Image from "next/image";

interface PublicRoomViewProps {
  room: Room;
}

export function PublicRoomView({ room }: PublicRoomViewProps) {
  const handleContact = () => {
    const message = `Olá! Vi a sala ${room.name} no Fusion Clinic e gostaria de mais informações.`;
    const url = `https://wa.me/55${room.host.phone.replace(
      /\D/g,
      ""
    )}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Fusion Clinic - ${room.name}`,
        text: `Confira esta sala disponível para locação: ${room.name}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copiado para a área de transferência!");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header Image / Carousel */}
      <div className="w-full h-[40vh] md:h-[50vh] relative bg-muted">
        {room.images.length > 0 ? (
          <Carousel className="w-full h-full">
            <CarouselContent>
              {room.images.map((img, index) => (
                <CarouselItem key={index} className="w-full h-full relative">
                  <div className="w-full h-[40vh] md:h-[50vh] relative">
                    <Image
                      src={img}
                      alt={`${room.name} - Imagem ${index + 1}`}
                      fill
                      className="object-cover"
                      priority={index === 0}
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {room.images.length > 1 && (
              <>
                <CarouselPrevious className="left-4" />
                <CarouselNext className="right-4" />
              </>
            )}
          </Carousel>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <span className="flex items-center gap-2">
              <Image
                src="/placeholder.svg"
                width={40}
                height={40}
                alt="Sem imagem"
                className="opacity-50"
              />
              Sem imagens disponíveis
            </span>
          </div>
        )}

        <div className="absolute top-4 right-4 z-10">
          <Button
            variant="secondary"
            size="icon"
            className="rounded-full shadow-lg"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="container max-w-4xl mx-auto px-4 -mt-8 relative z-10">
        <Card className="shadow-xl border-none">
          <CardContent className="p-6 md:p-8 space-y-8">
            {/* Header Info */}
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2 mb-2">
                {room.specialties.map((spec) => (
                  <Badge
                    key={spec}
                    variant="secondary"
                    className="text-primary bg-primary/10"
                  >
                    {specialtyLabels[spec]}
                  </Badge>
                ))}
              </div>

              <h1 className="text-3xl font-bold text-foreground">
                {room.name}
              </h1>

              <div className="flex flex-col gap-2 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 shrink-0 text-primary" />
                  <span>
                    {room.address}, {room.neighborhood}
                  </span>
                </div>

                {/* --- MUDANÇA AQUI: Exibição do Ponto de Referência --- */}
                {room.referencePoint && (
                  <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-500 font-medium bg-amber-500/10 p-2 rounded-md w-fit">
                    <Navigation className="h-4 w-4 shrink-0" />
                    <span>Próximo a: {room.referencePoint}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Price & Contact */}
            <div className="flex flex-col md:flex-row gap-4 p-4 bg-muted/50 rounded-xl border border-border">
              <div className="flex-1 space-y-1">
                <span className="text-sm text-muted-foreground">
                  Valores a partir de
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-primary">
                    R${" "}
                    {room.pricePerHour ||
                      room.pricePerShift ||
                      room.priceFixed ||
                      "Sob consulta"}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {room.pricePerHour
                      ? "/hora"
                      : room.pricePerShift
                      ? "/turno"
                      : "/mês"}
                  </span>
                </div>
              </div>
              <Button
                size="lg"
                onClick={handleContact}
                className="w-full md:w-auto font-semibold"
              >
                <User className="mr-2 h-4 w-4" />
                Agendar Visita
              </Button>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <h3 className="text-xl font-semibold">Sobre a sala</h3>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {room.description}
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  Comodidades
                </h3>
                <ul className="grid grid-cols-1 gap-2">
                  {room.amenities.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      {amenityLabels[item] || item}
                    </li>
                  ))}
                  {room.amenities.length === 0 && (
                    <li className="text-sm text-muted-foreground italic">
                      Nenhuma comodidade listada
                    </li>
                  )}
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  Disponibilidade
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm p-2 rounded bg-background border">
                    <span className="text-muted-foreground">Noturno</span>
                    <Badge
                      variant={room.nightShiftAvailable ? "default" : "outline"}
                    >
                      {room.nightShiftAvailable ? "Disponível" : "Indisponível"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm p-2 rounded bg-background border">
                    <span className="text-muted-foreground">
                      Finais de Semana
                    </span>
                    <Badge
                      variant={room.weekendAvailable ? "default" : "outline"}
                    >
                      {room.weekendAvailable ? "Disponível" : "Indisponível"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Modalidades */}
            <div className="space-y-3 pt-4 border-t border-border">
              <h3 className="font-semibold flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" />
                Modalidades de Locação
              </h3>
              <div className="flex flex-wrap gap-2">
                {room.modalities.map((mod) => (
                  <Badge key={mod} variant="secondary" className="px-3 py-1">
                    {modalityLabels[mod]}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
