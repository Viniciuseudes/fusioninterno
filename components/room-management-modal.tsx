"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Room,
  RoomModality,
  RoomSpecialty,
  amenityLabels,
  specialtyLabels,
} from "@/lib/data";
import { Loader2, Trash2, Upload, X } from "lucide-react";
import { RoomService } from "@/services/room-service";
import { toast } from "sonner";

const DRAFT_KEY = "room-form-draft";

const formSchema = z.object({
  name: z.string().min(3, "Nome da sala é obrigatório (mín. 3 caracteres)"),
  description: z.string().min(10, "Descrição muito curta (mín. 10 caracteres)"),
  neighborhood: z.string().min(1, "Selecione um bairro"),
  address: z.string().min(5, "Endereço completo é obrigatório"),
  referencePoint: z.string().optional(),
  size: z.coerce.number().min(1, "Informe o tamanho da sala (m²)"),

  modalities: z
    .array(z.string())
    .min(1, "Selecione pelo menos uma modalidade de aluguel"),
  specialties: z
    .array(z.string())
    .min(1, "Selecione pelo menos uma especialidade aceita"),
  amenities: z.array(z.string()),
  equipment: z.array(z.string()),

  pricePerHour: z.coerce.number().optional(),
  pricePerShift: z.coerce.number().optional(),
  priceFixed: z.coerce.number().optional(),

  nightShiftAvailable: z.boolean().default(false),
  weekendAvailable: z.boolean().default(false),

  hostName: z.string().min(2, "Nome do anfitrião é obrigatório"),
  hostPhone: z.string().min(10, "Telefone do anfitrião inválido"),

  // Agora opcionais (se vazio, usa o do host)
  managerName: z.string().optional(),
  managerPhone: z.string().optional(),

  images: z.array(z.string()).optional(),
});

// Máscara de telefone
const formatPhone = (value: string) => {
  if (!value) return "";
  value = value.replace(/\D/g, "");
  value = value.replace(/^(\d{2})(\d)/g, "($1) $2");
  value = value.replace(/(\d)(\d{4})$/, "$1-$2");
  return value.slice(0, 15);
};

interface RoomManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomToEdit?: Room | null;
  onSave: () => void;
}

export function RoomManagementModal({
  isOpen,
  onClose,
  roomToEdit,
  onSave,
}: RoomManagementModalProps) {
  const [equipmentInput, setEquipmentInput] = useState("");
  const [activeTab, setActiveTab] = useState("basic"); // Estado para controlar a aba ativa

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      neighborhood: "",
      address: "",
      referencePoint: "",
      size: 0,
      modalities: [],
      specialties: [],
      amenities: [],
      equipment: [],
      nightShiftAvailable: false,
      weekendAvailable: false,
      hostName: "",
      hostPhone: "",
      managerName: "",
      managerPhone: "",
      images: [],
    },
  });

  // 1. Carregar dados
  useEffect(() => {
    if (isOpen) {
      if (roomToEdit) {
        form.reset({
          name: roomToEdit.name,
          description: roomToEdit.description,
          neighborhood: roomToEdit.neighborhood,
          address: roomToEdit.address,
          referencePoint: roomToEdit.referencePoint || "",
          size: roomToEdit.size,
          modalities: roomToEdit.modalities,
          specialties: roomToEdit.specialties,
          amenities: roomToEdit.amenities,
          equipment: roomToEdit.equipment || [],
          pricePerHour: roomToEdit.pricePerHour,
          pricePerShift: roomToEdit.pricePerShift,
          priceFixed: roomToEdit.priceFixed,
          nightShiftAvailable: roomToEdit.nightShiftAvailable,
          weekendAvailable: roomToEdit.weekendAvailable,
          hostName: roomToEdit.host.name,
          hostPhone: roomToEdit.host.phone,
          managerName: roomToEdit.manager?.name,
          managerPhone: roomToEdit.manager?.phone,
          images: roomToEdit.images,
        });
      } else {
        const draft = localStorage.getItem(DRAFT_KEY);
        if (draft) {
          try {
            const parsedDraft = JSON.parse(draft);
            form.reset(parsedDraft);
            // toast.info("Rascunho restaurado."); // Comentado para não incomodar
          } catch (e) {
            console.error(e);
          }
        } else {
          form.reset({
            name: "",
            description: "",
            neighborhood: "",
            address: "",
            referencePoint: "",
            size: 0,
            modalities: [],
            specialties: [],
            amenities: [],
            equipment: [],
            nightShiftAvailable: false,
            weekendAvailable: false,
            hostName: "",
            hostPhone: "",
            managerName: "",
            managerPhone: "",
            images: [],
          });
        }
      }
    }
  }, [roomToEdit, form, isOpen]);

  // 2. Salvar Rascunho
  useEffect(() => {
    if (!roomToEdit && isOpen) {
      const subscription = form.watch((value) => {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(value));
      });
      return () => subscription.unsubscribe();
    }
  }, [form.watch, roomToEdit, isOpen]);

  const handleAddEquipment = (
    e: React.KeyboardEvent<HTMLInputElement> | React.MouseEvent
  ) => {
    if (
      (e as React.KeyboardEvent).key &&
      !["Enter", ","].includes((e as React.KeyboardEvent).key)
    ) {
      return;
    }
    e.preventDefault();
    const trimmed = equipmentInput.trim().replace(/,$/, "");

    if (trimmed) {
      const current = form.getValues("equipment") || [];
      if (!current.includes(trimmed)) {
        form.setValue("equipment", [...current, trimmed]);
        setEquipmentInput("");
      } else {
        toast.warning("Equipamento já adicionado");
      }
    }
  };

  const handleRemoveEquipment = (itemToRemove: string) => {
    const current = form.getValues("equipment") || [];
    form.setValue(
      "equipment",
      current.filter((item) => item !== itemToRemove)
    );
  };

  // Função chamada se houver ERRO no formulário ao tentar salvar
  const onInvalid = (errors: any) => {
    console.error("Erros de validação:", errors);

    // Mapeia os erros para mensagens amigáveis e muda a aba se necessário
    const errorKeys = Object.keys(errors);
    if (errorKeys.length > 0) {
      // Prioriza erros da aba atual, se não, vai para a primeira aba com erro
      if (
        errors.name ||
        errors.address ||
        errors.neighborhood ||
        errors.description
      ) {
        if (activeTab !== "basic") setActiveTab("basic");
        toast.error("Verifique os campos obrigatórios na aba 'Básico'.");
        return;
      }
      if (
        errors.size ||
        errors.hostName ||
        errors.hostPhone ||
        errors.specialties ||
        errors.modalities
      ) {
        if (activeTab !== "details") setActiveTab("details");
        toast.error(
          "Verifique os campos obrigatórios na aba 'Detalhes' (Tamanho, Anfitrião, etc)."
        );
        return;
      }
      toast.error(
        "Existem campos obrigatórios não preenchidos. Verifique as abas."
      );
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const { hostName, hostPhone, managerName, managerPhone, ...rest } =
        values;

      // Lógica de Fallback: Se não preencheu gerente, usa o anfitrião
      const finalManagerName =
        managerName && managerName.trim() !== "" ? managerName : hostName;
      const finalManagerPhone =
        managerPhone && managerPhone.trim() !== "" ? managerPhone : hostPhone;

      const roomData: Partial<Room> = {
        ...rest,
        modalities: rest.modalities as RoomModality[],
        specialties: rest.specialties as RoomSpecialty[],
        host: { name: hostName, phone: hostPhone },
        manager: { name: finalManagerName, phone: finalManagerPhone },
      };

      if (roomToEdit) {
        await RoomService.updateRoom(roomToEdit.id, roomData);
        toast.success("Sala atualizada com sucesso!");
      } else {
        await RoomService.createRoom(roomData);
        toast.success("Sala criada com sucesso!");
        localStorage.removeItem(DRAFT_KEY);
      }
      onSave();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar sala no servidor.");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        toast.info("Enviando imagem...");
        const url = await RoomService.uploadRoomImage(e.target.files[0]);
        const currentImages = form.getValues("images") || [];
        form.setValue("images", [...currentImages, url]);
        toast.success("Imagem adicionada!");
      } catch (error) {
        toast.error("Erro no upload da imagem");
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-4xl max-h-[90vh] flex flex-col p-0"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>
            {roomToEdit ? "Editar Sala" : "Cadastrar Nova Sala"}
          </DialogTitle>
          <DialogDescription>
            Preencha os dados da sala. Se faltar algo, nós te avisamos.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <Form {...form}>
            {/* Adicionado tratamento de erro no handleSubmit */}
            <form
              id="room-form"
              onSubmit={form.handleSubmit(onSubmit, onInvalid)}
              className="space-y-6"
            >
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="basic">Básico</TabsTrigger>
                  <TabsTrigger value="details">Detalhes</TabsTrigger>
                  <TabsTrigger value="values">Valores</TabsTrigger>
                  <TabsTrigger value="images">Imagens</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome da Sala *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ex: Consultório Premium 01"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="neighborhood"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bairro *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o bairro" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Lagoa Nova">
                                Lagoa Nova
                              </SelectItem>
                              <SelectItem value="Tirol">Tirol</SelectItem>
                              <SelectItem value="Petrópolis">
                                Petrópolis
                              </SelectItem>
                              <SelectItem value="Candelária">
                                Candelária
                              </SelectItem>
                              <SelectItem value="Ponta Negra">
                                Ponta Negra
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Endereço Completo *</FormLabel>
                        <FormControl>
                          <Input placeholder="Rua, Número, CEP" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="referencePoint"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ponto de Referência</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex: Próximo ao Shopping Midway"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Descreva os diferenciais da sala..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <TabsContent value="details" className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border p-4 rounded-lg bg-muted/10">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm text-primary flex items-center gap-2">
                        Dados do Anfitrião (Obrigatório)
                      </h4>
                      <FormField
                        control={form.control}
                        name="hostName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Nome do proprietário"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="hostPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Telefone (WhatsApp)</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="(00) 00000-0000"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(formatPhone(e.target.value))
                                }
                                maxLength={15}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm text-muted-foreground flex items-center gap-2">
                        Dados do Responsável (Opcional)
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Se vazio, usaremos os dados do anfitrião.
                      </p>
                      <FormField
                        control={form.control}
                        name="managerName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Gerente (opcional)"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="managerPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Telefone (WhatsApp)</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="(00) 00000-0000"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(formatPhone(e.target.value))
                                }
                                maxLength={15}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="size"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tamanho (m²) *</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <FormLabel>Equipamentos Disponíveis</FormLabel>
                    <div className="border p-4 rounded-lg bg-card space-y-3">
                      <div className="flex flex-wrap gap-2 min-h-[30px]">
                        {form.watch("equipment")?.map((item, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="pl-2 pr-1 py-1 flex items-center gap-1 text-sm"
                          >
                            {item}
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 rounded-full hover:bg-destructive/20 hover:text-destructive"
                              onClick={() => handleRemoveEquipment(item)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        ))}
                        {(!form.watch("equipment") ||
                          form.watch("equipment")?.length === 0) && (
                          <span className="text-muted-foreground text-sm italic">
                            Nenhum equipamento. Digite abaixo.
                          </span>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Input
                          value={equipmentInput}
                          onChange={(e) => setEquipmentInput(e.target.value)}
                          onKeyDown={handleAddEquipment}
                          placeholder="Digite e tecle Enter..."
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={handleAddEquipment as any}
                        >
                          Adicionar
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <FormLabel>Especialidades Aceitas *</FormLabel>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 border p-3 rounded-lg">
                      {Object.entries(specialtyLabels).map(([key, label]) => (
                        <FormField
                          key={key}
                          control={form.control}
                          name="specialties"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={key}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(key)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, key])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== key
                                            )
                                          );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer text-sm">
                                  {label}
                                </FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                    </div>
                    {form.formState.errors.specialties && (
                      <p className="text-sm font-medium text-destructive">
                        Selecione pelo menos uma especialidade
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <FormLabel>Modalidades de Aluguel *</FormLabel>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border p-3 rounded-lg">
                      <FormField
                        control={form.control}
                        name="modalities"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes("hourly")}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, "hourly"])
                                    : field.onChange(
                                        field.value?.filter(
                                          (v) => v !== "hourly"
                                        )
                                      );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Por Hora
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="modalities"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes("shift")}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, "shift"])
                                    : field.onChange(
                                        field.value?.filter(
                                          (v) => v !== "shift"
                                        )
                                      );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Por Turno
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="modalities"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes("fixed")}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, "fixed"])
                                    : field.onChange(
                                        field.value?.filter(
                                          (v) => v !== "fixed"
                                        )
                                      );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Mensal
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    </div>
                    {form.formState.errors.modalities && (
                      <p className="text-sm font-medium text-destructive">
                        Selecione pelo menos uma modalidade
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <FormLabel>Comodidades</FormLabel>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 border p-3 rounded-lg">
                      {Object.entries(amenityLabels).map(([key, label]) => (
                        <FormField
                          key={key}
                          control={form.control}
                          name="amenities"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={key}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(key)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, key])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== key
                                            )
                                          );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer text-sm">
                                  {label}
                                </FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="values" className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="pricePerHour"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preço por Hora (R$)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="pricePerShift"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preço por Turno (R$)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="priceFixed"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mensal Fixo (R$)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4 border p-4 rounded-lg">
                    <h4 className="font-medium text-sm">
                      Disponibilidade Extra
                    </h4>
                    <FormField
                      control={form.control}
                      name="nightShiftAvailable"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel>Turno Noturno</FormLabel>
                            <FormDescription>
                              Disponível para locação após as 18h
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="weekendAvailable"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel>Finais de Semana</FormLabel>
                            <FormDescription>
                              Disponível sábados e domingos
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="images" className="space-y-4 mt-4">
                  <div className="flex items-center gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="relative cursor-pointer"
                    >
                      <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={handleImageUpload}
                      />
                      <Upload className="mr-2 h-4 w-4" />
                      Adicionar Nova Imagem
                    </Button>
                  </div>

                  <ScrollArea className="h-[300px] w-full border rounded-md p-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {form.watch("images")?.map((img, index) => (
                        <div
                          key={index}
                          className="relative group aspect-video rounded-lg overflow-hidden border"
                        >
                          <img
                            src={img}
                            alt={`Sala ${index}`}
                            className="w-full h-full object-cover"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => {
                              const current = form.getValues("images") || [];
                              form.setValue(
                                "images",
                                current.filter((_, i) => i !== index)
                              );
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      {(!form.watch("images") ||
                        form.watch("images")?.length === 0) && (
                        <div className="col-span-full flex flex-col items-center justify-center h-40 text-muted-foreground border-2 border-dashed rounded-lg">
                          <Upload className="h-8 w-8 mb-2 opacity-50" />
                          <p>Nenhuma imagem adicionada</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </form>
          </Form>
        </div>

        <DialogFooter className="border-t p-4 bg-muted/20">
          <Button variant="outline" onClick={onClose} type="button">
            Cancelar
          </Button>
          <Button
            type="submit"
            form="room-form"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {roomToEdit ? "Salvar Alterações" : "Cadastrar Sala"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
