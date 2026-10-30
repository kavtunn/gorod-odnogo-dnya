import type { CityData, ProgressState } from '../types'

type Props = {
  city: CityData
  state: ProgressState
  onQuiz: () => void
  onRestart: () => void
}

export function DayComplete({ city, state, onQuiz, onRestart }: Props) {
  const total = city.locations.length
  const counts = { safe: 0, risky: 0, learn: 0 }
  state.decisions.forEach((d) => {
    if (d.outcome === 'safe') counts.safe += 1
    else if (d.outcome === 'risky') counts.risky += 1
    else counts.learn += 1
  })
  const modules = Array.from(
    new Set(
      city.locations
        .filter((l) => state.completedScenes.includes(l.sceneId))
        .map((l) => city.moduleLabels[l.module]),
    ),
  )

  return (
    <section className="board stack finale anim-scene">
      <h1>День завершён</h1>
      <p>
        {state.playerName ? `${state.playerName}, ` : ''}
        ты прошёл {state.completedScenes.length} из {total} локаций.
      </p>
      <div className="finale-stats">
        <div className="stat safe">
          <span className="stat-n">{counts.safe}</span>
          <span className="stat-l">безопасно</span>
        </div>
        <div className="stat learn">
          <span className="stat-n">{counts.learn}</span>
          <span className="stat-l">урок</span>
        </div>
        <div className="stat risky">
          <span className="stat-n">{counts.risky}</span>
          <span className="stat-l">риск</span>
        </div>
      </div>
      {modules.length ? (
        <p className="muted">Темы дня: {modules.join(' · ')}</p>
      ) : null}
      <p>Закрепи день коротким тестом.</p>
      <div className="choice-list">
        <button type="button" className="btn primary" onClick={onQuiz}>
          Пройти тест
        </button>
        <button type="button" className="btn" onClick={onRestart}>
          Начать день заново
        </button>
      </div>
    </section>
  )
}
