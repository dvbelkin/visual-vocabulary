# Visual Vocabulary

Двуязычный учебный справочник по выбору визуализаций данных. Каталог содержит
72 интерактивных примера на русском и английском языках.

Публичная версия:
<https://dvbelkin.github.io/visual-vocabulary/>

## Стек

- Astro и строгий TypeScript;
- Apache ECharts с модульными импортами;
- `d3-delaunay`, `d3-contour` и `d3-force` только для геометрических расчётов;
- статическая сборка и GitHub Pages.

## Локальная разработка

Требуется Node.js 24.

```bash
npm ci
npm run dev
```

Основные проверки:

```bash
npm run format:check
npm run check
npm run lint
npm test
npm run build
```

`npm run build` проверяет каталог, отсутствие старого D3 runtime, размеры
клиентских чанков, 72 RU/EN-маршрута и SEO-метаданные.

## Структура

- `src/lib/catalog.ts` — типизированный двуязычный каталог и учебные данные;
- `src/lib/charts/` — фабрики ECharts и lifecycle;
- `src/pages/` — статические RU/EN-маршруты;
- `src/styles/` — дизайн-токены, адаптивные и печатные стили;
- `src/data/geo/` — локальная картографическая основа и её происхождение;
- `tests/` — контракты каталога, диаграмм и собранных маршрутов.

## Данные и происхождение

Учебные значения синтетические и не предназначены для фактических выводов.
Структура справочника основана на
[FT Visual Vocabulary](https://ft-interactive.github.io/visual-vocabulary/).
Программный код исходного проекта опубликован Financial Times по лицензии MIT;
лицензия не распространяется на содержание и фирменные обозначения FT.

Картографическая основа получена из Natural Earth 1:110m. Подробности и
public-domain статус находятся в `src/data/geo/README.md`.
