# Design

<!-- Derived from shipped cork-board world for «Город одного дня» -->

## World

Классная пробковая карта: рама дерева, бумажные ярлыки, булавки, синяя нить маршрута. Светлая сцена для проектора в классе.

## Palette

| Token | Value | Role |
| --- | --- | --- |
| cork | `#d8b896` | Основной фон доски |
| cork-deep | `#c4a574` | Фон страницы |
| frame | `#5c4030` | Рама / шапка |
| paper | `#fff8e7` | Ярлыки, панели, кнопки |
| ink | `#2a2118` | Текст |
| pin | `#c0392b` | Булавка / риск |
| yarn | `#2e86ab` | Нить / акцент фокуса |
| safe | `#2f6b4f` | Успех / пройдено |

## Type

- Display: Source Serif 4 / Georgia / Palatino (заголовки)
- UI: system sans

## Components

- `.cork-board` — главная карта дня
- `.loc-cell` — булавка-локация
- `.btn` / `.nav-links a` — бумажные кнопки с мягкой тенью
- Сцены — `.panel` на бумаге поверх пробкового поля страницы
