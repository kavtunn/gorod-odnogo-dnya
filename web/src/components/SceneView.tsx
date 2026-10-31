import type { ReactNode } from 'react'
import { playOutcome, playPlace } from '../audio/sfx'
import type { Choice, CityData, SceneStep, StepLocal } from '../types'
import { flashPick } from '../utils/flashPick'
import { outcomeFromChoice, stepHint } from './Outcome'
import {
  checklistChoice,
  hotspotChoice,
  sortChoice,
} from './sceneOutcomes'

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
  setStepLocal: (next: StepLocal | ((prev: StepLocal) => StepLocal)) => void
}

export type { StepLocal }

function saveChoice(
  choice: Choice,
  step: SceneStep,
  onDecide: Props['onDecide'],
  setStepLocal: Props['setStepLocal'],
  extra: Partial<StepLocal> = {},
) {
  playOutcome(choice.outcome)
  onDecide(choice, step)
  setStepLocal((prev) => ({ ...prev, ...extra, picked: choice }))
}

function OutcomeBlock({
  choice,
  buttonLabel,
  onNext,
}: {
  choice: Choice
  buttonLabel: string
  onNext: () => void
}) {
  return (
    <div className="stack anim-step">
      {outcomeFromChoice(choice)}
      <button type="button" className="btn primary" onClick={onNext}>
        {buttonLabel}
      </button>
    </div>
  )
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
    city.artTitles?.[scene.locationId] || loc?.name || scene.locationId
  const artSrc =
    loc?.image || `${import.meta.env.BASE_URL}img/${scene.locationId}.jpg`
  const progress =
    ((stepIndex + (sceneDone ? 1 : 0)) / scene.steps.length) * 100

  if (sceneDone) {
    return (
      <section className="panel stack anim-scene scene-done">
        <figure className="scene-art scene-art-live">
          <img src={artSrc} alt={artTitle} width={1200} height={700} />
          <figcaption>{artTitle}</figcaption>
        </figure>
        <div className="scene-progress" aria-hidden="true">
          <div
            className="scene-progress-fill"
            style={{ transform: 'scaleX(1)' }}
          />
        </div>
        <h1 className="anim-in">{scene.title}</h1>
        <p className="anim-in" style={{ animationDelay: '0.08s' }}>
          {scene.summary}
        </p>
        <div className="map-cta anim-in" style={{ animationDelay: '0.14s' }}>
          {endedDay ? (
            <button type="button" className="btn primary" onClick={onMap}>
              К итогам дня
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
      <figure className="scene-art scene-art-live" key={sceneId}>
        <img src={artSrc} alt={artTitle} width={1200} height={700} />
        <figcaption>{artTitle}</figcaption>
      </figure>
      <div className="scene-progress" aria-hidden="true">
        <div
          className="scene-progress-fill"
          style={{ transform: `scaleX(${Math.max(progress, 8) / 100})` }}
        />
      </div>
      <p className="muted">
        {loc?.name} · {city.moduleLabels[scene.module]} · шаг {stepIndex + 1}/
        {scene.steps.length}
      </p>
      <h1>{scene.title}</h1>
      <StepBody
        key={`${sceneId}-${step.id}-${stepIndex}`}
        step={step}
        stageSrc={artSrc}
        stageAlt={artTitle}
        stepLocal={stepLocal}
        setStepLocal={setStepLocal}
        onDecide={onDecide}
        onNextStep={onNextStep}
      />
    </section>
  )
}

function StepBody({
  step,
  stageSrc,
  stageAlt,
  stepLocal,
  setStepLocal,
  onDecide,
  onNextStep,
}: {
  step: SceneStep
  stageSrc: string
  stageAlt: string
  stepLocal: StepLocal
  setStepLocal: Props['setStepLocal']
  onDecide: Props['onDecide']
  onNextStep: () => void
}) {
  const tip = <p className="step-hint anim-in">{stepHint(step.kind)}</p>

  if (step.kind === 'narration') {
    return (
      <div className="stack anim-step">
        {tip}
        <p className="narration-text">{step.text}</p>
        <button type="button" className="btn primary" onClick={onNextStep}>
          Дальше
        </button>
      </div>
    )
  }

  if (step.kind === 'choice') {
    if (stepLocal.picked) {
      return (
        <OutcomeBlock
          choice={stepLocal.picked}
          buttonLabel="Продолжить"
          onNext={onNextStep}
        />
      )
    }

    return (
      <div className="stack anim-step">
        {tip}
        <p>{step.text}</p>
        <div className="choice-list">
          {(step.choices || []).map((c, i) => (
            <button
              key={c.id}
              type="button"
              className="btn pickable choice-enter"
              style={{ animationDelay: `${0.06 + i * 0.06}s` }}
              onClick={(e) => {
                flashPick(e.currentTarget, 220, () => {
                  saveChoice(c, step, onDecide, setStepLocal)
                })
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
    return (
      <HotspotStep
        step={step}
        tip={tip}
        stageSrc={stageSrc}
        stageAlt={stageAlt}
        stepLocal={stepLocal}
        setStepLocal={setStepLocal}
        onDecide={onDecide}
        onNextStep={onNextStep}
      />
    )
  }

  if (step.kind === 'checklist') {
    return (
      <ChecklistStep
        step={step}
        tip={tip}
        stepLocal={stepLocal}
        setStepLocal={setStepLocal}
        onDecide={onDecide}
        onNextStep={onNextStep}
      />
    )
  }

  if (step.kind === 'sort') {
    return (
      <SortStep
        step={step}
        tip={tip}
        stepLocal={stepLocal}
        setStepLocal={setStepLocal}
        onDecide={onDecide}
        onNextStep={onNextStep}
      />
    )
  }

  if (step.kind === 'chat') {
    return (
      <ChatStep
        step={step}
        tip={tip}
        stepLocal={stepLocal}
        setStepLocal={setStepLocal}
        onDecide={onDecide}
        onNextStep={onNextStep}
      />
    )
  }

  return (
    <button type="button" className="btn primary" onClick={onNextStep}>
      Дальше
    </button>
  )
}

function HotspotStep({
  step,
  tip,
  stageSrc,
  stageAlt,
  stepLocal,
  setStepLocal,
  onDecide,
  onNextStep,
}: {
  step: SceneStep
  tip: ReactNode
  stageSrc: string
  stageAlt: string
  stepLocal: StepLocal
  setStepLocal: Props['setStepLocal']
  onDecide: Props['onDecide']
  onNextStep: () => void
}) {
  const spots = step.hotspots || []
  const need = spots.filter((h) => h.correct).length
  const found = stepLocal.found || []
  const good = spots.filter((h) => h.correct && found.includes(h.id)).length
  const bad = spots.filter((h) => !h.correct && found.includes(h.id))
  const tips = spots
    .filter((h) => found.includes(h.id))
    .map((h) => h.tip)
    .join(' · ')

  if (stepLocal.hotspotDone && stepLocal.picked) {
    return (
      <OutcomeBlock
        choice={stepLocal.picked}
        buttonLabel="Продолжить"
        onNext={onNextStep}
      />
    )
  }

  const mark = (id: string) => {
    if (found.includes(id)) return
    playPlace()
    setStepLocal({ ...stepLocal, found: found.concat(id) })
  }

  const finish = () => {
    const choice = hotspotChoice(
      step,
      good,
      need,
      bad.map((h) => h.label),
      bad.map((h) => h.tip).join(' '),
      tips,
    )
    saveChoice(choice, step, onDecide, setStepLocal, { hotspotDone: true })
  }

  return (
    <div className="stack anim-step">
      {tip}
      <p>{step.text}</p>
      <div className="hotspot-stage">
        <img className="hotspot-bg ken-burns" src={stageSrc} alt={stageAlt} />
        {spots.map((h, i) => {
          const isFound = found.includes(h.id)
          let cls = 'hotspot hotspot-idle'
          if (isFound) cls = h.correct ? 'hotspot good' : 'hotspot bad'

          return (
            <button
              key={h.id}
              type="button"
              className={`${cls}${isFound ? ' anim-pop' : ''}`}
              style={{
                left: `${h.x}%`,
                top: `${h.y}%`,
                animationDelay: isFound ? undefined : `${i * 0.35}s`,
              }}
              onClick={() => mark(h.id)}
            >
              {h.label}
            </button>
          )
        })}
      </div>
      <div className="hotspot-list" aria-label="Точки на сцене">
        {spots.map((h) => {
          const isFound = found.includes(h.id)
          return (
            <button
              key={`list-${h.id}`}
              type="button"
              className={`btn hotspot-list-btn${isFound && h.correct ? ' safe' : ''}`}
              disabled={isFound}
              onClick={() => mark(h.id)}
            >
              {isFound ? (h.correct ? '✓ ' : '· ') : ''}
              {h.label}
            </button>
          )
        })}
      </div>
      {tips ? <p className="muted tip-fade">{tips}</p> : null}
      <button
        type="button"
        className="btn primary"
        disabled={found.length < 1}
        onClick={finish}
      >
        Готово ({good}/{need}
        {bad.length ? `, ошибок: ${bad.length}` : ''})
      </button>
    </div>
  )
}

function ChecklistStep({
  step,
  tip,
  stepLocal,
  setStepLocal,
  onDecide,
  onNextStep,
}: {
  step: SceneStep
  tip: ReactNode
  stepLocal: StepLocal
  setStepLocal: Props['setStepLocal']
  onDecide: Props['onDecide']
  onNextStep: () => void
}) {
  const items = step.checklist || []
  const checked = stepLocal.checked || []

  if (stepLocal.checklistDone && stepLocal.picked) {
    return (
      <OutcomeBlock
        choice={stepLocal.picked}
        buttonLabel="Продолжить"
        onNext={onNextStep}
      />
    )
  }

  return (
    <div className="stack anim-step">
      {tip}
      <p>{step.text}</p>
      <div className="stack checklist">
        {items.map((c, i) => (
          <label
            key={c.id}
            className={`check-row${checked.includes(c.id) ? ' on' : ''}`}
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <input
              type="checkbox"
              checked={checked.includes(c.id)}
              onChange={(e) => {
                playPlace()
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
        onClick={() => {
          const choice = checklistChoice(step, checked)
          saveChoice(choice, step, onDecide, setStepLocal, {
            checklistDone: true,
          })
        }}
      >
        Подтвердить выбор
      </button>
    </div>
  )
}

function SortStep({
  step,
  tip,
  stepLocal,
  setStepLocal,
  onDecide,
  onNextStep,
}: {
  step: SceneStep
  tip: ReactNode
  stepLocal: StepLocal
  setStepLocal: Props['setStepLocal']
  onDecide: Props['onDecide']
  onNextStep: () => void
}) {
  if (stepLocal.sortDone && stepLocal.picked) {
    return (
      <OutcomeBlock
        choice={stepLocal.picked}
        buttonLabel="Дальше"
        onNext={onNextStep}
      />
    )
  }

  const placed = stepLocal.placed || {}
  const selected = stepLocal.selectedItem || null
  const items = step.sort?.items || []
  const bins = step.sort?.bins || []

  return (
    <div className="stack anim-step">
      {tip}
      <p>{step.text}</p>
      <div className="stack sort-items">
        {items
          .filter((i) => !placed[i.id])
          .map((i, idx) => (
            <button
              key={i.id}
              type="button"
              className={`sort-item choice-enter${selected === i.id ? ' bin active' : ''}`}
              style={{ animationDelay: `${idx * 0.05}s` }}
              onClick={() => {
                playPlace()
                setStepLocal({ ...stepLocal, selectedItem: i.id })
              }}
            >
              {i.label}
            </button>
          ))}
      </div>
      <div className="bins">
        {bins.map((b) => (
          <button
            key={b.id}
            type="button"
            className={`bin${selected ? ' ready' : ''}`}
            onClick={() => {
              if (!selected) return
              playPlace()
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
        disabled={Object.keys(placed).length < items.length}
        onClick={() => {
          const choice = sortChoice(step, placed)
          saveChoice(choice, step, onDecide, setStepLocal, { sortDone: true })
        }}
      >
        Проверить
      </button>
    </div>
  )
}

function ChatStep({
  step,
  tip,
  stepLocal,
  setStepLocal,
  onDecide,
  onNextStep,
}: {
  step: SceneStep
  tip: ReactNode
  stepLocal: StepLocal
  setStepLocal: Props['setStepLocal']
  onDecide: Props['onDecide']
  onNextStep: () => void
}) {
  if (stepLocal.picked) {
    return (
      <OutcomeBlock
        choice={stepLocal.picked}
        buttonLabel="Дальше"
        onNext={onNextStep}
      />
    )
  }

  const messages = step.chat?.messages || []
  const replies = step.chat?.replies || []
  const msgCount = messages.length

  return (
    <div className="stack anim-step">
      {tip}
      <p>{step.text}</p>
      <div className="chat">
        <strong>{step.chat?.npcName}</strong>
        {messages.map((m, i) => (
          <div
            key={`${m.from}-${i}`}
            className={`bubble ${m.from} anim-bubble`}
            style={{ animationDelay: `${0.15 + i * 0.22}s` }}
          >
            {m.text}
          </div>
        ))}
        <div
          className="typing-dots"
          aria-hidden="true"
          style={{ animationDelay: `${0.15 + msgCount * 0.22}s` }}
        >
          <span />
          <span />
          <span />
        </div>
      </div>
      <div className="choice-list chat-replies">
        {replies.map((c, i) => (
          <button
            key={c.id}
            type="button"
            className="btn pickable choice-enter"
            style={{
              animationDelay: `${0.55 + msgCount * 0.22 + i * 0.07}s`,
            }}
            onClick={(e) => {
              flashPick(e.currentTarget, 220, () => {
                saveChoice(c, step, onDecide, setStepLocal)
              })
            }}
          >
            {c.label}
          </button>
        ))}
      </div>
    </div>
  )
}
