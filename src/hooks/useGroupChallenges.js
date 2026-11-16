import { useCallback, useEffect, useState } from 'react'
import { supabase, isDemoMode } from '../lib/supabase'

const DEMO_KEY = 'habit-app-demo-challenges-state-v2'
const MY_ID = 'demo-me'

function thisMondayIso() {
  const d = new Date()
  const day = d.getDay() // 0=domingo .. 6=sábado
  const diffToMonday = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diffToMonday)
  d.setHours(0, 0, 0, 0)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const date = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${date}`
}

function seedDemoState() {
  return {
    challenges: [{ id: 'demo-c1', title: 'Cardio semanal', base_label: 'km', target_value: 20 }],
    equivalences: [
      { id: 'demo-e1', challenge_id: 'demo-c1', label: '1 km trote', factor: 1, votes: [MY_ID, 'demo-majo', 'demo-andres'] },
      { id: 'demo-e2', challenge_id: 'demo-c1', label: '1 km bici', factor: 0.625, votes: ['demo-majo', 'demo-andres'] },
      { id: 'demo-e3', challenge_id: 'demo-c1', label: '1000 pasos', factor: 0.8, votes: ['demo-majo'] },
    ],
    progress: [
      { challenge_id: 'demo-c1', user_id: 'demo-majo', total_value: 20 },
      { challenge_id: 'demo-c1', user_id: 'demo-andres', total_value: 11 },
      { challenge_id: 'demo-c1', user_id: MY_ID, total_value: 0 },
    ],
  }
}

function loadDemoState() {
  const raw = localStorage.getItem(DEMO_KEY)
  if (raw) return JSON.parse(raw)
  const seeded = seedDemoState()
  localStorage.setItem(DEMO_KEY, JSON.stringify(seeded))
  return seeded
}

function saveDemoState(state) {
  localStorage.setItem(DEMO_KEY, JSON.stringify(state))
}

/** Retos semanales de un grupo, sus equivalencias votadas, y el avance por integrante. */
export function useGroupChallenges(groupId) {
  const [challenges, setChallenges] = useState([])
  const [equivalences, setEquivalences] = useState([])
  const [progress, setProgress] = useState([])
  const [loading, setLoading] = useState(!isDemoMode)

  const load = useCallback(async () => {
    if (isDemoMode) {
      const state = loadDemoState()
      setChallenges(state.challenges)
      setEquivalences(state.equivalences)
      setProgress(state.progress)
      setLoading(false)
      return
    }
    if (!groupId) return
    setLoading(true)
    const weekStart = thisMondayIso()
    const { data: challengeRows } = await supabase
      .from('gym_challenges')
      .select('*')
      .eq('group_id', groupId)
      .eq('week_start', weekStart)
    const ids = (challengeRows ?? []).map((c) => c.id)

    const [{ data: equivRows }, { data: voteRows }, { data: progressRows }] = ids.length
      ? await Promise.all([
          supabase.from('gym_equivalences').select('*').in('challenge_id', ids),
          supabase.from('gym_equivalence_votes').select('equivalence_id, user_id'),
          supabase.from('gym_challenge_progress').select('*').in('challenge_id', ids),
        ])
      : [{ data: [] }, { data: [] }, { data: [] }]

    setChallenges(challengeRows ?? [])
    setEquivalences((equivRows ?? []).map((e) => ({
      ...e,
      votes: (voteRows ?? []).filter((v) => v.equivalence_id === e.id).map((v) => v.user_id),
    })))
    setProgress(progressRows ?? [])
    setLoading(false)
  }, [groupId])

  useEffect(() => { load() }, [load])

  const createChallenge = useCallback(async (title, baseLabel, targetValue) => {
    if (isDemoMode) {
      const state = loadDemoState()
      state.challenges.push({ id: `demo-c${Date.now()}`, title, base_label: baseLabel, target_value: targetValue })
      saveDemoState(state)
      setChallenges(state.challenges)
      return
    }
    await supabase.from('gym_challenges').insert({
      group_id: groupId, title, base_label: baseLabel, target_value: targetValue, week_start: thisMondayIso(),
    })
    await load()
  }, [groupId, load])

  const proposeEquivalence = useCallback(async (challengeId, label, factor) => {
    if (isDemoMode) {
      const state = loadDemoState()
      state.equivalences.push({ id: `demo-e${Date.now()}`, challenge_id: challengeId, label, factor, votes: [MY_ID] })
      saveDemoState(state)
      setEquivalences(state.equivalences)
      return
    }
    await supabase.from('gym_equivalences').insert({ challenge_id: challengeId, label, factor })
    await load()
  }, [load])

  const toggleVote = useCallback(async (equivalenceId, currentlyVoted) => {
    if (isDemoMode) {
      const state = loadDemoState()
      state.equivalences = state.equivalences.map((e) => {
        if (e.id !== equivalenceId) return e
        const votes = currentlyVoted ? e.votes.filter((v) => v !== MY_ID) : [...e.votes, MY_ID]
        return { ...e, votes }
      })
      saveDemoState(state)
      setEquivalences(state.equivalences)
      return
    }
    if (currentlyVoted) {
      const { data: { user } } = await supabase.auth.getUser()
      await supabase.from('gym_equivalence_votes').delete().eq('equivalence_id', equivalenceId).eq('user_id', user.id)
    } else {
      await supabase.from('gym_equivalence_votes').insert({ equivalence_id: equivalenceId })
    }
    await load()
  }, [load])

  const logProgress = useCallback(async (challengeId, addedValue) => {
    if (isDemoMode) {
      const state = loadDemoState()
      const row = state.progress.find((p) => p.challenge_id === challengeId && p.user_id === MY_ID)
      if (row) row.total_value += addedValue
      else state.progress.push({ challenge_id: challengeId, user_id: MY_ID, total_value: addedValue })
      saveDemoState(state)
      setProgress(state.progress)
      return
    }
    const { data: { user } } = await supabase.auth.getUser()
    const existing = progress.find((p) => p.challenge_id === challengeId && p.user_id === user.id)
    await supabase.from('gym_challenge_progress').upsert({
      challenge_id: challengeId, total_value: (existing?.total_value ?? 0) + addedValue,
    })
    await load()
  }, [progress, load])

  return { challenges, equivalences, progress, loading, createChallenge, proposeEquivalence, toggleVote, logProgress, isDemoMode }
}
