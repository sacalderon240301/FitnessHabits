import { useCallback, useEffect, useState } from 'react'
import { supabase, isDemoMode } from '../lib/supabase'

const DEMO_KEY = 'habit-app-demo-gym-groups'

function seedDemoGroups() {
  return [
    { id: 'g1', code: 'DEMO42', name: 'Los Tanques', maxMembers: 4, memberCount: 3, isMine: true },
  ]
}

function loadDemoGroups() {
  const raw = localStorage.getItem(DEMO_KEY)
  if (raw) return JSON.parse(raw)
  const seeded = seedDemoGroups()
  localStorage.setItem(DEMO_KEY, JSON.stringify(seeded))
  return seeded
}

function saveDemoGroups(groups) {
  localStorage.setItem(DEMO_KEY, JSON.stringify(groups))
}

/**
 * Grupos de gimnasio a los que pertenece el usuario (Change Request #6).
 * Los hábitos son personales — esto es solo progreso de gym, con máximo
 * `max_members` integrantes, y se entra por código.
 */
export function useGymGroups() {
  const [groups, setGroups] = useState(isDemoMode ? loadDemoGroups() : [])
  const [loading, setLoading] = useState(!isDemoMode)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    if (isDemoMode) { setGroups(loadDemoGroups()); return }
    setLoading(true)
    setError(null)
    const { data: memberships, error: err } = await supabase
      .from('gym_group_members')
      .select('group_id, gym_groups(id, code, name, max_members, created_at)')
    if (err) { setError(err.message); setLoading(false); return }

    const groupRows = (memberships ?? []).map((m) => m.gym_groups).filter(Boolean)
    if (groupRows.length === 0) { setGroups([]); setLoading(false); return }

    const { data: allMembers } = await supabase
      .from('gym_group_members')
      .select('group_id')
      .in('group_id', groupRows.map((g) => g.id))

    const counts = {}
    for (const m of allMembers ?? []) counts[m.group_id] = (counts[m.group_id] ?? 0) + 1

    setGroups(groupRows.map((g) => ({
      id: g.id,
      code: g.code,
      name: g.name,
      maxMembers: g.max_members,
      memberCount: counts[g.id] ?? 1,
    })))
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const createGroup = useCallback(async (name) => {
    if (isDemoMode) {
      const updated = [...loadDemoGroups(), { id: `g${Date.now()}`, code: Math.random().toString(36).slice(2, 8).toUpperCase(), name, maxMembers: 4, memberCount: 1, isMine: true }]
      saveDemoGroups(updated)
      setGroups(updated)
      return updated[updated.length - 1]
    }
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error: err } = await supabase.from('gym_groups').insert({ name }).select().single()
    if (err) { setError(err.message); return null }
    await supabase.from('gym_group_members').insert({ group_id: data.id, user_id: user.id })
    await load()
    return data
  }, [load])

  const joinGroup = useCallback(async (code) => {
    if (isDemoMode) { setError('El modo demo no puede simular unirse con otra persona real.'); return null }
    const cleanCode = code.trim().toUpperCase()
    const { data: group, error: findErr } = await supabase.from('gym_groups').select('*').eq('code', cleanCode).single()
    if (findErr || !group) { setError('No encontramos un grupo con ese código.'); return null }
    const { error: joinErr } = await supabase.from('gym_group_members').insert({ group_id: group.id })
    if (joinErr) {
      setError(joinErr.message.includes('duplicate') ? 'Ya estás en ese grupo.' : joinErr.message)
      return null
    }
    await load()
    return group
  }, [load])

  const leaveGroup = useCallback(async (groupId) => {
    if (isDemoMode) {
      const updated = loadDemoGroups().filter((g) => g.id !== groupId)
      saveDemoGroups(updated)
      setGroups(updated)
      return
    }
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('gym_group_members').delete().eq('group_id', groupId).eq('user_id', user.id)
    await load()
  }, [load])

  return { groups, loading, error, createGroup, joinGroup, leaveGroup, isDemoMode }
}
