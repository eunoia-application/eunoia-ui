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
const WordsPage = lazy(() =>
  import('@pages/words').then((m) => ({ default: m.WordsPage })),
)
const StudyPage = lazy(() =>
  import('@pages/study').then((m) => ({ default: m.StudyPage })),
)
const GrammarPage = lazy(() =>
  import('@pages/grammar').then((m) => ({ default: m.GrammarPage })),
)
const TopicsPage = lazy(() =>
  import('@pages/topics').then((m) => ({ default: m.TopicsPage })),
)
const SettingsPage = lazy(() =>
  import('@pages/settings').then((m) => ({ default: m.SettingsPage })),
)
// ВРЕМЕННО: dev-песочница дерева (не коммитить).
const GardenLab = lazy(() => import('./__GardenLab'))

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
            <Route path={PATHS.words} element={<WordsPage />} />
            <Route path={PATHS.study} element={<StudyPage />} />
            <Route path={PATHS.grammar} element={<GrammarPage />} />
            <Route path={PATHS.topics} element={<TopicsPage />} />
            <Route path={PATHS.settings} element={<SettingsPage />} />
          </Route>
        </Route>

        {import.meta.env.DEV ? <Route path="/__garden-lab" element={<GardenLab />} /> : null}

        <Route path="*" element={<Navigate to={PATHS.home} replace />} />
      </Routes>
    </Suspense>
  )
}
