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
  User,
  Phone,
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
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [address, setAddress] = useState("");
  const [referencePoint, setReferencePoint] = useState("");
  const [size, setSize] = useState<string>("");

  const [hostName, setHostName] = useState("");
  const [hostPhone, setHostPhone] = useState("");
  const [managerName, setManagerName] = useState("");
  const [managerPhone, setManagerPhone] = useState("");
  const [sameAsHost, setSameAsHost] = useState(false);

  const [images, setImages] = useState<string[]>([]);
  const [selectedModalities, setSelectedModalities] = useState<string[]>([]);
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  const [equipmentText, setEquipmentText] = useState("");

  const [priceHour, setPriceHour] = useState("");
  const [priceShift, setPriceShift] = useState("");
  const [priceFixed, setPriceFixed] = useState("");

  const [nightShift, setNightShift] = useState(false);
  const [weekend, setWeekend] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && roomToEdit) {
      setName(roomToEdit.name);
      setDescription(roomToEdit.description);
      setNeighborhood(roomToEdit.neighborhood);
      setAddress(roomToEdit.address);
      setReferencePoint(roomToEdit.referencePoint || "");
      setSize(roomToEdit.size.toString());
      setImages(roomToEdit.images);

      setHostName(roomToEdit.host.name);
      setHostPhone(roomToEdit.host.phone);
      setManagerName(roomToEdit.manager.name);
      setManagerPhone(roomToEdit.manager.phone);

      setSelectedModalities(roomToEdit.modalities);
      setSelectedSpecialties(roomToEdit.specialties);
      setSelectedAmenities(roomToEdit.amenities);
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

  useEffect(() => {
    if (sameAsHost) {
      setManagerName(hostName);
      setManagerPhone(hostPhone);
    }
  }, [sameAsHost, hostName, hostPhone]);

  const resetForm = () => {
    setName("");
    setDescription("");
    setNeighborhood("");
    setAddress("");
    setReferencePoint("");
    setSize("");
    setHostName("");
    setHostPhone("");
    setManagerName("");
    setManagerPhone("");
    setSameAsHost(false);
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
      await Promise.all(
        Array.from(files).map(async (file) => {
          const url = await RoomService.uploadRoomImage(file);
          newUrls.push(url);
        })
      );
      setImages((prev) => [...prev, ...newUrls]);
    } catch (error) {
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
    if (list.includes(item)) setList(list.filter((i) => i !== item));
    else setList([...list, item]);
  };

  const handleSubmit = async () => {
    if (!name || !neighborhood || !hostName || !hostPhone) {
      alert("Preencha os campos obrigatórios e dados do anfitrião.");
      return;
    }

    if (images.length === 0) {
      alert("Adicione pelo menos uma foto da sala.");
      return;
    }

    setIsSubmitting(true);
    try {
      const equipmentArray = equipmentText
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
      const safeSize = size && !isNaN(Number(size)) ? Number(size) : 0;

      const roomData: Partial<Room> = {
        name,
        description,
        neighborhood,
        address,
        referencePoint,
        size: safeSize,
        images,
        modalities: selectedModalities as any,
        specialties: selectedSpecialties as any,
        amenities: selectedAmenities,
        equipment: equipmentArray,
        pricePerHour: priceHour ? Number(priceHour) : undefined,
        pricePerShift: priceShift ? Number(priceShift) : undefined,
        priceFixed: priceFixed ? Number(priceFixed) : undefined,
        nightShiftAvailable: nightShift,
        weekendAvailable: weekend,
        host: { name: hostName, phone: hostPhone },
        manager: { name: managerName, phone: managerPhone },
      };

      if (roomToEdit) await RoomService.updateRoom(roomToEdit.id, roomData);
      else await RoomService.createRoom(roomData);

      onSave();
      onClose();
    } catch (error) {
      alert("Erro ao salvar sala.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-card w-full max-w-4xl max-h-[90vh] rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b shrink-0 bg-card z-10">
          <h2 className="text-2xl font-bold">
            {roomToEdit ? "Editar Sala" : "Cadastrar Nova Sala"}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
          <div className="space-y-8">
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

            <section className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2 text-primary">
                Localização
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Bairro *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="pl-9"
                      value={neighborhood}
                      onChange={(e) => setNeighborhood(e.target.value)}
                      placeholder="Bairro"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Endereço Completo</Label>
                  <Input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Rua e Número"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Melhor Ponto de Referência</Label>
                  <Input
                    value={referencePoint}
                    onChange={(e) => setReferencePoint(e.target.value)}
                    placeholder="Ex: Ao lado do Shopping X, Em frente à farmácia Y"
                  />
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2 text-primary">
                Contatos
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Anfitrião */}
                <div className="space-y-3 p-4 bg-muted/20 rounded-lg border">
                  <h4 className="font-medium flex items-center gap-2">
                    <User className="h-4 w-4" /> Anfitrião (Dono)
                  </h4>
                  <div className="space-y-2">
                    <Label>Nome</Label>
                    <Input
                      value={hostName}
                      onChange={(e) => setHostName(e.target.value)}
                      placeholder="Nome do anfitrião"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Telefone / WhatsApp</Label>
                    <Input
                      value={hostPhone}
                      onChange={(e) => setHostPhone(e.target.value)}
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                </div>

                {/* Responsável */}
                <div className="space-y-3 p-4 bg-muted/20 rounded-lg border">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium flex items-center gap-2">
                      <User className="h-4 w-4" /> Responsável Clínica
                    </h4>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="same"
                        checked={sameAsHost}
                        onCheckedChange={(c) => setSameAsHost(c as boolean)}
                      />
                      <label htmlFor="same" className="text-xs cursor-pointer">
                        Mesmo do Anfitrião
                      </label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Nome</Label>
                    <Input
                      value={managerName}
                      onChange={(e) => setManagerName(e.target.value)}
                      disabled={sameAsHost}
                      placeholder="Nome do responsável"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Telefone / WhatsApp</Label>
                    <Input
                      value={managerPhone}
                      onChange={(e) => setManagerPhone(e.target.value)}
                      disabled={sameAsHost}
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2 text-primary">
                Galeria de Fotos *
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((url, index) => (
                  <div
                    key={index}
                    className="relative aspect-[3/4] rounded-lg overflow-hidden border group"
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
                  className="aspect-[3/4] border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {isUploading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  ) : (
                    <>
                      <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                      <span className="text-xs text-muted-foreground text-center px-2">
                        Adicionar Fotos (Vertical)
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

            <section className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2 text-primary">
                Classificação & Infra
              </h3>
              <div className="space-y-2">
                <Label>Modalidades</Label>
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
                      {modalityLabels[key as keyof typeof modalityLabels]}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Especialidades</Label>
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
                      {specialtyLabels[key as keyof typeof specialtyLabels]}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Equipamentos</Label>
                <Textarea
                  value={equipmentText}
                  onChange={(e) => setEquipmentText(e.target.value)}
                  placeholder="Digite separado por vírgula..."
                  rows={3}
                />
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2 text-primary">
                Valores
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
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Preço Fixo</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      className="pl-9"
                      value={priceFixed}
                      onChange={(e) => setPriceFixed(e.target.value)}
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
                  <label htmlFor="night" className="text-sm cursor-pointer">
                    Turno Noite
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="weekend"
                    checked={weekend}
                    onCheckedChange={(c) => setWeekend(c as boolean)}
                  />
                  <label htmlFor="weekend" className="text-sm cursor-pointer">
                    Fim de Semana
                  </label>
                </div>
              </div>
            </section>
          </div>
        </div>

        <div className="p-6 border-t bg-muted/20 flex justify-end gap-3 shrink-0">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || isUploading}
            className="min-w-[150px]"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {roomToEdit ? "Salvar" : "Cadastrar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
