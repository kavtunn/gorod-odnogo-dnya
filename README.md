# Город одного дня

## Веб-приложение (React + TypeScript)

Основной продукт — папка `web/`:

```
web/
├── index.html
├── public/
│   ├── json/city.json   ← данные
│   ├── img/             ← картинки
│   └── fonts/           ← шрифты
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── types/           ← TypeScript-типы
    ├── styles/          ← CSS
    ├── store/           ← прогресс (localStorage)
    ├── data/            ← загрузка JSON
    └── components/      ← UI-компоненты
```

```bash
cd web
npm install
npm run dev
```

Открой адрес из терминала (обычно http://127.0.0.1:5173).

## Выложить на GitHub Pages

Пошагово: см. **[DEPLOY.md](DEPLOY.md)**.

Кратко: `git push` → Settings → Pages → Source: **GitHub Actions** → сайт на  
`https://ЛОГИН.github.io/ИМЯ_РЕПО/`

## Статическая версия (HTML + CSS + JS)

```
html/  css/  js/  json/  img/  fonts/
```

```bash
python3 -m http.server 8080
```

http://127.0.0.1:8080/html/

## Прочее

- `docs/` — PRODUCT.md, DESIGN.md  
- `archive/` — старый React-прототип  
