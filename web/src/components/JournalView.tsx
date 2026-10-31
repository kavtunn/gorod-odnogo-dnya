import type { ChoiceOutcome, CityData, PhaseId, ProgressState } from '../types'

type Props = {
  city: CityData
  state: ProgressState
  onMap: () => void
}

const PHASE_FOR_LOCATION: Record<string, PhaseId> = {
  home: 'morning',
  road: 'morning',
  school: 'school',
  canteen: 'school',
  river: 'afternoon',
  park: 'afternoon',
  plant: 'afternoon',
  road2: 'afternoon',
  net: 'evening',
  'home-eve': 'evening',
}

const OUTCOME_LABEL: Record<ChoiceOutcome, string> = {
  safe: 'Безопасно',
  risky: 'Риск',
  learn: 'Урок',
}

export function JournalView({ city, state, onMap }: Props) {
  const hasAny = state.decisions.length > 0

  return (
    <section className="board stack journal anim-scene">
      <h1>Журнал решений</h1>
      <p className="muted">
        Что выбирал по фазам дня — и короткий совет к каждому выбору.
      </p>

      {!hasAny ? (
        <section className="panel">
          <p>Пока пусто. Пройди сцены с выбором — записи появятся здесь.</p>
        </section>
      ) : (
        city.phases.map((phase) => {
          const items = state.decisions.filter((d) => {
            const scene = city.scenes[d.sceneId]
            if (!scene) return false
            return PHASE_FOR_LOCATION[scene.locationId] === phase.id
          })

          return (
            <section key={phase.id} className="panel stack journal-phase">
              <h2>
                {phase.label}
                <span className="muted"> · {phase.clock}</span>
              </h2>
              {items.length === 0 ? (
                <p className="muted">В эту фазу выборов ещё не было.</p>
              ) : (
                <ul className="journal-list">
                  {items.map((d, i) => {
                    const scene = city.scenes[d.sceneId]
                    return (
                      <li key={`${d.sceneId}-${d.stepId}-${d.choiceId}-${i}`}>
                        <div className={`tag ${d.outcome}`}>
                          {OUTCOME_LABEL[d.outcome]}
                        </div>
                        <strong>{scene?.title || d.sceneId}</strong>
                        <p>{d.label}</p>
                        <p className="muted">{d.tip}</p>
                      </li>
                    )
                  })}
                </ul>
              )}
            </section>
          )
        })
      )}

      <div className="choice-list">
        <button type="button" className="btn" onClick={onMap}>
          На карту
        </button>
      </div>
    </section>
  )
}
