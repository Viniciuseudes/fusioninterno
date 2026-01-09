"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import {
  Search,
  MessageCircle,
  Link2,
  Phone,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Wifi,
  Wind,
  Car,
  Coffee,
  Accessibility,
  Moon,
  CalendarDays,
  Maximize2,
  Sparkles,
  Filter,
  X,
  Plus,
  ImagePlus,
} from "lucide-react"
import {
  sampleRooms,
  type Room,
  type RoomModality,
  type RoomSpecialty,
  specialtyLabels,
  modalityLabels,
  neighborhoods,
  amenityLabels,
  equipmentLabels,
} from "@/lib/data"
import { useUser } from "@/contexts/user-context"

interface RoomCardProps {
  room: Room
}

function RoomImageCarousel({ images, isFeatured }: { images: string[]; isFeatured?: boolean }) {
  const [currentIndex, setCurrentIndex] = useState(0)

  return (
    <div className="relative h-48 overflow-hidden rounded-t-xl group">
      <img
        src={images[currentIndex] || "/placeholder.svg"}
        alt="Foto da sala"
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation()
                  setCurrentIndex(idx)
                }}
                className={cn(
                  "w-2 h-2 rounded-full transition-colors",
                  idx === currentIndex ? "bg-white" : "bg-white/50",
                )}
              />
            ))}
          </div>
        </>
      )}
      {isFeatured && (
        <div className="absolute top-2 right-2">
          <Badge className="bg-primary text-primary-foreground">
            <Sparkles className="h-3 w-3 mr-1" />
            Destaque
          </Badge>
        </div>
      )}
    </div>
  )
}

function RoomCard({ room }: RoomCardProps) {
  const [showPhone, setShowPhone] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `Olá! Vi a sala "${room.name}" no Fucion Interno e gostaria de mais informações.`,
    )
    window.open(`https://wa.me/${room.host.whatsapp}?text=${message}`, "_blank")
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://fucion.app/sala/${room.id}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const amenityIcons: Record<string, React.ReactNode> = {
    "ar-condicionado": <Wind className="h-3.5 w-3.5" />,
    wifi: <Wifi className="h-3.5 w-3.5" />,
    estacionamento: <Car className="h-3.5 w-3.5" />,
    copa: <Coffee className="h-3.5 w-3.5" />,
    acessibilidade: <Accessibility className="h-3.5 w-3.5" />,
  }

  return (
    <Card className="overflow-hidden bg-card border-border hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5">
      <RoomImageCarousel images={room.images} isFeatured={room.id === "room-1"} />

      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-foreground">{room.name}</h3>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              <span>{room.neighborhood}</span>
            </div>
          </div>
          <Badge variant="secondary" className="shrink-0">
            <Maximize2 className="h-3 w-3 mr-1" />
            {room.size}m²
          </Badge>
        </div>

        {/* Specialty Tags */}
        <div className="flex flex-wrap gap-1">
          {room.specialties.slice(0, 3).map((specialty) => (
            <Badge key={specialty} className="text-xs bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
              {specialtyLabels[specialty]}
            </Badge>
          ))}
          {room.specialties.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{room.specialties.length - 3}
            </Badge>
          )}
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2 py-2 border-y border-border">
          <span className="text-2xl font-bold text-primary">
            R$ {room.pricePerHour?.toLocaleString("pt-BR") || room.pricePerShift?.toLocaleString("pt-BR")}
          </span>
          <span className="text-sm text-muted-foreground">{room.pricePerHour ? "/hora" : "/turno"}</span>
          {room.pricePerShift && room.pricePerHour && (
            <span className="text-sm text-muted-foreground ml-auto">
              R$ {room.pricePerShift.toLocaleString("pt-BR")}/turno
            </span>
          )}
        </div>

        {/* Amenities */}
        <div className="flex items-center gap-3">
          {room.amenities.slice(0, 4).map((amenity) => (
            <div key={amenity} className="flex items-center gap-1 text-muted-foreground" title={amenityLabels[amenity]}>
              {amenityIcons[amenity] || <Sparkles className="h-3.5 w-3.5" />}
            </div>
          ))}
          {room.nightShiftAvailable && (
            <div className="flex items-center gap-1 text-muted-foreground" title="Turno noturno disponível">
              <Moon className="h-3.5 w-3.5" />
            </div>
          )}
          {room.weekendAvailable && (
            <div className="flex items-center gap-1 text-muted-foreground" title="Disponível aos fins de semana">
              <CalendarDays className="h-3.5 w-3.5" />
            </div>
          )}
        </div>

        {/* Host */}
        <div className="flex items-center gap-2 pt-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={room.host.avatar || "/placeholder.svg"} />
            <AvatarFallback>{room.host.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground">{room.host.name}</span>
        </div>

        {/* Commercial Actions */}
        <div className="flex gap-2 pt-2">
          <Button onClick={handleWhatsApp} className="flex-1 bg-green-600 hover:bg-green-700 text-white">
            <MessageCircle className="h-4 w-4 mr-2" />
            WhatsApp
          </Button>
          <Button variant="outline" onClick={handleCopyLink} className="shrink-0 bg-transparent">
            {copied ? "Copiado!" : <Link2 className="h-4 w-4" />}
          </Button>
          <Button
            variant="outline"
            className="shrink-0 relative bg-transparent"
            onMouseEnter={() => setShowPhone(true)}
            onMouseLeave={() => setShowPhone(false)}
          >
            <Phone className="h-4 w-4" />
            {showPhone && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-popover border border-border rounded-lg shadow-lg whitespace-nowrap text-sm">
                {room.host.phone}
              </div>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function NewRoomModal({ onAddRoom }: { onAddRoom: (room: Room) => void }) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(1)
  const { currentUser } = useUser()

  // Form state
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [neighborhood, setNeighborhood] = useState("")
  const [address, setAddress] = useState("")
  const [size, setSize] = useState("")
  const [pricePerHour, setPricePerHour] = useState("")
  const [pricePerShift, setPricePerShift] = useState("")
  const [priceFixed, setPriceFixed] = useState("")
  const [selectedModalities, setSelectedModalities] = useState<RoomModality[]>([])
  const [selectedSpecialties, setSelectedSpecialties] = useState<RoomSpecialty[]>([])
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  const [selectedEquipments, setSelectedEquipments] = useState<string[]>([])
  const [nightShift, setNightShift] = useState(false)
  const [weekend, setWeekend] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [phone, setPhone] = useState("")
  const [whatsapp, setWhatsapp] = useState("")

  const allSpecialties: RoomSpecialty[] = [
    "psicologia",
    "nutricao",
    "dermatologia",
    "estetica",
    "fisioterapia",
    "medicina",
    "odontologia",
    "fonoaudiologia",
  ]

  const allAmenities = ["ar-condicionado", "wifi", "recepcionista", "estacionamento", "copa", "acessibilidade"]
  const allEquipments = ["laser", "eletrocauterio", "ultrassom", "radiofrequencia", "criolipolise", "microagulhamento"]

  const toggleModality = (modality: RoomModality) => {
    setSelectedModalities((prev) =>
      prev.includes(modality) ? prev.filter((m) => m !== modality) : [...prev, modality],
    )
  }

  const toggleSpecialty = (specialty: RoomSpecialty) => {
    setSelectedSpecialties((prev) =>
      prev.includes(specialty) ? prev.filter((s) => s !== specialty) : [...prev, specialty],
    )
  }

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) => (prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]))
  }

  const toggleEquipment = (equipment: string) => {
    setSelectedEquipments((prev) =>
      prev.includes(equipment) ? prev.filter((e) => e !== equipment) : [...prev, equipment],
    )
  }

  const addPlaceholderImage = () => {
    const queries = [
      "modern medical office white elegant",
      "clean clinical room professional",
      "aesthetic clinic interior",
      "medical examination room clean",
    ]
    const query = queries[images.length % queries.length]
    setImages((prev) => [...prev, `/placeholder.svg?height=400&width=600&query=${encodeURIComponent(query)}`])
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = () => {
    const newRoom: Room = {
      id: `room-${Date.now()}`,
      name,
      description,
      neighborhood,
      address,
      size: Number.parseInt(size) || 20,
      pricePerHour: pricePerHour ? Number.parseFloat(pricePerHour) : undefined,
      pricePerShift: pricePerShift ? Number.parseFloat(pricePerShift) : undefined,
      priceFixed: priceFixed ? Number.parseFloat(priceFixed) : undefined,
      modalities: selectedModalities,
      specialties: selectedSpecialties,
      amenities: selectedAmenities,
      equipment: selectedEquipments,
      nightShiftAvailable: nightShift,
      weekendAvailable: weekend,
      images: images.length > 0 ? images : ["/modern-medical-office.png"],
      host: {
        id: currentUser.id,
        name: currentUser.name,
        avatar: currentUser.avatar,
        phone,
        whatsapp,
      },
    }

    onAddRoom(newRoom)
    setOpen(false)
    resetForm()
  }

  const resetForm = () => {
    setStep(1)
    setName("")
    setDescription("")
    setNeighborhood("")
    setAddress("")
    setSize("")
    setPricePerHour("")
    setPricePerShift("")
    setPriceFixed("")
    setSelectedModalities([])
    setSelectedSpecialties([])
    setSelectedAmenities([])
    setSelectedEquipments([])
    setNightShift(false)
    setWeekend(false)
    setImages([])
    setPhone("")
    setWhatsapp("")
  }

  const isStep1Valid = name && neighborhood && size
  const isStep2Valid = selectedModalities.length > 0 && (pricePerHour || pricePerShift || priceFixed)
  const isStep3Valid = selectedSpecialties.length > 0

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Cadastrar Sala
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Cadastrar Nova Sala</DialogTitle>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 py-4">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                  step >= s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                )}
              >
                {s}
              </div>
              {s < 4 && <div className={cn("w-12 h-0.5 transition-colors", step > s ? "bg-primary" : "bg-muted")} />}
            </div>
          ))}
        </div>

        <div className="text-center text-sm text-muted-foreground mb-4">
          {step === 1 && "Informações Básicas"}
          {step === 2 && "Preços e Modalidades"}
          {step === 3 && "Especialidades e Comodidades"}
          {step === 4 && "Fotos e Contato"}
        </div>

        <Tabs value={`step-${step}`} className="w-full">
          {/* Step 1: Basic Info */}
          <TabsContent value="step-1" className="space-y-4 mt-0">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="name">Nome da Sala *</Label>
                <Input
                  id="name"
                  placeholder="Ex: Consultório Premium Centro"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="neighborhood">Bairro *</Label>
                <Select value={neighborhood} onValueChange={setNeighborhood}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o bairro" />
                  </SelectTrigger>
                  <SelectContent>
                    {neighborhoods
                      .filter((n) => n !== "Todos")
                      .map((n) => (
                        <SelectItem key={n} value={n}>
                          {n}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="size">Tamanho (m²) *</Label>
                <Input
                  id="size"
                  type="number"
                  placeholder="Ex: 25"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                />
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="address">Endereço Completo</Label>
                <Input
                  id="address"
                  placeholder="Rua, número, complemento"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  placeholder="Descreva sua sala, diferenciais, estrutura..."
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>
          </TabsContent>

          {/* Step 2: Pricing */}
          <TabsContent value="step-2" className="space-y-4 mt-0">
            <div className="space-y-4">
              <div>
                <Label className="text-sm text-muted-foreground mb-2 block">Modalidades de Locação *</Label>
                <div className="flex flex-wrap gap-2">
                  {(["hourly", "shift", "fixed"] as RoomModality[]).map((modality) => (
                    <Badge
                      key={modality}
                      variant={selectedModalities.includes(modality) ? "default" : "outline"}
                      className={cn(
                        "cursor-pointer transition-colors py-2 px-4",
                        selectedModalities.includes(modality)
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-accent",
                      )}
                      onClick={() => toggleModality(modality)}
                    >
                      {modalityLabels[modality]}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {selectedModalities.includes("hourly") && (
                  <div className="space-y-2">
                    <Label htmlFor="priceHour">Preço por Hora (R$)</Label>
                    <Input
                      id="priceHour"
                      type="number"
                      placeholder="Ex: 80"
                      value={pricePerHour}
                      onChange={(e) => setPricePerHour(e.target.value)}
                    />
                  </div>
                )}
                {selectedModalities.includes("shift") && (
                  <div className="space-y-2">
                    <Label htmlFor="priceShift">Preço por Turno (R$)</Label>
                    <Input
                      id="priceShift"
                      type="number"
                      placeholder="Ex: 300"
                      value={pricePerShift}
                      onChange={(e) => setPricePerShift(e.target.value)}
                    />
                  </div>
                )}
                {selectedModalities.includes("fixed") && (
                  <div className="space-y-2">
                    <Label htmlFor="priceFixed">Preço Mensal (R$)</Label>
                    <Input
                      id="priceFixed"
                      type="number"
                      placeholder="Ex: 2500"
                      value={priceFixed}
                      onChange={(e) => setPriceFixed(e.target.value)}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2 pt-4 border-t border-border">
                <Label className="text-sm text-muted-foreground">Disponibilidade Extra</Label>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="nightShift"
                      checked={nightShift}
                      onCheckedChange={(checked) => setNightShift(checked === true)}
                    />
                    <label htmlFor="nightShift" className="text-sm cursor-pointer flex items-center gap-2">
                      <Moon className="h-4 w-4 text-muted-foreground" />
                      Turno Noturno
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="weekend"
                      checked={weekend}
                      onCheckedChange={(checked) => setWeekend(checked === true)}
                    />
                    <label htmlFor="weekend" className="text-sm cursor-pointer flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-muted-foreground" />
                      Fins de Semana
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Step 3: Specialties & Amenities */}
          <TabsContent value="step-3" className="space-y-4 mt-0">
            <div className="space-y-4">
              <div>
                <Label className="text-sm text-muted-foreground mb-2 block">Especialidades Atendidas *</Label>
                <div className="flex flex-wrap gap-2">
                  {allSpecialties.map((specialty) => (
                    <Badge
                      key={specialty}
                      variant={selectedSpecialties.includes(specialty) ? "default" : "outline"}
                      className={cn(
                        "cursor-pointer transition-colors",
                        selectedSpecialties.includes(specialty)
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-accent",
                      )}
                      onClick={() => toggleSpecialty(specialty)}
                    >
                      {specialtyLabels[specialty]}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground mb-2 block">Comodidades</Label>
                <div className="grid grid-cols-2 gap-2">
                  {allAmenities.map((amenity) => (
                    <div key={amenity} className="flex items-center gap-2">
                      <Checkbox
                        id={`amenity-${amenity}`}
                        checked={selectedAmenities.includes(amenity)}
                        onCheckedChange={() => toggleAmenity(amenity)}
                      />
                      <label htmlFor={`amenity-${amenity}`} className="text-sm cursor-pointer">
                        {amenityLabels[amenity]}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground mb-2 block">Equipamentos Disponíveis</Label>
                <div className="grid grid-cols-2 gap-2">
                  {allEquipments.map((equipment) => (
                    <div key={equipment} className="flex items-center gap-2">
                      <Checkbox
                        id={`equipment-${equipment}`}
                        checked={selectedEquipments.includes(equipment)}
                        onCheckedChange={() => toggleEquipment(equipment)}
                      />
                      <label htmlFor={`equipment-${equipment}`} className="text-sm cursor-pointer">
                        {equipmentLabels[equipment]}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Step 4: Photos & Contact */}
          <TabsContent value="step-4" className="space-y-4 mt-0">
            <div className="space-y-4">
              <div>
                <Label className="text-sm text-muted-foreground mb-2 block">Fotos da Sala</Label>
                <div className="grid grid-cols-3 gap-3">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative aspect-video rounded-lg overflow-hidden group">
                      <img
                        src={img || "/placeholder.svg"}
                        alt={`Foto ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {images.length < 6 && (
                    <button
                      onClick={addPlaceholderImage}
                      className="aspect-video rounded-lg border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <ImagePlus className="h-6 w-6" />
                      <span className="text-xs">Adicionar</span>
                    </button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-2">Adicione até 6 fotos da sua sala</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    placeholder="(11) 99999-9999"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    placeholder="5511999999999"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4 border-t border-border">
          <Button
            variant="outline"
            onClick={() => setStep((prev) => prev - 1)}
            disabled={step === 1}
            className="bg-transparent"
          >
            Voltar
          </Button>

          {step < 4 ? (
            <Button
              onClick={() => setStep((prev) => prev + 1)}
              disabled={(step === 1 && !isStep1Valid) || (step === 2 && !isStep2Valid) || (step === 3 && !isStep3Valid)}
            >
              Próximo
            </Button>
          ) : (
            <Button onClick={handleSubmit}>
              <Plus className="h-4 w-4 mr-2" />
              Cadastrar Sala
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function FindRoomView() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedModality, setSelectedModality] = useState<RoomModality | "all">("all")
  const [selectedSpecialties, setSelectedSpecialties] = useState<RoomSpecialty[]>([])
  const [selectedNeighborhood, setSelectedNeighborhood] = useState("Todos")
  const [nightShift, setNightShift] = useState(false)
  const [weekend, setWeekend] = useState(false)
  const [priceRange, setPriceRange] = useState([0, 300])
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [rooms, setRooms] = useState<Room[]>(sampleRooms)

  const allSpecialties: RoomSpecialty[] = [
    "psicologia",
    "nutricao",
    "dermatologia",
    "estetica",
    "fisioterapia",
    "medicina",
    "odontologia",
    "fonoaudiologia",
  ]

  const allAmenities = ["ar-condicionado", "wifi", "recepcionista", "estacionamento", "copa", "acessibilidade"]

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesEquipment = room.equipment.some(
          (e) => equipmentLabels[e]?.toLowerCase().includes(query) || e.toLowerCase().includes(query),
        )
        const matchesName = room.name.toLowerCase().includes(query)
        const matchesDesc = room.description.toLowerCase().includes(query)
        if (!matchesEquipment && !matchesName && !matchesDesc) return false
      }

      // Modality
      if (selectedModality !== "all" && !room.modalities.includes(selectedModality)) {
        return false
      }

      // Specialties
      if (selectedSpecialties.length > 0) {
        const hasSpecialty = selectedSpecialties.some((s) => room.specialties.includes(s))
        if (!hasSpecialty) return false
      }

      // Neighborhood
      if (selectedNeighborhood !== "Todos" && room.neighborhood !== selectedNeighborhood) {
        return false
      }

      // Night shift
      if (nightShift && !room.nightShiftAvailable) return false

      // Weekend
      if (weekend && !room.weekendAvailable) return false

      // Price range
      const price = room.pricePerHour || 0
      if (price < priceRange[0] || price > priceRange[1]) return false

      // Amenities
      if (selectedAmenities.length > 0) {
        const hasAllAmenities = selectedAmenities.every((a) => room.amenities.includes(a))
        if (!hasAllAmenities) return false
      }

      return true
    })
  }, [
    rooms,
    searchQuery,
    selectedModality,
    selectedSpecialties,
    selectedNeighborhood,
    nightShift,
    weekend,
    priceRange,
    selectedAmenities,
  ])

  const toggleSpecialty = (specialty: RoomSpecialty) => {
    setSelectedSpecialties((prev) =>
      prev.includes(specialty) ? prev.filter((s) => s !== specialty) : [...prev, specialty],
    )
  }

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) => (prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]))
  }

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedModality("all")
    setSelectedSpecialties([])
    setSelectedNeighborhood("Todos")
    setNightShift(false)
    setWeekend(false)
    setPriceRange([0, 300])
    setSelectedAmenities([])
  }

  const handleAddRoom = (newRoom: Room) => {
    setRooms((prev) => [newRoom, ...prev])
  }

  const activeFiltersCount =
    (selectedModality !== "all" ? 1 : 0) +
    selectedSpecialties.length +
    (selectedNeighborhood !== "Todos" ? 1 : 0) +
    (nightShift ? 1 : 0) +
    (weekend ? 1 : 0) +
    selectedAmenities.length

  const FilterSidebar = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Filtros Avançados</h2>
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            Limpar ({activeFiltersCount})
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="space-y-2">
        <Label className="text-sm text-muted-foreground">Buscar por equipamento</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Ex: Laser, Eletrocautério..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background"
          />
        </div>
      </div>

      {/* Modality */}
      <div className="space-y-2">
        <Label className="text-sm text-muted-foreground">Modalidade</Label>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="modality"
              checked={selectedModality === "all"}
              onChange={() => setSelectedModality("all")}
              className="accent-primary"
            />
            <span className="text-sm">Todas</span>
          </label>
          {(["hourly", "shift", "fixed"] as RoomModality[]).map((modality) => (
            <label key={modality} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="modality"
                checked={selectedModality === modality}
                onChange={() => setSelectedModality(modality)}
                className="accent-primary"
              />
              <span className="text-sm">{modalityLabels[modality]}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Specialty */}
      <div className="space-y-2">
        <Label className="text-sm text-muted-foreground">Especialidades</Label>
        <div className="flex flex-wrap gap-1.5">
          {allSpecialties.map((specialty) => (
            <Badge
              key={specialty}
              variant={selectedSpecialties.includes(specialty) ? "default" : "outline"}
              className={cn(
                "cursor-pointer transition-colors",
                selectedSpecialties.includes(specialty)
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "hover:bg-accent",
              )}
              onClick={() => toggleSpecialty(specialty)}
            >
              {specialtyLabels[specialty]}
            </Badge>
          ))}
        </div>
      </div>

      {/* Neighborhood */}
      <div className="space-y-2">
        <Label className="text-sm text-muted-foreground">Bairro</Label>
        <Select value={selectedNeighborhood} onValueChange={setSelectedNeighborhood}>
          <SelectTrigger className="bg-background">
            <SelectValue placeholder="Selecione o bairro" />
          </SelectTrigger>
          <SelectContent>
            {neighborhoods.map((neighborhood) => (
              <SelectItem key={neighborhood} value={neighborhood}>
                {neighborhood}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Availability */}
      <div className="space-y-2">
        <Label className="text-sm text-muted-foreground">Disponibilidade</Label>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Checkbox id="night" checked={nightShift} onCheckedChange={(checked) => setNightShift(checked === true)} />
            <label htmlFor="night" className="text-sm cursor-pointer flex items-center gap-2">
              <Moon className="h-4 w-4 text-muted-foreground" />
              Turno Noturno
            </label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="weekend" checked={weekend} onCheckedChange={(checked) => setWeekend(checked === true)} />
            <label htmlFor="weekend" className="text-sm cursor-pointer flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              Fins de Semana
            </label>
          </div>
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-3">
        <Label className="text-sm text-muted-foreground">Faixa de Preço (por hora)</Label>
        <Slider value={priceRange} onValueChange={setPriceRange} min={0} max={300} step={10} className="py-2" />
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>R$ {priceRange[0]}</span>
          <span>R$ {priceRange[1]}</span>
        </div>
      </div>

      {/* Amenities */}
      <div className="space-y-2">
        <Label className="text-sm text-muted-foreground">Comodidades</Label>
        <div className="space-y-2">
          {allAmenities.map((amenity) => (
            <div key={amenity} className="flex items-center gap-2">
              <Checkbox
                id={amenity}
                checked={selectedAmenities.includes(amenity)}
                onCheckedChange={() => toggleAmenity(amenity)}
              />
              <label htmlFor={amenity} className="text-sm cursor-pointer">
                {amenityLabels[amenity]}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Encontre uma Sala</h1>
          <p className="text-muted-foreground">
            Ferramenta comercial para encontrar o espaço ideal para profissionais de saúde
          </p>
        </div>
        <div className="flex items-center gap-2">
          <NewRoomModal onAddRoom={handleAddRoom} />
          <Button variant="outline" className="md:hidden bg-transparent" onClick={() => setMobileFiltersOpen(true)}>
            <Filter className="h-4 w-4 mr-2" />
            Filtros
            {activeFiltersCount > 0 && (
              <Badge className="ml-2 bg-primary text-primary-foreground">{activeFiltersCount}</Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="bg-primary/10 text-primary">
          {filteredRooms.length} {filteredRooms.length === 1 ? "sala encontrada" : "salas encontradas"}
        </Badge>
      </div>

      {/* Main content */}
      <div className="flex gap-6">
        {/* Desktop Filter Sidebar */}
        <aside className="hidden md:block w-72 shrink-0">
          <div className="sticky top-6 bg-card rounded-xl border border-border p-4">
            <FilterSidebar />
          </div>
        </aside>

        {/* Room Cards Grid */}
        <div className="flex-1">
          {filteredRooms.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredRooms.map((room) => (
                <RoomCard key={room.id} room={room} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Nenhuma sala encontrada</h3>
              <p className="text-muted-foreground mb-4">Tente ajustar os filtros para encontrar mais opções</p>
              <Button variant="outline" onClick={clearFilters}>
                Limpar filtros
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Modal */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileFiltersOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-full max-w-sm bg-card p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Filtros</h2>
              <Button variant="ghost" size="icon" onClick={() => setMobileFiltersOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <FilterSidebar />
            <div className="sticky bottom-0 pt-4 mt-6 border-t border-border bg-card">
              <Button className="w-full" onClick={() => setMobileFiltersOpen(false)}>
                Ver {filteredRooms.length} resultados
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
