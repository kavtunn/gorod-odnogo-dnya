import { useEffect, useRef, useState, type ReactNode } from 'react'
import { isMuted, playPhaseChange, setMuted } from '../audio/sfx'
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
  const currentPhaseIndex = city.phases.findIndex((p) => p.id === state.phase)
  const prevPhase = useRef(state.phase)
  const [muted, setMutedState] = useState(() => isMuted())
  const [phaseFlash, setPhaseFlash] = useState(0)

  useEffect(() => {
    if (prevPhase.current === state.phase) return
    prevPhase.current = state.phase
    setPhaseFlash((n) => n + 1)
    playPhaseChange()
  }, [state.phase])

  return (
    <div className={`app-shell phase-${state.phase}`} data-phase={state.phase}>
      <header className="topbar">
        <div className="brand">
          Город <strong>одного дня</strong>
          <span className="brand-issue">Учебный день · БЖД, ЗОЖ, город</span>
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
            className={view === 'journal' ? 'active' : ''}
            onClick={() => onNav('journal')}
          >
            Журнал
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

      <div className="day-strip" aria-label="Фазы дня" key={phaseFlash}>
        {city.phases.map((ph, i) => {
          let className = 'day-slot'
          if (i < currentPhaseIndex) className = 'day-slot done'
          if (i === currentPhaseIndex) className = 'day-slot current'

          const clock = i === currentPhaseIndex ? ` · ${ph.clock}` : ''

          return (
            <div key={ph.id} className={className}>
              {ph.label}
              {clock}
            </div>
          )
        })}
      </div>

      <main className="main view-swap" key={view === 'scene' ? 'scene' : view}>
        {children}
      </main>

      <footer className="footer">
        <button
          type="button"
          className="btn"
          aria-pressed={muted}
          onClick={() => {
            const next = !muted
            setMuted(next)
            setMutedState(next)
          }}
        >
          {muted ? 'Звук выкл' : 'Звук вкл'}
        </button>
        <button type="button" className="btn" onClick={onReset}>
          Сбросить прогресс
        </button>
      </footer>
    </div>
  )
}

export function phaseOf(city: CityData, phase: PhaseId) {
  return city.phases.find((p) => p.id === phase) || city.phases[0]
}
