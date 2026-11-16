import { useCallback, useEffect, useState } from 'react'
import { supabase, isDemoMode } from '../lib/supabase'
import { uploadPhoto } from '../lib/uploadPhoto'
import { todayIso } from '../lib/date'

const DEMO_KEY = 'habit-app-demo-my-checkin'

function loadDemoCheckin() {
  const raw = localStorage.getItem(DEMO_KEY)
  return raw ? JSON.parse(raw) : null
}

function saveDemoCheckin(checkin) {
  localStorage.setItem(DEMO_KEY, JSON.stringify(checkin))
}

/** El check-in de HOY del usuario actual: foto + si tomó agua. */
export function useMyCheckin() {
  const today = todayIso()
  const [checkin, setCheckin] = useState(isDemoMode ? loadDemoCheckin() : null)
  const [loading, setLoading] = useState(!isDemoMode)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isDemoMode) return
    let cancelled = false
    async function load() {
      setLoading(true)
      const { data } = await supabase.from('gym_checkins').select('*').eq('checkin_date', today).maybeSingle()
      if (!cancelled) { setCheckin(data ?? null); setLoading(false) }
    }
    load()
    return () => { cancelled = true }
  }, [today])

  const checkIn = useCallback(async ({ photoFile, drankWater, note }) => {
    setSaving(true)
    const photo_url = photoFile ? await uploadPhoto('checkin-photos', photoFile) : (checkin?.photo_url ?? null)
    if (isDemoMode) {
      const updated = { checkin_date: today, photo_url, drank_water: drankWater, note: note ?? null }
      saveDemoCheckin(updated)
      setCheckin(updated)
      setSaving(false)
      return updated
    }
    const { data, error } = await supabase
      .from('gym_checkins')
      .upsert({ checkin_date: today, photo_url, drank_water: drankWater, note: note ?? null }, { onConflict: 'user_id,checkin_date' })
      .select()
      .single()
    setSaving(false)
    if (error) return null
    setCheckin(data)
    return data
  }, [today, checkin])

  return { checkin, loading, saving, checkIn, isDemoMode }
}
