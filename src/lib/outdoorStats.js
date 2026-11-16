export function computeOutdoorStats(sessions) {
  const now = new Date()
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  const thisMonth = sessions.filter((s) => s.session_date.startsWith(monthKey))
  const totalKm = thisMonth.reduce((sum, s) => sum + (s.distance_km ?? 0), 0)
  const sessionCount = thisMonth.length

  const sorted = [...sessions].sort(
    (a, b) => new Date(b.session_date) - new Date(a.session_date)
  )
  const lastSession = sorted[0] ?? null

  return {
    totalKm: Math.round(totalKm * 10) / 10,
    sessionCount,
    lastSessionDate: lastSession?.session_date ?? null,
  }
}
