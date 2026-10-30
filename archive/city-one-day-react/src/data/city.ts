import type { HandbookEntry, Location, QuizQuestion, Scene } from '../types'

export const PHASES = [
  { id: 'morning' as const, label: 'Утро', clock: '07:40' },
  { id: 'school' as const, label: 'Школа', clock: '10:15' },
  { id: 'afternoon' as const, label: 'День', clock: '15:20' },
  { id: 'evening' as const, label: 'Вечер', clock: '20:05' },
]

export const MODULE_LABELS: Record<string, string> = {
  road: 'БЖД · дорога',
  school: 'БЖД · школа',
  health: 'ЗОЖ',
  ecology: 'Экология',
  digital: 'Цифровая безопасность',
  professions: 'Профессии города',
  all: 'Все темы',
}

export const DISCLAIMER =
  'Учебный тренажёр для уроков и внеурочки. Не заменяет курс ПДД, инструктаж по эвакуации или консультацию врача. Решения в сценах — учебные примеры.'

export const locations: Location[] = [
  { id: 'home', name: 'Дом', short: 'ДОМ', phase: 'morning', module: 'health', x: 12, y: 28, sceneId: 'scene-home-morning' },
  { id: 'road', name: 'Дорога в школу', short: 'ДОРОГА', phase: 'morning', module: 'road', x: 38, y: 22, sceneId: 'scene-road' },
  { id: 'school', name: 'Школа', short: 'ШКОЛА', phase: 'school', module: 'school', x: 62, y: 30, sceneId: 'scene-evac' },
  { id: 'canteen', name: 'Столовая', short: 'ЕДА', phase: 'school', module: 'health', x: 78, y: 48, sceneId: 'scene-food' },
  { id: 'river', name: 'Река', short: 'РЕКА', phase: 'afternoon', module: 'ecology', x: 22, y: 62, sceneId: 'scene-river' },
  { id: 'park', name: 'Парк / двор', short: 'ДВОР', phase: 'afternoon', module: 'road', x: 48, y: 68, sceneId: 'scene-yard' },
  { id: 'plant', name: 'Завод', short: 'ЗАВОД', phase: 'afternoon', module: 'professions', x: 72, y: 66, sceneId: 'scene-plant' },
  { id: 'net', name: 'Сеть', short: 'СЕТЬ', phase: 'evening', module: 'digital', x: 36, y: 44, sceneId: 'scene-chat' },
]

export const scenes: Scene[] = [
  {
    id: 'scene-home-morning',
    locationId: 'home',
    module: 'health',
    phase: 'morning',
    title: 'Утро: сон и экран',
    summary: 'Как начать день, если вчера сидел допоздна.',
    handbookId: 'hb-sleep',
    steps: [
      {
        id: 'h1',
        kind: 'narration',
        text: '07:40. Будильник орёт. Вчера до двух ночи листал ленту. Впереди дорога и первый урок.',
      },
      {
        id: 'h1b',
        kind: 'narration',
        text: 'Телефон уже в руке. Можно «ещё чуть-чуть» — или встать и собраться.',
      },
      {
        id: 'h2',
        kind: 'choice',
        text: 'Первые десять минут. Что делаешь?',
        choices: [
          {
            id: 'h2a',
            label: 'Ещё 15 минут «только досмотреть»',
            outcome: 'risky',
            consequence: 'Ты выбегаешь без завтрака. На переходе мысли плывут.',
            tip: 'Утренний экран крадёт время на еду и сборы. На дороге это заметно.',
          },
          {
            id: 'h2b',
            label: 'Встать, вода, быстрый завтрак',
            outcome: 'safe',
            consequence: 'Ты выходишь вовремя. На переходе проще держать внимание.',
            tip: 'Сон и еда — топливо дня, не «галочка ЗОЖ».',
          },
          {
            id: 'h2c',
            label: 'Энергетик вместо еды',
            outcome: 'risky',
            consequence: 'Сердце колотится, к обеду — яма. Снова тянет к сладкому.',
            tip: 'Энергетик не чинит короткий сон. Для подростков это лишняя нагрузка.',
          },
        ],
      },
    ],
  },
  {
    id: 'scene-road',
    locationId: 'road',
    module: 'road',
    phase: 'morning',
    title: 'Дорога: переход',
    summary: 'Найди риски на улице и реши, когда идти.',
    handbookId: 'hb-road',
    steps: [
      {
        id: 'r1',
        kind: 'narration',
        text: 'Перекрёсток у школы. Кто-то бежит на жёлтый. Наушники на полной. Из-за куста плохо видно дорогу.',
      },
      {
        id: 'r2',
        kind: 'hotspot',
        text: 'Найди на сцене два реальных риска (кликай по ним).',
        hotspots: [
          { id: 'hs1', label: 'Наушники', x: 28, y: 55, correct: true, tip: 'Не слышишь сигнал и машину сбоку.' },
          { id: 'hs2', label: 'Куст / угол', x: 62, y: 40, correct: true, tip: 'Ты и водитель не видите друг друга.' },
          { id: 'hs3', label: 'Скамейка', x: 78, y: 70, correct: false, tip: 'Скамейка сама по себе не риск перехода.' },
        ],
      },
      {
        id: 'r3',
        kind: 'choice',
        text: 'Жёлтый. Ты уже у края проезжей части.',
        choices: [
          {
            id: 'r3a',
            label: 'Пробежаться — успею',
            outcome: 'risky',
            consequence: 'Машина тормозит резко. Ты «успел», ставка была чужая реакция.',
            tip: 'Жёлтый — не команда ускориться. Жди следующий цикл.',
          },
          {
            id: 'r3b',
            label: 'Стоп. Жду зелёный',
            outcome: 'safe',
            consequence: 'Минута позже — и ты на другой стороне без гонки.',
            tip: 'Скучный переход — рабочий переход.',
          },
        ],
      },
    ],
  },
  {
    id: 'scene-evac',
    locationId: 'school',
    module: 'school',
    phase: 'school',
    title: 'Школа: сигнал эвакуации',
    summary: 'Первые минуты по плану, не «кто куда».',
    handbookId: 'hb-evac',
    steps: [
      {
        id: 'e1',
        kind: 'narration',
        text: 'Сирена в коридоре. Учитель открывает дверь. Кто-то тянется снять сторис.',
      },
      {
        id: 'e1b',
        kind: 'narration',
        text: 'План этажа висит у доски. Точка сбора — во дворе у спортзала.',
      },
      {
        id: 'e2',
        kind: 'checklist',
        text: 'Отметь только нужные действия.',
        checklist: [
          { id: 'c1', label: 'Идти к выходу по плану этажа', required: true },
          { id: 'c2', label: 'Взять лифт — быстрее', required: false },
          { id: 'c3', label: 'Закрыть окна/дверь по инструкции', required: true },
          { id: 'c4', label: 'Бежать толпой без строя', required: false },
          { id: 'c5', label: 'Слушать учителя', required: true },
        ],
      },
      {
        id: 'e3',
        kind: 'choice',
        text: 'Друг зовёт: «Через чёрный ход, там пусто».',
        choices: [
          {
            id: 'e3a',
            label: 'Иду с ним — короче',
            outcome: 'risky',
            consequence: 'Класс не сходится на точке сбора. Короткий путь ломает учёт.',
            tip: 'Свой маршрут мешает всей эвакуации.',
          },
          {
            id: 'e3b',
            label: 'Остаюсь с классом',
            outcome: 'safe',
            consequence: 'Все на точке сбора. Учитель видит состав.',
            tip: 'План отрабатывают на учениях — его и держимся.',
          },
        ],
      },
    ],
  },
  {
    id: 'scene-food',
    locationId: 'canteen',
    module: 'health',
    phase: 'school',
    title: 'Столовая: выбор тарелки',
    summary: 'Что взять, чтобы хватило сил до вечера.',
    handbookId: 'hb-food',
    steps: [
      {
        id: 'f0',
        kind: 'narration',
        text: 'Очередь на раздаче. В автомате рядом — сок и печенье. В меню — суп и второе.',
      },
      {
        id: 'f1',
        kind: 'choice',
        text: 'Что берёшь?',
        choices: [
          {
            id: 'f1a',
            label: 'Суп, второе, вода',
            outcome: 'safe',
            consequence: 'До конца дня хватает сил. Меньше тяги к автомату.',
            tip: 'Нормальный обед держит внимание лучше сладкого перекуса.',
          },
          {
            id: 'f1b',
            label: 'Два сока и печенье',
            outcome: 'risky',
            consequence: 'Быстрый подъём — и спад на следующем уроке.',
            tip: 'Сладкое вместо обеда — это перекус в маске еды.',
          },
          {
            id: 'f1c',
            label: 'Пропустить, купить чипсы после',
            outcome: 'risky',
            consequence: 'Кружится голова на физре. Во дворе реакция хуже.',
            tip: 'Голод бьёт по концентрации — в том числе на дороге.',
          },
        ],
      },
    ],
  },
  {
    id: 'scene-river',
    locationId: 'river',
    module: 'ecology',
    phase: 'afternoon',
    title: 'Река: куда бросить',
    summary: 'Сортировка руками, не «в ближайшую урну».',
    handbookId: 'hb-waste',
    steps: [
      {
        id: 'v1',
        kind: 'narration',
        text: 'Класс на субботнике у реки. Четыре бака. На берегу — газета, бутылка, банка и грязный стаканчик.',
      },
      {
        id: 'v1b',
        kind: 'narration',
        text: 'Правило простое: грязное не клади к чистому. Не уверен — в смешанные.',
      },
      {
        id: 'v2',
        kind: 'sort',
        text: 'Выбери предмет, потом бак.',
        sort: {
          bins: [
            { id: 'paper', label: 'Бумага' },
            { id: 'plastic', label: 'Пластик' },
            { id: 'glass', label: 'Стекло' },
            { id: 'mixed', label: 'Смешанные' },
          ],
          items: [
            { id: 'i1', label: 'Сухая газета', bin: 'paper' },
            { id: 'i2', label: 'ПЭТ-бутылка', bin: 'plastic' },
            { id: 'i3', label: 'Стеклянная банка', bin: 'glass' },
            { id: 'i4', label: 'Грязный стаканчик', bin: 'mixed' },
          ],
        },
      },
    ],
  },
  {
    id: 'scene-yard',
    locationId: 'park',
    module: 'road',
    phase: 'afternoon',
    title: 'Двор: самокат и арка',
    summary: 'Во дворе обзор хуже, чем на улице.',
    handbookId: 'hb-yard',
    steps: [
      {
        id: 'y0',
        kind: 'narration',
        text: 'Ты на самокате. Впереди арка: из неё может выехать машина без предупреждения.',
      },
      {
        id: 'y1',
        kind: 'choice',
        text: 'Как едешь к арке?',
        choices: [
          {
            id: 'y1a',
            label: 'На полной, «как всегда»',
            outcome: 'risky',
            consequence: 'Машина появляется внезапно. Тормозить уже поздно.',
            tip: 'Двор — зона внезапных выездов. Скорость режь заранее.',
          },
          {
            id: 'y1b',
            label: 'Сбрасываю скорость, смотрю в обе стороны',
            outcome: 'safe',
            consequence: 'Машина есть — ты уже готов остановиться.',
            tip: 'Сначала взгляд, потом газ.',
          },
        ],
      },
    ],
  },
  {
    id: 'scene-plant',
    locationId: 'plant',
    module: 'professions',
    phase: 'afternoon',
    title: 'Завод: кто держит город',
    summary: 'Свет и вода дома — чья-то смена, не «само так».',
    handbookId: 'hb-jobs',
    steps: [
      {
        id: 'p1',
        kind: 'narration',
        text: 'Экскурсия на проходной. Мастер: «Город — не картинка. Это люди в смене».',
      },
      {
        id: 'p1b',
        kind: 'narration',
        text: 'За забором — цех, таблички, каски. Без разрешения сюда не ходят.',
      },
      {
        id: 'p2',
        kind: 'choice',
        text: 'Что делаешь на экскурсии?',
        choices: [
          {
            id: 'p2a',
            label: '«Мне не сюда» — отключаюсь',
            outcome: 'learn',
            consequence: 'В профессию можно не идти. Свет дома всё равно от чьей-то смены.',
            tip: 'Уважение к труду рядом — не лозунг, а факт города.',
          },
          {
            id: 'p2b',
            label: 'Спросить про навыки и ночную смену',
            outcome: 'safe',
            consequence: 'Узнаёшь про график, безопасность и ответственность за район.',
            tip: 'Вопрос «как устроено» — нормальный способ увидеть город изнутри.',
          },
          {
            id: 'p2c',
            label: 'Сфоткать станок без спроса',
            outcome: 'risky',
            consequence: 'Охрана останавливает. На объекте свои правила.',
            tip: 'Сначала спроси. Производство — не площадка для сторис.',
          },
        ],
      },
    ],
  },
  {
    id: 'scene-chat',
    locationId: 'net',
    module: 'digital',
    phase: 'evening',
    title: 'Сеть: «новый друг»',
    summary: 'Один ответ может отдать аккаунт.',
    handbookId: 'hb-digital',
    steps: [
      {
        id: 'd1',
        kind: 'narration',
        text: 'Вечер. Пишет незнакомый аккаунт: якобы из параллели, просит код из СМС «для розыгрыша».',
      },
      {
        id: 'd2',
        kind: 'chat',
        text: 'Что ответишь?',
        chat: {
          npcName: 'Аккаунт «Кира_09»',
          messages: [
            {
              from: 'npc',
              text: 'Привет! Мы вроде из одной школы. Админ розыгрыша просит код из СМС — скинь, я перешлю 🎁',
            },
            {
              from: 'system',
              text: 'Код из СМС — ключ к аккаунту. Его не пересылают «друзьям».',
            },
          ],
          replies: [
            {
              id: 'd2a',
              label: 'Ок, перешлю код',
              outcome: 'risky',
              consequence: 'Доступ уходит мошеннику. Дальше — родители и поддержка сервиса.',
              tip: 'Никто из школы не просит код из СМС. Это фишинг.',
            },
            {
              id: 'd2b',
              label: 'Не скидываю. Спрошу взрослых / блок',
              outcome: 'safe',
              consequence: 'Аккаунт на месте. Можно пожаловаться на профиль.',
              tip: 'Стоп → взрослый → блок. Быстрее, чем «разбираться самому».',
            },
            {
              id: 'd2c',
              label: 'Спрошу адрес школы — вдруг свой',
              outcome: 'learn',
              consequence: 'Адрес школы легко нагуглить. Вопрос не заменяет отказ от кода.',
              tip: 'Даже «свой» код не получает.',
            },
          ],
        },
      },
    ],
  },
]

export const handbook: HandbookEntry[] = [
  {
    id: 'hb-sleep',
    title: 'Сон и утренний экран',
    module: 'health',
    bullets: [
      'Недосып бьёт по вниманию на дороге.',
      'Утром сначала тело (вода, еда), потом лента.',
      'Энергетик не чинит короткий сон.',
    ],
  },
  {
    id: 'hb-road',
    title: 'Переход и обзор',
    module: 'road',
    bullets: [
      'Наушники на переходе — слепое пятно по звуку.',
      'Жёлтый — стоп, не ускорение.',
      'Кусты и углы прячут машины.',
    ],
  },
  {
    id: 'hb-evac',
    title: 'Эвакуация в школе',
    module: 'school',
    bullets: [
      'Идём классом по плану, не «коротким путём».',
      'Лифт при тревоге не используем.',
      'Точка сбора — чтобы видеть, кто на месте.',
    ],
  },
  {
    id: 'hb-food',
    title: 'Обед и внимание',
    module: 'health',
    bullets: [
      'Сок и печенье — не обед.',
      'Пропуск еды усиливает ошибки после уроков.',
      'Вода — простой якорь самочувствия.',
    ],
  },
  {
    id: 'hb-waste',
    title: 'У реки: сортировка',
    module: 'ecology',
    bullets: [
      'Грязное чаще идёт в смешанные.',
      'Сухая бумага и чистый ПЭТ — разные потоки.',
      'Берег показывает, что не дошло до бака.',
    ],
  },
  {
    id: 'hb-yard',
    title: 'Двор и самокат',
    module: 'road',
    bullets: [
      'Арка — слепая зона.',
      'Во дворе жди внезапный выезд.',
      'Скорость сбрасывай до поворота.',
    ],
  },
  {
    id: 'hb-jobs',
    title: 'Профессии города',
    module: 'professions',
    bullets: [
      'Свет и вода — чьи-то смены.',
      'На объекте свои правила безопасности.',
      'Спросить «как устроено» — нормально.',
    ],
  },
  {
    id: 'hb-digital',
    title: 'Коды и незнакомцы',
    module: 'digital',
    bullets: [
      'Код из СМС никому не пересылают.',
      '«Я из твоей школы» легко подделать.',
      'Стоп → взрослый → блок.',
    ],
  },
]

export const quiz: QuizQuestion[] = [
  {
    id: 'q1',
    module: 'road',
    question: 'На жёлтый на переходе лучше:',
    options: ['Пробежать, если близко', 'Подождать следующий зелёный', 'Идти спиной к машинам'],
    correctIndex: 1,
    explain: 'Жёлтый завершает цикл, а не зовёт ускориться.',
  },
  {
    id: 'q2',
    module: 'school',
    question: 'При эвакуации класс должен:',
    options: ['Разбежаться кто куда короче', 'Идти по плану на точку сбора', 'Сразу вызвать лифт'],
    correctIndex: 1,
    explain: 'План и точка сбора — чтобы никого не потерять.',
  },
  {
    id: 'q3',
    module: 'digital',
    question: 'Код из СМС можно:',
    options: ['Переслать «однокласснику» для розыгрыша', 'Никому не отправлять', 'Написать в комментарии к конкурсу'],
    correctIndex: 1,
    explain: 'Код = доступ к аккаунту.',
  },
  {
    id: 'q4',
    module: 'ecology',
    question: 'Грязный стаканчик из-под еды чаще кладут в:',
    options: ['Бумагу', 'Смешанные', 'Стекло'],
    correctIndex: 1,
    explain: 'Грязь ломает переработку чистых фракций.',
  },
  {
    id: 'q5',
    module: 'health',
    question: 'После короткого сна утром полезнее:',
    options: ['Ещё полчаса ленты', 'Вода и завтрак, потом сборы', 'Энергетик вместо еды'],
    correctIndex: 1,
    explain: 'Еда и вода чинят день лучше экрана.',
  },
]

export function sceneById(id: string) {
  return scenes.find((s) => s.id === id)
}

export function locationById(id: string) {
  return locations.find((l) => l.id === id)
}

export function handbookById(id: string) {
  return handbook.find((h) => h.id === id)
}
