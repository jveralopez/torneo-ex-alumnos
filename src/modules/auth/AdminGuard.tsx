import type { PropsWithChildren } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

import { useAuth } from '../../hooks/useAuth'
import { appRoutes } from '../../utils/routes'

export function AdminGuard({ children }: PropsWithChildren) {
  const location = useLocation()
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-sky-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to={appRoutes.adminLogin} replace state={{ from: location }} />
  }

  return <>{children}</>
}