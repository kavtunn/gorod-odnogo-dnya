import type { CityData } from '../types'
import { flashPick } from '../utils/flashPick'

type Props = {
  city: CityData
  answers: Record<string, number>
  submitted: boolean
  score: number | null
  playerName?: string
  onAnswer: (id: string, idx: number) => void
  onSubmit: () => void
  onMap: () => void
  onRestart: () => void
}

function getVerdict(score: number, total: number) {
  const ratio = total === 0 ? 0 : score / total

  if (ratio >= 0.9) {
    return {
      title: 'День закрыт на отлично',
      line: 'Почти без промахов. Город бы кивнул.',
      tone: 'safe' as const,
    }
  }

  if (ratio >= 0.6) {
    return {
      title: 'День закрыт',
      line: 'Основное усвоено. Пара мест ещё стоит перечитать в журнале.',
      tone: 'learn' as const,
    }
  }

  return {
    title: 'День закрыт — есть над чем подумать',
    line: 'Ошибки тоже опыт. Завтра можно пройти маршрут ещё раз.',
    tone: 'risky' as const,
  }
}

function countScore(
  city: CityData,
  answers: Record<string, number>,
  saved: number | null,
) {
  if (saved != null) return saved

  let score = 0
  for (const q of city.quiz) {
    if (answers[q.id] === q.correct) score += 1
  }
  return score
}

export function QuizView({
  city,
  answers,
  submitted,
  score,
  playerName,
  onAnswer,
  onSubmit,
  onMap,
  onRestart,
}: Props) {
  if (submitted) {
    const finalScore = countScore(city, answers, score)
    const verdict = getVerdict(finalScore, city.quiz.length)
    const namePrefix = playerName?.trim() ? `${playerName.trim()}, ` : ''

    return (
      <div className="stack anim-scene quiz-finale">
        <section
          className={`panel quiz-stamp result ${verdict.tone} anim-stamp`}
        >
          <p className="quiz-stamp-mark" aria-hidden="true">
            СДАНО
          </p>
          <h1>{verdict.title}</h1>
          <p className="quiz-score-line">
            <span className="stat-n">{finalScore}</span>
            <span className="quiz-score-of">из {city.quiz.length}</span>
          </p>
          <p>
            {namePrefix}
            {verdict.line}
          </p>
          <p className="muted">Тест зафиксирован. Можно свернуть ответы ниже.</p>
        </section>

        {city.quiz.map((q, i) => {
          const picked = answers[q.id]
          const ok = picked === q.correct

          return (
            <section
              key={q.id}
              className={`panel quiz-review ${ok ? 'ok' : 'miss'} choice-enter`}
              style={{ animationDelay: `${0.06 + i * 0.05}s` }}
            >
              <p className={`tag ${ok ? 'safe' : 'risky'}`}>
                {ok ? 'Верно' : 'Мимо'}
              </p>
              <h2>
                {i + 1}. {q.question}
              </h2>
              <p>
                Твой ответ:{' '}
                <strong>{picked == null ? '—' : q.options[picked]}</strong>
              </p>
              {!ok ? (
                <p className="muted">Верный: {q.options[q.correct]}</p>
              ) : null}
              <p className="muted">{q.explain}</p>
            </section>
          )
        })}

        <div className="choice-list">
          <button type="button" className="btn primary" onClick={onMap}>
            На карту
          </button>
          <button type="button" className="btn" onClick={onRestart}>
            Пройти день заново
          </button>
        </div>
      </div>
    )
  }

  const ready = Object.keys(answers).length >= city.quiz.length

  return (
    <div className="stack anim-scene">
      <section className="panel">
        <h1>Тест</h1>
        <p className="muted">
          {city.quiz.length} вопросов по темам дня. Отметь ответ в каждом блоке.
        </p>
      </section>

      {city.quiz.map((q, i) => (
        <section key={q.id} className="panel stack">
          <h2>
            {i + 1}. {q.question}
          </h2>
          <div className="choice-list">
            {q.options.map((opt, idx) => {
              const selected = answers[q.id] === idx
              let className = 'btn pickable'
              if (selected) className += ' primary is-picked'

              return (
                <button
                  key={opt}
                  type="button"
                  className={className}
                  onClick={(e) => {
                    flashPick(e.currentTarget, 0, () => {
                      onAnswer(q.id, idx)
                    })
                  }}
                >
                  {opt}
                </button>
              )
            })}
          </div>
        </section>
      ))}

      <button
        type="button"
        className="btn safe"
        disabled={!ready}
        onClick={onSubmit}
      >
        Сдать тест
      </button>
    </div>
  )
}
