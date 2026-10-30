import type { Choice, ChoiceOutcome } from '../types'

type Props = {
  outcome: ChoiceOutcome
  consequence: string
  tip: string
}

export function Outcome({ outcome, consequence, tip }: Props) {
  const tag = outcome === 'safe' ? 'Безопасно' : outcome === 'risky' ? 'Риск' : 'Урок'
  const anim =
    outcome === 'risky' ? 'anim-shake' : outcome === 'safe' ? 'anim-safe' : 'anim-learn'

  return (
    <div className={`result ${outcome} ${anim}`}>
      <div className={`tag ${outcome}`}>{tag}</div>
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

export function stepHint(kind: string): string {
  switch (kind) {
    case 'narration':
      return 'Прочитай текст и нажми «Дальше».'
    case 'choice':
      return 'Выбери один вариант — увидишь следствие решения.'
    case 'hotspot':
      return 'Нажимай на важные места на фото. Нужны все верные точки.'
    case 'checklist':
      return 'Отметь только то, что действительно нужно по ситуации.'
    case 'sort':
      return 'Сначала выбери предмет, потом контейнер. Потом — «Проверить».'
    case 'chat':
      return 'Выбери ответ в переписке. Код из СМС никому не отдают.'
    default:
      return 'Следуй подсказке на экране.'
  }
}
