import { createClient } from "@/lib/supabase/client"
import { Room } from "@/lib/data"

const supabase = createClient()

export const RoomService = {
  // ==========================================
  // 1. LEITURA (BUSCA E FILTROS)
  // ==========================================

  async getRooms(filters?: {
    neighborhood?: string
    modality?: string
    specialty?: string
    equipment?: string
  }): Promise<Room[]> {
    let query = supabase.from('rooms').select('*')

    if (filters?.neighborhood && filters.neighborhood !== "all") {
      query = query.eq('neighborhood', filters.neighborhood)
    }

    if (filters?.modality) {
      query = query.contains('modalities', [filters.modality])
    }

    if (filters?.specialty) {
      query = query.contains('specialties', [filters.specialty])
    }

    if (filters?.equipment) {
       query = query.contains('equipment', [filters.equipment])
    }

    const { data, error } = await query

    if (error) {
      console.error("Erro ao buscar salas:", error)
      return []
    }

    return data.map((room: any) => ({
      id: room.id,
      name: room.name,
      images: room.images || [],
      neighborhood: room.neighborhood,
      address: room.address,
      modalities: room.modalities || [],
      specialties: room.specialties || [],
      pricePerHour: room.price_per_hour,
      pricePerShift: room.price_per_shift,
      priceFixed: room.price_fixed,
      amenities: room.amenities || [],
      equipment: room.equipment || [],
      nightShiftAvailable: room.night_shift_available,
      weekendAvailable: room.weekend_available,
      host: {
        id: "sys",
        name: room.host_info?.name || "Fusion Clinic",
        avatar: "/placeholder-user.jpg",
        phone: room.host_info?.phone || "",
        whatsapp: room.host_info?.phone?.replace(/\D/g, "") || ""
      },
      description: room.description,
      size: room.size
    }))
  },

  async getAvailableEquipments(): Promise<string[]> {
    const { data, error } = await supabase.from('rooms').select('equipment')
    if (error) return []
    const allEquipments = data.flatMap((r: any) => r.equipment || [])
    return Array.from(new Set(allEquipments)).sort()
  },

  // ESTA ERA A FUNÇÃO QUE FALTAVA
  async getLocations(): Promise<string[]> {
    const { data, error } = await supabase.from('rooms').select('neighborhood')
    if (error) return []
    const uniqueLocations = Array.from(new Set(data.map((r: any) => r.neighborhood))).filter(Boolean).sort()
    return uniqueLocations
  },

  // ==========================================
  // 2. ESCRITA (GESTÃO E ADMINISTRAÇÃO)
  // ==========================================

  async createRoom(roomData: Partial<Room>) {
    // Sanitização de dados para o Supabase
    const dbRoom = {
      name: roomData.name,
      description: roomData.description,
      neighborhood: roomData.neighborhood,
      address: roomData.address,
      size: roomData.size || 0,
      images: roomData.images || [],
      modalities: roomData.modalities || [],
      specialties: roomData.specialties || [],
      amenities: roomData.amenities || [],
      equipment: roomData.equipment || [],
      // Converter explicitamente undefined ou NaN para null
      price_per_hour: roomData.pricePerHour ? Number(roomData.pricePerHour) : null,
      price_per_shift: roomData.pricePerShift ? Number(roomData.pricePerShift) : null,
      price_fixed: roomData.priceFixed ? Number(roomData.priceFixed) : null,
      night_shift_available: roomData.nightShiftAvailable || false,
      weekend_available: roomData.weekendAvailable || false,
      host_info: roomData.host ? {
        name: roomData.host.name,
        phone: roomData.host.phone
      } : { name: "Fusion Clinic", phone: "" }
    }

    const { data, error } = await supabase
      .from('rooms')
      .insert(dbRoom)
      .select()
      .single()

    if (error) {
      console.error("Supabase Create Error:", error) // Log detalhado do erro
      throw error
    }
    return data
  },

  async updateRoom(roomId: string, updates: Partial<Room>) {
    const dbUpdates: any = {}
    
    // Mapeamento seguro
    if (updates.name !== undefined) dbUpdates.name = updates.name
    if (updates.description !== undefined) dbUpdates.description = updates.description
    if (updates.neighborhood !== undefined) dbUpdates.neighborhood = updates.neighborhood
    if (updates.address !== undefined) dbUpdates.address = updates.address
    if (updates.size !== undefined) dbUpdates.size = updates.size
    if (updates.images !== undefined) dbUpdates.images = updates.images
    if (updates.modalities !== undefined) dbUpdates.modalities = updates.modalities
    if (updates.specialties !== undefined) dbUpdates.specialties = updates.specialties
    if (updates.amenities !== undefined) dbUpdates.amenities = updates.amenities
    if (updates.equipment !== undefined) dbUpdates.equipment = updates.equipment
    
    // Tratamento de preços para aceitar zerar o valor
    if (updates.pricePerHour !== undefined) dbUpdates.price_per_hour = updates.pricePerHour ? Number(updates.pricePerHour) : null
    if (updates.pricePerShift !== undefined) dbUpdates.price_per_shift = updates.pricePerShift ? Number(updates.pricePerShift) : null
    if (updates.priceFixed !== undefined) dbUpdates.price_fixed = updates.priceFixed ? Number(updates.priceFixed) : null
    
    if (updates.nightShiftAvailable !== undefined) dbUpdates.night_shift_available = updates.nightShiftAvailable
    if (updates.weekendAvailable !== undefined) dbUpdates.weekend_available = updates.weekendAvailable

    if (updates.host) {
      dbUpdates.host_info = {
        name: updates.host.name,
        phone: updates.host.phone
      }
    }

    const { error } = await supabase
      .from('rooms')
      .update(dbUpdates)
      .eq('id', roomId)

    if (error) {
      console.error("Supabase Update Error:", error)
      throw error
    }
  },

  async deleteRoom(roomId: string) {
    const { error } = await supabase
      .from('rooms')
      .delete()
      .eq('id', roomId)

    if (error) throw error
  },

  async uploadRoomImage(file: File): Promise<string> {
    const fileExt = file.name.split('.').pop()
    const fileName = `room-${Date.now()}-${Math.random()}.${fileExt}`
    const filePath = `${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('attachments') // Certifique-se que este bucket existe no Supabase
      .upload(filePath, file)

    if (uploadError) throw uploadError

    const { data } = supabase.storage.from('attachments').getPublicUrl(filePath)
    return data.publicUrl
  }
}