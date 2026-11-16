import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Si no has configurado tu .env.local todavía, esto queda en null y
// la app cae automáticamente en "modo demo" (datos guardados en localStorage
// en vez de en Supabase). Así puedes ver la interfaz funcionando desde ya.
export const supabase = url && anonKey ? createClient(url, anonKey) : null

export const isDemoMode = !supabase
