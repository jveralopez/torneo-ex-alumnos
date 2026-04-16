import { getSupabaseClient } from '../lib/supabase'

// Configuración de buckets
export const STORAGE_BUCKETS = {
  TEAM_SHIELDS: 'team-shields',
  TEAM_PHOTOS: 'team-photos',
  PLAYER_PHOTOS: 'player-photos',
  DOCUMENTS: 'documents',
} as const

// Validación de archivos
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export function validateImageFile(file: File): void {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error(`Tipo de archivo no válido. Solo se permiten: JPG, PNG, WebP, GIF`)
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`El archivo es demasiado grande. Máximo: 5MB`)
  }
}

export function validateDocumentFile(file: File): void {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`El archivo es demasiado grande. Máximo: 5MB`)
  }
}

export type StorageBucket = (typeof STORAGE_BUCKETS)[keyof typeof STORAGE_BUCKETS]

interface UploadOptions {
  bucket: StorageBucket
  file: File
  folder?: string
  fileName?: string
}

interface UploadResult {
  path: string
  url: string
}

export async function uploadFile({ bucket, file, folder, fileName }: UploadOptions): Promise<UploadResult> {
  const supabase = getSupabaseClient()
  
  // Generar nombre de archivo único
  const ext = file.name.split('.').pop()
  const uniqueName = fileName || `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`
  const path = folder ? `${folder}/${uniqueName}` : uniqueName

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: true,
    })

  if (error) {
    throw new Error(`Error al subir archivo: ${error.message}`)
  }

  // Obtener URL pública
  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(path)

  return {
    path: data.path,
    url: urlData.publicUrl,
  }
}

export async function deleteFile(bucket: StorageBucket, path: string): Promise<void> {
  const supabase = getSupabaseClient()
  
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path])

  if (error) {
    throw new Error(`Error al eliminar archivo: ${error.message}`)
  }
}

export function getPublicUrl(bucket: StorageBucket, path: string): string {
  const supabase = getSupabaseClient()
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

// Funciones de utilidad para cada tipo de archivo
export async function uploadTeamShield(teamId: string, file: File) {
  return uploadFile({
    bucket: STORAGE_BUCKETS.TEAM_SHIELDS,
    file,
    folder: teamId,
  })
}

export async function uploadTeamPhoto(teamId: string, file: File) {
  return uploadFile({
    bucket: STORAGE_BUCKETS.TEAM_PHOTOS,
    file,
    folder: teamId,
  })
}

export async function uploadPlayerPhoto(playerId: string, file: File) {
  return uploadFile({
    bucket: STORAGE_BUCKETS.PLAYER_PHOTOS,
    file,
    folder: playerId,
  })
}

export async function uploadDocument(tournamentId: string, file: File, type: string) {
  return uploadFile({
    bucket: STORAGE_BUCKETS.DOCUMENTS,
    file,
    folder: `${tournamentId}/${type}`,
  })
}