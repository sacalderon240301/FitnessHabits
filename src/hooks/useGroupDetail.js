import { useCallback, useEffect, useState } from 'react'
import { supabase, isDemoMode } from '../lib/supabase'
import { todayIso, addDays } from '../lib/date'

function seedDemoMembers() {
  return [
    { userId: 'demo-me', displayName: 'Tú', isMe: true },
    { userId: 'demo-majo', displayName: 'Majo', isMe: false },
    { userId: 'demo-andres', displayName: 'Andrés', isMe: false },
  ]
}

const MY_CHECKIN_DEMO_KEY = 'habit-app-demo-my-checkin'

function seedDemoCheckins() {
  const today = todayIso()
  const checkins = [
    { user_id: 'demo-majo', checkin_date: today, drank_water: true, photo_url: null },
    { user_id: 'demo-majo', checkin_date: addDays(today, -1), drank_water: true, photo_url: null },
    { user_id: 'demo-andres', checkin_date: addDays(today, -1), drank_water: false, photo_url: null },
  ]
  // El check-in propio vive en su propio hook (useMyCheckin) — lo leemos
  // acá también para que el calendario del grupo lo refleje en demo.
  const raw = localStorage.getItem(MY_CHECKIN_DEMO_KEY)
  if (raw) {
    const mine = JSON.parse(raw)
    checkins.push({ ...mine, user_id: 'demo-me' })
  }
  return checkins
}

/** Integrantes de un grupo + sus check-ins de los últimos 7 días. */
export function useGroupDetail(groupId) {
  const [members, setMembers] = useState([])
  const [checkins, setCheckins] = useState([])
  const [loading, setLoading] = useState(!isDemoMode)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    if (isDemoMode) {
      setMembers(seedDemoMembers())
      setCheckins(seedDemoCheckins())
      setLoading(false)
      return
    }
    if (!groupId) return
    setLoading(true)
    setError(null)

    const { data: memberRows, error: memErr } = await supabase
      .from('gym_group_members')
      .select('user_id')
      .eq('group_id', groupId)
    if (memErr) { setError(memErr.message); setLoading(false); return }

    const userIds = (memberRows ?? []).map((m) => m.user_id)
    const { data: { user } } = await supabase.auth.getUser()

    const { data: profileRows } = await supabase
      .from('profiles')
      .select('user_id, display_name')
      .in('user_id', userIds.length ? userIds : ['00000000-0000-0000-0000-000000000000'])

    setMembers(userIds.map((id) => ({
      userId: id,
      displayName: profileRows?.find((p) => p.user_id === id)?.display_name ?? 'Alguien',
      isMe: id === user?.id,
    })))

    const weekAgo = addDays(todayIso(), -6)
    const { data: checkinRows } = await supabase
      .from('gym_checkins')
      .select('user_id, checkin_date, drank_water, photo_url')
      .in('user_id', userIds.length ? userIds : ['00000000-0000-0000-0000-000000000000'])
      .gte('checkin_date', weekAgo)

    setCheckins(checkinRows ?? [])
    setLoading(false)
  }, [groupId])

  useEffect(() => { load() }, [load])

  return { members, checkins, loading, error, reload: load, isDemoMode }
}
