import type { CityData, ProgressState } from '../types'
import { phaseOf } from './Shell'
import { DayComplete } from './DayComplete'

type Props = {
  city: CityData
  state: ProgressState
  onName: (name: string) => void
  onOpenScene: (sceneId: string) => void
  onStartFirst: () => void
  onQuiz: () => void
  onRestart: () => void
}

export function CityMap({
  city,
  state,
  onName,
  onOpenScene,
  onStartFirst,
  onQuiz,
  onRestart,
}: Props) {
  if (state.dayFinished) {
    return (
      <DayComplete city={city} state={state} onQuiz={onQuiz} onRestart={onRestart} />
    )
  }

  const list = city.locations
  const doneCount = list.filter((l) => state.completedScenes.includes(l.sceneId)).length
  const pct = list.length ? Math.round((doneCount / list.length) * 100) : 0
  const p = phaseOf(city, state.phase)
  const ctaLabel = doneCount > 0 ? 'Продолжить день' : 'Начать утро'

  return (
    <section className="board">
      <div className="hero">
        <div>
          <h1>Сводка города</h1>
          <p className="muted">Локации дня — ячейки маршрута. Решения вместо лозунгов.</p>
          {doneCount > 0 ? (
            <div className="resume-banner anim-in">
              Ты на фазе «{p.label}» · {p.clock}. Пройдено {doneCount} из {list.length}.
              Открытые ячейки ждут.
            </div>
          ) : null}
          <div className="progress-label">
            Прогресс дня: {doneCount} / {list.length} ({pct}%)
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ transform: `scaleX(${pct / 100})` }} />
          </div>
          <div className="field" style={{ marginTop: 14 }}>
            <label htmlFor="name2">Имя</label>
            <input
              id="name2"
              value={state.playerName}
              onChange={(e) => onName(e.target.value)}
            />
          </div>
        </div>
        <div>
          <div className="big-time">{p.clock}</div>
          <p className="muted">Сейчас: {p.label}</p>
          <div className="map-cta">
            <button type="button" className="btn primary" onClick={onStartFirst}>
              {ctaLabel}
            </button>
          </div>
        </div>
      </div>
      <h2>Карта города</h2>
      <div className="grid-map">
        {list.map((loc) => {
          const unlocked = state.unlockedLocations.includes(loc.id)
          const done = state.completedScenes.includes(loc.sceneId)
          const cls = done ? 'loc done' : unlocked ? 'loc on' : 'loc'
          const caption = city.artTitles[loc.id] || loc.name
          return (
            <button
              key={loc.id}
              type="button"
              className={cls}
              disabled={!unlocked}
              onClick={() => onOpenScene(loc.sceneId)}
            >
              <span className="loc-media">
                <img className="loc-thumb" src={loc.image} alt={caption} />
                <span className="loc-caption">{caption}</span>
              </span>
              <span className="code">{loc.short}</span>
              <span className="meta">
                {loc.name}
                <br />
                {city.moduleLabels[loc.module]}
                {done ? ' · готово' : unlocked ? ' · открыто' : ' · позже'}
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
