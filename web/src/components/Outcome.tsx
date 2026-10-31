import type { Choice, ChoiceOutcome, StepKind } from '../types'

type Props = {
  outcome: ChoiceOutcome
  consequence: string
  tip: string
}

function outcomeTag(outcome: ChoiceOutcome): string {
  if (outcome === 'safe') return 'Безопасно'
  if (outcome === 'risky') return 'Риск'
  return 'Урок'
}

function outcomeAnim(outcome: ChoiceOutcome): string {
  if (outcome === 'risky') return 'anim-shake'
  if (outcome === 'safe') return 'anim-safe'
  return 'anim-learn'
}

export function Outcome({ outcome, consequence, tip }: Props) {
  return (
    <div className={`result ${outcome} ${outcomeAnim(outcome)}`}>
      <div className={`tag ${outcome}`}>{outcomeTag(outcome)}</div>
      <p>{consequence}</p>
      <p className="muted">{tip}</p>
    </div>
  )
}

export function outcomeFromChoice(choice: Choice) {
  return (
    <Outcome
      outcome={choice.outcome}
      consequence={choice.consequence}
      tip={choice.tip}
    />
  )
}

export function stepHint(kind: StepKind): string {
  switch (kind) {
    case 'narration':
      return 'Прочитай текст и нажми «Дальше».'
    case 'choice':
      return 'Выбери один вариант — увидишь следствие.'
    case 'hotspot':
      return 'Отметь места на фото — любой набор даст свой исход.'
    case 'checklist':
      return 'Отметь любой набор — у каждого будет свой исход.'
    case 'sort':
      return 'Сначала предмет, потом бак — затем «Проверить».'
    case 'chat':
      return 'Выбери ответ в переписке. Код из СМС никому не отдают.'
    default: {
      const _never: never = kind
      return _never
    }
  }
}
