import { useCallback, useEffect, useState } from 'react'
import { CityMap } from './components/CityMap'
import { QuizView } from './components/QuizView'
import { SceneView, type StepLocal } from './components/SceneView'
import { Shell } from './components/Shell'
import { Welcome } from './components/Welcome'
import { loadCity } from './data/loadCity'
import {
  clearProgress,
  initialProgress,
  loadProgress,
  saveProgress,
} from './store/progress'
import type {
  Choice,
  CityData,
  ProgressState,
  SceneStep,
  ViewId,
} from './types'

export default function App() {
  const [city, setCity] = useState<CityData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [state, setState] = useState<ProgressState>(() => loadProgress())
  const [view, setView] = useState<ViewId>(() =>
    loadProgress().onboarded ? 'map' : 'welcome',
  )
  const [sceneId, setSceneId] = useState<string | null>(null)
  const [stepIndex, setStepIndex] = useState(0)
  const [sceneDone, setSceneDone] = useState(false)
  const [endedDay, setEndedDay] = useState(false)
  const [stepLocal, setStepLocal] = useState<StepLocal>({})
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({})
  const [quizSubmitted, setQuizSubmitted] = useState(false)

  useEffect(() => {
    loadCity()
      .then(setCity)
      .catch(() => setError('Не удалось загрузить /json/city.json'))
  }, [])

  const patch = useCallback((partial: Partial<ProgressState>) => {
    setState((prev) => {
      const next = { ...prev, ...partial }
      saveProgress(next)
      return next
    })
  }, [])

  const resetAll = () => {
    if (!confirm('Сбросить прогресс?')) return
    clearProgress()
    setState({ ...initialProgress })
    setSceneId(null)
    setStepIndex(0)
    setSceneDone(false)
    setEndedDay(false)
    setStepLocal({})
    setQuizAnswers({})
    setQuizSubmitted(false)
    setView('welcome')
  }

  const startDay = () => {
    const next: ProgressState = {
      ...initialProgress,
      onboarded: true,
      playerName: state.playerName,
    }
    setState(next)
    saveProgress(next)
    setQuizAnswers({})
    setQuizSubmitted(false)
    setView('map')
  }

  const openScene = (id: string) => {
    setSceneId(id)
    setStepIndex(0)
    setSceneDone(false)
    setEndedDay(false)
    setStepLocal({})
    setView('scene')
  }

  const completeCurrentScene = () => {
    if (!city || !sceneId) return
    const meta = city.unlockAfter[sceneId] || {
      unlock: [] as string[],
      phase: state.phase,
    }
    const nextCompleted = state.completedScenes.includes(sceneId)
      ? state.completedScenes
      : state.completedScenes.concat(sceneId)
    const unlocked = Array.from(
      new Set(state.unlockedLocations.concat(meta.unlock)),
    )
    const dayDone = city.locations.every((l) =>
      nextCompleted.includes(l.sceneId),
    )
    setEndedDay(dayDone)
    patch({
      completedScenes: nextCompleted,
      unlockedLocations: unlocked,
      phase: meta.phase,
      dayFinished: dayDone || state.dayFinished,
    })
    setSceneDone(true)
  }

  const addDecision = (choice: Choice, step: SceneStep) => {
    if (!sceneId) return
    patch({
      decisions: state.decisions.concat([
        {
          sceneId,
          stepId: step.id,
          choiceId: choice.id,
          label: choice.label,
          outcome: choice.outcome,
          tip: choice.tip,
          at: new Date().toISOString(),
        },
      ]),
    })
  }

  if (error) {
    return (
      <main className="main">
        <section className="boot-error">
          <h1>Ошибка загрузки</h1>
          <p>{error}</p>
          <p className="muted">Запусти: cd web && npm run dev</p>
        </section>
      </main>
    )
  }

  if (!city) {
    return (
      <main className="main">
        <section className="board">
          <p>Загрузка…</p>
        </section>
      </main>
    )
  }

  if (!state.onboarded || view === 'welcome') {
    return (
      <Welcome
        playerName={state.playerName}
        onName={(name) => patch({ playerName: name })}
        onStart={startDay}
        onReset={resetAll}
      />
    )
  }

  let body: React.ReactNode = null

  if (view === 'map') {
    body = (
      <CityMap
        city={city}
        state={state}
        onName={(name) => patch({ playerName: name })}
        onOpenScene={openScene}
        onStartFirst={() => {
          const first =
            city.locations.find(
              (l) =>
                state.unlockedLocations.includes(l.id) &&
                !state.completedScenes.includes(l.sceneId),
            ) ||
            city.locations.find((l) => state.unlockedLocations.includes(l.id))
          if (first) openScene(first.sceneId)
        }}
        onQuiz={() => setView('quiz')}
        onRestart={startDay}
      />
    )
  } else if (view === 'scene' && sceneId) {
    body = (
      <SceneView
        city={city}
        sceneId={sceneId}
        stepIndex={stepIndex}
        sceneDone={sceneDone}
        endedDay={endedDay}
        stepLocal={stepLocal}
        setStepLocal={setStepLocal}
        onMap={() => setView('map')}
        onNextScene={() => {
          const nextId = findNextScene(city, state, sceneId, endedDay)
          if (!nextId) {
            setView('map')
            return
          }
          openScene(nextId)
        }}
        onNextStep={() => {
          const scene = city.scenes[sceneId]
          if (stepIndex >= scene.steps.length - 1) completeCurrentScene()
          else {
            setStepIndex((i) => i + 1)
            setStepLocal({})
          }
        }}
        onDecide={addDecision}
      />
    )
  } else if (view === 'quiz') {
    body = (
      <QuizView
        city={city}
        answers={quizAnswers}
        submitted={quizSubmitted}
        score={state.quizScore}
        onAnswer={(id, idx) => setQuizAnswers((a) => ({ ...a, [id]: idx }))}
        onSubmit={() => {
          const score = city.quiz.reduce(
            (n, q) => n + (quizAnswers[q.id] === q.correct ? 1 : 0),
            0,
          )
          setQuizSubmitted(true)
          patch({ quizScore: score })
        }}
        onMap={() => setView('map')}
        onRestart={startDay}
      />
    )
  }

  return (
    <Shell
      city={city}
      state={state}
      view={view === 'scene' ? 'map' : view}
      onNav={(v) => setView(v)}
      onReset={resetAll}
    >
      {body}
    </Shell>
  )
}

function findNextScene(
  city: CityData,
  state: ProgressState,
  sceneId: string,
  endedDay: boolean,
): string | null {
  if (endedDay || state.dayFinished) return null
  const meta = city.unlockAfter[sceneId]
  const unlocked = meta
    ? Array.from(new Set(state.unlockedLocations.concat(meta.unlock)))
    : state.unlockedLocations
  const order = city.locations.map((l) => l.sceneId)
  const i = order.indexOf(sceneId)
  if (i < 0) return null
  for (let n = i + 1; n < order.length; n++) {
    const nextId = order[n]
    const loc = city.locations.find((l) => l.sceneId === nextId)
    if (!loc) continue
    if (unlocked.includes(loc.id)) return nextId
  }
  return null
}
