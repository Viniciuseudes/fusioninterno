"use client";

import { useState } from "react";
import { Room, modalityLabels, specialtyLabels } from "@/lib/data";
import {
  X,
  MapPin,
  Copy,
  Check,
  Users,
  Ruler,
  Moon,
  Sun,
  Calendar,
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
  const [copied, setCopied] = useState(false);

  if (!isOpen || !room) return null;

  const handleCopyToClipboard = () => {
    // Formata um texto bonito para WhatsApp
    const text = `
🏥 *${room.name}*
📍 ${room.neighborhood} - ${room.address}

📏 Tamanho: ${room.size}m²
✨ Ideal para: ${room.specialties.map((s) => specialtyLabels[s]).join(", ")}

✅ *Destaques & Equipamentos:*
${room.equipment.map((e) => `• ${e}`).join("\n")}
${room.amenities.map((a) => `• ${a}`).join("\n")}

💰 *Valores:*
${room.pricePerHour ? `• Hora: R$ ${room.pricePerHour}` : ""}
${room.pricePerShift ? `• Turno (4h): R$ ${room.pricePerShift}` : ""}
${room.priceFixed ? `• Fixo Mensal: R$ ${room.priceFixed}` : ""}

🔗 Agende agora pelo Fusion Clinic!
`.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-card w-full max-w-4xl h-[90vh] md:h-auto md:max-h-[90vh] rounded-xl shadow-2xl flex flex-col md:flex-row overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-50 bg-black/20 hover:bg-black/40 text-white rounded-full"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </Button>

        {/* Coluna Esquerda: Imagens */}
        <div className="w-full md:w-1/2 bg-black flex items-center justify-center relative">
          {room.images.length > 0 ? (
            <Carousel className="w-full h-full">
              <CarouselContent>
                {room.images.map((img, index) => (
                  <CarouselItem key={index} className="h-[300px] md:h-[600px]">
                    <div className="h-full w-full flex items-center justify-center">
                      <img
                        src={img}
                        alt={`Foto ${index + 1}`}
                        className="object-cover w-full h-full"
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
            <div className="text-white/50 flex flex-col items-center">
              <Moon className="h-12 w-12 mb-2" />
              <p>Sem fotos disponíveis</p>
            </div>
          )}

          <div className="absolute bottom-4 left-4 flex gap-2">
            {room.nightShiftAvailable && (
              <Badge className="bg-indigo-600 hover:bg-indigo-700">
                <Moon className="w-3 h-3 mr-1" /> Noite
              </Badge>
            )}
            {room.weekendAvailable && (
              <Badge className="bg-green-600 hover:bg-green-700">
                <Sun className="w-3 h-3 mr-1" /> Fim de Semana
              </Badge>
            )}
          </div>
        </div>

        {/* Coluna Direita: Informações */}
        <div className="w-full md:w-1/2 flex flex-col bg-background">
          <ScrollArea className="flex-1 p-6 md:p-8">
            <div className="space-y-6">
              {/* Cabeçalho */}
              <div>
                <div className="flex items-start justify-between">
                  <h2 className="text-2xl font-bold text-foreground">
                    {room.name}
                  </h2>
                </div>
                <p className="text-muted-foreground flex items-center gap-1 mt-1 text-sm">
                  <MapPin className="h-4 w-4 text-primary" /> {room.address},{" "}
                  {room.neighborhood}
                </p>
              </div>

              {/* Descrição */}
              <div className="text-sm leading-relaxed text-muted-foreground bg-muted/30 p-4 rounded-lg border">
                {room.description || "Nenhuma descrição fornecida."}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Ruler className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{room.size}m²</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Capacidade Padrão</span>
                </div>
              </div>

              <Separator />

              {/* Equipamentos e Comodidades */}
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

              {/* Especialidades */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                  Ideal Para
                </h3>
                <div className="flex flex-wrap gap-2">
                  {room.specialties.map((spec) => (
                    <div
                      key={spec}
                      className="flex items-center gap-1 text-sm text-foreground bg-muted px-2 py-1 rounded-md"
                    >
                      <Check className="h-3 w-3 text-green-500" />{" "}
                      {specialtyLabels[spec]}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>

          {/* Footer Fixo: Preços e Ação */}
          <div className="p-6 border-t bg-muted/10 space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-sm text-muted-foreground">
                  Planos Disponíveis
                </p>
                <div className="flex gap-4 mt-1">
                  {room.pricePerHour && (
                    <div>
                      <span className="block text-lg font-bold text-primary">
                        R$ {room.pricePerHour}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        / hora
                      </span>
                    </div>
                  )}
                  {room.pricePerShift && (
                    <div>
                      <span className="block text-lg font-bold text-primary">
                        R$ {room.pricePerShift}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        / turno
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={handleCopyToClipboard}
                className="w-full"
              >
                {copied ? (
                  <Check className="h-4 w-4 mr-2" />
                ) : (
                  <Copy className="h-4 w-4 mr-2" />
                )}
                {copied ? "Copiado!" : "Copiar Info"}
              </Button>
              <Button className="w-full">
                <Calendar className="h-4 w-4 mr-2" /> Reservar Sala
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
