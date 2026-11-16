import { useEffect, useState } from 'react'
import { supabase, isDemoMode } from './lib/supabase'
import AuthScreen from './screens/AuthScreen'
import ResetPasswordScreen from './screens/ResetPasswordScreen'
import ManualScreen from './screens/ManualScreen'
import DashboardScreen from './screens/DashboardScreen'
import HabitosScreen from './screens/HabitosScreen'
import EjercicioScreen from './screens/EjercicioScreen'
import PlannerScreen from './screens/PlannerScreen'
import KpisScreen from './screens/KpisScreen'
import AguaScreen from './screens/AguaScreen'
import MasScreen from './screens/MasScreen'
import TabBar from './components/TabBar'

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

  const [showManual, setShowManual] = useState(false)
  // "Hoy" (dashboard) es la pantalla de entrada — ver Change Request #1.
  const [branch, setBranch] = useState('dashboard')
  const [initialTabs, setInitialTabs] = useState({ habitos: 'malos', ejercicio: 'calendario' })
  // key fuerza que la pantalla de la rama se remonte con el sub-tab correcto
  // cuando se navega desde un acceso directo (dashboard, Más), sin pelear
  // con el estado interno de tab que ya tenía si solo cambiamos de rama.
  const [routeVersion, setRouteVersion] = useState(0)

  const navigateTo = (branchId, tabId) => {
    if (tabId) setInitialTabs((prev) => ({ ...prev, [branchId]: tabId }))
    setBranch(branchId)
    setRouteVersion((v) => v + 1)
  }

  const goHome = () => setBranch('dashboard')

  const handleLogout = async () => {
    await supabase.auth.signOut()
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

  return (
    <>
      <main style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {branch === 'dashboard' && (
          <DashboardScreen key={`dashboard-${routeVersion}`} onNavigate={navigateTo} />
        )}
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
        {branch === 'agua' && (
          <AguaScreen key={`agua-${routeVersion}`} onGoHome={goHome} />
        )}
        {branch === 'mas' && (
          <MasScreen
            key={`mas-${routeVersion}`}
            onNavigate={navigateTo}
            userEmail={session?.user?.email}
            onLogout={!isDemoMode ? handleLogout : undefined}
            onOpenManual={() => setShowManual(true)}
          />
        )}
      </main>
      <TabBar active={branch === 'mas' ? 'mas' : branch} onChange={setBranch} />
    </>
  )
}
