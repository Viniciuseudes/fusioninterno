"use client";

import { useState, useEffect, useRef } from "react";
import {
  X,
  Upload,
  Loader2,
  DollarSign,
  Ruler,
  MapPin,
  List,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Room,
  modalityLabels,
  specialtyLabels,
  amenityLabels,
} from "@/lib/data";
import { RoomService } from "@/services/room-service";

interface RoomManagementModalProps {
  roomToEdit?: Room | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function RoomManagementModal({
  roomToEdit,
  isOpen,
  onClose,
  onSave,
}: RoomManagementModalProps) {
  // Estados do Formulário
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [address, setAddress] = useState("");
  const [size, setSize] = useState<string>(""); // String para facilitar input vazio

  // Listas
  const [images, setImages] = useState<string[]>([]);
  const [selectedModalities, setSelectedModalities] = useState<string[]>([]);
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  // Equipamentos como texto para edição rápida
  const [equipmentText, setEquipmentText] = useState("");

  // Preços (Strings para permitir limpar o campo)
  const [priceHour, setPriceHour] = useState("");
  const [priceShift, setPriceShift] = useState("");
  const [priceFixed, setPriceFixed] = useState("");

  // Booleans
  const [nightShift, setNightShift] = useState(false);
  const [weekend, setWeekend] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Carregar dados se for edição
  useEffect(() => {
    if (isOpen && roomToEdit) {
      setName(roomToEdit.name);
      setDescription(roomToEdit.description);
      setNeighborhood(roomToEdit.neighborhood);
      setAddress(roomToEdit.address);
      setSize(roomToEdit.size.toString());
      setImages(roomToEdit.images);
      setSelectedModalities(roomToEdit.modalities);
      setSelectedSpecialties(roomToEdit.specialties);
      setSelectedAmenities(roomToEdit.amenities);

      // Converte array para texto separado por vírgula
      setEquipmentText(roomToEdit.equipment.join(", "));

      setPriceHour(roomToEdit.pricePerHour?.toString() || "");
      setPriceShift(roomToEdit.pricePerShift?.toString() || "");
      setPriceFixed(roomToEdit.priceFixed?.toString() || "");

      setNightShift(roomToEdit.nightShiftAvailable);
      setWeekend(roomToEdit.weekendAvailable);
    } else if (isOpen && !roomToEdit) {
      resetForm();
    }
  }, [isOpen, roomToEdit]);

  const resetForm = () => {
    setName("");
    setDescription("");
    setNeighborhood("");
    setAddress("");
    setSize("");
    setImages([]);
    setSelectedModalities([]);
    setSelectedSpecialties([]);
    setSelectedAmenities([]);
    setEquipmentText("");
    setPriceHour("");
    setPriceShift("");
    setPriceFixed("");
    setNightShift(false);
    setWeekend(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const newUrls: string[] = [];
      // Upload paralelo
      await Promise.all(
        Array.from(files).map(async (file) => {
          const url = await RoomService.uploadRoomImage(file);
          newUrls.push(url);
        })
      );
      setImages((prev) => [...prev, ...newUrls]);
    } catch (error) {
      console.error("Erro no upload", error);
      alert("Erro ao enviar imagens");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleSelection = (
    list: string[],
    setList: (l: string[]) => void,
    item: string
  ) => {
    if (list.includes(item)) {
      setList(list.filter((i) => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleSubmit = async () => {
    // 1. Validação
    if (!name || !neighborhood) {
      alert("Preencha os campos obrigatórios (Nome e Bairro).");
      return;
    }

    if (images.length === 0) {
      alert("Adicione pelo menos uma foto da sala.");
      return;
    }

    setIsSubmitting(true);
    try {
      // 2. Processamento dos dados
      const equipmentArray = equipmentText
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item.length > 0);

      // Conversão segura de preços e números
      const safePriceHour =
        priceHour && !isNaN(Number(priceHour)) ? Number(priceHour) : undefined;
      const safePriceShift =
        priceShift && !isNaN(Number(priceShift))
          ? Number(priceShift)
          : undefined;
      const safePriceFixed =
        priceFixed && !isNaN(Number(priceFixed))
          ? Number(priceFixed)
          : undefined;
      const safeSize = size && !isNaN(Number(size)) ? Number(size) : 0;

      const roomData: Partial<Room> = {
        name,
        description,
        neighborhood,
        address,
        size: safeSize,
        images,
        modalities: selectedModalities as any,
        specialties: selectedSpecialties as any,
        amenities: selectedAmenities,
        equipment: equipmentArray,
        pricePerHour: safePriceHour,
        pricePerShift: safePriceShift,
        priceFixed: safePriceFixed,
        nightShiftAvailable: nightShift,
        weekendAvailable: weekend,
        // Host fixo por enquanto (pode evoluir para pegar do usuário logado)
        host: {
          id: "sys",
          name: "Fusion Clinic",
          phone: "",
          avatar: "",
          whatsapp: "",
        },
      };

      // 3. Chamada ao Serviço
      if (roomToEdit) {
        await RoomService.updateRoom(roomToEdit.id, roomData);
      } else {
        await RoomService.createRoom(roomData);
      }

      onSave(); // Atualiza a lista na tela pai
      onClose(); // Fecha o modal
    } catch (error: any) {
      console.error("Erro ao salvar sala", error);
      alert(`Erro ao salvar sala: ${error.message || "Tente novamente."}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Container Modal */}
      <div className="relative bg-card w-full max-w-4xl max-h-[90vh] rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header Fixo */}
        <div className="flex items-center justify-between p-6 border-b shrink-0 bg-card z-10">
          <h2 className="text-2xl font-bold">
            {roomToEdit ? "Editar Sala" : "Cadastrar Nova Sala"}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Corpo com Scroll */}
        <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
          <div className="space-y-8">
            {/* 1. Informações Básicas */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2 text-primary">
                Informações Básicas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome da Sala *</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Consultório Premium 01"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Localização (Bairro/Cidade) *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="pl-9"
                      value={neighborhood}
                      onChange={(e) => setNeighborhood(e.target.value)}
                      placeholder="Ex: Vila Nova Conceição - SP"
                    />
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Endereço Completo</Label>
                  <Input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Rua, Número, Complemento"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tamanho (m²)</Label>
                  <div className="relative">
                    <Ruler className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      className="pl-9"
                      value={size}
                      onChange={(e) => setSize(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Descrição</Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            </section>

            {/* 2. Fotos */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2 text-primary">
                Galeria de Fotos *
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((url, index) => (
                  <div
                    key={index}
                    className="relative aspect-video rounded-lg overflow-hidden border group"
                  >
                    <img
                      src={url}
                      alt="Sala"
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-500/80 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}

                <div
                  className="aspect-video border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {isUploading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  ) : (
                    <>
                      <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                      <span className="text-xs text-muted-foreground text-center px-2">
                        Adicionar Fotos
                      </span>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                />
              </div>
            </section>

            {/* 3. Classificações */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2 text-primary">
                Classificação
              </h3>

              <div className="space-y-2">
                <Label>Modalidades Aceitas</Label>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(modalityLabels).map((key) => (
                    <Badge
                      key={key}
                      variant={
                        selectedModalities.includes(key) ? "default" : "outline"
                      }
                      className="cursor-pointer hover:bg-primary/80"
                      onClick={() =>
                        toggleSelection(
                          selectedModalities,
                          setSelectedModalities,
                          key
                        )
                      }
                    >
                      {modalityLabels[key as any]}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Especialidades Atendidas</Label>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(specialtyLabels).map((key) => (
                    <Badge
                      key={key}
                      variant={
                        selectedSpecialties.includes(key)
                          ? "default"
                          : "outline"
                      }
                      className="cursor-pointer hover:bg-primary/80"
                      onClick={() =>
                        toggleSelection(
                          selectedSpecialties,
                          setSelectedSpecialties,
                          key
                        )
                      }
                    >
                      {specialtyLabels[key as any]}
                    </Badge>
                  ))}
                </div>
              </div>
            </section>

            {/* 4. Infraestrutura */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2 text-primary">
                Infraestrutura
              </h3>

              <div className="space-y-2">
                <Label>Comodidades Fixas</Label>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(amenityLabels).map((key) => (
                    <Badge
                      key={key}
                      variant={
                        selectedAmenities.includes(key)
                          ? "secondary"
                          : "outline"
                      }
                      className="cursor-pointer"
                      onClick={() =>
                        toggleSelection(
                          selectedAmenities,
                          setSelectedAmenities,
                          key
                        )
                      }
                    >
                      {amenityLabels[key]}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <List className="h-4 w-4" />
                  Equipamentos (Digite separado por vírgula)
                </Label>
                <Textarea
                  value={equipmentText}
                  onChange={(e) => setEquipmentText(e.target.value)}
                  placeholder="Ex: Laser CO2, Maca Elétrica, Wi-Fi 5G, Estacionamento Valet..."
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Digite todos os equipamentos e diferenciais separados por
                  vírgula.
                </p>
              </div>
            </section>

            {/* 5. Preços e Regras */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2 text-primary">
                Valores e Regras
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Preço/Hora</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      className="pl-9"
                      value={priceHour}
                      onChange={(e) => setPriceHour(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Preço/Turno</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      className="pl-9"
                      value={priceShift}
                      onChange={(e) => setPriceShift(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Preço Fixo Mensal</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      className="pl-9"
                      value={priceFixed}
                      onChange={(e) => setPriceFixed(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-6 pt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="night"
                    checked={nightShift}
                    onCheckedChange={(c) => setNightShift(c as boolean)}
                  />
                  <label
                    htmlFor="night"
                    className="text-sm font-medium cursor-pointer"
                  >
                    Disponível Turno da Noite
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="weekend"
                    checked={weekend}
                    onCheckedChange={(c) => setWeekend(c as boolean)}
                  />
                  <label
                    htmlFor="weekend"
                    className="text-sm font-medium cursor-pointer"
                  >
                    Disponível Fim de Semana
                  </label>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Footer Fixo */}
        <div className="p-6 border-t bg-muted/20 flex justify-end gap-3 shrink-0">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || isUploading}
            className="min-w-[150px]"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            {roomToEdit ? "Salvar Alterações" : "Cadastrar Sala"}
          </Button>
        </div>
      </div>
    </div>
  );
}
