import { Outlet } from 'react-router-dom'

import { MainNavigation } from '../navigation/MainNavigation'

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.15),_transparent_35%),linear-gradient(180deg,_#f0fdf4_0%,_#ffffff_50%,_#dcfce7_100%)] text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 pb-10 pt-4 sm:px-6 lg:px-8">
        <MainNavigation />
        <main className="flex-1 py-8 sm:py-10">
          <Outlet />
        </main>
        <footer className="mt-auto border-t border-slate-200 bg-slate-50 py-4 text-center">
          <p className="text-sm text-slate-600">
            Esto es una solución diseñada y creada por{' '}
            <a 
              href="https://www.octolab.com.ar" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-green-600 hover:text-green-700 font-semibold underline"
            >
              Octolab
            </a>
            {' '}2026
          </p>
        </footer>
      </div>
    </div>
  )
}
