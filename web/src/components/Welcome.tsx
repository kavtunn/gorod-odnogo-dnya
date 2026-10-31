import { useState } from 'react'

type Props = {
  playerName: string
  onName: (name: string) => void
  onStart: () => void
  onReset: () => void
}

const AGENDA = [
  {
    clock: '07:40',
    phase: 'Утро',
    line: 'Дом → сбор → переход через дорогу',
  },
  {
    clock: '08:30',
    phase: 'Школа',
    line: 'Эвакуация, столовая, решения в классе',
  },
  {
    clock: '15:00',
    phase: 'День',
    line: 'Река, двор, завод — город снаружи',
  },
  {
    clock: '20:10',
    phase: 'Вечер',
    line: 'Чат, ссылки, возврат домой',
  },
] as const

const BEATS = [
  { img: 'home.jpg', title: 'Дом', note: 'Сборы и привычки' },
  { img: 'road.jpg', title: 'Дорога', note: 'Переход и внимание' },
  { img: 'school.jpg', title: 'Школа', note: 'Безопасность класса' },
  { img: 'river.jpg', title: 'Город', note: 'Мусор, двор, завод' },
  { img: 'net.jpg', title: 'Сеть', note: 'Сообщения и ссылки' },
] as const

export function Welcome({ playerName, onName, onStart, onReset }: Props) {
  const [showHow, setShowHow] = useState(true)
  const base = import.meta.env.BASE_URL

  return (
    <div className="app-shell phase-morning welcome-shell">
      <header className="topbar">
        <div className="brand anim-in">
          Город <strong>одного дня</strong>
          <span className="brand-issue">Учебный день · БЖД · ЗОЖ · город</span>
        </div>
        <p className="welcome-dateline anim-in">
          Субботний выпуск · один проход от утра до вечера
        </p>
      </header>
      <div className="day-strip" aria-hidden="true">
        <div className="day-slot current">Утро</div>
        <div className="day-slot">Школа</div>
        <div className="day-slot">День</div>
        <div className="day-slot">Вечер</div>
      </div>
      <main className="main welcome-main">
        <section className="welcome-spread">
          <figure className="welcome-hero anim-in">
            <img
              src={`${base}img/home.jpg`}
              alt="Утро дома перед выходом в город"
              width={1200}
              height={700}
            />
            <figcaption>Кадр утра · дом перед выходом</figcaption>
          </figure>

          <div className="welcome-deck anim-in">
            <p className="welcome-kicker">07:40 · будильник уже орёт</p>
            <h1>Один день. Город отвечает на твои решения.</h1>
            <p className="welcome-lead">
              Заходишь в локации, выбираешь действие — и видишь следствие.
              Ошибки тоже считаются: у каждой выборки свой исход.
            </p>
          </div>

          <div className="welcome-beats anim-in" aria-label="Что встретится">
            {BEATS.map((b) => (
              <figure key={b.title} className="welcome-beat">
                <img
                  src={`${base}img/${b.img}`}
                  alt=""
                  width={320}
                  height={180}
                />
                <figcaption>
                  <strong>{b.title}</strong>
                  <span>{b.note}</span>
                </figcaption>
              </figure>
            ))}
          </div>

          <div className="welcome-grid">
            <div className="welcome-col start-col anim-in">
              <h2>Войти в день</h2>
              <p className="welcome-col-lead">
                Имя попадёт в журнал решений. Прогресс лежит в этом браузере.
              </p>
              <div className="field">
                <label htmlFor="name">Как тебя зовут</label>
                <input
                  id="name"
                  value={playerName}
                  placeholder="Имя"
                  onChange={(e) => onName(e.target.value)}
                />
              </div>
              <div className="welcome-actions">
                <button type="button" className="btn primary" onClick={onStart}>
                  Начать день
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() => setShowHow((v) => !v)}
                >
                  {showHow ? 'Свернуть правила' : 'Как устроено'}
                </button>
              </div>
              {showHow ? (
                <ol className="how-list">
                  <li>На карте открываешь доступную локацию.</li>
                  <li>В сцене выбираешь — даже «неправильный» путь даёт исход.</li>
                  <li>Журнал собирает решения по фазам дня.</li>
                  <li>Вечером — отчёт и короткий тест.</li>
                </ol>
              ) : null}
            </div>

            <aside className="welcome-col agenda-col anim-in">
              <h2>Маршрут дня</h2>
              <ul className="agenda-list">
                {AGENDA.map((row) => (
                  <li key={row.phase}>
                    <span className="agenda-clock">{row.clock}</span>
                    <span className="agenda-phase">{row.phase}</span>
                    <span className="agenda-line">{row.line}</span>
                  </li>
                ))}
              </ul>
              <p className="welcome-aside-note">
                Локации открываются по ходу дня. Нельзя перепрыгнуть утро —
                сначала дом и дорога.
              </p>
            </aside>
          </div>
        </section>
      </main>
      <footer className="footer">
        <button type="button" className="btn" onClick={onReset}>
          Сбросить прогресс
        </button>
      </footer>
    </div>
  )
}
