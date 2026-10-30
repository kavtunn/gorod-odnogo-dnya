import { useState } from 'react'

type Props = {
  playerName: string
  onName: (name: string) => void
  onStart: () => void
  onReset: () => void
}

export function Welcome({ playerName, onName, onStart, onReset }: Props) {
  const [showHow, setShowHow] = useState(false)

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          Город <strong>одного дня</strong>
        </div>
      </header>
      <div className="day-strip" aria-hidden="true">
        <div className="day-slot current">Утро</div>
        <div className="day-slot">Школа</div>
        <div className="day-slot">День</div>
        <div className="day-slot">Вечер</div>
      </div>
      <main className="main">
        <section className="board stack">
          <h1>Сводка города</h1>
          <p>
            Один учебный день: дорога, школа, еда, река, двор, завод и сеть. Решения
            вместо лозунгов.
          </p>
          <div className="welcome-sky" aria-hidden="true" />
          <div className="field">
            <label htmlFor="name">Имя</label>
            <input
              id="name"
              value={playerName}
              placeholder="Как тебя зовут"
              onChange={(e) => onName(e.target.value)}
            />
          </div>
          <div className="choice-list">
            <button type="button" className="btn primary" onClick={onStart}>
              Начать день
            </button>
            <button type="button" className="btn" onClick={() => setShowHow((v) => !v)}>
              {showHow ? 'Скрыть подсказку' : 'Как играть'}
            </button>
          </div>
          {showHow ? (
            <ol className="how-list">
              <li>Открой ячейку на карте.</li>
              <li>Пройди сцену и сделай выбор.</li>
              <li>Прогресс сохраняется — можно продолжить позже.</li>
              <li>В конце дня — финал и тест.</li>
            </ol>
          ) : null}
        </section>
      </main>
      <footer className="footer">
        <button type="button" className="btn" onClick={onReset}>
          Сброс прогресса
        </button>
      </footer>
    </div>
  )
}
