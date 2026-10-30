# Как выложить «Город одного дня» на GitHub + GitHub Pages

Сайт собирается из папки `web/` (React + TypeScript) и открывается как обычное веб-приложение.

Адрес будет таким:

`https://ТВОЙ_ЛОГИН.github.io/ИМЯ_РЕПОЗИТОРИЯ/`

---

## 0. Один раз: GitHub CLI или сайт

Нужен аккаунт на [github.com](https://github.com).  
Если ещё нет репозитория — создай пустой (без README), например имя: `gorod-odnogo-dnya`.

---

## 1. Инициализация git и первый push

В Терминале из корня проекта (`Новая папка 2`):

```bash
cd "/Users/daniil/Desktop/Новая папка 2"

git init
git add .
git commit -m "Город одного дня: веб-приложение"

# подставь СВОЙ логин и имя репо
git branch -M main
git remote add origin https://github.com/ТВОЙ_ЛОГИН/gorod-odnogo-dnya.git
git push -u origin main
```

Если GitHub спросит вход — через браузер или Personal Access Token.

Через GitHub CLI (если установлен `gh`):

```bash
cd "/Users/daniil/Desktop/Новая папка 2"
git init
git add .
git commit -m "Город одного дня: веб-приложение"
gh repo create gorod-odnogo-dnya --public --source=. --remote=origin --push
```

---

## 2. Включить GitHub Pages

1. Открой репозиторий на GitHub → **Settings** → **Pages**.
2. **Source**: выбери **GitHub Actions** (не «Deploy from a branch»).
3. Сохрани.

В проекте уже есть workflow: `.github/workflows/pages.yml`.  
Он сам соберёт `web/` и выложит сайт после каждого `git push` в `main`.

---

## 3. Проверить деплой

1. Вкладка **Actions** в репозитории — дождись зелёной галочки у **Deploy to GitHub Pages**.
2. Открой:

`https://ТВОЙ_ЛОГИН.github.io/gorod-odnogo-dnya/`

(подставь своё имя репо, если другое)

---

## 4. Локально проверить сборку как на Pages

```bash
cd web
npm install
VITE_BASE=/gorod-odnogo-dnya/ npm run build
npm run preview
```

Открой URL из терминала и зайди по пути с именем репо, если preview это показывает.

Обычная разработка без Pages:

```bash
cd web
npm run dev
```

---

## Важно

| Тема | Что знать |
| --- | --- |
| Имя репозитория | Попадает в URL. Workflow подставляет его в `base` автоматически. |
| JSON и картинки | Лежат в `web/public/` и попадают в сборку. |
| Прогресс игрока | Хранится в `localStorage` браузера посетителя (на сервере не нужен бэкенд). |
| Старая папка `html/` | Это запасной статический вариант; на Pages уходит именно React из `web/`. |

---

## Обновить сайт после правок

```bash
cd "/Users/daniil/Desktop/Новая папка 2"
git add .
git commit -m "Обновление сайта"
git push
```

Подожди 1–2 минуты, пока отработает Actions — и обнови страницу на GitHub Pages (иногда нужен жёсткий refresh: Cmd+Shift+R).
