import type { Choice, CityData, SceneStep } from '../types'
import { Outcome, outcomeFromChoice, stepHint } from './Outcome'

type StepLocal = {
  picked?: Choice
  found?: string[]
  checked?: string[]
  selectedItem?: string | null
  placed?: Record<string, string>
  sortDone?: boolean
}

type Props = {
  city: CityData
  sceneId: string
  stepIndex: number
  sceneDone: boolean
  endedDay: boolean
  onMap: () => void
  onNextScene: () => void
  onNextStep: () => void
  onDecide: (choice: Choice, step: SceneStep) => void
  stepLocal: StepLocal
  setStepLocal: (patch: StepLocal | ((prev: StepLocal) => StepLocal)) => void
}

export function SceneView({
  city,
  sceneId,
  stepIndex,
  sceneDone,
  endedDay,
  onMap,
  onNextScene,
  onNextStep,
  onDecide,
  stepLocal,
  setStepLocal,
}: Props) {
  const scene = city.scenes[sceneId]
  if (!scene) return <p>Сцена не найдена</p>

  const loc = city.locations.find((l) => l.id === scene.locationId)
  const artTitle =
    (city.artTitles && city.artTitles[scene.locationId]) || loc?.name || scene.locationId
  const artSrc =
    loc?.image || `${import.meta.env.BASE_URL}img/${scene.locationId}.jpg`

  if (sceneDone) {
    return (
      <section className="panel stack anim-scene">
        <figure className="scene-art anim-scene">
          <img src={artSrc} alt={artTitle} width={1200} height={700} />
          <figcaption>{artTitle}</figcaption>
        </figure>
        <h1>{scene.title}</h1>
        <p>{scene.summary}</p>
        <div className="map-cta">
          {endedDay ? (
            <button type="button" className="btn primary" onClick={onMap}>
              К финалу дня
            </button>
          ) : (
            <button type="button" className="btn primary" onClick={onNextScene}>
              Дальше
            </button>
          )}
          <button type="button" className="btn" onClick={onMap}>
            На карту
          </button>
        </div>
      </section>
    )
  }

  const step = scene.steps[stepIndex]

  return (
    <section className="panel stack anim-scene">
      <figure className="scene-art anim-scene">
        <img src={artSrc} alt={artTitle} width={1200} height={700} />
        <figcaption>{artTitle}</figcaption>
      </figure>
      <p className="muted">
        {loc?.name} · {city.moduleLabels[scene.module]} · шаг {stepIndex + 1}/
        {scene.steps.length}
      </p>
      <h1>{scene.title}</h1>
      <StepBody
        city={city}
        step={step}
        stepLocal={stepLocal}
        setStepLocal={setStepLocal}
        onDecide={onDecide}
        onNextStep={onNextStep}
      />
    </section>
  )
}

function StepBody({
  city,
  step,
  stepLocal,
  setStepLocal,
  onDecide,
  onNextStep,
}: {
  city: CityData
  step: SceneStep
  stepLocal: StepLocal
  setStepLocal: (patch: StepLocal | ((prev: StepLocal) => StepLocal)) => void
  onDecide: (choice: Choice, step: SceneStep) => void
  onNextStep: () => void
}) {
  const tip = <p className="step-hint">{stepHint(step.kind)}</p>

  if (step.kind === 'narration') {
    return (
      <div className="stack anim-step">
        {tip}
        <p>{step.text}</p>
        <button type="button" className="btn primary" onClick={onNextStep}>
          Дальше
        </button>
      </div>
    )
  }

  if (step.kind === 'choice') {
    if (stepLocal.picked) {
      return (
        <div className="stack">
          {outcomeFromChoice(stepLocal.picked)}
          <button type="button" className="btn primary" onClick={onNextStep}>
            Продолжить
          </button>
        </div>
      )
    }
    return (
      <div className="stack anim-step">
        {tip}
        <p>{step.text}</p>
        <div className="choice-list">
          {(step.choices || []).map((c) => (
            <button
              key={c.id}
              type="button"
              className="btn"
              onClick={() => {
                onDecide(c, step)
                setStepLocal({ ...stepLocal, picked: c })
              }}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>
    )
  }

  if (step.kind === 'hotspot') {
    const need = (step.hotspots || []).filter((h) => h.correct).length
    const found = stepLocal.found || []
    const good = (step.hotspots || []).filter(
      (h) => h.correct && found.includes(h.id),
    ).length
    const tips = (step.hotspots || [])
      .filter((h) => found.includes(h.id))
      .map((h) => h.tip)
      .join(' · ')
    const road = city.locations.find((l) => l.id === 'road')

    return (
      <div className="stack anim-step">
        {tip}
        <p>{step.text}</p>
        <div className="hotspot-stage">
          <img
            src={road?.image || `${import.meta.env.BASE_URL}img/road.jpg`}
            alt={city.artTitles.road || 'Дорога'}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: 0.9,
            }}
          />
          {(step.hotspots || []).map((h) => {
            const is = found.includes(h.id)
            const cls = !is ? 'hotspot' : h.correct ? 'hotspot good' : 'hotspot bad'
            return (
              <button
                key={h.id}
                type="button"
                className={`${cls}${is ? ' anim-pop' : ''}`}
                style={{ left: `${h.x}%`, top: `${h.y}%` }}
                onClick={() => {
                  if (found.includes(h.id)) return
                  setStepLocal({ ...stepLocal, found: found.concat(h.id) })
                }}
              >
                {h.label}
              </button>
            )
          })}
        </div>
        {tips ? <p className="muted">{tips}</p> : null}
        <button
          type="button"
          className="btn primary"
          disabled={good < need}
          onClick={onNextStep}
        >
          Дальше ({good}/{need})
        </button>
      </div>
    )
  }

  if (step.kind === 'checklist') {
    const checked = stepLocal.checked || []
    const required = (step.checklist || []).filter((c) => c.required).map((c) => c.id)
    const ok =
      required.every((id) => checked.includes(id)) &&
      (step.checklist || []).every((c) =>
        c.required ? checked.includes(c.id) : !checked.includes(c.id),
      )

    return (
      <div className="stack anim-step">
        {tip}
        <p>{step.text}</p>
        <div className="stack checklist">
          {(step.checklist || []).map((c) => (
            <label key={c.id}>
              <input
                type="checkbox"
                checked={checked.includes(c.id)}
                onChange={(e) => {
                  const next = e.target.checked
                    ? checked.concat(c.id)
                    : checked.filter((x) => x !== c.id)
                  setStepLocal({ ...stepLocal, checked: next })
                }}
              />
              <span>{c.label}</span>
            </label>
          ))}
        </div>
        <button
          type="button"
          className="btn primary"
          disabled={!ok}
          onClick={onNextStep}
        >
          Подтвердить
        </button>
      </div>
    )
  }

  if (step.kind === 'sort') {
    if (stepLocal.sortDone && step.sort) {
      const placed = stepLocal.placed || {}
      const allOk = step.sort.items.every((i) => placed[i.id] === i.bin)
      return (
        <div className="stack">
          <Outcome
            outcome={allOk ? 'safe' : 'learn'}
            consequence={
              allOk
                ? 'Все на месте. Берег чище.'
                : 'Часть вещей не туда. Грязное и чистое не смешивают.'
            }
            tip="Не уверен — в смешанные."
          />
          <button type="button" className="btn primary" onClick={onNextStep}>
            Дальше
          </button>
        </div>
      )
    }

    const placed = stepLocal.placed || {}
    const selected = stepLocal.selectedItem || null

    return (
      <div className="stack anim-step">
        {tip}
        <p>{step.text}</p>
        <div className="stack">
          {(step.sort?.items || [])
            .filter((i) => !placed[i.id])
            .map((i) => (
              <button
                key={i.id}
                type="button"
                className={`sort-item${selected === i.id ? ' bin active' : ''}`}
                onClick={() => setStepLocal({ ...stepLocal, selectedItem: i.id })}
              >
                {i.label}
              </button>
            ))}
        </div>
        <div className="bins">
          {(step.sort?.bins || []).map((b) => (
            <button
              key={b.id}
              type="button"
              className="bin"
              onClick={() => {
                if (!selected) return
                setStepLocal({
                  ...stepLocal,
                  placed: { ...placed, [selected]: b.id },
                  selectedItem: null,
                })
              }}
            >
              {b.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="btn primary"
          disabled={
            Object.keys(placed).length < (step.sort?.items.length || 0)
          }
          onClick={() => setStepLocal({ ...stepLocal, sortDone: true })}
        >
          Проверить
        </button>
      </div>
    )
  }

  if (step.kind === 'chat') {
    if (stepLocal.picked) {
      return (
        <div className="stack">
          {outcomeFromChoice(stepLocal.picked)}
          <button type="button" className="btn primary" onClick={onNextStep}>
            Дальше
          </button>
        </div>
      )
    }
    return (
      <div className="stack anim-step">
        {tip}
        <p>{step.text}</p>
        <div className="chat">
          <strong>{step.chat?.npcName}</strong>
          {(step.chat?.messages || []).map((m, i) => (
            <div
              key={`${m.from}-${i}`}
              className={`bubble ${m.from} anim-bubble`}
              style={{ animationDelay: `${i * 0.12}s` }}
            >
              {m.text}
            </div>
          ))}
        </div>
        <div className="choice-list">
          {(step.chat?.replies || []).map((c) => (
            <button
              key={c.id}
              type="button"
              className="btn"
              onClick={() => {
                onDecide(c, step)
                setStepLocal({ ...stepLocal, picked: c })
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
    <button type="button" className="btn primary" onClick={onNextStep}>
      Дальше
    </button>
  )
}

export type { StepLocal }
