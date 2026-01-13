"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Search,
  MapPin,
  Filter,
  Star,
  Check,
  Loader2,
  Stethoscope,
  Plus,
  Edit,
  Trash2,
  ChevronsUpDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  type Room,
  type RoomModality,
  type RoomSpecialty,
  specialtyLabels,
  modalityLabels,
} from "@/lib/data";
import { RoomService } from "@/services/room-service";
import { RoomDetailModal } from "@/components/room-detail-modal";
import { RoomManagementModal } from "@/components/room-management-modal";
import { useUser } from "@/contexts/user-context";
import { ScrollArea } from "@/components/ui/scroll-area";

// --- COMPONENTE DE SELECT COM BUSCA (COMBOBOX) ---
interface FilterComboboxProps {
  label: string;
  icon: any;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  labels?: Record<string, string>;
}

function FilterCombobox({
  label,
  icon: Icon,
  options,
  value,
  onChange,
  labels,
}: FilterComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredOptions = useMemo(() => {
    if (!search) return options;
    return options.filter((item) => {
      const labelText = labels ? labels[item] : item;
      return labelText?.toLowerCase().includes(search.toLowerCase());
    });
  }, [options, search, labels]);

  const currentLabel = value === "all" ? label : labels ? labels[value] : value;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-background border-input hover:bg-accent hover:text-accent-foreground h-10 px-3 py-2"
        >
          <div className="flex items-center gap-2 truncate">
            <Icon className="h-4 w-4 shrink-0 opacity-50" />
            <span className="truncate text-muted-foreground font-normal">
              {value === "all" ? label : currentLabel}
            </span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <div className="p-2 border-b">
          <div className="flex items-center border rounded-md px-2 bg-muted/20">
            <Search className="h-3 w-3 text-muted-foreground mr-2" />
            <input
              className="flex h-8 w-full rounded-md bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <ScrollArea className="h-[200px]">
          <div className="p-1">
            <div
              className={cn(
                "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                value === "all" && "bg-accent/50"
              )}
              onClick={() => {
                onChange("all");
                setOpen(false);
              }}
            >
              <Check
                className={cn(
                  "mr-2 h-4 w-4",
                  value === "all" ? "opacity-100" : "opacity-0"
                )}
              />
              Todos
            </div>
            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Não encontrado.
              </div>
            ) : (
              filteredOptions.map((option) => {
                const optionLabel = labels ? labels[option] : option;
                const isSelected = value === option;
                return (
                  <div
                    key={option}
                    className={cn(
                      "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 cursor-pointer",
                      isSelected && "bg-accent/50"
                    )}
                    onClick={() => {
                      onChange(option);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        isSelected ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {optionLabel}
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

// --- VIEW PRINCIPAL ---

export function FindRoomView() {
  const { isGestor } = useUser();

  // Filtros
  const [selectedNeighborhood, setSelectedNeighborhood] = useState("all");
  const [selectedModality, setSelectedModality] = useState<
    RoomModality | "all"
  >("all");
  const [selectedSpecialty, setSelectedSpecialty] = useState<
    RoomSpecialty | "all"
  >("all");
  const [selectedEquipment, setSelectedEquipment] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Dados
  const [rooms, setRooms] = useState<Room[]>([]);
  const [availableEquipments, setAvailableEquipments] = useState<string[]>([]);
  const [availableLocations, setAvailableLocations] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modais
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [roomToEdit, setRoomToEdit] = useState<Room | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const filters = {
        neighborhood:
          selectedNeighborhood === "all" ? undefined : selectedNeighborhood,
        modality: selectedModality === "all" ? undefined : selectedModality,
        specialty: selectedSpecialty === "all" ? undefined : selectedSpecialty,
        equipment: selectedEquipment === "all" ? undefined : selectedEquipment,
      };

      const [roomsData, equipData, locationData] = await Promise.all([
        RoomService.getRooms(filters),
        RoomService.getAvailableEquipments(),
        RoomService.getLocations(),
      ]);

      setRooms(roomsData);
      setAvailableEquipments(equipData);
      setAvailableLocations(locationData);
    } catch (error) {
      console.error("Erro ao carregar dados", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [
    selectedNeighborhood,
    selectedModality,
    selectedSpecialty,
    selectedEquipment,
  ]);

  const filteredRooms = rooms.filter((room) => {
    if (
      searchTerm &&
      !room.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !room.description.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  // Handlers
  const handleCreateRoom = () => {
    setRoomToEdit(null);
    setIsManageModalOpen(true);
  };

  const handleEditRoom = (e: React.MouseEvent, room: Room) => {
    e.stopPropagation();
    setRoomToEdit(room);
    setIsManageModalOpen(true);
  };

  const handleDeleteRoom = async (e: React.MouseEvent, roomId: string) => {
    e.stopPropagation();
    if (confirm("Tem certeza que deseja excluir esta sala?")) {
      try {
        await RoomService.deleteRoom(roomId);
        loadData();
      } catch (error) {
        alert("Erro ao excluir");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Encontre sua Sala</h1>
          <p className="text-muted-foreground">
            Gestão e busca de consultórios em todo o Brasil
          </p>
        </div>

        {isGestor && (
          <Button onClick={handleCreateRoom} className="bg-primary shadow-md">
            <Plus className="h-4 w-4 mr-2" /> Cadastrar Sala
          </Button>
        )}
      </div>

      <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Busca Textual */}
          <div className="relative lg:col-span-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Busca rápida..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* COMBOBOX DE LOCALIZAÇÃO */}
          <FilterCombobox
            label="Localização"
            icon={MapPin}
            options={availableLocations}
            value={selectedNeighborhood}
            onChange={setSelectedNeighborhood}
          />

          {/* COMBOBOX DE MODALIDADE */}
          <FilterCombobox
            label="Modalidade"
            icon={Filter}
            options={Object.keys(modalityLabels)}
            value={selectedModality}
            onChange={(v) => setSelectedModality(v as any)}
            labels={modalityLabels}
          />

          {/* COMBOBOX DE ESPECIALIDADE */}
          <FilterCombobox
            label="Especialidade"
            icon={Star}
            options={Object.keys(specialtyLabels)}
            value={selectedSpecialty}
            onChange={(v) => setSelectedSpecialty(v as any)}
            labels={specialtyLabels}
          />

          {/* COMBOBOX DE EQUIPAMENTO */}
          <FilterCombobox
            label="Equipamento"
            icon={Stethoscope}
            options={availableEquipments}
            value={selectedEquipment}
            onChange={setSelectedEquipment}
          />
        </div>

        {(selectedNeighborhood !== "all" ||
          selectedModality !== "all" ||
          selectedSpecialty !== "all" ||
          selectedEquipment !== "all") && (
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedNeighborhood("all");
                setSelectedModality("all");
                setSelectedSpecialty("all");
                setSelectedEquipment("all");
                setSearchTerm("");
              }}
              className="text-muted-foreground hover:text-destructive"
            >
              Limpar Filtros
            </Button>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredRooms.length === 0 ? (
        <div className="text-center py-16 bg-muted/20 border-2 border-dashed rounded-xl">
          <p className="text-lg font-medium text-muted-foreground">
            Nenhuma sala encontrada.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredRooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              onClick={() => {
                setSelectedRoom(room);
                setIsDetailModalOpen(true);
              }}
              isGestor={isGestor}
              onEdit={(e) => handleEditRoom(e, room)}
              onDelete={(e) => handleDeleteRoom(e, room.id)}
            />
          ))}
        </div>
      )}

      <RoomDetailModal
        room={selectedRoom}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
      />

      <RoomManagementModal
        isOpen={isManageModalOpen}
        onClose={() => setIsManageModalOpen(false)}
        onSave={loadData}
        roomToEdit={roomToEdit}
      />
    </div>
  );
}

function RoomCard({
  room,
  onClick,
  isGestor,
  onEdit,
  onDelete,
}: {
  room: Room;
  onClick: () => void;
  isGestor: boolean;
  onEdit: (e: any) => void;
  onDelete: (e: any) => void;
}) {
  return (
    <Card
      className="overflow-hidden hover:shadow-lg hover:border-primary/50 transition-all group flex flex-col h-full cursor-pointer relative"
      onClick={onClick}
    >
      {isGestor && (
        <div className="absolute top-2 left-2 z-20 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="secondary"
            size="icon"
            className="h-8 w-8 rounded-full bg-white/90 shadow-sm"
            onClick={onEdit}
            title="Editar"
          >
            <Edit className="h-4 w-4 text-blue-600" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="h-8 w-8 rounded-full bg-white/90 shadow-sm"
            onClick={onDelete}
            title="Excluir"
          >
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      )}

      {/* ASPECT-RATIO 3/4 PARA FORMATO RETRATO (CELULAR) */}
      <div className="aspect-[3/4] relative overflow-hidden bg-muted">
        <img
          src={room.images[0] || "/placeholder.jpg"}
          alt={room.name}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
        <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
          {room.modalities.slice(0, 2).map((mod) => (
            <Badge
              key={mod}
              variant="secondary"
              className="bg-white/90 text-black shadow-sm backdrop-blur-sm text-[10px] font-bold uppercase tracking-wide"
            >
              {modalityLabels[mod]}
            </Badge>
          ))}
        </div>
        <div className="absolute bottom-3 left-3 right-3 text-white">
          <h3 className="font-bold text-lg leading-tight shadow-black drop-shadow-md">
            {room.name}
          </h3>
          <p className="text-xs text-white/90 flex items-center gap-1 mt-1 drop-shadow-md">
            <MapPin className="h-3 w-3" /> {room.neighborhood}
          </p>
        </div>
      </div>

      <CardContent className="p-4 pt-4 flex-1 flex flex-col gap-3">
        <div className="flex flex-wrap gap-1">
          {room.specialties.slice(0, 2).map((spec) => (
            <Badge
              key={spec}
              variant="outline"
              className="text-[10px] border-primary/20 text-primary bg-primary/5"
            >
              {specialtyLabels[spec]}
            </Badge>
          ))}
          {room.specialties.length > 2 && (
            <Badge variant="outline" className="text-[10px]">
              +{room.specialties.length - 2}
            </Badge>
          )}
        </div>

        {/* EXIBIÇÃO INTELIGENTE: REFERÊNCIA OU EQUIPAMENTOS */}
        <div className="space-y-1.5 pt-1">
          {room.referencePoint ? (
            <p className="text-xs text-muted-foreground flex items-start gap-1">
              <MapPin className="h-3 w-3 mt-0.5 shrink-0 text-primary" />
              <span className="line-clamp-2">{room.referencePoint}</span>
            </p>
          ) : (
            room.equipment.slice(0, 2).map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 text-xs text-muted-foreground"
              >
                <Check className="h-3 w-3 text-green-500 shrink-0" />
                <span className="truncate">{item}</span>
              </div>
            ))
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 mt-auto border-t bg-muted/5">
        <div className="w-full flex items-center justify-between pt-3">
          <div>
            <p className="font-bold text-lg text-primary">
              R$ {room.pricePerHour || room.pricePerShift || room.priceFixed}
              <span className="text-xs font-normal text-muted-foreground ml-1">
                {room.pricePerHour
                  ? "/h"
                  : room.pricePerShift
                  ? "/turno"
                  : "/mês"}
              </span>
            </p>
          </div>
          <Button size="sm" variant="secondary" className="h-8">
            Ver Detalhes
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
