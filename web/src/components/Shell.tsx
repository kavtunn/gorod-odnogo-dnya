import type { ReactNode } from 'react'
import type { CityData, PhaseId, ProgressState, ViewId } from '../types'

type Props = {
  city: CityData
  state: ProgressState
  view: ViewId
  onNav: (view: ViewId) => void
  onReset: () => void
  children: ReactNode
}

export function Shell({ city, state, view, onNav, onReset, children }: Props) {
  const cur = city.phases.findIndex((p) => p.id === state.phase)

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          Город <strong>одного дня</strong>
        </div>
        <nav className="nav">
          <button
            type="button"
            className={view === 'map' ? 'active' : ''}
            onClick={() => onNav('map')}
          >
            Карта
          </button>
          <button
            type="button"
            className={view === 'quiz' ? 'active' : ''}
            onClick={() => onNav('quiz')}
          >
            Тест
          </button>
        </nav>
      </header>
      <div className="day-strip" aria-label="Фазы дня">
        {city.phases.map((ph, i) => {
          const cls =
            i < cur ? 'day-slot done' : i === cur ? 'day-slot current' : 'day-slot'
          const clock = i === cur ? ` · ${ph.clock}` : ''
          return (
            <div key={ph.id} className={cls}>
              {ph.label}
              {clock}
            </div>
          )
        })}
      </div>
      <main className="main">{children}</main>
      <footer className="footer">
        <button type="button" className="btn" onClick={onReset}>
          Сброс прогресса
        </button>
      </footer>
    </div>
  )
}

export function phaseOf(city: CityData, phase: PhaseId) {
  return city.phases.find((p) => p.id === phase) || city.phases[0]
}
