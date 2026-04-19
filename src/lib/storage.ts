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

// Dimensiones recomendadas por tipo
export const IMAGE_SIZES = {
  teamShield: { maxWidth: 256, maxHeight: 256 },
  teamPhoto: { maxWidth: 1920, maxHeight: 1080 },
  playerPhoto: { maxWidth: 512, maxHeight: 512 },
} as const

// Redimensionar imagen antes de subir
export async function resizeImage(file: File, maxWidth: number, maxHeight: number): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      let { width, height } = img
      
      // Calcular nuevas dimensiones manteniendo aspecto
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height)
        width = Math.round(width * ratio)
        height = Math.round(height * ratio)
      }
      
      canvas.width = width
      canvas.height = height
      
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('No se pudo crear el contexto de canvas'))
        return
      }
      
      ctx.drawImage(img, 0, 0, width, height)
      
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Error al redimensionar imagen'))
            return
          }
          resolve(new File([blob], file.name, { type: file.type }))
        },
        file.type,
        0.85 // Quality 85%
      )
    }
    img.onerror = () => reject(new Error('Error al cargar imagen'))
    img.src = URL.createObjectURL(file)
  })
}

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
  // Redimensionar escudo a 256x256
  const resized = await resizeImage(file, IMAGE_SIZES.teamShield.maxWidth, IMAGE_SIZES.teamShield.maxHeight)
  return uploadFile({
    bucket: STORAGE_BUCKETS.TEAM_SHIELDS,
    file: resized,
    folder: teamId,
  })
}

export async function uploadTeamPhoto(teamId: string, file: File) {
  // Redimensionar foto de equipo a 1920x1080
  const resized = await resizeImage(file, IMAGE_SIZES.teamPhoto.maxWidth, IMAGE_SIZES.teamPhoto.maxHeight)
  return uploadFile({
    bucket: STORAGE_BUCKETS.TEAM_PHOTOS,
    file: resized,
    folder: teamId,
  })
}

export async function uploadPlayerPhoto(playerId: string, file: File) {
  // Redimensionar foto de jugador a 512x512
  const resized = await resizeImage(file, IMAGE_SIZES.playerPhoto.maxWidth, IMAGE_SIZES.playerPhoto.maxHeight)
  return uploadFile({
    bucket: STORAGE_BUCKETS.PLAYER_PHOTOS,
    file: resized,
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