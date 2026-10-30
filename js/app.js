(function () {
  const KEY = 'gorod-odnogo-dnya-v1';
  let C = null;

  const initial = {
    playerName: '',
    onboarded: false,
    dayFinished: false,
    phase: 'morning',
    completedScenes: [],
    decisions: [],
    unlockedLocations: ['home'],
    quizScore: null,
  };

  let state = load();
  let view = state.onboarded ? 'map' : 'welcome';
  let sceneId = null;
  let stepIndex = 0;
  let sceneDone = false;
  let endedDay = false;
  let showHow = false;
  let stepLocal = {};
  let quizAnswers = {};
  let quizSubmitted = false;

  const app = document.getElementById('app');

  function load() {
    try {
      return { ...initial, ...JSON.parse(localStorage.getItem(KEY) || '{}') };
    } catch {
      return { ...initial };
    }
  }

  function save() {
    localStorage.setItem(KEY, JSON.stringify(state));
  }

  function setState(patch) {
    state = { ...state, ...patch };
    save();
  }


  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function phase() {
    return C.phases.find((p) => p.id === state.phase) || C.phases[0];
  }

  function locById(id) {
    return C.locations.find((l) => l.id === id);
  }

  function visibleLocations() {
    return C.locations;
  }

  function sceneOrder() {
    return visibleLocations().map((l) => l.sceneId);
  }

  function getNextSceneId() {
    if (endedDay || state.dayFinished) return null;
    const order = sceneOrder();
    const i = order.indexOf(sceneId);
    if (i < 0) return null;
    for (let n = i + 1; n < order.length; n++) {
      const nextId = order[n];
      const loc = C.locations.find((l) => l.sceneId === nextId);
      if (!loc) continue;
      if (state.unlockedLocations.includes(loc.id)) {
        return nextId;
      }
    }
    return null;
  }

  function openScene(id) {
    sceneId = id;
    stepIndex = 0;
    sceneDone = false;
    endedDay = false;
    stepLocal = {};
    view = 'scene';
    render();
  }

  function artTitle(locId) {
    const loc = locById(locId);
    return (C.artTitles && C.artTitles[locId]) || (loc && loc.name) || locId;
  }

  function artHtml(locId) {
    const loc = locById(locId);
    const src = loc && loc.image ? loc.image : '../img/' + locId + '.jpg';
    const title = artTitle(locId);
    return (
      '<figure class="scene-art anim-scene">' +
      '<img src="' +
      esc(src) +
      '" alt="' +
      esc(title) +
      '" width="1200" height="700" loading="lazy" />' +
      '<figcaption>' +
      esc(title) +
      '</figcaption></figure>'
    );
  }

  function stepHint(kind) {
    switch (kind) {
      case 'narration':
        return 'Прочитай текст и нажми «Дальше».';
      case 'choice':
        return 'Выбери один вариант — увидишь следствие решения.';
      case 'hotspot':
        return 'Нажимай на важные места на фото. Нужны все верные точки.';
      case 'checklist':
        return 'Отметь только то, что действительно нужно по ситуации.';
      case 'sort':
        return 'Сначала выбери предмет, потом контейнер. Потом — «Проверить».';
      case 'chat':
        return 'Выбери ответ в переписке. Код из СМС никому не отдают.';
      default: {
        const _exhaustive = kind;
        void _exhaustive;
        return 'Следуй подсказке на экране.';
      }
    }
  }

  function hintHtml(kind) {
    return '<p class="step-hint">' + esc(stepHint(kind)) + '</p>';
  }

  function decisionStats() {
    const counts = { safe: 0, risky: 0, learn: 0 };
    state.decisions.forEach((d) => {
      if (d.outcome === 'safe') counts.safe += 1;
      else if (d.outcome === 'risky') counts.risky += 1;
      else counts.learn += 1;
    });
    return counts;
  }

  function dayStripHtml() {
    const cur = C.phases.findIndex((x) => x.id === state.phase);
    return (
      '<div class="day-strip" aria-label="Фазы дня">' +
      C.phases
        .map((ph, i) => {
          const cls =
            i < cur ? 'day-slot done' : i === cur ? 'day-slot current' : 'day-slot';
          const clock = i === cur ? ' · ' + ph.clock : '';
          return (
            '<div class="' +
            cls +
            '">' +
            esc(ph.label) +
            esc(clock) +
            '</div>'
          );
        })
        .join('') +
      '</div>'
    );
  }

  function shell(inner) {
    return (
      '<header class="topbar">' +
      '<div class="brand">Город <strong>одного дня</strong></div>' +
      '<nav class="nav">' +
      btnNav('map', 'Карта') +
      btnNav('quiz', 'Тест') +
      '</nav></header>' +
      dayStripHtml() +
      '<main class="main">' +
      inner +
      '</main><footer class="footer">' +
      '<button type="button" class="btn" data-action="reset">Сброс прогресса</button>' +
      '</footer>'
    );
  }

  function btnNav(v, label) {
    return (
      '<button type="button" data-nav="' +
      v +
      '" class="' +
      (view === v ? 'active' : '') +
      '">' +
      label +
      '</button>'
    );
  }

  function renderWelcome() {
    return (
      '<header class="topbar">' +
      '<div class="brand">Город <strong>одного дня</strong></div>' +
      '</header>' +
      '<div class="day-strip" aria-hidden="true">' +
      '<div class="day-slot current">Утро</div>' +
      '<div class="day-slot">Школа</div>' +
      '<div class="day-slot">День</div>' +
      '<div class="day-slot">Вечер</div>' +
      '</div>' +
      '<main class="main"><section class="board stack">' +
      '<h1>Сводка города</h1>' +
      '<p>Один учебный день: дорога, школа, еда, река, двор, завод и сеть. Решения вместо лозунгов.</p>' +
      '<div class="welcome-sky" aria-hidden="true"></div>' +
      '<div class="field"><label for="name">Имя</label>' +
      '<input id="name" data-bind="name" value="' +
      esc(state.playerName) +
      '" placeholder="Как тебя зовут" /></div>' +
      '<div class="choice-list">' +
      '<button type="button" class="btn primary" data-action="start">Начать день</button>' +
      '<button type="button" class="btn" data-action="toggle-how">' +
      (showHow ? 'Скрыть подсказку' : 'Как играть') +
      '</button></div>' +
      (showHow
        ? '<ol class="how-list"><li>Открой ячейку на карте.</li><li>Пройди сцену и сделай выбор.</li><li>Прогресс сохраняется — можно продолжить позже.</li><li>В конце дня — финал и тест.</li></ol>'
        : '') +
      '</section></main><footer class="footer">' +
      '<button type="button" class="btn" data-action="reset">Сброс прогресса</button>' +
      '</footer>'
    );
  }

  function renderDayComplete() {
    const total = C.locations.length;
    const stats = decisionStats();
    const modules = Array.from(
      new Set(
        C.locations
          .filter((l) => state.completedScenes.includes(l.sceneId))
          .map((l) => C.moduleLabels[l.module]),
      ),
    );
    return (
      '<section class="board stack finale anim-scene">' +
      '<h1>День завершён</h1>' +
      '<p>' +
      (state.playerName ? esc(state.playerName) + ', ' : '') +
      'ты прошёл ' +
      state.completedScenes.length +
      ' из ' +
      total +
      ' локаций.</p>' +
      '<div class="finale-stats">' +
      '<div class="stat safe"><span class="stat-n">' +
      stats.safe +
      '</span><span class="stat-l">безопасно</span></div>' +
      '<div class="stat learn"><span class="stat-n">' +
      stats.learn +
      '</span><span class="stat-l">урок</span></div>' +
      '<div class="stat risky"><span class="stat-n">' +
      stats.risky +
      '</span><span class="stat-l">риск</span></div>' +
      '</div>' +
      (modules.length
        ? '<p class="muted">Темы дня: ' + esc(modules.join(' · ')) + '</p>'
        : '') +
      '<p>Закрепи день коротким тестом.</p>' +
      '<div class="choice-list">' +
      '<button type="button" class="btn primary" data-nav="quiz">Пройти тест</button>' +
      '<button type="button" class="btn" data-action="restart">Начать день заново</button>' +
      '</div></section>'
    );
  }

  function renderMap() {
    if (state.dayFinished) return renderDayComplete();
    const list = visibleLocations();
    const doneCount = list.filter((l) => state.completedScenes.includes(l.sceneId)).length;
    const pct = list.length ? Math.round((doneCount / list.length) * 100) : 0;
    const p = phase();

    const cells = list
      .map((loc) => {
        const unlocked = state.unlockedLocations.includes(loc.id);
        const done = state.completedScenes.includes(loc.sceneId);
        const cls = done ? 'loc done' : unlocked ? 'loc on' : 'loc';
        const caption = artTitle(loc.id);
        return (
          '<button type="button" class="' +
          cls +
          '" data-open-scene="' +
          loc.sceneId +
          '" ' +
          (unlocked ? '' : 'disabled') +
          '>' +
          '<span class="loc-media">' +
          '<img class="loc-thumb" src="' +
          esc(loc.image) +
          '" alt="' +
          esc(caption) +
          '" />' +
          '<span class="loc-caption">' +
          esc(caption) +
          '</span></span>' +
          '<span class="code">' +
          esc(loc.short) +
          '</span><span class="meta">' +
          esc(loc.name) +
          '<br/>' +
          esc(C.moduleLabels[loc.module]) +
          (done ? ' · готово' : unlocked ? ' · открыто' : ' · позже') +
          '</span></button>'
        );
      })
      .join('');

    const ctaLabel = doneCount > 0 ? 'Продолжить день' : 'Начать утро';
    const resume =
      doneCount > 0
        ? '<div class="resume-banner anim-in">Ты на фазе «' +
          esc(p.label) +
          '» · ' +
          esc(p.clock) +
          '. Пройдено ' +
          doneCount +
          ' из ' +
          list.length +
          '. Открытые ячейки ждут.</div>'
        : '';

    return (
      '<section class="board"><div class="hero"><div>' +
      '<h1>Сводка города</h1>' +
      '<p class="muted">' +
      'Локации дня — ячейки маршрута. Решения вместо лозунгов.' +
      '</p>' +
      resume +
      '<div class="progress-label">Прогресс дня: ' +
      doneCount +
      ' / ' +
      list.length +
      ' (' +
      pct +
      '%)</div>' +
      '<div class="progress-track"><div class="progress-fill" style="transform:scaleX(' +
      pct / 100 +
      ')"></div></div>' +
      '<div class="field" style="margin-top:14px"><label for="name2">Имя</label>' +
      '<input id="name2" data-bind="name" value="' +
      esc(state.playerName) +
      '" /></div></div><div>' +
      '<div class="big-time">' +
      esc(p.clock) +
      '</div>' +
      '<p class="muted">Сейчас: ' +
      esc(p.label) +
      '</p>' +
      '<div class="map-cta"><button type="button" class="btn primary" data-action="start-first">' +
      esc(ctaLabel) +
      '</button></div></div></div>' +
      '<h2>Карта города</h2><div class="grid-map">' +
      cells +
      '</div></section>'
    );
  }

  function outcomeHtml(o) {
    const tag = o.outcome === 'safe' ? 'Безопасно' : o.outcome === 'risky' ? 'Риск' : 'Урок';
    const anim =
      o.outcome === 'risky'
        ? 'anim-shake'
        : o.outcome === 'safe'
          ? 'anim-safe'
          : 'anim-learn';
    return (
      '<div class="result ' +
      o.outcome +
      ' ' +
      anim +
      '"><div class="tag ' +
      o.outcome +
      '">' +
      tag +
      '</div><p>' +
      esc(o.consequence) +
      '</p><p class="muted">' +
      esc(o.tip) +
      '</p></div>'
    );
  }

  function renderStep(scene, step) {
    const tip = hintHtml(step.kind);
    if (step.kind === 'narration') {
      return (
        '<div class="stack anim-step">' +
        tip +
        '<p>' +
        esc(step.text) +
        '</p><button type="button" class="btn primary" data-action="next-step">Дальше</button></div>'
      );
    }
    if (step.kind === 'choice') {
      if (stepLocal.picked) {
        return (
          '<div class="stack">' +
          outcomeHtml(stepLocal.picked) +
          '<button type="button" class="btn primary" data-action="next-step">Продолжить</button></div>'
        );
      }
      return (
        '<div class="stack anim-step">' +
        tip +
        '<p>' +
        esc(step.text) +
        '</p><div class="choice-list">' +
        step.choices
          .map(
            (c) =>
              '<button type="button" class="btn" data-choice="' +
              c.id +
              '">' +
              esc(c.label) +
              '</button>',
          )
          .join('') +
        '</div></div>'
      );
    }
    if (step.kind === 'hotspot') {
      const need = step.hotspots.filter((h) => h.correct).length;
      const found = stepLocal.found || [];
      const good = step.hotspots.filter((h) => h.correct && found.includes(h.id)).length;
      const tips = step.hotspots
        .filter((h) => found.includes(h.id))
        .map((h) => h.tip)
        .join(' · ');
      const road = locById('road');
      return (
        '<div class="stack anim-step">' +
        tip +
        '<p>' +
        esc(step.text) +
        '</p><div class="hotspot-stage">' +
        '<img src="' +
        esc(road.image) +
        '" alt="' +
        esc(artTitle('road')) +
        '" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0.9" />' +
        step.hotspots
          .map((h) => {
            const is = found.includes(h.id);
            const cls = !is ? 'hotspot' : h.correct ? 'hotspot good' : 'hotspot bad';
            return (
              '<button type="button" class="' +
              cls +
              (is ? ' anim-pop' : '') +
              '" style="left:' +
              h.x +
              '%;top:' +
              h.y +
              '%" data-hotspot="' +
              h.id +
              '">' +
              esc(h.label) +
              '</button>'
            );
          })
          .join('') +
        '</div>' +
        (tips ? '<p class="muted">' + esc(tips) + '</p>' : '') +
        '<button type="button" class="btn primary" data-action="next-step" ' +
        (good < need ? 'disabled' : '') +
        '>Дальше (' +
        good +
        '/' +
        need +
        ')</button></div>'
      );
    }
    if (step.kind === 'checklist') {
      const checked = stepLocal.checked || [];
      const required = step.checklist.filter((c) => c.required).map((c) => c.id);
      const ok =
        required.every((id) => checked.includes(id)) &&
        step.checklist.every((c) =>
          c.required ? checked.includes(c.id) : !checked.includes(c.id),
        );
      return (
        '<div class="stack anim-step">' +
        tip +
        '<p>' +
        esc(step.text) +
        '</p><div class="stack checklist">' +
        step.checklist
          .map(
            (c) =>
              '<label><input type="checkbox" data-check="' +
              c.id +
              '" ' +
              (checked.includes(c.id) ? 'checked' : '') +
              '/><span>' +
              esc(c.label) +
              '</span></label>',
          )
          .join('') +
        '</div><button type="button" class="btn primary" data-action="next-step" ' +
        (ok ? '' : 'disabled') +
        '>Подтвердить</button></div>'
      );
    }
    if (step.kind === 'sort') {
      if (stepLocal.sortDone) {
        const allOk = step.sort.items.every((i) => (stepLocal.placed || {})[i.id] === i.bin);
        return (
          '<div class="stack">' +
          outcomeHtml({
            outcome: allOk ? 'safe' : 'learn',
            consequence: allOk
              ? 'Все на месте. Берег чище.'
              : 'Часть вещей не туда. Грязное и чистое не смешивают.',
            tip: 'Не уверен — в смешанные.',
          }) +
          '<button type="button" class="btn primary" data-action="next-step">Дальше</button></div>'
        );
      }
      const placed = stepLocal.placed || {};
      const selected = stepLocal.selectedItem || null;
      return (
        '<div class="stack anim-step">' +
        tip +
        '<p>' +
        esc(step.text) +
        '</p><div class="stack">' +
        step.sort.items
          .filter((i) => !placed[i.id])
          .map(
            (i) =>
              '<button type="button" class="sort-item' +
              (selected === i.id ? ' bin active' : '') +
              '" data-sort-item="' +
              i.id +
              '">' +
              esc(i.label) +
              '</button>',
          )
          .join('') +
        '</div><div class="bins">' +
        step.sort.bins
          .map(
            (b) =>
              '<button type="button" class="bin" data-sort-bin="' +
              b.id +
              '">' +
              esc(b.label) +
              '</button>',
          )
          .join('') +
        '</div><button type="button" class="btn primary" data-action="check-sort" ' +
        (Object.keys(placed).length < step.sort.items.length ? 'disabled' : '') +
        '>Проверить</button></div>'
      );
    }
    if (step.kind === 'chat') {
      if (stepLocal.picked) {
        return (
          '<div class="stack">' +
          outcomeHtml(stepLocal.picked) +
          '<button type="button" class="btn primary" data-action="next-step">Дальше</button></div>'
        );
      }
      return (
        '<div class="stack anim-step">' +
        tip +
        '<p>' +
        esc(step.text) +
        '</p><div class="chat"><strong>' +
        esc(step.chat.npcName) +
        '</strong>' +
        step.chat.messages
          .map(
            (m, i) =>
              '<div class="bubble ' +
              m.from +
              ' anim-bubble" style="animation-delay:' +
              i * 0.12 +
              's">' +
              esc(m.text) +
              '</div>',
          )
          .join('') +
        '</div><div class="choice-list">' +
        step.chat.replies
          .map(
            (c) =>
              '<button type="button" class="btn" data-chat-choice="' +
              c.id +
              '">' +
              esc(c.label) +
              '</button>',
          )
          .join('') +
        '</div></div>'
      );
    }
    return '<button type="button" class="btn primary" data-action="next-step">Дальше</button>';
  }

  function renderScene() {
    const scene = C.scenes[sceneId];
    if (!scene) return '<p>Сцена не найдена</p>';
    const loc = locById(scene.locationId);

    if (sceneDone) {
      const nextId = getNextSceneId();
      const nextLoc = nextId
        ? C.locations.find((l) => l.sceneId === nextId)
        : null;
      return (
        '<section class="panel stack anim-scene">' +
        artHtml(scene.locationId) +
        '<h1>' +
        esc(scene.title) +
        '</h1><p>' +
        esc(scene.summary) +
        '</p>' +
        '<div class="map-cta">' +
        (endedDay
          ? '<button type="button" class="btn primary" data-nav="map">К финалу дня</button>'
          : nextId
            ? '<button type="button" class="btn primary" data-action="next-scene">Дальше: ' +
              esc(nextLoc ? nextLoc.name : 'следующая сцена') +
              '</button>'
            : '') +
        '<button type="button" class="btn" data-nav="map">На карту</button></div></section>'
      );
    }

    const step = scene.steps[stepIndex];
    return (
      '<section class="panel stack anim-scene">' +
      artHtml(scene.locationId) +
      '<p class="muted">' +
      esc(loc ? loc.name : '') +
      ' · ' +
      esc(C.moduleLabels[scene.module]) +
      ' · шаг ' +
      (stepIndex + 1) +
      '/' +
      scene.steps.length +
      '</p><h1>' +
      esc(scene.title) +
      '</h1>' +
      renderStep(scene, step) +
      '</section>'
    );
  }


  function renderQuiz() {
    if (quizSubmitted) {
      const score = C.quiz.reduce(
        (n, q) => n + (quizAnswers[q.id] === q.correct ? 1 : 0),
        0,
      );
      return (
        '<div class="stack anim-scene"><section class="panel"><h1>Результат: ' +
        score +
        ' / ' +
        C.quiz.length +
        '</h1><p class="muted">Можно вернуться на карту или пройти день заново.</p></section>' +
        C.quiz
          .map(
            (q) =>
              '<section class="panel"><h2>' +
              esc(q.question) +
              '</h2><p class="muted">' +
              esc(q.explain) +
              '</p></section>',
          )
          .join('') +
        '<div class="choice-list"><button type="button" class="btn" data-nav="map">На карту</button>' +
        '<button type="button" class="btn" data-action="restart">Начать день заново</button></div></div>'
      );
    }
    return (
      '<div class="stack anim-scene"><section class="panel"><h1>Тест</h1>' +
      '<p class="muted">9 вопросов по темам дня. Выбери ответ в каждом блоке.</p></section>' +
      C.quiz
        .map(
          (q, i) =>
            '<section class="panel stack"><h2>' +
            (i + 1) +
            '. ' +
            esc(q.question) +
            '</h2><div class="choice-list">' +
            q.options
              .map(
                (opt, idx) =>
                  '<button type="button" class="btn' +
                  (quizAnswers[q.id] === idx ? ' primary' : '') +
                  '" data-quiz="' +
                  q.id +
                  '" data-idx="' +
                  idx +
                  '">' +
                  esc(opt) +
                  '</button>',
              )
              .join('') +
            '</div></section>',
        )
        .join('') +
      '<button type="button" class="btn safe" data-action="submit-quiz" ' +
      (Object.keys(quizAnswers).length < C.quiz.length ? 'disabled' : '') +
      '>Сдать тест</button></div>'
    );
  }


  function render() {
    if (!C) return;
    if (!state.onboarded || view === 'welcome') {
      app.innerHTML = renderWelcome();
      bind();
      return;
    }
    let inner = '';
    if (view === 'map') inner = renderMap();
    else if (view === 'scene') inner = renderScene();
    else if (view === 'quiz') inner = renderQuiz();
    else inner = renderMap();
    app.innerHTML = shell(inner);
    bind();
  }

  function completeCurrentScene() {
    const meta = C.unlockAfter[sceneId] || { unlock: [], phase: state.phase };
    const unlocks = meta.unlock;
    const nextCompleted = state.completedScenes.includes(sceneId)
      ? state.completedScenes
      : state.completedScenes.concat(sceneId);
    const unlocked = Array.from(new Set(state.unlockedLocations.concat(unlocks)));
    const dayDone = C.locations.every((l) => nextCompleted.includes(l.sceneId));
    endedDay = dayDone;
    setState({
      completedScenes: nextCompleted,
      unlockedLocations: unlocked,
      phase: meta.phase,
      dayFinished: dayDone || state.dayFinished,
    });
    sceneDone = true;
  }

  function addDecision(choice, step) {
    setState({
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
    });
  }

  function startDay() {
    setState({
      ...initial,
      onboarded: true,
      playerName: state.playerName,
    });
    view = 'map';
    render();
  }


  function bind() {
    app.querySelectorAll('[data-nav]').forEach((el) => {
      el.addEventListener('click', () => {
        view = el.getAttribute('data-nav');
        render();
      });
    });
    app.querySelectorAll('[data-bind="name"]').forEach((el) => {
      el.addEventListener('input', () => setState({ playerName: el.value }));
    });
    const act = (name, fn) => {
      app.querySelectorAll('[data-action="' + name + '"]').forEach((el) =>
        el.addEventListener('click', fn),
      );
    };
    act('toggle-how', () => {
      showHow = !showHow;
      render();
    });
    act('start', () => startDay());
    act('restart', () => startDay());
    act('start-first', () => {
      const list = visibleLocations();
      const first =
        list.find(
          (l) =>
            state.unlockedLocations.includes(l.id) &&
            !state.completedScenes.includes(l.sceneId),
        ) || list.find((l) => state.unlockedLocations.includes(l.id));
      if (!first) return;
      openScene(first.sceneId);
    });
    act('next-scene', () => {
      const nextId = getNextSceneId();
      if (!nextId) {
        view = 'map';
        render();
        return;
      }
      openScene(nextId);
    });
    act('next-step', () => {
      const scene = C.scenes[sceneId];
      if (stepIndex >= scene.steps.length - 1) completeCurrentScene();
      else {
        stepIndex += 1;
        stepLocal = {};
      }
      render();
    });
    act('check-sort', () => {
      const scene = C.scenes[sceneId];
      const step = scene.steps[stepIndex];
      const placed = stepLocal.placed || {};
      const allOk = step.sort.items.every((i) => placed[i.id] === i.bin);
      stepLocal.sortDone = true;
      render();
    });
    act('submit-quiz', () => {
      const score = C.quiz.reduce(
        (n, q) => n + (quizAnswers[q.id] === q.correct ? 1 : 0),
        0,
      );
      quizSubmitted = true;
      setState({ quizScore: score });
      render();
    });

    act('reset', () => {
      if (confirm('Сбросить прогресс?')) {
        localStorage.removeItem(KEY);
        state = { ...initial };
        sceneId = null;
        stepIndex = 0;
        sceneDone = false;
        endedDay = false;
        showHow = false;
        stepLocal = {};
        quizAnswers = {};
        quizSubmitted = false;
        view = 'welcome';
        render();
      }
    });

    app.querySelectorAll('[data-open-scene]').forEach((el) => {
      el.addEventListener('click', () => {
        openScene(el.getAttribute('data-open-scene'));
      });
    });
    app.querySelectorAll('[data-choice]').forEach((el) => {
      el.addEventListener('click', () => {
        const scene = C.scenes[sceneId];
        const step = scene.steps[stepIndex];
        const choice = step.choices.find((c) => c.id === el.getAttribute('data-choice'));
        addDecision(choice, step);
        stepLocal.picked = choice;
        render();
      });
    });
    app.querySelectorAll('[data-chat-choice]').forEach((el) => {
      el.addEventListener('click', () => {
        const scene = C.scenes[sceneId];
        const step = scene.steps[stepIndex];
        const choice = step.chat.replies.find((c) => c.id === el.getAttribute('data-chat-choice'));
        addDecision(choice, step);
        stepLocal.picked = choice;
        render();
      });
    });
    app.querySelectorAll('[data-hotspot]').forEach((el) => {
      el.addEventListener('click', () => {
        const id = el.getAttribute('data-hotspot');
        const scene = C.scenes[sceneId];
        const step = scene.steps[stepIndex];
        const h = step.hotspots.find((x) => x.id === id);
        const found = stepLocal.found || [];
        if (found.includes(id)) return;
        stepLocal.found = found.concat(id);
        render();
      });
    });
    app.querySelectorAll('[data-check]').forEach((el) => {
      el.addEventListener('change', () => {
        const id = el.getAttribute('data-check');
        let checked = stepLocal.checked || [];
        if (el.checked) checked = checked.concat(id);
        else checked = checked.filter((x) => x !== id);
        stepLocal.checked = checked;
        render();
      });
    });
    app.querySelectorAll('[data-sort-item]').forEach((el) => {
      el.addEventListener('click', () => {
        stepLocal.selectedItem = el.getAttribute('data-sort-item');
        render();
      });
    });
    app.querySelectorAll('[data-sort-bin]').forEach((el) => {
      el.addEventListener('click', () => {
        if (!stepLocal.selectedItem) return;
        stepLocal.placed = {
          ...(stepLocal.placed || {}),
          [stepLocal.selectedItem]: el.getAttribute('data-sort-bin'),
        };
        stepLocal.selectedItem = null;
        render();
      });
    });
    app.querySelectorAll('[data-quiz]').forEach((el) => {
      el.addEventListener('click', () => {
        quizAnswers[el.getAttribute('data-quiz')] = Number(el.getAttribute('data-idx'));
        render();
      });
    });
  }

  fetch('../json/city.json')
    .then((r) => {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    })
    .then((json) => {
      C = json;
      view = state.onboarded ? 'map' : 'welcome';
      render();
    })
    .catch(() => {
      app.innerHTML =
        '<main class="main"><section class="boot-error"><h1>Нужен локальный сервер</h1>' +
        '<p>JSON не грузится с file://. Запусти:</p>' +
        '<pre>cd gorod\npython3 -m http.server 8080</pre>' +
        '<p>Открой <a href="http://127.0.0.1:8080/html/">http://127.0.0.1:8080/html/</a></p></section></main>';
    });
})();
