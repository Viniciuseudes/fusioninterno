"use client";

import { useState } from "react";
import { Room, modalityLabels, specialtyLabels } from "@/lib/data";
import {
  X,
  MapPin,
  Check,
  Users,
  Ruler,
  Moon,
  Sun,
  Calendar,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface RoomDetailModalProps {
  room: Room | null;
  isOpen: boolean;
  onClose: () => void;
}

export function RoomDetailModal({
  room,
  isOpen,
  onClose,
}: RoomDetailModalProps) {
  if (!isOpen || !room) return null;

  const handleShareWhatsApp = () => {
    // Gera o link público (ajuste o domínio quando for pra produção)
    const baseUrl = window.location.origin;
    const publicLink = `${baseUrl}/share/room/${room.id}`;

    const text = `
🏥 *Olha essa sala que encontrei no Fusion!*
*${room.name}* em ${room.neighborhood}

📸 Veja as fotos e detalhes aqui:
${publicLink}
`.trim();

    const encodedText = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encodedText}`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-card w-full max-w-4xl h-[90vh] rounded-xl shadow-2xl flex flex-col md:flex-row overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-50 bg-black/20 hover:bg-black/40 text-white rounded-full"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </Button>

        {/* Coluna Esquerda: Imagens Verticais */}
        <div className="w-full md:w-1/2 bg-black flex items-center justify-center relative">
          <Carousel className="w-full h-full">
            <CarouselContent>
              {room.images.map((img, index) => (
                <CarouselItem key={index} className="h-[40vh] md:h-full">
                  <img
                    src={img}
                    alt={`Foto ${index + 1}`}
                    className="object-cover w-full h-full"
                  />
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
        </div>

        {/* Coluna Direita: Informações */}
        <div className="w-full md:w-1/2 flex flex-col bg-background">
          <ScrollArea className="flex-1 p-6 md:p-8">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  {room.name}
                </h2>
                <p className="text-muted-foreground flex items-center gap-1 mt-1 text-sm">
                  <MapPin className="h-4 w-4 text-primary" /> {room.address},{" "}
                  {room.neighborhood}
                </p>
                {room.referencePoint && (
                  <p className="text-xs text-muted-foreground mt-1 ml-5">
                    Ref: {room.referencePoint}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Ruler className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{room.size}m²</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">
                    Responsável: {room.manager.name}
                  </span>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                  Infraestrutura
                </h3>
                <div className="flex flex-wrap gap-2">
                  {room.equipment.map((item) => (
                    <Badge
                      key={item}
                      variant="secondary"
                      className="border-primary/20 text-primary bg-primary/5"
                    >
                      {item}
                    </Badge>
                  ))}
                  {room.amenities.map((item) => (
                    <Badge key={item} variant="outline">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>

          <div className="p-6 border-t bg-muted/10 space-y-4">
            <div className="flex justify-between items-end">
              <div className="flex gap-4">
                {room.pricePerHour && (
                  <div>
                    <span className="block text-lg font-bold text-primary">
                      R$ {room.pricePerHour}
                    </span>
                    <span className="text-xs text-muted-foreground">/h</span>
                  </div>
                )}
                {room.pricePerShift && (
                  <div>
                    <span className="block text-lg font-bold text-primary">
                      R$ {room.pricePerShift}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      /turno
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={handleShareWhatsApp}
                className="w-full bg-green-50 hover:bg-green-100 hover:text-green-700 border-green-200"
              >
                <Share2 className="h-4 w-4 mr-2" /> Compartilhar
              </Button>
              <Button className="w-full">Reservar Sala</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
