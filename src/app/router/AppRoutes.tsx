import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

import { AppLayout } from '@app/layouts'
import { PATHS } from '@shared/config'

import { GuestOnly, ProtectedRoute } from './ProtectedRoute'
import { RouteFallback } from './RouteFallback'

// Ленивые страницы; FSD-слайсы отдают именованный публичный API.
const AuthPage = lazy(() =>
  import('@pages/auth').then((m) => ({ default: m.AuthPage })),
)
const HomePage = lazy(() =>
  import('@pages/home').then((m) => ({ default: m.HomePage })),
)
const SettingsPage = lazy(() =>
  import('@pages/settings').then((m) => ({ default: m.SettingsPage })),
)

export function AppRoutes() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route
          path={PATHS.auth}
          element={
            <GuestOnly>
              <AuthPage />
            </GuestOnly>
          }
        />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path={PATHS.home} element={<HomePage />} />
            <Route path={PATHS.settings} element={<SettingsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to={PATHS.home} replace />} />
      </Routes>
    </Suspense>
  )
}
