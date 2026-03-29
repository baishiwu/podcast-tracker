import { AuthProvider, useAuth } from '@/context/AuthContext'
import { LandingPage } from '@/components/landing/LandingPage'
import { DashboardPage } from '@/components/dashboard/DashboardPage'

function AppRoutes() {
  const { status } = useAuth()

  if (status === 'authenticated') {
    return <DashboardPage />
  }

  return <LandingPage />
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
