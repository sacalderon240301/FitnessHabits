import { supabase } from './supabase'

/**
 * Manda una descripción libre del día a la Edge Function `parse-day-plan`,
 * que llama a OpenAI (la API key vive solo ahí, nunca en el navegador) y
 * devuelve una lista de bloques ya en la forma que espera `day_plan_blocks`.
 */
export async function generateDayPlan({ text, date }) {
  if (!supabase) {
    return { blocks: null, error: 'La generación con IA necesita Supabase conectado (no funciona en modo demo).' }
  }
  const { data, error } = await supabase.functions.invoke('parse-day-plan', {
    body: { text, date },
  })
  if (error) {
    return { blocks: null, error: error.message ?? 'No se pudo generar el plan.' }
  }
  if (data?.error) {
    return { blocks: null, error: data.error }
  }
  return { blocks: data?.blocks ?? [], error: null }
}
