import { supabase, isDemoMode } from './supabase'

/**
 * Sube una foto a un bucket público de Storage y devuelve su URL pública.
 * En modo demo no hay Storage real — se guarda como data URL (sirve para
 * localStorage, no para producción).
 */
export async function uploadPhoto(bucket, file) {
  if (isDemoMode) {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = () => resolve(null)
      reader.readAsDataURL(file)
    })
  }
  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_')
  const path = `${Date.now()}-${safeName}`
  const { error } = await supabase.storage.from(bucket).upload(path, file)
  if (error) return null
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data?.publicUrl ?? null
}
