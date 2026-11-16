// Edge Function: convierte una descripción libre del día (texto que escribe
// el usuario) en bloques estructurados para el planificador.
//
// La OPENAI_API_KEY vive SOLO acá (secret del proyecto de Supabase), nunca
// en el bundle del navegador. El cliente llama esta función con
// supabase.functions.invoke('parse-day-plan', { body: { text, date } }).
//
// Deploy:
//   supabase functions deploy parse-day-plan
//   supabase secrets set OPENAI_API_KEY=sk-...

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const CATEGORY_IDS = [
  'descanso', 'rutina', 'ejercicio', 'preparacion', 'trabajo',
  'comida', 'estudio', 'proyecto', 'ocio', 'hogar', 'personal', 'otro',
]

const SYSTEM_PROMPT = `Eres un asistente que convierte una descripción libre de un día, escrita en español por el usuario, en una lista de bloques de tiempo para un planificador diario.

Responde ÚNICAMENTE con un objeto JSON con esta forma exacta:
{"blocks": [ { "start_time": "HH:MM", "end_time": "HH:MM", "is_flexible": boolean, "activity": string | null, "category": string | null, "flexible_label": string | null } ]}

Reglas:
- Horas en formato 24h "HH:MM".
- Si el usuario da una actividad concreta con horario claro: is_flexible=false, "activity" es un nombre corto (2-5 palabras) en español, "category" es uno de estos ids exactos: ${CATEGORY_IDS.join(', ')}. "flexible_label" debe ser null.
- Si el usuario describe algo sin actividad fija ("tiempo libre", "lo que salga", "por definir"): is_flexible=true, "flexible_label" es una etiqueta corta, "activity" y "category" deben ser null.
- Si el usuario no da una hora exacta para algo, infiere un horario razonable que no se cruce con los demás bloques ya identificados, coherente con el resto del día.
- Ordena los bloques por start_time ascendente.
- No inventes actividades que el usuario no mencionó ni de forma implícita.
- No agregues texto fuera del JSON.`

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })
}

function isValidTime(v: unknown): v is string {
  return typeof v === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(v)
}

function sanitizeBlocks(raw: unknown): Array<Record<string, unknown>> {
  if (!Array.isArray(raw)) return []
  const out: Array<Record<string, unknown>> = []
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue
    const b = item as Record<string, unknown>
    if (!isValidTime(b.start_time) || !isValidTime(b.end_time)) continue
    const isFlexible = Boolean(b.is_flexible)
    if (isFlexible) {
      const label = typeof b.flexible_label === 'string' ? b.flexible_label.trim() : ''
      if (!label) continue
      out.push({ start_time: b.start_time, end_time: b.end_time, is_flexible: true, flexible_label: label, activity: null, category: null })
    } else {
      const activity = typeof b.activity === 'string' ? b.activity.trim() : ''
      if (!activity) continue
      const category = CATEGORY_IDS.includes(b.category as string) ? b.category : 'otro'
      out.push({ start_time: b.start_time, end_time: b.end_time, is_flexible: false, activity, category, flexible_label: null })
    }
  }
  out.sort((a, b) => (a.start_time as string).localeCompare(b.start_time as string))
  return out
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS_HEADERS })
  if (req.method !== 'POST') return json({ error: 'Método no soportado' }, 405)

  let body: { text?: string; date?: string }
  try {
    body = await req.json()
  } catch {
    return json({ error: 'Body inválido' }, 400)
  }

  const text = (body.text ?? '').trim()
  if (!text) return json({ error: 'Falta describir el día' }, 400)

  const apiKey = Deno.env.get('OPENAI_API_KEY')
  if (!apiKey) return json({ error: 'OPENAI_API_KEY no está configurada en este proyecto de Supabase' }, 500)

  try {
    const aiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `Fecha del plan: ${body.date ?? '(no especificada)'}\n\nDescripción del día:\n${text}` },
        ],
      }),
    })

    if (!aiRes.ok) {
      const errText = await aiRes.text()
      return json({ error: `OpenAI respondió ${aiRes.status}: ${errText.slice(0, 300)}` }, 502)
    }

    const aiData = await aiRes.json()
    const content = aiData?.choices?.[0]?.message?.content
    if (!content) return json({ error: 'OpenAI no devolvió contenido' }, 502)

    let parsed: unknown
    try {
      parsed = JSON.parse(content)
    } catch {
      return json({ error: 'No se pudo interpretar la respuesta de OpenAI como JSON' }, 502)
    }

    const blocks = sanitizeBlocks((parsed as Record<string, unknown>)?.blocks)
    if (blocks.length === 0) {
      return json({ error: 'No se identificaron bloques en el texto. Intenta ser más específico.' }, 200)
    }

    return json({ blocks })
  } catch (e) {
    return json({ error: `Error llamando a OpenAI: ${String(e)}` }, 500)
  }
})
