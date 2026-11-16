import { useEffect, useState } from 'react'
import { supabase, isDemoMode } from './lib/supabase'
import AuthScreen from './screens/AuthScreen'
import ResetPasswordScreen from './screens/ResetPasswordScreen'
import OnboardingScreen from './screens/OnboardingScreen'
import ManualScreen from './screens/ManualScreen'
import HabitosScreen from './screens/HabitosScreen'
import EjercicioScreen from './screens/EjercicioScreen'
import PlannerScreen from './screens/PlannerScreen'
import KpisScreen from './screens/KpisScreen'
import TabBar from './components/TabBar'

const ONBOARDING_KEY = 'habit-app-onboarding-seen'

export default function App() {
  // undefined = todavía cargando la sesión, null = sin sesión, objeto = logueado.
  // En modo demo no hay auth — se entra directo, como siempre.
  const [session, setSession] = useState(isDemoMode ? null : undefined)
  const [authEvent, setAuthEvent] = useState(null)

  useEffect(() => {
    if (isDemoMode) return
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: listener } = supabase.auth.onAuthStateChange((event, newSession) => {
      setAuthEvent(event)
      setSession(newSession)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  const [showOnboarding, setShowOnboarding] = useState(
    () => !localStorage.getItem(ONBOARDING_KEY)
  )
  const [showManual, setShowManual] = useState(false)
  const [branch, setBranch] = useState('habitos')
  const [initialTabs, setInitialTabs] = useState({ habitos: 'malos', ejercicio: 'calendario' })
  // key forces the branch screen to remount with the right initial sub-tab
  // when coming from onboarding, without fighting internal tab state later.
  const [routeVersion, setRouteVersion] = useState(0)

  const handleSelect = (branchId, tabId) => {
    localStorage.setItem(ONBOARDING_KEY, '1')
    if (tabId) setInitialTabs((prev) => ({ ...prev, [branchId]: tabId }))
    setBranch(branchId)
    setRouteVersion((v) => v + 1)
    setShowOnboarding(false)
  }

  const goHome = () => setShowOnboarding(true)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setShowOnboarding(true)
  }

  if (!isDemoMode && authEvent === 'PASSWORD_RECOVERY') {
    return <ResetPasswordScreen onDone={() => setAuthEvent(null)} />
  }

  if (session === undefined) {
    return <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-muted)' }}>Cargando...</div>
  }

  if (!isDemoMode && !session) {
    return <AuthScreen />
  }

  if (showManual) {
    return <ManualScreen onBack={() => setShowManual(false)} />
  }

  if (showOnboarding) {
    return (
      <OnboardingScreen
        onSelect={handleSelect}
        userEmail={session?.user?.email}
        onLogout={!isDemoMode ? handleLogout : undefined}
        onOpenManual={() => setShowManual(true)}
      />
    )
  }

  return (
    <>
      <main style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {branch === 'habitos' && (
          <HabitosScreen key={`habitos-${routeVersion}`} initialTab={initialTabs.habitos} onGoHome={goHome} />
        )}
        {branch === 'ejercicio' && (
          <EjercicioScreen key={`ejercicio-${routeVersion}`} initialTab={initialTabs.ejercicio} onGoHome={goHome} />
        )}
        {branch === 'planificador' && (
          <PlannerScreen key={`planificador-${routeVersion}`} onGoHome={goHome} />
        )}
        {branch === 'kpis' && (
          <KpisScreen key={`kpis-${routeVersion}`} onGoHome={goHome} />
        )}
      </main>
      <TabBar active={branch} onChange={setBranch} />
    </>
  )
}
