import { playPinClick } from '../audio/sfx'
import type { CityData, ProgressState } from '../types'
import { DayComplete } from './DayComplete'
import { phaseOf } from './Shell'

type Props = {
  city: CityData
  state: ProgressState
  onName: (name: string) => void
  onOpenScene: (sceneId: string) => void
  onStartFirst: () => void
  onQuiz: () => void
  onJournal: () => void
  onRestart: () => void
}

function locStatus(
  unlocked: boolean,
  done: boolean,
  isNext: boolean,
): string {
  if (done) return ' · готово'
  if (isNext) return ' · дальше'
  if (unlocked) return ' · открыто'
  return ' · позже'
}

export function CityMap({
  city,
  state,
  onName,
  onOpenScene,
  onStartFirst,
  onJournal,
  onRestart,
  onQuiz,
}: Props) {
  if (state.dayFinished) {
    return (
      <DayComplete
        city={city}
        state={state}
        onQuiz={onQuiz}
        onJournal={onJournal}
        onRestart={onRestart}
      />
    )
  }

  const list = city.locations
  const doneCount = list.filter((l) =>
    state.completedScenes.includes(l.sceneId),
  ).length
  const pct = list.length ? Math.round((doneCount / list.length) * 100) : 0
  const phase = phaseOf(city, state.phase)
  const ctaLabel = doneCount > 0 ? 'Продолжить' : 'Начать с утра'

  const activeIdx = list.findIndex(
    (l) =>
      state.unlockedLocations.includes(l.id) &&
      !state.completedScenes.includes(l.sceneId),
  )

  return (
    <section className="board">
      <div className="comic-page">
        <div className="map-hero-grid">
          <div className="hero-panel anim-in">
            {doneCount > 0 ? (
              <div className="resume-banner">
                Сейчас «{phase.label}», {phase.clock}. Пройдено {doneCount} из{' '}
                {list.length}.
              </div>
            ) : (
              <p className="balloon">Карта дня. Открытые места можно пройти.</p>
            )}
            <h1 style={{ marginTop: 16 }}>Карта города</h1>
            <p className="muted">
              Локации открываются по ходу дня. Решение важнее слогана.
            </p>
            <div className="progress-label">
              Прогресс: {doneCount} / {list.length} ({pct}%)
            </div>
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ transform: `scaleX(${pct / 100})` }}
              />
            </div>
            <div className="field" style={{ marginTop: 14 }}>
              <label htmlFor="name2">Имя</label>
              <input
                id="name2"
                value={state.playerName}
                onChange={(e) => onName(e.target.value)}
              />
            </div>
            <div className="map-cta">
              <button
                type="button"
                className="btn primary"
                onClick={onStartFirst}
              >
                {ctaLabel}
              </button>
              {state.decisions.length > 0 ? (
                <button type="button" className="btn" onClick={onJournal}>
                  Журнал решений
                </button>
              ) : null}
            </div>
          </div>
          <div className="panel stack anim-in">
            <div className="big-time" key={phase.clock}>
              {phase.clock}
            </div>
            <p className="muted">{phase.label}</p>
          </div>
        </div>

        <div className="grid-map">
          {list.map((loc, i) => {
            const unlocked = state.unlockedLocations.includes(loc.id)
            const done = state.completedScenes.includes(loc.sceneId)
            const isNext = i === activeIdx

            let className = 'loc'
            if (done) className += ' done'
            if (unlocked && !done) className += ' on'
            if (isNext) className += ' next'

            const caption = city.artTitles[loc.id] || loc.name

            return (
              <button
                key={loc.id}
                type="button"
                className={className}
                data-tone={loc.id}
                style={{ animationDelay: `${Math.min(i, 5) * 0.03}s` }}
                disabled={!unlocked}
                onClick={() => {
                  playPinClick()
                  onOpenScene(loc.sceneId)
                }}
              >
                <span className="pin-dot" aria-hidden="true" />
                {done ? (
                  <span className="loc-check" aria-hidden="true">
                    ✓
                  </span>
                ) : null}
                <span className="loc-media">
                  <img className="loc-thumb" src={loc.image} alt={caption} />
                  <span className="loc-caption">{caption}</span>
                </span>
                <span className="code">{loc.name}</span>
                <span className="meta">
                  {city.moduleLabels[loc.module]}
                  {locStatus(unlocked, done, isNext)}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
