import type { CityData, ProgressState } from '../types'

type Props = {
  city: CityData
  state: ProgressState
  onQuiz: () => void
  onJournal: () => void
  onRestart: () => void
}

export function DayComplete({
  city,
  state,
  onQuiz,
  onJournal,
  onRestart,
}: Props) {
  const total = city.locations.length

  const counts = { safe: 0, risky: 0, learn: 0 }
  for (const d of state.decisions) {
    if (d.outcome === 'safe') counts.safe += 1
    else if (d.outcome === 'risky') counts.risky += 1
    else counts.learn += 1
  }

  const modules: string[] = []
  for (const loc of city.locations) {
    if (!state.completedScenes.includes(loc.sceneId)) continue
    const label = city.moduleLabels[loc.module]
    if (label && !modules.includes(label)) modules.push(label)
  }

  const namePrefix = state.playerName ? `${state.playerName}, ` : ''

  return (
    <section className="board stack finale anim-scene">
      <div className="finale-burst" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>
      <h1>День закончен</h1>
      <p className="anim-in">
        {namePrefix}
        пройдено {state.completedScenes.length} из {total} локаций.
      </p>
      <div className="finale-stats">
        <div className="stat safe choice-enter" style={{ animationDelay: '0.08s' }}>
          <span className="stat-n">{counts.safe}</span>
          <span className="stat-l">безопасно</span>
        </div>
        <div
          className="stat learn choice-enter"
          style={{ animationDelay: '0.14s' }}
        >
          <span className="stat-n">{counts.learn}</span>
          <span className="stat-l">урок</span>
        </div>
        <div
          className="stat risky choice-enter"
          style={{ animationDelay: '0.2s' }}
        >
          <span className="stat-n">{counts.risky}</span>
          <span className="stat-l">риск</span>
        </div>
      </div>
      {modules.length > 0 ? (
        <p className="muted anim-in" style={{ animationDelay: '0.24s' }}>
          Темы дня: {modules.join(' · ')}
        </p>
      ) : null}
      <p className="anim-in" style={{ animationDelay: '0.28s' }}>
        Можно посмотреть журнал решений или закрепить день тестом.
      </p>
      <div className="choice-list anim-in" style={{ animationDelay: '0.32s' }}>
        <button type="button" className="btn primary" onClick={onQuiz}>
          Пройти тест
        </button>
        <button type="button" className="btn" onClick={onJournal}>
          Журнал решений
        </button>
        <button type="button" className="btn" onClick={onRestart}>
          Начать заново
        </button>
      </div>
    </section>
  )
}
