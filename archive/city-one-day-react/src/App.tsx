import { useMemo, useState } from 'react'
import {
  NavLink,
  Navigate,
  Route,
  Routes,
  useNavigate,
  useParams,
} from 'react-router-dom'
import { LocationArt } from './components/LocationArt'
import {
  DISCLAIMER,
  MODULE_LABELS,
  PHASES,
  handbook,
  handbookById,
  locationById,
  locations,
  quiz,
  sceneById,
  scenes,
} from './data/city'
import { playSound } from './lib/sound'
import {
  DEMO_SCENE_IDS,
  addDecision,
  completeScene,
  finishOnboarding,
  loadProgress,
  resetProgress,
  saveProgress,
  setPlayerName,
  setQuizScore,
  setSoundEnabled,
  setTeacherFilter,
  startDemo,
  startFullDay,
} from './store/progress'
import type {
  Choice,
  ChoiceOutcome,
  ModuleId,
  ProgressState,
  SceneStep,
  UserRole,
} from './types'

const UNLOCK_AFTER: Record<string, { unlock: string[]; phase: ProgressState['phase'] }> = {
  'scene-home-morning': { unlock: ['road'], phase: 'morning' },
  'scene-road': { unlock: ['school'], phase: 'school' },
  'scene-evac': { unlock: ['canteen'], phase: 'school' },
  'scene-food': { unlock: ['river', 'park', 'plant'], phase: 'afternoon' },
  'scene-river': { unlock: ['net'], phase: 'evening' },
  'scene-yard': { unlock: ['net'], phase: 'evening' },
  'scene-plant': { unlock: ['net'], phase: 'evening' },
  'scene-chat': { unlock: [], phase: 'evening' },
}

function useProgress() {
  const [state, setState] = useState<ProgressState>(() => loadProgress())
  const commit = (next: ProgressState) => {
    setState(next)
    saveProgress(next)
  }
  return { state, commit }
}

function Shell({
  state,
  commit,
  children,
}: {
  state: ProgressState
  commit: (s: ProgressState) => void
  children: React.ReactNode
}) {
  const phase = PHASES.find((p) => p.id === state.phase) ?? PHASES[0]
  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          Город <strong>одного дня</strong>
        </div>
        <div className="clock" aria-label={`Время фазы ${phase.label}`}>
          {phase.clock}
        </div>
        <nav className="nav-links" aria-label="Разделы">
          <NavLink to="/" end>
            Карта
          </NavLink>
          <NavLink to="/handbook">Справка</NavLink>
          <NavLink to="/quiz">Тест</NavLink>
          <NavLink to="/report">Отчёт</NavLink>
          <NavLink to="/teacher">Учителю</NavLink>
          <button
            type="button"
            className={`chip ${state.soundEnabled ? 'active' : ''}`}
            onClick={() => {
              const next = !state.soundEnabled
              commit(setSoundEnabled(state, next))
              if (next) playSound('click', true)
            }}
            aria-pressed={state.soundEnabled}
          >
            Звук {state.soundEnabled ? 'вкл' : 'выкл'}
          </button>
        </nav>
      </header>
      <main className="main">{children}</main>
      <footer className="footer-bar">{DISCLAIMER}</footer>
    </div>
  )
}

function Welcome({
  state,
  commit,
}: {
  state: ProgressState
  commit: (s: ProgressState) => void
}) {
  const navigate = useNavigate()
  const [how, setHow] = useState(false)

  const begin = (role: UserRole) => {
    playSound('click', state.soundEnabled)
    commit(finishOnboarding(startFullDay({ ...state, role }, role)))
    navigate('/')
  }

  const demo = () => {
    playSound('done', state.soundEnabled)
    commit(startDemo(state))
    navigate('/scene/scene-road')
  }

  return (
    <div className="stack welcome">
      <section className="cork-board">
        <h1>Город одного дня</h1>
        <p>
          Интерактивный учебный день: дорога, школа, еда, река, двор, завод и сеть. Решения
          вместо лозунгов.
        </p>
        <div className="yarn-line" aria-hidden="true" />
        <p className="muted">{DISCLAIMER}</p>

        <div className="field" style={{ maxWidth: 360, marginTop: 16 }}>
          <label htmlFor="welcome-name">Имя для отчёта (можно позже)</label>
          <input
            id="welcome-name"
            value={state.playerName}
            onChange={(e) => commit(setPlayerName(state, e.target.value))}
            placeholder="Как тебя зовут"
          />
        </div>

        <div className="choice-list" style={{ marginTop: 20 }}>
          <button type="button" className="btn primary" onClick={() => begin('student')}>
            Я ученик — начать день
          </button>
          <button type="button" className="btn" onClick={() => begin('teacher')}>
            Я учитель — открыть карту
          </button>
          <button type="button" className="btn safe" onClick={demo}>
            Демо для жюри · ~3–4 мин
          </button>
          <button type="button" className="btn" onClick={() => setHow((v) => !v)}>
            {how ? 'Скрыть подсказку' : 'Как играть'}
          </button>
        </div>

        {how && (
          <ol className="how-list">
            <li>Открой булавку на карте.</li>
            <li>Пройди сцену: выбор, клики, чат или сортировка.</li>
            <li>Прочитай справку после сцены.</li>
            <li>В конце дня — отчёт и памятка.</li>
            <li>Учитель может фильтровать темы в разделе «Учителю».</li>
          </ol>
        )}
      </section>
    </div>
  )
}

function DayComplete({
  state,
  commit,
}: {
  state: ProgressState
  commit: (s: ProgressState) => void
}) {
  const navigate = useNavigate()
  return (
    <section className="cork-board stack day-complete">
      <h1>{state.demoMode ? 'Демо пройдено' : 'День завершён'}</h1>
      <p>
        {state.playerName ? `${state.playerName}, ` : ''}
        сцен: {state.completedScenes.length}
        {state.demoMode ? ' (маршрут жюри)' : ` из ${locations.length}`}. Решения сохранены в
        отчёте.
      </p>
      <div className="outcome-anim safe-pulse" aria-hidden="true" />
      <div className="choice-list">
        <button
          type="button"
          className="btn primary"
          onClick={() => {
            playSound('done', state.soundEnabled)
            navigate('/report')
          }}
        >
          Открыть отчёт
        </button>
        <button type="button" className="btn" onClick={() => navigate('/quiz')}>
          Пройти тест
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => {
            commit(startFullDay(state, state.role ?? 'student'))
            navigate('/')
          }}
        >
          Начать день заново
        </button>
      </div>
    </section>
  )
}

function Home({ state, commit }: { state: ProgressState; commit: (s: ProgressState) => void }) {
  const navigate = useNavigate()
  const visible = locations.filter((loc) => {
    if (state.demoMode) return DEMO_SCENE_IDS.includes(loc.sceneId as (typeof DEMO_SCENE_IDS)[number])
    if (state.teacherFilter === 'all') return true
    return loc.module === state.teacherFilter
  })
  const total = visible.length
  const doneCount = visible.filter((loc) => state.completedScenes.includes(loc.sceneId)).length
  const pct = total ? Math.round((doneCount / total) * 100) : 0
  const firstOpen = visible.find(
    (loc) => state.unlockedLocations.includes(loc.id) || state.teacherFilter !== 'all',
  )

  if (state.dayFinished) {
    return <DayComplete state={state} commit={commit} />
  }

  return (
    <div className="stack">
      <section className="cork-board">
        <div className="hero-home">
          <div>
            <h1>Город одного дня</h1>
            <p className="muted">
              {state.demoMode
                ? 'Демо-маршрут: дорога → эвакуация → сеть. Три сцены для показа жюри.'
                : 'Булавки локаций, нитка маршрута, решения вместо лозунгов.'}
            </p>
            <div className="yarn-line" aria-hidden="true" />
            <div className="progress-block">
              <div className="progress-label">
                Прогресс дня: {doneCount} / {total} ({pct}%)
              </div>
              <div className="progress-track" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
                <div className="progress-fill" style={{ width: `${pct}%` }} />
              </div>
            </div>
            <div className="field" style={{ maxWidth: 320, marginTop: 12 }}>
              <label htmlFor="name">Имя для отчёта</label>
              <input
                id="name"
                value={state.playerName}
                onChange={(e) => commit(setPlayerName(state, e.target.value))}
                placeholder="Как тебя зовут"
              />
            </div>
          </div>
          <div>
            <div className="big-digits">{PHASES.find((p) => p.id === state.phase)?.clock}</div>
            <div className="timeline" aria-label="Фазы дня">
              {PHASES.map((p) => {
                const idx = PHASES.findIndex((x) => x.id === state.phase)
                const mine = PHASES.findIndex((x) => x.id === p.id)
                const cls =
                  mine < idx ? 'phase-pill done' : mine === idx ? 'phase-pill current' : 'phase-pill'
                return (
                  <span key={p.id} className={cls}>
                    {p.label}
                  </span>
                )
              })}
            </div>
          </div>
        </div>

        <h2>Карта города</h2>
        <div className="grid-map">
          {visible.map((loc) => {
            const unlocked =
              state.unlockedLocations.includes(loc.id) ||
              state.teacherFilter !== 'all' ||
              state.demoMode
            const done = state.completedScenes.includes(loc.sceneId)
            const cls = done ? 'loc-cell done' : unlocked ? 'loc-cell on' : 'loc-cell'
            return (
              <button
                key={loc.id}
                type="button"
                className={cls}
                disabled={!unlocked}
                onClick={() => {
                  playSound('click', state.soundEnabled)
                  navigate(`/scene/${loc.sceneId}`)
                }}
              >
                <span className="code">{loc.short}</span>
                <span className="meta">
                  {loc.name}
                  <br />
                  {MODULE_LABELS[loc.module]}
                  {done ? ' · готово' : unlocked ? ' · открыто' : ' · позже'}
                </span>
              </button>
            )
          })}
        </div>
        <div className="map-cta-row">
          <button
            type="button"
            className="btn primary"
            disabled={!firstOpen}
            onClick={() => {
              playSound('click', state.soundEnabled)
              if (firstOpen) navigate(`/scene/${firstOpen.sceneId}`)
            }}
          >
            {state.demoMode ? 'К демо-сцене' : 'Начать утро'}
          </button>
        </div>
        <p className="muted disclaimer-inline">{DISCLAIMER}</p>
      </section>
    </div>
  )
}

function recordChoice(
  state: ProgressState,
  commit: (s: ProgressState) => void,
  sceneId: string,
  stepId: string,
  choice: Choice,
) {
  playSound(choice.outcome, state.soundEnabled)
  commit(
    addDecision(state, {
      sceneId,
      stepId,
      choiceId: choice.id,
      label: choice.label,
      outcome: choice.outcome,
      tip: choice.tip,
      at: new Date().toISOString(),
    }),
  )
}

function OutcomeBlock({
  outcome,
  consequence,
  tip,
}: {
  outcome: ChoiceOutcome
  consequence: string
  tip: string
}) {
  const cls =
    outcome === 'safe' ? 'result-safe' : outcome === 'risky' ? 'result-risky' : 'result-learn'
  const tag = outcome === 'safe' ? 'Безопасно' : outcome === 'risky' ? 'Риск' : 'Урок'
  const anim =
    outcome === 'safe' ? 'outcome-anim safe-pulse' : outcome === 'risky' ? 'outcome-anim risky-shake' : 'outcome-anim learn-glow'
  return (
    <div className={`${cls} ${anim}`}>
      <div className={`tag ${outcome}`}>{tag}</div>
      <p>{consequence}</p>
      <p className="muted">{tip}</p>
    </div>
  )
}

function StepView({
  step,
  sceneId,
  state,
  commit,
  onDone,
}: {
  step: SceneStep
  sceneId: string
  state: ProgressState
  commit: (s: ProgressState) => void
  onDone: () => void
}) {
  const [picked, setPicked] = useState<Choice | null>(null)
  const [found, setFound] = useState<string[]>([])
  const [checked, setChecked] = useState<string[]>([])
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const [placed, setPlaced] = useState<Record<string, string>>({})
  const [sortDone, setSortDone] = useState(false)

  if (step.kind === 'narration') {
    return (
      <div className="stack">
        <p>{step.text}</p>
        <button
          type="button"
          className="btn primary"
          onClick={() => {
            playSound('click', state.soundEnabled)
            onDone()
          }}
        >
          Дальше
        </button>
      </div>
    )
  }

  if (step.kind === 'choice' && step.choices) {
    if (picked) {
      return (
        <div className="stack">
          <OutcomeBlock
            outcome={picked.outcome}
            consequence={picked.consequence}
            tip={picked.tip}
          />
          <button type="button" className="btn primary" onClick={onDone}>
            Продолжить
          </button>
        </div>
      )
    }
    return (
      <div className="stack">
        <p>{step.text}</p>
        <div className="choice-list">
          {step.choices.map((c) => (
            <button
              key={c.id}
              type="button"
              className="btn"
              onClick={() => {
                recordChoice(state, commit, sceneId, step.id, c)
                setPicked(c)
              }}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>
    )
  }

  if (step.kind === 'hotspot' && step.hotspots) {
    const need = step.hotspots.filter((h) => h.correct).length
    const goodFound = step.hotspots.filter((h) => h.correct && found.includes(h.id)).length
    return (
      <div className="stack">
        <p>{step.text}</p>
        <div className="hotspot-stage" aria-label="Сцена перехода">
          <svg className="hotspot-bg" viewBox="0 0 640 280" aria-hidden="true">
            <rect width="640" height="280" fill="#d4b896" />
            <rect y="180" width="640" height="100" fill="#6b7280" />
            <rect x="300" y="40" width="28" height="140" fill="#5c4030" />
            <circle cx="314" cy="55" r="16" fill="#c0392b" />
            <circle cx="314" cy="90" r="16" fill="#f0c36a" />
            <circle cx="314" cy="125" r="16" fill="#2f6b4f" />
            <ellipse cx="480" cy="200" rx="60" ry="24" fill="#2a2118" />
          </svg>
          {step.hotspots.map((h) => {
            const isFound = found.includes(h.id)
            const cls = !isFound
              ? 'hotspot'
              : h.correct
                ? 'hotspot found-good'
                : 'hotspot found-bad'
            return (
              <button
                key={h.id}
                type="button"
                className={cls}
                style={{ left: `${h.x}%`, top: `${h.y}%` }}
                onClick={() => {
                  if (isFound) return
                  playSound(h.correct ? 'learn' : 'click', state.soundEnabled)
                  setFound((f) => [...f, h.id])
                }}
              >
                {h.label}
              </button>
            )
          })}
        </div>
        {found.length > 0 && (
          <p className="muted">
            {step.hotspots
              .filter((h) => found.includes(h.id))
              .map((h) => h.tip)
              .join(' · ')}
          </p>
        )}
        <button
          type="button"
          className="btn primary"
          disabled={goodFound < need}
          onClick={onDone}
        >
          Дальше ({goodFound}/{need})
        </button>
      </div>
    )
  }

  if (step.kind === 'checklist' && step.checklist) {
    const required = step.checklist.filter((c) => c.required).map((c) => c.id)
    const ok =
      required.every((id) => checked.includes(id)) &&
      step.checklist.every((c) => (c.required ? checked.includes(c.id) : !checked.includes(c.id)))
    return (
      <div className="stack">
        <p>{step.text}</p>
        <div className="checklist stack">
          {step.checklist.map((c) => (
            <label key={c.id}>
              <input
                type="checkbox"
                checked={checked.includes(c.id)}
                onChange={(e) => {
                  playSound('click', state.soundEnabled)
                  setChecked((prev) =>
                    e.target.checked ? [...prev, c.id] : prev.filter((x) => x !== c.id),
                  )
                }}
              />
              <span>{c.label}</span>
            </label>
          ))}
        </div>
        {!ok && checked.length > 0 && (
          <p className="muted">Нужны только верные пункты — лишнее тоже ошибка.</p>
        )}
        <button type="button" className="btn primary" disabled={!ok} onClick={onDone}>
          Подтвердить
        </button>
      </div>
    )
  }

  if (step.kind === 'sort' && step.sort) {
    if (sortDone) {
      const allOk = step.sort.items.every((i) => placed[i.id] === i.bin)
      return (
        <div className="stack">
          <OutcomeBlock
            outcome={allOk ? 'safe' : 'learn'}
            consequence={
              allOk
                ? 'Все на месте. Берег чище, поток вторсырья — честнее.'
                : 'Часть вещей не туда. Грязное и чистое не смешивают «на глаз».'
            }
            tip="Не уверен — в смешанные, а не в «пластик мечты»."
          />
          <button type="button" className="btn primary" onClick={onDone}>
            Дальше
          </button>
        </div>
      )
    }
    return (
      <div className="stack">
        <p>{step.text}</p>
        <div className="stack">
          {step.sort.items
            .filter((i) => !placed[i.id])
            .map((i) => (
              <button
                key={i.id}
                type="button"
                className={`sort-item ${selectedItem === i.id ? 'bin active' : ''}`}
                onClick={() => {
                  playSound('click', state.soundEnabled)
                  setSelectedItem(i.id)
                }}
              >
                {i.label}
              </button>
            ))}
        </div>
        <div className="bins">
          {step.sort.bins.map((b) => (
            <button
              key={b.id}
              type="button"
              className="bin"
              onClick={() => {
                if (!selectedItem) return
                playSound('click', state.soundEnabled)
                setPlaced((p) => ({ ...p, [selectedItem]: b.id }))
                setSelectedItem(null)
              }}
            >
              {b.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="btn primary"
          disabled={Object.keys(placed).length < step.sort.items.length}
          onClick={() => {
            const allOk = step.sort!.items.every((i) => placed[i.id] === i.bin)
            playSound(allOk ? 'safe' : 'learn', state.soundEnabled)
            setSortDone(true)
          }}
        >
          Проверить
        </button>
      </div>
    )
  }

  if (step.kind === 'chat' && step.chat) {
    if (picked) {
      return (
        <div className="stack">
          <OutcomeBlock
            outcome={picked.outcome}
            consequence={picked.consequence}
            tip={picked.tip}
          />
          <button type="button" className="btn primary" onClick={onDone}>
            Дальше
          </button>
        </div>
      )
    }
    return (
      <div className="stack">
        <p>{step.text}</p>
        <div className="chat-box">
          <strong>{step.chat.npcName}</strong>
          {step.chat.messages.map((m, i) => (
            <div key={i} className={`bubble ${m.from}`}>
              {m.text}
            </div>
          ))}
        </div>
        <div className="choice-list">
          {step.chat.replies.map((c) => (
            <button
              key={c.id}
              type="button"
              className="btn"
              onClick={() => {
                recordChoice(state, commit, sceneId, step.id, c)
                setPicked(c)
              }}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <button type="button" className="btn primary" onClick={onDone}>
      Дальше
    </button>
  )
}

function ScenePage({
  state,
  commit,
}: {
  state: ProgressState
  commit: (s: ProgressState) => void
}) {
  const { sceneId = '' } = useParams()
  const navigate = useNavigate()
  const scene = sceneById(sceneId)
  const [stepIndex, setStepIndex] = useState(0)
  const [finished, setFinished] = useState(false)
  const [endedDay, setEndedDay] = useState(false)

  if (!scene) return <Navigate to="/" replace />

  const loc = locationById(scene.locationId)
  const hb = handbookById(scene.handbookId)
  const step = scene.steps[stepIndex]

  const finish = () => {
    const meta = UNLOCK_AFTER[scene.id] ?? { unlock: [] as string[], phase: state.phase }
    const unlocks = state.demoMode ? [] : meta.unlock
    const nextCompleted = state.completedScenes.includes(scene.id)
      ? state.completedScenes
      : [...state.completedScenes, scene.id]
    const dayDone = state.demoMode
      ? DEMO_SCENE_IDS.every((id) => nextCompleted.includes(id))
      : locations.every((l) => nextCompleted.includes(l.sceneId))
    playSound(dayDone ? 'done' : 'safe', state.soundEnabled)
    commit(completeScene(state, scene.id, unlocks, meta.phase, dayDone))
    setEndedDay(dayDone)
    setFinished(true)
  }

  if (finished) {
    return (
      <div className="panel stack">
        <LocationArt id={scene.locationId} />
        <h1>{scene.title}</h1>
        <p>{scene.summary}</p>
        {hb && (
          <div className="result-safe outcome-anim safe-pulse">
            <div className="tag safe">Справка</div>
            <h2>{hb.title}</h2>
            <ul>
              {hb.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </div>
        )}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button type="button" className="btn primary" onClick={() => navigate('/')}>
            {endedDay ? 'К финалу дня' : 'На карту'}
          </button>
          <button type="button" className="btn" onClick={() => navigate('/report')}>
            К отчёту
          </button>
        </div>
        <p className="muted disclaimer-inline">{DISCLAIMER}</p>
      </div>
    )
  }

  return (
    <div className="panel stack">
      <LocationArt id={scene.locationId} />
      <p className="muted">
        {loc?.name} · {MODULE_LABELS[scene.module]} · шаг {stepIndex + 1}/{scene.steps.length}
      </p>
      <h1>{scene.title}</h1>
      {step && (
        <StepView
          key={step.id}
          step={step}
          sceneId={scene.id}
          state={state}
          commit={commit}
          onDone={() => {
            if (stepIndex >= scene.steps.length - 1) finish()
            else setStepIndex((i) => i + 1)
          }}
        />
      )}
    </div>
  )
}

function HandbookPage({ state }: { state: ProgressState }) {
  const list =
    state.teacherFilter === 'all'
      ? handbook
      : handbook.filter((h) => h.module === state.teacherFilter)
  return (
    <div className="stack">
      <section className="panel">
        <h1>Справка</h1>
        <p className="muted">Карточки после сцен — можно на проектор.</p>
        <p className="muted disclaimer-inline">{DISCLAIMER}</p>
      </section>
      {list.map((h) => (
        <section key={h.id} className="panel">
          <p className="muted">{MODULE_LABELS[h.module]}</p>
          <h2>{h.title}</h2>
          <ul>
            {h.bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}

function QuizPage({
  state,
  commit,
}: {
  state: ProgressState
  commit: (s: ProgressState) => void
}) {
  const questions = useMemo(() => {
    if (state.teacherFilter === 'all') return quiz
    return quiz.filter((q) => q.module === state.teacherFilter)
  }, [state.teacherFilter])
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [submitted, setSubmitted] = useState(false)
  const score = questions.reduce(
    (acc, q) => acc + (answers[q.id] === q.correctIndex ? 1 : 0),
    0,
  )

  return (
    <div className="stack">
      <section className="panel">
        <h1>Тест</h1>
        <p className="muted">{questions.length} вопросов</p>
      </section>
      {questions.map((q) => (
        <section key={q.id} className="panel stack">
          <h2>{q.question}</h2>
          <div className="choice-list">
            {q.options.map((opt, idx) => (
              <button
                key={opt}
                type="button"
                className={`btn ${answers[q.id] === idx ? 'primary' : ''}`}
                disabled={submitted}
                onClick={() => {
                  playSound('click', state.soundEnabled)
                  setAnswers((a) => ({ ...a, [q.id]: idx }))
                }}
              >
                {opt}
              </button>
            ))}
          </div>
          {submitted && <p className="muted">{q.explain}</p>}
        </section>
      ))}
      {!submitted ? (
        <button
          type="button"
          className="btn safe"
          disabled={Object.keys(answers).length < questions.length}
          onClick={() => {
            playSound('done', state.soundEnabled)
            setSubmitted(true)
            commit(setQuizScore(state, score))
          }}
        >
          Сдать тест
        </button>
      ) : (
        <section className="panel">
          <h2>
            Результат: {score} / {questions.length}
          </h2>
        </section>
      )}
    </div>
  )
}

function ReportPage({ state }: { state: ProgressState }) {
  const printMemo = () => {
    const lines = [
      'Город одного дня — памятка (учебный материал)',
      DISCLAIMER,
      '',
      `Ученик: ${state.playerName || 'без имени'}`,
      `Сцен: ${state.completedScenes.length}/${state.demoMode ? DEMO_SCENE_IDS.length : scenes.length}`,
      '',
      ...state.decisions.map((d) => `• [${d.outcome}] ${d.label} — ${d.tip}`),
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'pamyatka-gorod-odnogo-dnya.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="stack">
      <section className="panel">
        <h1>{state.playerName || 'Ученик'}, твой день</h1>
        <p className="muted">
          Сцен: {state.completedScenes.length}
          {state.quizScore !== null ? ` · тест: ${state.quizScore}` : ''}
          {state.dayFinished ? ' · день завершён' : ''}
        </p>
        <button type="button" className="btn primary" onClick={printMemo}>
          Скачать памятку (.txt)
        </button>
        <p className="muted disclaimer-inline">{DISCLAIMER}</p>
      </section>
      <div className="report-list">
        {state.decisions.length === 0 && (
          <section className="panel muted">Пока нет решений — открой локацию на карте.</section>
        )}
        {state.decisions.map((d, i) => (
          <article key={`${d.choiceId}-${i}`} className="report-item">
            <div className={`tag ${d.outcome}`}>{d.outcome}</div>
            <h2>{d.label}</h2>
            <p className="muted">{d.tip}</p>
          </article>
        ))}
      </div>
    </div>
  )
}

function TeacherPage({
  state,
  commit,
}: {
  state: ProgressState
  commit: (s: ProgressState) => void
}) {
  const navigate = useNavigate()
  const modules = ['all', 'road', 'school', 'health', 'ecology', 'digital', 'professions'] as const
  return (
    <div className="stack">
      <section className="panel stack">
        <h1>Режим учителя</h1>
        <p className="muted">Фильтр темы или демо для жюри.</p>
        <button
          type="button"
          className="btn safe"
          onClick={() => {
            commit(startDemo(state))
            navigate('/scene/scene-road')
          }}
        >
          Запустить демо для жюри
        </button>
        <div className="choice-list">
          {modules.map((m) => (
            <button
              key={m}
              type="button"
              className={`chip ${state.teacherFilter === m ? 'active' : ''}`}
              onClick={() => commit(setTeacherFilter(state, m as ModuleId | 'all'))}
            >
              {MODULE_LABELS[m]}
            </button>
          ))}
        </div>
      </section>
      <section className="panel stack">
        <h2>Журнал устройства</h2>
        <p className="muted">Решений: {state.decisions.length}. Данные в localStorage.</p>
        <button
          type="button"
          className="btn"
          onClick={() => {
            if (confirm('Сбросить прогресс?')) commit(resetProgress())
          }}
        >
          Сбросить прогресс
        </button>
        <p className="muted disclaimer-inline">{DISCLAIMER}</p>
      </section>
    </div>
  )
}

export default function App() {
  const { state, commit } = useProgress()

  if (!state.onboarded) {
    return (
      <div className="app-shell">
        <main className="main">
          <Welcome state={state} commit={commit} />
        </main>
        <footer className="footer-bar">{DISCLAIMER}</footer>
      </div>
    )
  }

  return (
    <Shell state={state} commit={commit}>
      <Routes>
        <Route path="/" element={<Home state={state} commit={commit} />} />
        <Route path="/scene/:sceneId" element={<ScenePage state={state} commit={commit} />} />
        <Route path="/handbook" element={<HandbookPage state={state} />} />
        <Route path="/quiz" element={<QuizPage state={state} commit={commit} />} />
        <Route path="/report" element={<ReportPage state={state} />} />
        <Route path="/teacher" element={<TeacherPage state={state} commit={commit} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Shell>
  )
}
