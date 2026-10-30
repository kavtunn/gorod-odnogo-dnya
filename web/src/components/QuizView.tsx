import type { CityData } from '../types'

type Props = {
  city: CityData
  answers: Record<string, number>
  submitted: boolean
  score: number | null
  onAnswer: (id: string, idx: number) => void
  onSubmit: () => void
  onMap: () => void
  onRestart: () => void
}

export function QuizView({
  city,
  answers,
  submitted,
  score,
  onAnswer,
  onSubmit,
  onMap,
  onRestart,
}: Props) {
  if (submitted) {
    const finalScore =
      score ??
      city.quiz.reduce((n, q) => n + (answers[q.id] === q.correct ? 1 : 0), 0)

    return (
      <div className="stack anim-scene">
        <section className="panel">
          <h1>
            Результат: {finalScore} / {city.quiz.length}
          </h1>
          <p className="muted">Можно вернуться на карту или пройти день заново.</p>
        </section>
        {city.quiz.map((q) => (
          <section key={q.id} className="panel">
            <h2>{q.question}</h2>
            <p className="muted">{q.explain}</p>
          </section>
        ))}
        <div className="choice-list">
          <button type="button" className="btn" onClick={onMap}>
            На карту
          </button>
          <button type="button" className="btn" onClick={onRestart}>
            Начать день заново
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
        <p className="muted">9 вопросов по темам дня. Выбери ответ в каждом блоке.</p>
      </section>
      {city.quiz.map((q, i) => (
        <section key={q.id} className="panel stack">
          <h2>
            {i + 1}. {q.question}
          </h2>
          <div className="choice-list">
            {q.options.map((opt, idx) => (
              <button
                key={opt}
                type="button"
                className={`btn${answers[q.id] === idx ? ' primary' : ''}`}
                onClick={() => onAnswer(q.id, idx)}
              >
                {opt}
              </button>
            ))}
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
