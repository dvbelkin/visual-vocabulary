import type { Locale } from "./i18n";
import { assertChartCatalog } from "./catalog-validation";

export type CategoryId =
    | "deviation"
    | "magnitude"
    | "ranking"
    | "change-time"
    | "correlation"
    | "distribution"
    | "part-whole"
    | "spatial"
    | "flow";

export type ChartKind =
    | "bar"
    | "line"
    | "scatter"
    | "histogram"
    | "pie"
    | "donut"
    | "heatmap"
    | "diverging-bar"
    | "grouped-bar"
    | "lollipop"
    | "rank-change"
    | "bullet"
    | "radar"
    | "timeline-bar"
    | "combo"
    | "slope"
    | "stacked-area"
    | "calendar"
    | "population-pyramid"
    | "dot-range"
    | "cumulative"
    | "observation-strip"
    | "barcode"
    | "stacked-bar"
    | "normalized-stacked"
    | "treemap"
    | "waterfall"
    | "diverging-stacked"
    | "spine"
    | "balance-area"
    | "boxplot"
    | "violin"
    | "vertical-bar"
    | "proportional-symbols"
    | "dot-strip"
    | "vertical-lollipop"
    | "bump"
    | "correlation-combo"
    | "connected-scatter"
    | "bubble"
    | "sankey"
    | "process-waterfall"
    | "chord"
    | "network"
    | "grouped-column"
    | "pictogram"
    | "parallel"
    | "candlestick"
    | "fan"
    | "timeline-connected"
    | "circle-timeline"
    | "seismogram"
    | "sunburst"
    | "semi-donut"
    | "symbol-grid"
    | "priestley"
    | "voronoi"
    | "venn"
    | "choropleth-map"
    | "symbol-map"
    | "flow-map"
    | "contour-map"
    | "tile-cartogram"
    | "dorling-cartogram"
    | "dot-density-map"
    | "spatial-heatmap";

type LocalizedText = Record<Locale, string>;

export interface DataRow {
    label: LocalizedText;
    key?: string;
    value: number;
    value2?: number;
    value3?: number;
    values?: number[];
}

export interface ChartDefinition {
    id: string;
    category: CategoryId;
    kind: ChartKind;
    title: LocalizedText;
    description: LocalizedText;
    useWhen: LocalizedText;
    avoidWhen: LocalizedText;
    unit: LocalizedText;
    dataStatus?: LocalizedText;
    source?: {
        label: LocalizedText;
        url: string;
    };
    valueLabels?: {
        primary: LocalizedText;
        secondary?: LocalizedText;
        tertiary?: LocalizedText;
    };
    data: DataRow[];
}

export const categoryNames: Record<CategoryId, LocalizedText> = {
    deviation: { ru: "Отклонение", en: "Deviation" },
    magnitude: { ru: "Величина", en: "Magnitude" },
    ranking: { ru: "Ранжирование", en: "Ranking" },
    "change-time": { ru: "Изменение во времени", en: "Change over time" },
    correlation: { ru: "Связь", en: "Correlation" },
    distribution: { ru: "Распределение", en: "Distribution" },
    "part-whole": { ru: "Части целого", en: "Part to whole" },
    spatial: { ru: "Пространство", en: "Spatial" },
    flow: { ru: "Поток", en: "Flow" },
};

export const charts: readonly ChartDefinition[] = [
    {
        id: "ordered-bar",
        category: "ranking",
        kind: "bar",
        title: { ru: "Упорядоченные столбцы", en: "Ordered bars" },
        description: {
            ru: "Сравнение значений становится быстрее, когда категории отсортированы.",
            en: "Sorting categories makes differences and rank easier to scan.",
        },
        useWhen: {
            ru: "Нужно сравнить величины нескольких категорий и сразу показать порядок.",
            en: "You need to compare several categories and make their order clear.",
        },
        avoidWhen: {
            ru: "Естественная последовательность категорий важнее ранга.",
            en: "The categories have a meaningful sequence that matters more than rank.",
        },
        unit: { ru: "тыс. посещений", en: "thousand visits" },
        data: [
            { label: { ru: "Библиотека", en: "Library" }, value: 84 },
            { label: { ru: "Музей", en: "Museum" }, value: 67 },
            { label: { ru: "Театр", en: "Theatre" }, value: 52 },
            { label: { ru: "Галерея", en: "Gallery" }, value: 39 },
            { label: { ru: "Архив", en: "Archive" }, value: 24 },
        ],
    },
    {
        id: "line-chart",
        category: "change-time",
        kind: "line",
        title: { ru: "Линейный график", en: "Line chart" },
        description: {
            ru: "Линия подчёркивает направление и темп изменения последовательного ряда.",
            en: "A line emphasises the direction and pace of change in a sequence.",
        },
        useWhen: {
            ru: "Наблюдения упорядочены во времени и важен общий тренд.",
            en: "Observations are ordered in time and the overall trend matters.",
        },
        avoidWhen: {
            ru: "Между наблюдениями нет содержательной последовательности.",
            en: "There is no meaningful continuity between observations.",
        },
        unit: { ru: "мкг/м³", en: "µg/m³" },
        data: [
            { label: { ru: "Янв", en: "Jan" }, value: 38 },
            { label: { ru: "Фев", en: "Feb" }, value: 34 },
            { label: { ru: "Мар", en: "Mar" }, value: 29 },
            { label: { ru: "Апр", en: "Apr" }, value: 24 },
            { label: { ru: "Май", en: "May" }, value: 20 },
            { label: { ru: "Июн", en: "Jun" }, value: 18 },
        ],
    },
    {
        id: "scatterplot",
        category: "correlation",
        kind: "scatter",
        title: { ru: "Диаграмма рассеяния", en: "Scatterplot" },
        description: {
            ru: "Положение точки показывает совместные значения двух числовых переменных.",
            en: "Each point combines the values of two numerical variables.",
        },
        useWhen: {
            ru: "Нужно увидеть направление, силу связи и необычные наблюдения.",
            en: "You want to see the direction and strength of a relationship and any outliers.",
        },
        avoidWhen: {
            ru: "Одна из переменных является категорией, а не числом.",
            en: "One of the variables is categorical rather than numerical.",
        },
        unit: { ru: "баллы и часы", en: "score and hours" },
        valueLabels: {
            primary: { ru: "Часы подготовки", en: "Study hours" },
            secondary: { ru: "Результат", en: "Score" },
        },
        data: [
            { label: { ru: "А", en: "A" }, value: 2, value2: 58 },
            { label: { ru: "Б", en: "B" }, value: 3, value2: 64 },
            { label: { ru: "В", en: "C" }, value: 4, value2: 63 },
            { label: { ru: "Г", en: "D" }, value: 5, value2: 72 },
            { label: { ru: "Д", en: "E" }, value: 6, value2: 78 },
            { label: { ru: "Е", en: "F" }, value: 7, value2: 84 },
            { label: { ru: "Ж", en: "G" }, value: 8, value2: 88 },
        ],
    },
    {
        id: "histogram",
        category: "distribution",
        kind: "histogram",
        title: { ru: "Гистограмма", en: "Histogram" },
        description: {
            ru: "Соседние интервалы показывают форму распределения числовой переменной.",
            en: "Adjacent bins reveal the shape of a numerical distribution.",
        },
        useWhen: {
            ru: "Нужно увидеть типичные значения, разброс, асимметрию или несколько пиков.",
            en: "You need to inspect typical values, spread, skew, or multiple peaks.",
        },
        avoidWhen: {
            ru: "Нужно сравнить точные значения отдельных наблюдений.",
            en: "You need to compare exact values for individual observations.",
        },
        unit: { ru: "студентов", en: "students" },
        data: [
            { label: { ru: "0–10", en: "0–10" }, value: 3 },
            { label: { ru: "10–20", en: "10–20" }, value: 9 },
            { label: { ru: "20–30", en: "20–30" }, value: 18 },
            { label: { ru: "30–40", en: "30–40" }, value: 14 },
            { label: { ru: "40–50", en: "40–50" }, value: 7 },
            { label: { ru: "50–60", en: "50–60" }, value: 2 },
        ],
    },
    {
        id: "donut-chart",
        category: "part-whole",
        kind: "donut",
        title: { ru: "Кольцевая диаграмма", en: "Donut chart" },
        description: {
            ru: "Сектора показывают доли небольшого числа компонентов в одном целом.",
            en: "Segments show the shares of a few components within one whole.",
        },
        useWhen: {
            ru: "Компонентов мало, сумма равна целому, а точное сравнение не главное.",
            en: "There are few components, they sum to a whole, and exact comparison is secondary.",
        },
        avoidWhen: {
            ru: "Долей много или они близки по величине — столбцы будут точнее.",
            en: "There are many similar shares; bars will support more accurate comparison.",
        },
        unit: { ru: "% бюджета", en: "% of budget" },
        data: [
            { label: { ru: "Обучение", en: "Teaching" }, value: 46 },
            { label: { ru: "Исследования", en: "Research" }, value: 28 },
            { label: { ru: "Кампус", en: "Campus" }, value: 16 },
            { label: { ru: "Поддержка", en: "Support" }, value: 10 },
        ],
    },
    {
        id: "heatmap",
        category: "correlation",
        kind: "heatmap",
        title: { ru: "Двумерная тепловая карта", en: "Two-dimensional heatmap" },
        description: {
            ru: "Интенсивность цвета помогает найти сочетания двух категорий.",
            en: "Colour intensity reveals patterns across two categorical dimensions.",
        },
        useWhen: {
            ru: "Нужно быстро увидеть общий рисунок в плотной матрице значений.",
            en: "You need to scan a dense matrix for broad patterns.",
        },
        avoidWhen: {
            ru: "Читателю важно точно сравнить близкие значения.",
            en: "Readers need to compare similar values precisely.",
        },
        unit: { ru: "посещений", en: "visits" },
        data: [
            { label: { ru: "Пн|Утро", en: "Mon|Morning" }, value: 18 },
            { label: { ru: "Пн|Вечер", en: "Mon|Evening" }, value: 42 },
            { label: { ru: "Вт|Утро", en: "Tue|Morning" }, value: 25 },
            { label: { ru: "Вт|Вечер", en: "Tue|Evening" }, value: 54 },
            { label: { ru: "Ср|Утро", en: "Wed|Morning" }, value: 31 },
            { label: { ru: "Ср|Вечер", en: "Wed|Evening" }, value: 61 },
            { label: { ru: "Чт|Утро", en: "Thu|Morning" }, value: 27 },
            { label: { ru: "Чт|Вечер", en: "Thu|Evening" }, value: 58 },
            { label: { ru: "Пт|Утро", en: "Fri|Morning" }, value: 35 },
            { label: { ru: "Пт|Вечер", en: "Fri|Evening" }, value: 76 },
        ],
    },
    {
        id: "diverging-bar",
        category: "deviation",
        kind: "diverging-bar",
        title: { ru: "Расходящиеся столбцы", en: "Diverging bars" },
        description: {
            ru: "Столбцы расходятся от общей базовой линии и показывают направление отклонения.",
            en: "Bars extend from a shared baseline to show the direction of each deviation.",
        },
        useWhen: {
            ru: "Нужно сравнить положительные и отрицательные отклонения от плана, нуля или нормы.",
            en: "You need to compare positive and negative differences from a target, zero, or norm.",
        },
        avoidWhen: {
            ru: "Знак значения не несёт содержательного смысла или базовая линия различается.",
            en: "The sign has no meaningful interpretation or observations use different baselines.",
        },
        unit: { ru: "% к плану", en: "% vs target" },
        data: [
            { label: { ru: "Север", en: "North" }, value: 12 },
            { label: { ru: "Центр", en: "Central" }, value: -7 },
            { label: { ru: "Юг", en: "South" }, value: 18 },
            { label: { ru: "Восток", en: "East" }, value: -11 },
            { label: { ru: "Запад", en: "West" }, value: 5 },
        ],
    },
    {
        id: "grouped-horizontal-bars",
        category: "magnitude",
        kind: "grouped-bar",
        title: { ru: "Сгруппированные горизонтальные столбцы", en: "Grouped horizontal bars" },
        description: {
            ru: "Парные столбцы сравнивают два ряда внутри каждой категории.",
            en: "Paired bars compare two series within every category.",
        },
        useWhen: {
            ru: "Категорий немного, подписи длинные, а сравнить нужно два согласованных показателя.",
            en: "There are few categories, labels are long, and two aligned series need comparison.",
        },
        avoidWhen: {
            ru: "Рядов больше трёх или важнее показать изменение во времени.",
            en: "There are more than three series or the time trend is more important.",
        },
        unit: { ru: "% студентов", en: "% of students" },
        valueLabels: {
            primary: { ru: "Самооценка", en: "Self-assessment" },
            secondary: { ru: "Практическое задание", en: "Practical task" },
        },
        data: [
            { label: { ru: "Анализ данных", en: "Data analysis" }, value: 72, value2: 61 },
            { label: { ru: "Программирование", en: "Programming" }, value: 68, value2: 54 },
            { label: { ru: "Статистика", en: "Statistics" }, value: 59, value2: 52 },
            { label: { ru: "Коммуникация", en: "Communication" }, value: 47, value2: 63 },
        ],
    },
    {
        id: "ranking-lollipop",
        category: "ranking",
        kind: "lollipop",
        title: { ru: "Горизонтальный лоллипоп", en: "Horizontal lollipop chart" },
        description: {
            ru: "Точка подчёркивает значение, а тонкая линия сохраняет связь с нулевой отметкой.",
            en: "A dot emphasises the value while a thin stem preserves its connection to zero.",
        },
        useWhen: {
            ru: "Нужно показать порядок небольшого числа положительных значений с лёгким визуальным весом.",
            en: "You want to rank a small set of positive values with less visual weight than bars.",
        },
        avoidWhen: {
            ru: "Нужно очень точно сравнить близкие значения или показать отрицательные величины.",
            en: "Readers must compare very similar values precisely or values include negatives.",
        },
        unit: { ru: "баллов из 100", en: "score out of 100" },
        data: [
            { label: { ru: "Доступность", en: "Accessibility" }, value: 91 },
            { label: { ru: "Надёжность", en: "Reliability" }, value: 84 },
            { label: { ru: "Понятность", en: "Clarity" }, value: 78 },
            { label: { ru: "Скорость", en: "Speed" }, value: 66 },
            { label: { ru: "Гибкость", en: "Flexibility" }, value: 57 },
        ],
    },
    {
        id: "rank-change",
        category: "ranking",
        kind: "rank-change",
        title: { ru: "График изменения мест", en: "Rank change chart" },
        description: {
            ru: "Линии соединяют позиции объектов в двух срезах и делают перестановки заметными.",
            en: "Lines connect two ranked snapshots and make position changes visible.",
        },
        useWhen: {
            ru: "Нужно сравнить ранги одних и тех же объектов в двух моментах или группах.",
            en: "You need to compare the same objects' ranks across two times or groups.",
        },
        avoidWhen: {
            ru: "Важнее абсолютное изменение показателя, а не место в списке.",
            en: "The absolute change matters more than position in the ranking.",
        },
        unit: { ru: "место", en: "rank" },
        valueLabels: {
            primary: { ru: "Место в 2024", en: "2024 rank" },
            secondary: { ru: "Место в 2026", en: "2026 rank" },
        },
        data: [
            { label: { ru: "Команда А", en: "Team A" }, value: 1, value2: 3 },
            { label: { ru: "Команда Б", en: "Team B" }, value: 4, value2: 1 },
            { label: { ru: "Команда В", en: "Team C" }, value: 2, value2: 2 },
            { label: { ru: "Команда Г", en: "Team D" }, value: 3, value2: 5 },
            { label: { ru: "Команда Д", en: "Team E" }, value: 5, value2: 4 },
        ],
    },
    {
        id: "bullet-chart",
        category: "magnitude",
        kind: "bullet",
        title: { ru: "Буллет-чарт", en: "Bullet chart" },
        description: {
            ru: "Фактическое значение сравнивается с целью на фоне качественного диапазона.",
            en: "An actual value is compared with a target against a qualitative range.",
        },
        useWhen: {
            ru: "Нужно компактно показать выполнение цели по нескольким показателям.",
            en: "You need a compact view of progress toward targets across several measures.",
        },
        avoidWhen: {
            ru: "Нет обоснованной цели или диапазоны качества выбраны произвольно.",
            en: "There is no defensible target or the qualitative ranges are arbitrary.",
        },
        unit: { ru: "% выполнения", en: "% achieved" },
        valueLabels: {
            primary: { ru: "Факт", en: "Actual" },
            secondary: { ru: "Цель", en: "Target" },
        },
        data: [
            { label: { ru: "Посещаемость", en: "Attendance" }, value: 84, value2: 90 },
            { label: { ru: "Завершение курса", en: "Completion" }, value: 76, value2: 80 },
            { label: { ru: "Практические работы", en: "Coursework" }, value: 93, value2: 85 },
            { label: { ru: "Обратная связь", en: "Feedback" }, value: 68, value2: 75 },
        ],
    },
    {
        id: "radar-chart",
        category: "magnitude",
        kind: "radar",
        title: { ru: "Радарная диаграмма", en: "Radar chart" },
        description: {
            ru: "Несколько нормированных характеристик образуют профиль объекта вокруг общего центра.",
            en: "Several normalised measures form an object's profile around a shared centre.",
        },
        useWhen: {
            ru: "Нужно дать обзор профилей двух объектов по небольшому числу одинаковых шкал.",
            en: "You need an overview of two profiles across a few comparable scales.",
        },
        avoidWhen: {
            ru: "Нужна точная оценка каждой величины или шкалы имеют разные единицы.",
            en: "Readers need precise comparisons or axes use incomparable units.",
        },
        unit: { ru: "баллов из 100", en: "score out of 100" },
        valueLabels: {
            primary: { ru: "Программа А", en: "Programme A" },
            secondary: { ru: "Программа Б", en: "Programme B" },
        },
        data: [
            { label: { ru: "Точность", en: "Accuracy" }, value: 88, value2: 73 },
            { label: { ru: "Скорость", en: "Speed" }, value: 64, value2: 91 },
            { label: { ru: "Понятность", en: "Clarity" }, value: 82, value2: 76 },
            { label: { ru: "Гибкость", en: "Flexibility" }, value: 71, value2: 84 },
            { label: { ru: "Надёжность", en: "Reliability" }, value: 90, value2: 78 },
        ],
    },
    {
        id: "timeline-columns",
        category: "change-time",
        kind: "timeline-bar",
        title: { ru: "Столбцы по времени", en: "Columns over time" },
        description: {
            ru: "Отдельные столбцы показывают величину последовательных дискретных периодов.",
            en: "Separate columns show the magnitude of consecutive discrete periods.",
        },
        useWhen: {
            ru: "Данные собраны по регулярным периодам, а отдельные значения важны не меньше тренда.",
            en: "Data uses regular periods and individual values matter as much as the trend.",
        },
        avoidWhen: {
            ru: "Наблюдений очень много или интервалы между ними нерегулярны.",
            en: "There are many observations or intervals between them are irregular.",
        },
        unit: { ru: "тыс. поездок", en: "thousand trips" },
        data: [
            { label: { ru: "Янв", en: "Jan" }, value: 42 },
            { label: { ru: "Фев", en: "Feb" }, value: 46 },
            { label: { ru: "Мар", en: "Mar" }, value: 58 },
            { label: { ru: "Апр", en: "Apr" }, value: 64 },
            { label: { ru: "Май", en: "May" }, value: 71 },
            { label: { ru: "Июн", en: "Jun" }, value: 69 },
            { label: { ru: "Июл", en: "Jul" }, value: 78 },
            { label: { ru: "Авг", en: "Aug" }, value: 74 },
        ],
    },
    {
        id: "column-line-timeline",
        category: "change-time",
        kind: "combo",
        title: { ru: "Столбцы и линия по времени", en: "Columns and line over time" },
        description: {
            ru: "Столбцы показывают объём, а линия — связанный относительный показатель.",
            en: "Columns show volume while a line tracks a related rate.",
        },
        useWhen: {
            ru: "Нужно сопоставить абсолютный объём с показателем другой размерности по тем же периодам.",
            en: "You need to compare an absolute volume with a rate across the same periods.",
        },
        avoidWhen: {
            ru: "Две шкалы создают ложное впечатление связи или показатели можно привести к одной шкале.",
            en: "Two axes would imply a misleading relationship or measures can share one scale.",
        },
        unit: { ru: "заявки и %", en: "applications and %" },
        valueLabels: {
            primary: { ru: "Заявки", en: "Applications" },
            secondary: { ru: "Доля одобрения, %", en: "Approval rate, %" },
        },
        data: [
            { label: { ru: "Янв", en: "Jan" }, value: 420, value2: 54 },
            { label: { ru: "Фев", en: "Feb" }, value: 460, value2: 57 },
            { label: { ru: "Мар", en: "Mar" }, value: 510, value2: 55 },
            { label: { ru: "Апр", en: "Apr" }, value: 580, value2: 61 },
            { label: { ru: "Май", en: "May" }, value: 620, value2: 64 },
            { label: { ru: "Июн", en: "Jun" }, value: 590, value2: 68 },
        ],
    },
    {
        id: "slope-timeline",
        category: "change-time",
        kind: "slope",
        title: { ru: "График наклона", en: "Slope chart" },
        description: {
            ru: "Две точки и соединяющая линия подчёркивают направление и величину изменения.",
            en: "Two points and a connecting line emphasise the direction and size of change.",
        },
        useWhen: {
            ru: "Нужно сравнить значения нескольких объектов ровно в двух моментах.",
            en: "You need to compare several objects at exactly two moments.",
        },
        avoidWhen: {
            ru: "Промежуточная траектория содержит важные колебания или точек времени больше трёх.",
            en: "The path between endpoints contains important variation or there are more than three dates.",
        },
        unit: { ru: "% выпускников", en: "% of graduates" },
        valueLabels: {
            primary: { ru: "2022", en: "2022" },
            secondary: { ru: "2026", en: "2026" },
        },
        data: [
            { label: { ru: "Инженерия", en: "Engineering" }, value: 62, value2: 78 },
            { label: { ru: "Экономика", en: "Economics" }, value: 71, value2: 68 },
            { label: { ru: "Дизайн", en: "Design" }, value: 55, value2: 73 },
            { label: { ru: "Биология", en: "Biology" }, value: 66, value2: 70 },
        ],
    },
    {
        id: "stacked-area",
        category: "change-time",
        kind: "stacked-area",
        title: { ru: "Диаграмма с областями", en: "Area chart" },
        description: {
            ru: "Заполненные области показывают изменение общего объёма и вклад компонентов.",
            en: "Filled areas show how a total and its components change over time.",
        },
        useWhen: {
            ru: "Важен общий объём во времени, а компонентов немного и они образуют целое.",
            en: "The changing total matters and a few components form the whole.",
        },
        avoidWhen: {
            ru: "Нужно точно сравнить внутренние компоненты, не лежащие на общей базовой линии.",
            en: "Readers need precise comparison of internal components without a shared baseline.",
        },
        unit: { ru: "ГВт·ч", en: "GWh" },
        valueLabels: {
            primary: { ru: "Солнце", en: "Solar" },
            secondary: { ru: "Ветер", en: "Wind" },
        },
        data: [
            { label: { ru: "Янв", en: "Jan" }, value: 18, value2: 34 },
            { label: { ru: "Фев", en: "Feb" }, value: 24, value2: 31 },
            { label: { ru: "Мар", en: "Mar" }, value: 35, value2: 29 },
            { label: { ru: "Апр", en: "Apr" }, value: 48, value2: 27 },
            { label: { ru: "Май", en: "May" }, value: 59, value2: 24 },
            { label: { ru: "Июн", en: "Jun" }, value: 66, value2: 22 },
        ],
    },
    {
        id: "calendar-heatmap",
        category: "change-time",
        kind: "calendar",
        title: { ru: "Календарная тепловая карта", en: "Calendar heatmap" },
        description: {
            ru: "Каждый день занимает знакомое место в календаре, а цвет кодирует интенсивность.",
            en: "Each day occupies a familiar calendar position while colour encodes intensity.",
        },
        useWhen: {
            ru: "Нужно найти недельные, сезонные циклы и необычные дни в ежедневном ряду.",
            en: "You need to find weekly or seasonal cycles and unusual days in daily data.",
        },
        avoidWhen: {
            ru: "Точная динамика и последовательность значений важнее календарного рисунка.",
            en: "Exact trend and sequential comparison matter more than the calendar pattern.",
        },
        unit: { ru: "посещений в день", en: "visits per day" },
        data: Array.from({ length: 90 }, (_, index) => {
            const date = new Date(Date.UTC(2026, 0, index + 1));
            const iso = date.toISOString().slice(0, 10);
            const value = Math.round(28 + 24 * Math.abs(Math.sin(index / 8)) + (index % 7) * 3);
            return { label: { ru: iso, en: iso }, value };
        }),
    },
    {
        id: "population-pyramid",
        category: "distribution",
        kind: "population-pyramid",
        title: { ru: "Возрастно-половая пирамида", en: "Population pyramid" },
        description: {
            ru: "Зеркальные столбцы сравнивают возрастную структуру двух групп.",
            en: "Mirrored bars compare the age structure of two groups.",
        },
        useWhen: {
            ru: "Нужно сравнить распределение населения по возрасту и полу или другой паре групп.",
            en: "You need to compare population by age and sex or another pair of groups.",
        },
        avoidWhen: {
            ru: "Группы не сопоставимы или важнее общий размер каждой возрастной категории.",
            en: "Groups are not comparable or the combined size of each age band matters more.",
        },
        unit: { ru: "тыс. человек", en: "thousand people" },
        valueLabels: {
            primary: { ru: "Мужчины", en: "Men" },
            secondary: { ru: "Женщины", en: "Women" },
        },
        data: [
            { label: { ru: "80+", en: "80+" }, value: 12, value2: 21 },
            { label: { ru: "70–79", en: "70–79" }, value: 28, value2: 39 },
            { label: { ru: "60–69", en: "60–69" }, value: 46, value2: 54 },
            { label: { ru: "50–59", en: "50–59" }, value: 58, value2: 62 },
            { label: { ru: "40–49", en: "40–49" }, value: 66, value2: 68 },
            { label: { ru: "30–39", en: "30–39" }, value: 74, value2: 72 },
            { label: { ru: "20–29", en: "20–29" }, value: 69, value2: 65 },
            { label: { ru: "10–19", en: "10–19" }, value: 61, value2: 58 },
            { label: { ru: "0–9", en: "0–9" }, value: 55, value2: 52 },
        ],
    },
    {
        id: "dot-range",
        category: "distribution",
        kind: "dot-range",
        title: { ru: "Точечный диапазон", en: "Dot range" },
        description: {
            ru: "Две точки и соединяющий отрезок показывают границы диапазона.",
            en: "Two dots and a connecting segment show the endpoints of a range.",
        },
        useWhen: {
            ru: "Нужно компактно сравнить минимум и максимум в нескольких категориях.",
            en: "You need a compact comparison of minimum and maximum across categories.",
        },
        avoidWhen: {
            ru: "Границы не описывают форму распределения или скрывают важные выбросы.",
            en: "Endpoints do not describe distribution shape or conceal important outliers.",
        },
        unit: { ru: "минут", en: "minutes" },
        valueLabels: {
            primary: { ru: "Минимум", en: "Minimum" },
            secondary: { ru: "Максимум", en: "Maximum" },
        },
        data: [
            { label: { ru: "Маршрут А", en: "Route A" }, value: 24, value2: 41 },
            { label: { ru: "Маршрут Б", en: "Route B" }, value: 31, value2: 57 },
            { label: { ru: "Маршрут В", en: "Route C" }, value: 18, value2: 36 },
            { label: { ru: "Маршрут Г", en: "Route D" }, value: 27, value2: 48 },
            { label: { ru: "Маршрут Д", en: "Route E" }, value: 35, value2: 63 },
        ],
    },
    {
        id: "cumulative-curve",
        category: "distribution",
        kind: "cumulative",
        title: { ru: "Кумулятивная кривая", en: "Cumulative curve" },
        description: {
            ru: "Кривая показывает долю наблюдений, не превышающих выбранный порог.",
            en: "The curve shows the share of observations at or below each threshold.",
        },
        useWhen: {
            ru: "Нужно отвечать на вопросы о проценте наблюдений ниже заданного значения.",
            en: "You need to answer what share of observations falls below a threshold.",
        },
        avoidWhen: {
            ru: "Читателю важнее увидеть отдельные пики и форму обычного распределения.",
            en: "Readers need to see individual peaks and the shape of the distribution.",
        },
        unit: { ru: "% наблюдений", en: "% of observations" },
        data: [
            { label: { ru: "10", en: "10" }, value: 4 },
            { label: { ru: "20", en: "20" }, value: 13 },
            { label: { ru: "30", en: "30" }, value: 29 },
            { label: { ru: "40", en: "40" }, value: 51 },
            { label: { ru: "50", en: "50" }, value: 72 },
            { label: { ru: "60", en: "60" }, value: 86 },
            { label: { ru: "70", en: "70" }, value: 94 },
            { label: { ru: "80", en: "80" }, value: 98 },
            { label: { ru: "90", en: "90" }, value: 100 },
        ],
    },
    {
        id: "observation-strip",
        category: "distribution",
        kind: "observation-strip",
        title: { ru: "Полоса отдельных наблюдений", en: "Strip plot" },
        description: {
            ru: "Каждая точка представляет одно наблюдение, а небольшой сдвиг раскрывает совпадения.",
            en: "Each dot represents one observation, with slight jitter revealing overlaps.",
        },
        useWhen: {
            ru: "Наблюдений немного и важно не скрывать их агрегацией.",
            en: "There are relatively few observations and aggregation would hide useful detail.",
        },
        avoidWhen: {
            ru: "Точек настолько много, что наложение мешает увидеть плотность.",
            en: "There are so many points that overlap obscures density.",
        },
        unit: { ru: "баллов", en: "points" },
        data: [
            42, 45, 45, 48, 51, 52, 52, 53, 55, 56, 58, 58, 59, 61, 62, 64, 65, 67, 69, 72, 74, 77,
            81, 86,
        ].map((value, index) => ({
            label: { ru: `Наблюдение ${index + 1}`, en: `Observation ${index + 1}` },
            value,
        })),
    },
    {
        id: "distribution-barcode",
        category: "distribution",
        kind: "barcode",
        title: { ru: "Штрих-код распределения", en: "Distribution barcode" },
        description: {
            ru: "Каждое наблюдение отмечено тонким штрихом на общей числовой оси.",
            en: "Every observation is marked by a thin tick on a shared numerical axis.",
        },
        useWhen: {
            ru: "Нужно показать все точные позиции и заметить скопления или пустые интервалы.",
            en: "You want to show every exact position and reveal clusters or gaps.",
        },
        avoidWhen: {
            ru: "Много совпадающих значений: штрихи накладываются и скрывают частоту.",
            en: "Many values are identical, causing ticks to overlap and hide frequency.",
        },
        unit: { ru: "секунд", en: "seconds" },
        data: [12, 14, 17, 19, 23, 24, 27, 31, 32, 34, 37, 41, 46, 48, 52, 58, 61, 68, 74, 83].map(
            (value, index) => ({
                label: { ru: `Замер ${index + 1}`, en: `Reading ${index + 1}` },
                value,
            }),
        ),
    },
    {
        id: "stacked-columns",
        category: "part-whole",
        kind: "stacked-bar",
        title: { ru: "Составные столбцы", en: "Stacked columns" },
        description: {
            ru: "Сегменты столбца показывают состав общего значения в каждой категории.",
            en: "Segments within each column show how a total is composed in every category.",
        },
        useWhen: {
            ru: "Нужно одновременно сравнить общие величины и несколько устойчивых компонентов.",
            en: "You need to compare totals and a few consistent components at the same time.",
        },
        avoidWhen: {
            ru: "Важна точная разница внутренних сегментов без общей базовой линии.",
            en: "Precise comparison of internal segments without a common baseline matters.",
        },
        unit: { ru: "млн ₽", en: "million units" },
        valueLabels: {
            primary: { ru: "Персонал", en: "Staff" },
            secondary: { ru: "Инфраструктура", en: "Facilities" },
            tertiary: { ru: "Программы", en: "Programmes" },
        },
        data: [
            { label: { ru: "Школа А", en: "School A" }, value: 42, value2: 25, value3: 18 },
            { label: { ru: "Школа Б", en: "School B" }, value: 38, value2: 31, value3: 22 },
            { label: { ru: "Школа В", en: "School C" }, value: 51, value2: 28, value3: 16 },
            { label: { ru: "Школа Г", en: "School D" }, value: 46, value2: 34, value3: 27 },
        ],
    },
    {
        id: "normalized-stacked-bars",
        category: "part-whole",
        kind: "normalized-stacked",
        title: { ru: "Нормированные составные столбцы", en: "100% stacked bars" },
        description: {
            ru: "Каждый столбец приведён к 100%, поэтому сравнивается структура, а не общий размер.",
            en: "Every bar is normalised to 100%, focusing comparison on composition rather than total.",
        },
        useWhen: {
            ru: "Нужно сравнить доли одинаковых компонентов в нескольких группах.",
            en: "You need to compare the shares of consistent components across groups.",
        },
        avoidWhen: {
            ru: "Различия в абсолютном размере групп важны для вывода.",
            en: "Differences in the absolute size of groups are important to the conclusion.",
        },
        unit: { ru: "% ответов", en: "% of responses" },
        valueLabels: {
            primary: { ru: "Согласны", en: "Agree" },
            secondary: { ru: "Нейтральны", en: "Neutral" },
            tertiary: { ru: "Не согласны", en: "Disagree" },
        },
        data: [
            { label: { ru: "Первый курс", en: "Year one" }, value: 54, value2: 26, value3: 20 },
            { label: { ru: "Второй курс", en: "Year two" }, value: 61, value2: 23, value3: 16 },
            { label: { ru: "Третий курс", en: "Year three" }, value: 68, value2: 19, value3: 13 },
            { label: { ru: "Четвёртый курс", en: "Year four" }, value: 72, value2: 17, value3: 11 },
        ],
    },
    {
        id: "pie-chart",
        category: "part-whole",
        kind: "pie",
        title: { ru: "Круговая диаграмма", en: "Pie chart" },
        description: {
            ru: "Секторы показывают доли небольшого числа компонентов в одном целом.",
            en: "Slices show the shares of a small number of components within one whole.",
        },
        useWhen: {
            ru: "Компонентов мало, они складываются в 100%, а различия достаточно велики.",
            en: "There are few components, they sum to 100%, and differences are substantial.",
        },
        avoidWhen: {
            ru: "Долей много, они близки по размеру или нужно сравнить несколько целых.",
            en: "There are many similar shares or several wholes need comparison.",
        },
        unit: { ru: "% расходов", en: "% of spending" },
        data: [
            { label: { ru: "Обучение", en: "Teaching" }, value: 44 },
            { label: { ru: "Исследования", en: "Research" }, value: 29 },
            { label: { ru: "Кампус", en: "Campus" }, value: 17 },
            { label: { ru: "Поддержка", en: "Support" }, value: 10 },
        ],
    },
    {
        id: "treemap",
        category: "part-whole",
        kind: "treemap",
        title: { ru: "Древовидная карта", en: "Treemap" },
        description: {
            ru: "Площадь прямоугольника кодирует вклад элемента в общее значение.",
            en: "Rectangle area encodes each item's contribution to the total.",
        },
        useWhen: {
            ru: "Категорий много, важны крупные и мелкие компоненты, а точное сравнение вторично.",
            en: "There are many components and broad size differences matter more than precision.",
        },
        avoidWhen: {
            ru: "Значения близки или порядок категорий должен легко считываться.",
            en: "Values are similar or readers need a clearly ordered comparison.",
        },
        unit: { ru: "тыс. м²", en: "thousand m²" },
        data: [
            { label: { ru: "Учебные корпуса", en: "Teaching buildings" }, value: 38 },
            { label: { ru: "Общежития", en: "Residences" }, value: 27 },
            { label: { ru: "Лаборатории", en: "Laboratories" }, value: 19 },
            { label: { ru: "Спорт", en: "Sports" }, value: 11 },
            { label: { ru: "Библиотеки", en: "Libraries" }, value: 8 },
            { label: { ru: "Администрация", en: "Administration" }, value: 6 },
        ],
    },
    {
        id: "waterfall",
        category: "part-whole",
        kind: "waterfall",
        title: { ru: "Водопад", en: "Waterfall chart" },
        description: {
            ru: "Последовательные положительные и отрицательные вклады формируют итог.",
            en: "Sequential positive and negative contributions build to a final total.",
        },
        useWhen: {
            ru: "Нужно объяснить, как начальное значение изменилось под действием нескольких факторов.",
            en: "You need to explain how several factors transform a starting value into a final total.",
        },
        avoidWhen: {
            ru: "Шаги не образуют последовательный расчёт или важнее независимое сравнение факторов.",
            en: "Steps do not form a sequential calculation or factors should be compared independently.",
        },
        unit: { ru: "млн ₽", en: "million units" },
        data: [
            { label: { ru: "Старт", en: "Start" }, value: 120 },
            { label: { ru: "Продажи", en: "Sales" }, value: 35 },
            { label: { ru: "Возвраты", en: "Returns" }, value: -18 },
            { label: { ru: "Расходы", en: "Costs" }, value: -41 },
            { label: { ru: "Итог", en: "Total" }, value: 96 },
        ],
    },
    {
        id: "diverging-stacked-bars",
        category: "deviation",
        kind: "diverging-stacked",
        title: { ru: "Расходящиеся составные столбцы", en: "Diverging stacked bars" },
        description: {
            ru: "Ответы расходятся от центральной линии: несогласие влево, согласие вправо.",
            en: "Responses diverge from a central line, with disagreement left and agreement right.",
        },
        useWhen: {
            ru: "Нужно сравнить распределение ответов по шкале отношения в нескольких группах.",
            en: "You need to compare attitude-scale response distributions across several groups.",
        },
        avoidWhen: {
            ru: "Нужны точные значения каждой категории или у шкалы нет естественного центра.",
            en: "Exact category values matter or the scale has no meaningful midpoint.",
        },
        unit: { ru: "% ответов", en: "% of responses" },
        valueLabels: {
            primary: { ru: "Не согласны", en: "Disagree" },
            secondary: { ru: "Нейтральны", en: "Neutral" },
            tertiary: { ru: "Согласны", en: "Agree" },
        },
        data: [
            {
                label: { ru: "Доступность", en: "Accessibility" },
                value: 18,
                value2: 14,
                value3: 68,
            },
            { label: { ru: "Расписание", en: "Timetable" }, value: 31, value2: 19, value3: 50 },
            { label: { ru: "Материалы", en: "Materials" }, value: 12, value2: 16, value3: 72 },
            { label: { ru: "Обратная связь", en: "Feedback" }, value: 24, value2: 21, value3: 55 },
        ],
    },
    {
        id: "spine-chart",
        category: "deviation",
        kind: "spine",
        title: { ru: "Спайн-график", en: "Spine chart" },
        description: {
            ru: "Каждая полоса разделена относительно общей центральной линии на две противопоставленные части.",
            en: "Each bar splits around a shared centre line into two opposing parts.",
        },
        useWhen: {
            ru: "Нужно быстро сравнить баланс двух взаимоисключающих долей между группами.",
            en: "You need to compare the balance of two mutually exclusive shares across groups.",
        },
        avoidWhen: {
            ru: "Доли не образуют целое или важнее сравнить абсолютное число наблюдений.",
            en: "The shares do not form a whole or absolute counts matter more.",
        },
        unit: { ru: "% участников", en: "% of participants" },
        valueLabels: {
            primary: { ru: "Онлайн", en: "Online" },
            secondary: { ru: "Очно", en: "In person" },
        },
        data: [
            { label: { ru: "Первый курс", en: "Year one" }, value: 62, value2: 38 },
            { label: { ru: "Второй курс", en: "Year two" }, value: 54, value2: 46 },
            { label: { ru: "Третий курс", en: "Year three" }, value: 43, value2: 57 },
            { label: { ru: "Четвёртый курс", en: "Year four" }, value: 35, value2: 65 },
        ],
    },
    {
        id: "balance-area",
        category: "deviation",
        kind: "balance-area",
        title: { ru: "Баланс с заливкой", en: "Surplus and deficit area" },
        description: {
            ru: "Заливка между двумя рядами подчёркивает периоды избытка и дефицита.",
            en: "The fill between two series highlights periods of surplus and deficit.",
        },
        useWhen: {
            ru: "Нужно показать, когда один временной ряд превышает другой и насколько.",
            en: "You need to show when one time series exceeds another and by how much.",
        },
        avoidWhen: {
            ru: "Ряды измеряются в разных единицах или между соседними периодами нет непрерывности.",
            en: "The series use different units or adjacent periods are not continuous.",
        },
        unit: { ru: "МВт·ч", en: "MWh" },
        valueLabels: {
            primary: { ru: "Выработка", en: "Generation" },
            secondary: { ru: "Спрос", en: "Demand" },
        },
        data: [
            { label: { ru: "00:00", en: "00:00" }, value: 42, value2: 48 },
            { label: { ru: "04:00", en: "04:00" }, value: 38, value2: 43 },
            { label: { ru: "08:00", en: "08:00" }, value: 55, value2: 51 },
            { label: { ru: "12:00", en: "12:00" }, value: 68, value2: 58 },
            { label: { ru: "16:00", en: "16:00" }, value: 61, value2: 65 },
            { label: { ru: "20:00", en: "20:00" }, value: 49, value2: 57 },
            { label: { ru: "24:00", en: "24:00" }, value: 44, value2: 47 },
        ],
    },
    {
        id: "boxplot",
        category: "distribution",
        kind: "boxplot",
        title: { ru: "Ящик с усами", en: "Box plot" },
        description: {
            ru: "Медиана, квартили и крайние значения компактно описывают распределение каждой группы.",
            en: "Median, quartiles, and extremes provide a compact summary of each group.",
        },
        useWhen: {
            ru: "Нужно сравнить центр, разброс и асимметрию нескольких распределений.",
            en: "You need to compare centre, spread, and skew across several distributions.",
        },
        avoidWhen: {
            ru: "В выборке мало наблюдений или важны отдельные пики и разрывы плотности.",
            en: "Samples are small or individual peaks and gaps in density are important.",
        },
        unit: { ru: "минут в пути", en: "travel minutes" },
        valueLabels: { primary: { ru: "Медиана", en: "Median" } },
        data: [
            {
                label: { ru: "Автобус", en: "Bus" },
                value: 34,
                values: [22, 25, 27, 29, 31, 33, 34, 34, 36, 39, 42, 46, 52],
            },
            {
                label: { ru: "Трамвай", en: "Tram" },
                value: 29,
                values: [20, 22, 24, 25, 27, 28, 29, 29, 30, 32, 34, 37, 41],
            },
            {
                label: { ru: "Метро", en: "Metro" },
                value: 23,
                values: [17, 18, 19, 20, 21, 22, 23, 23, 24, 25, 27, 29, 32],
            },
            {
                label: { ru: "Велосипед", en: "Bicycle" },
                value: 27,
                values: [16, 19, 21, 23, 25, 26, 27, 28, 30, 33, 36, 40, 45],
            },
        ],
    },
    {
        id: "violin-plot",
        category: "distribution",
        kind: "violin",
        title: { ru: "Скрипичная диаграмма", en: "Violin plot" },
        description: {
            ru: "Ширина симметричной формы показывает плотность наблюдений на разных значениях.",
            en: "The width of each symmetric shape represents observation density at each value.",
        },
        useWhen: {
            ru: "Важно сравнить не только медиану и разброс, но и форму нескольких распределений.",
            en: "You need to compare distribution shape as well as centre and spread.",
        },
        avoidWhen: {
            ru: "Аудитории нужна простая сводка или наблюдений недостаточно для оценки плотности.",
            en: "Readers need a simple summary or there are too few observations for density estimation.",
        },
        unit: { ru: "минут в пути", en: "travel minutes" },
        valueLabels: { primary: { ru: "Медиана", en: "Median" } },
        data: [
            {
                label: { ru: "Автобус", en: "Bus" },
                value: 34,
                values: [22, 25, 27, 29, 31, 33, 34, 34, 36, 39, 42, 46, 52],
            },
            {
                label: { ru: "Трамвай", en: "Tram" },
                value: 29,
                values: [20, 22, 24, 25, 27, 28, 29, 29, 30, 32, 34, 37, 41],
            },
            {
                label: { ru: "Метро", en: "Metro" },
                value: 23,
                values: [17, 18, 19, 20, 21, 22, 23, 23, 24, 25, 27, 29, 32],
            },
            {
                label: { ru: "Велосипед", en: "Bicycle" },
                value: 27,
                values: [16, 19, 21, 23, 25, 26, 27, 28, 30, 33, 36, 40, 45],
            },
        ],
    },
    {
        id: "ordered-vertical-bars",
        category: "ranking",
        kind: "vertical-bar",
        title: { ru: "Упорядоченные вертикальные столбцы", en: "Ordered columns" },
        description: {
            ru: "Высота отсортированных столбцов показывает величину и место категории.",
            en: "Sorted column heights show both category magnitude and rank.",
        },
        useWhen: {
            ru: "Категорий немного, подписи короткие и нужно подчеркнуть порядок.",
            en: "There are few categories, labels are short, and rank should be prominent.",
        },
        avoidWhen: {
            ru: "Названия длинные или категорий слишком много для горизонтальной оси.",
            en: "Labels are long or there are too many categories for the horizontal axis.",
        },
        unit: { ru: "заявок", en: "applications" },
        data: [
            { label: { ru: "ИТ", en: "IT" }, value: 96 },
            { label: { ru: "Дизайн", en: "Design" }, value: 81 },
            { label: { ru: "Экономика", en: "Economics" }, value: 68 },
            { label: { ru: "Экология", en: "Ecology" }, value: 54 },
            { label: { ru: "История", en: "History" }, value: 39 },
        ],
    },
    {
        id: "ranked-proportional-symbols",
        category: "ranking",
        kind: "proportional-symbols",
        title: { ru: "Упорядоченные пропорциональные символы", en: "Ranked proportional symbols" },
        description: {
            ru: "Площадь кругов кодирует величину, а порядок помогает сравнить ранг.",
            en: "Circle area encodes magnitude while ordering supports rank comparison.",
        },
        useWhen: {
            ru: "Нужно выразительно показать большие различия среди небольшого числа категорий.",
            en: "You want an expressive view of large differences among a few categories.",
        },
        avoidWhen: {
            ru: "Значения близки и требуется точное сравнение.",
            en: "Values are close and precise comparison is required.",
        },
        unit: { ru: "участников", en: "participants" },
        data: [
            { label: { ru: "Фестиваль", en: "Festival" }, value: 2400 },
            { label: { ru: "Хакатон", en: "Hackathon" }, value: 1700 },
            { label: { ru: "Лекторий", en: "Lecture series" }, value: 980 },
            { label: { ru: "Турнир", en: "Tournament" }, value: 620 },
            { label: { ru: "Клуб", en: "Club" }, value: 310 },
        ],
    },
    {
        id: "dots-on-strip",
        category: "ranking",
        kind: "dot-strip",
        title: { ru: "Точки на полосе", en: "Dots on a strip" },
        description: {
            ru: "Точки показывают позиции категорий на общей числовой шкале без тяжёлых столбцов.",
            en: "Dots place categories on a shared numerical scale without heavy bars.",
        },
        useWhen: {
            ru: "Нужно лёгкое и точное ранжирование нескольких значений.",
            en: "You need a light but precise ranking of several values.",
        },
        avoidWhen: {
            ru: "Нулевая базовая линия принципиальна для интерпретации величины.",
            en: "A zero baseline is essential to interpreting magnitude.",
        },
        unit: { ru: "баллов", en: "points" },
        data: [
            { label: { ru: "Север", en: "North" }, value: 88 },
            { label: { ru: "Центр", en: "Central" }, value: 79 },
            { label: { ru: "Восток", en: "East" }, value: 73 },
            { label: { ru: "Юг", en: "South" }, value: 65 },
            { label: { ru: "Запад", en: "West" }, value: 58 },
        ],
    },
    {
        id: "vertical-lollipop",
        category: "ranking",
        kind: "vertical-lollipop",
        title: { ru: "Вертикальный лоллипоп", en: "Vertical lollipop chart" },
        description: {
            ru: "Тонкая линия связывает базу с точкой, сохраняя акцент на конечном значении.",
            en: "A thin stem connects the baseline to a dot, keeping focus on the endpoint.",
        },
        useWhen: {
            ru: "Категорий немного и нужен более лёгкий вариант вертикальных столбцов.",
            en: "There are few categories and you want a lighter alternative to columns.",
        },
        avoidWhen: {
            ru: "Подписи длинные или нужно сравнить состав каждого значения.",
            en: "Labels are long or each value's composition needs comparison.",
        },
        unit: { ru: "% завершивших", en: "% completed" },
        data: [
            { label: { ru: "Курс A", en: "Course A" }, value: 91 },
            { label: { ru: "Курс Б", en: "Course B" }, value: 84 },
            { label: { ru: "Курс В", en: "Course C" }, value: 76 },
            { label: { ru: "Курс Г", en: "Course D" }, value: 69 },
            { label: { ru: "Курс Д", en: "Course E" }, value: 61 },
        ],
    },
    {
        id: "bump-chart",
        category: "ranking",
        kind: "bump",
        title: { ru: "Бамп-чарт", en: "Bump chart" },
        description: {
            ru: "Линии показывают, как места участников меняются между несколькими периодами.",
            en: "Lines show how participants move through ranks across several periods.",
        },
        useWhen: {
            ru: "Важны перестановки в рейтинге во времени, а не абсолютные показатели.",
            en: "Movement in rank over time matters more than absolute measures.",
        },
        avoidWhen: {
            ru: "Участников слишком много или важен размер разрыва между их показателями.",
            en: "There are too many participants or gaps between underlying values matter.",
        },
        unit: { ru: "место", en: "rank" },
        valueLabels: { primary: { ru: "Итоговое место", en: "Final rank" } },
        data: [
            { label: { ru: "Команда А", en: "Team A" }, value: 2, values: [1, 2, 3, 2] },
            { label: { ru: "Команда Б", en: "Team B" }, value: 1, values: [4, 3, 2, 1] },
            { label: { ru: "Команда В", en: "Team C" }, value: 4, values: [2, 1, 1, 4] },
            { label: { ru: "Команда Г", en: "Team D" }, value: 3, values: [3, 4, 4, 3] },
        ],
    },
    {
        id: "line-and-columns",
        category: "correlation",
        kind: "correlation-combo",
        title: { ru: "Линия и столбцы", en: "Line and columns" },
        description: {
            ru: "Столбцы показывают абсолютный объём, а линия — связанный относительный показатель.",
            en: "Columns show absolute volume while a line tracks a related relative measure.",
        },
        useWhen: {
            ru: "Нужно сопоставить объём и нормированный показатель в общей последовательности.",
            en: "You need to compare a volume measure with a related rate across one sequence.",
        },
        avoidWhen: {
            ru: "Две шкалы создают ложную связь или показатели не имеют общего контекста.",
            en: "Dual scales imply a false relationship or the measures lack shared context.",
        },
        unit: { ru: "посещения / %", en: "visits / %" },
        valueLabels: {
            primary: { ru: "Посещения, тыс.", en: "Visits, thousands" },
            secondary: { ru: "Доля возвратов, %", en: "Return rate, %" },
        },
        data: [
            { label: { ru: "Янв", en: "Jan" }, value: 42, value2: 31 },
            { label: { ru: "Фев", en: "Feb" }, value: 51, value2: 34 },
            { label: { ru: "Мар", en: "Mar" }, value: 58, value2: 39 },
            { label: { ru: "Апр", en: "Apr" }, value: 66, value2: 43 },
            { label: { ru: "Май", en: "May" }, value: 73, value2: 47 },
            { label: { ru: "Июн", en: "Jun" }, value: 79, value2: 52 },
        ],
    },
    {
        id: "connected-scatterplot",
        category: "correlation",
        kind: "connected-scatter",
        title: { ru: "Связанная диаграмма рассеяния", en: "Connected scatterplot" },
        description: {
            ru: "Траектория соединяет последовательные пары значений и показывает изменение их связи.",
            en: "A trajectory connects sequential value pairs and shows how their relationship evolves.",
        },
        useWhen: {
            ru: "Есть два числовых показателя и важен путь между последовательными периодами.",
            en: "You have two numerical measures and the path between periods is meaningful.",
        },
        avoidWhen: {
            ru: "Последовательность точек не важна или траектория слишком запутана.",
            en: "Point order is irrelevant or the trajectory becomes too tangled.",
        },
        unit: { ru: "индексы", en: "indices" },
        valueLabels: {
            primary: { ru: "Доступность", en: "Affordability" },
            secondary: { ru: "Качество", en: "Quality" },
        },
        data: [
            { label: { ru: "2020", en: "2020" }, value: 58, value2: 62 },
            { label: { ru: "2021", en: "2021" }, value: 54, value2: 67 },
            { label: { ru: "2022", en: "2022" }, value: 61, value2: 71 },
            { label: { ru: "2023", en: "2023" }, value: 68, value2: 76 },
            { label: { ru: "2024", en: "2024" }, value: 73, value2: 74 },
            { label: { ru: "2025", en: "2025" }, value: 78, value2: 81 },
        ],
    },
    {
        id: "bubble-chart",
        category: "correlation",
        kind: "bubble",
        title: { ru: "Пузырьковая диаграмма", en: "Bubble chart" },
        description: {
            ru: "Положение показывает два числовых показателя, а площадь круга — третий.",
            en: "Position shows two numerical measures while circle area encodes a third.",
        },
        useWhen: {
            ru: "Нужно исследовать связь двух показателей с учётом масштаба наблюдения.",
            en: "You need to explore two-variable relationships while accounting for observation size.",
        },
        avoidWhen: {
            ru: "Пузырей много, размеры близки или третья переменная несущественна.",
            en: "There are many bubbles, sizes are similar, or the third variable is not meaningful.",
        },
        unit: { ru: "баллы / студентов", en: "scores / students" },
        valueLabels: {
            primary: { ru: "Практика, баллы", en: "Practice score" },
            secondary: { ru: "Экзамен, баллы", en: "Exam score" },
            tertiary: { ru: "Студентов", en: "Students" },
        },
        data: [
            { label: { ru: "Программа А", en: "Programme A" }, value: 72, value2: 78, value3: 420 },
            { label: { ru: "Программа Б", en: "Programme B" }, value: 64, value2: 69, value3: 260 },
            { label: { ru: "Программа В", en: "Programme C" }, value: 81, value2: 84, value3: 510 },
            { label: { ru: "Программа Г", en: "Programme D" }, value: 58, value2: 74, value3: 180 },
            { label: { ru: "Программа Д", en: "Programme E" }, value: 76, value2: 66, value3: 340 },
        ],
    },
    {
        id: "sankey-diagram",
        category: "flow",
        kind: "sankey",
        title: { ru: "Диаграмма Санки", en: "Sankey diagram" },
        description: {
            ru: "Ширина связей показывает объём потока между этапами системы.",
            en: "Link width represents the volume flowing between stages of a system.",
        },
        useWhen: {
            ru: "Нужно проследить распределение общего потока по нескольким направлениям.",
            en: "You need to trace how a total flow splits across several destinations.",
        },
        avoidWhen: {
            ru: "Связей слишком много или их величины не складываются в осмысленный поток.",
            en: "There are too many links or their values do not form a meaningful flow.",
        },
        unit: { ru: "студентов", en: "students" },
        data: [
            { label: { ru: "Поступили|1 курс", en: "Enrolled|Year 1" }, value: 520 },
            { label: { ru: "1 курс|2 курс", en: "Year 1|Year 2" }, value: 438 },
            { label: { ru: "1 курс|Перевелись", en: "Year 1|Transferred" }, value: 34 },
            { label: { ru: "1 курс|Выбыли", en: "Year 1|Left" }, value: 48 },
            { label: { ru: "2 курс|3 курс", en: "Year 2|Year 3" }, value: 391 },
            { label: { ru: "2 курс|Выбыли", en: "Year 2|Left" }, value: 47 },
            { label: { ru: "3 курс|Выпустились", en: "Year 3|Graduated" }, value: 362 },
            { label: { ru: "3 курс|Выбыли", en: "Year 3|Left" }, value: 29 },
        ],
    },
    {
        id: "process-waterfall",
        category: "flow",
        kind: "process-waterfall",
        title: { ru: "Водопад процесса", en: "Process waterfall" },
        description: {
            ru: "Последовательные потери показывают, сколько объектов остаётся на каждом этапе.",
            en: "Sequential losses show how many items remain at each process stage.",
        },
        useWhen: {
            ru: "Нужно объяснить уменьшение исходного объёма через последовательные этапы.",
            en: "You need to explain how an initial volume declines through sequential stages.",
        },
        avoidWhen: {
            ru: "Этапы идут параллельно или объекты могут возвращаться назад.",
            en: "Stages run in parallel or items can move backwards.",
        },
        unit: { ru: "заявок", en: "applications" },
        data: [
            { label: { ru: "Получено", en: "Received" }, value: 1000 },
            { label: { ru: "Проверка", en: "Screening" }, value: -180 },
            { label: { ru: "Интервью", en: "Interview" }, value: -260 },
            { label: { ru: "Предложение", en: "Offer" }, value: -310 },
            { label: { ru: "Принято", en: "Accepted" }, value: 250 },
        ],
    },
    {
        id: "chord-diagram",
        category: "flow",
        kind: "chord",
        title: { ru: "Хордовая диаграмма", en: "Chord diagram" },
        description: {
            ru: "Круговая компоновка показывает взаимные потоки между одними и теми же группами.",
            en: "A circular layout shows reciprocal flows among the same set of groups.",
        },
        useWhen: {
            ru: "Нужно дать обзор обмена между небольшим числом равноправных групп.",
            en: "You need an overview of exchanges among a small number of peer groups.",
        },
        avoidWhen: {
            ru: "Требуется точно сравнить связи или направлений слишком много.",
            en: "Links need precise comparison or there are too many directions.",
        },
        unit: { ru: "совместных проектов", en: "joint projects" },
        data: [
            { label: { ru: "Наука|Бизнес", en: "Science|Business" }, value: 18 },
            { label: { ru: "Наука|Город", en: "Science|City" }, value: 12 },
            { label: { ru: "Бизнес|Город", en: "Business|City" }, value: 15 },
            { label: { ru: "Бизнес|Культура", en: "Business|Culture" }, value: 9 },
            { label: { ru: "Город|Культура", en: "City|Culture" }, value: 14 },
            { label: { ru: "Культура|Наука", en: "Culture|Science" }, value: 7 },
        ],
    },
    {
        id: "network-diagram",
        category: "flow",
        kind: "network",
        title: { ru: "Сетевая диаграмма", en: "Network diagram" },
        description: {
            ru: "Узлы и связи раскрывают структуру взаимодействий без обязательной иерархии.",
            en: "Nodes and links reveal interaction structure without requiring a hierarchy.",
        },
        useWhen: {
            ru: "Важно найти центры, кластеры и мосты в небольшой сети.",
            en: "You need to identify hubs, clusters, and bridges in a small network.",
        },
        avoidWhen: {
            ru: "Связей так много, что они образуют нечитаемый клубок.",
            en: "There are so many links that the diagram becomes an unreadable hairball.",
        },
        unit: { ru: "взаимодействий", en: "interactions" },
        data: [
            { label: { ru: "Куратор|Команда А", en: "Mentor|Team A" }, value: 8 },
            { label: { ru: "Куратор|Команда Б", en: "Mentor|Team B" }, value: 7 },
            { label: { ru: "Куратор|Лаборатория", en: "Mentor|Lab" }, value: 9 },
            { label: { ru: "Команда А|Дизайн", en: "Team A|Design" }, value: 6 },
            { label: { ru: "Команда Б|Данные", en: "Team B|Data" }, value: 5 },
            { label: { ru: "Лаборатория|Данные", en: "Lab|Data" }, value: 7 },
            { label: { ru: "Дизайн|Данные", en: "Design|Data" }, value: 4 },
        ],
    },
    {
        id: "magnitude-columns",
        category: "magnitude",
        kind: "vertical-bar",
        title: { ru: "Вертикальные столбцы", en: "Vertical bars" },
        description: {
            ru: "Общая нулевая линия помогает точно сравнить величины нескольких категорий.",
            en: "A shared zero baseline supports accurate comparison across categories.",
        },
        useWhen: {
            ru: "Категорий немного, подписи короткие и важна величина различий.",
            en: "There are few categories, labels are short, and difference magnitude matters.",
        },
        avoidWhen: {
            ru: "Категорий много или их названия не помещаются по горизонтали.",
            en: "There are many categories or their labels do not fit horizontally.",
        },
        unit: { ru: "тыс. книг", en: "thousand books" },
        data: [
            { label: { ru: "История", en: "History" }, value: 48 },
            { label: { ru: "Наука", en: "Science" }, value: 71 },
            { label: { ru: "Искусство", en: "Arts" }, value: 39 },
            { label: { ru: "Общество", en: "Society" }, value: 57 },
            { label: { ru: "Техника", en: "Technology" }, value: 64 },
        ],
    },
    {
        id: "magnitude-bars",
        category: "magnitude",
        kind: "bar",
        title: { ru: "Горизонтальные столбцы", en: "Horizontal bars" },
        description: {
            ru: "Горизонтальная компоновка оставляет место для длинных названий категорий.",
            en: "A horizontal layout leaves room for long category names.",
        },
        useWhen: {
            ru: "Нужно сравнить величины категорий с длинными подписями.",
            en: "You need to compare categories with long labels.",
        },
        avoidWhen: {
            ru: "Категории образуют временную последовательность.",
            en: "The categories form a meaningful time sequence that should retain its order.",
        },
        unit: { ru: "посещений в месяц", en: "visits per month" },
        data: [
            {
                label: { ru: "Центр современной культуры", en: "Contemporary culture centre" },
                value: 8200,
            },
            { label: { ru: "Музей городской истории", en: "City history museum" }, value: 6900 },
            { label: { ru: "Научная библиотека", en: "Science library" }, value: 11300 },
            { label: { ru: "Молодёжный театр", en: "Youth theatre" }, value: 5400 },
        ],
    },
    {
        id: "grouped-vertical-columns",
        category: "magnitude",
        kind: "grouped-column",
        title: { ru: "Сгруппированные вертикальные столбцы", en: "Grouped vertical bars" },
        description: {
            ru: "Соседние столбцы сравнивают две связанные величины внутри каждой категории.",
            en: "Adjacent bars compare two related measures within each category.",
        },
        useWhen: {
            ru: "Нужно сравнить небольшое число серий в одних и тех же категориях.",
            en: "You need to compare a small number of series across shared categories.",
        },
        avoidWhen: {
            ru: "Серий больше трёх или важнее суммарный состав.",
            en: "There are more than three series or total composition matters more.",
        },
        unit: { ru: "% выпускников", en: "% of graduates" },
        valueLabels: {
            primary: { ru: "2024", en: "2024" },
            secondary: { ru: "2025", en: "2025" },
        },
        data: [
            { label: { ru: "Инженерия", en: "Engineering" }, value: 78, value2: 84 },
            { label: { ru: "Экономика", en: "Economics" }, value: 72, value2: 75 },
            { label: { ru: "Педагогика", en: "Education" }, value: 81, value2: 86 },
            { label: { ru: "Дизайн", en: "Design" }, value: 68, value2: 74 },
        ],
    },
    {
        id: "composition-and-magnitude",
        category: "magnitude",
        kind: "stacked-bar",
        title: { ru: "Состав и величина", en: "Composition and magnitude" },
        description: {
            ru: "Общая длина показывает итог, а сегменты — вклад компонентов.",
            en: "Total bar length shows magnitude while segments show component contributions.",
        },
        useWhen: {
            ru: "Нужно одновременно сравнить итоги и их несложный состав.",
            en: "You need to compare totals and their simple composition at once.",
        },
        avoidWhen: {
            ru: "Нужно точно сравнить каждый внутренний сегмент между категориями.",
            en: "Every internal segment must be compared precisely across categories.",
        },
        unit: { ru: "ГВт·ч", en: "GWh" },
        valueLabels: {
            primary: { ru: "Солнце", en: "Solar" },
            secondary: { ru: "Ветер", en: "Wind" },
            tertiary: { ru: "Гидро", en: "Hydro" },
        },
        data: [
            { label: { ru: "Север", en: "North" }, value: 18, value2: 42, value3: 26 },
            { label: { ru: "Центр", en: "Central" }, value: 35, value2: 24, value3: 12 },
            { label: { ru: "Юг", en: "South" }, value: 54, value2: 19, value3: 8 },
            { label: { ru: "Восток", en: "East" }, value: 22, value2: 31, value3: 37 },
        ],
    },
    {
        id: "magnitude-proportional-symbols",
        category: "magnitude",
        kind: "proportional-symbols",
        title: { ru: "Пропорциональные символы", en: "Proportional symbols" },
        description: {
            ru: "Площадь круга кодирует величину, позволяя компактно показать большой диапазон.",
            en: "Circle area encodes magnitude, compactly displaying a wide range.",
        },
        useWhen: {
            ru: "Нужен обзор сильных различий, а точное считывание вторично.",
            en: "You need an overview of large differences and exact reading is secondary.",
        },
        avoidWhen: {
            ru: "Значения близки: длину столбцов сравнивать точнее, чем площадь.",
            en: "Values are similar; bar length is easier to compare than area.",
        },
        unit: { ru: "тыс. м²", en: "thousand m²" },
        data: [
            { label: { ru: "Главный парк", en: "Central Park" }, value: 92 },
            { label: { ru: "Речной сквер", en: "Riverside Garden" }, value: 38 },
            { label: { ru: "Лесной массив", en: "Urban Forest" }, value: 146 },
            { label: { ru: "Сад искусств", en: "Arts Garden" }, value: 24 },
            { label: { ru: "Спортивный парк", en: "Sports Park" }, value: 61 },
        ],
    },
    {
        id: "pictogram",
        category: "magnitude",
        kind: "pictogram",
        title: { ru: "Пиктограмма", en: "Pictogram" },
        description: {
            ru: "Повторяющиеся символы превращают небольшие целые значения в наглядный счёт.",
            en: "Repeated symbols turn small whole-number values into a visible count.",
        },
        useWhen: {
            ru: "Значения небольшие, целые и важна дружелюбная учебная подача.",
            en: "Values are small whole numbers and an approachable presentation is useful.",
        },
        avoidWhen: {
            ru: "Нужна высокая точность, есть дроби или значения очень велики.",
            en: "High precision is needed, values include fractions, or counts are very large.",
        },
        unit: { ru: "десятков деревьев", en: "tens of trees" },
        data: [
            { label: { ru: "Школьные дворы", en: "School grounds" }, value: 8 },
            { label: { ru: "Улицы", en: "Streets" }, value: 12 },
            { label: { ru: "Скверы", en: "Pocket parks" }, value: 6 },
            { label: { ru: "Набережная", en: "Waterfront" }, value: 10 },
        ],
    },
    {
        id: "magnitude-horizontal-lollipop",
        category: "magnitude",
        kind: "lollipop",
        title: {
            ru: "Горизонтальный лоллипоп величин",
            en: "Horizontal magnitude lollipop",
        },
        description: {
            ru: "Тонкая линия и точка облегчают сравнение при менее тяжёлом визуальном весе.",
            en: "A thin stem and dot support comparison with less visual weight than bars.",
        },
        useWhen: {
            ru: "Нужно сравнить несколько положительных величин в лёгкой композиции.",
            en: "You need to compare several positive values in a light composition.",
        },
        avoidWhen: {
            ru: "Важно подчеркнуть объём или значения начинаются не от нуля.",
            en: "Volume should be emphasised or values do not start from zero.",
        },
        unit: { ru: "минут", en: "minutes" },
        data: [
            { label: { ru: "Автобус", en: "Bus" }, value: 34 },
            { label: { ru: "Трамвай", en: "Tram" }, value: 28 },
            { label: { ru: "Велосипед", en: "Bicycle" }, value: 22 },
            { label: { ru: "Пешком", en: "Walking" }, value: 46 },
        ],
    },
    {
        id: "magnitude-vertical-lollipop",
        category: "magnitude",
        kind: "vertical-lollipop",
        title: {
            ru: "Вертикальный лоллипоп величин",
            en: "Vertical magnitude lollipop",
        },
        description: {
            ru: "Вертикальные стебли и точки показывают величины короткого ряда категорий.",
            en: "Vertical stems and dots show values for a short set of categories.",
        },
        useWhen: {
            ru: "Категорий мало, подписи короткие и хочется уменьшить массу столбцов.",
            en: "There are few categories, labels are short, and bars feel too heavy.",
        },
        avoidWhen: {
            ru: "Категорий много или длинные названия не помещаются вдоль горизонтальной оси.",
            en: "There are many categories or long labels cannot fit along the horizontal axis.",
        },
        unit: { ru: "кг отходов на человека", en: "kg waste per person" },
        data: [
            { label: { ru: "Бумага", en: "Paper" }, value: 18 },
            { label: { ru: "Стекло", en: "Glass" }, value: 11 },
            { label: { ru: "Пластик", en: "Plastic" }, value: 23 },
            { label: { ru: "Металл", en: "Metal" }, value: 7 },
            { label: { ru: "Органика", en: "Organic" }, value: 31 },
        ],
    },
    {
        id: "parallel-coordinates",
        category: "magnitude",
        kind: "parallel",
        title: { ru: "Параллельные координаты", en: "Parallel coordinates" },
        description: {
            ru: "Каждая линия объединяет несколько показателей одного наблюдения на параллельных осях.",
            en: "Each line connects several measures for one observation across parallel axes.",
        },
        useWhen: {
            ru: "Нужно сравнить многомерные профили небольшого числа объектов.",
            en: "You need to compare multivariate profiles for a small number of observations.",
        },
        avoidWhen: {
            ru: "Линий слишком много или порядок и масштабы осей не объяснены.",
            en: "There are too many lines or axis order and scales are unexplained.",
        },
        unit: { ru: "индексы 0–100", en: "indices 0–100" },
        valueLabels: {
            primary: { ru: "Средний индекс", en: "Average index" },
        },
        data: [
            { label: { ru: "Район А", en: "District A" }, value: 70, values: [82, 61, 74, 68, 65] },
            { label: { ru: "Район Б", en: "District B" }, value: 64, values: [59, 78, 66, 71, 46] },
            { label: { ru: "Район В", en: "District C" }, value: 76, values: [74, 69, 88, 57, 91] },
            { label: { ru: "Район Г", en: "District D" }, value: 58, values: [67, 52, 49, 84, 38] },
        ],
    },
    {
        id: "candlestick-chart",
        category: "change-time",
        kind: "candlestick",
        title: { ru: "Биржевые свечи", en: "Candlestick chart" },
        description: {
            ru: "Тело и тени свечи показывают открытие, закрытие, минимум и максимум периода.",
            en: "The candle body and wicks show each period's open, close, low, and high.",
        },
        useWhen: {
            ru: "Нужно компактно показать четыре согласованных значения финансового ряда.",
            en: "You need to compactly show four related values in a financial time series.",
        },
        avoidWhen: {
            ru: "У ряда есть только одно значение на период или аудитория не знает соглашений свечей.",
            en: "There is only one value per period or readers do not know candlestick conventions.",
        },
        unit: { ru: "условных единиц", en: "index points" },
        valueLabels: { primary: { ru: "Закрытие", en: "Close" } },
        data: [
            { label: { ru: "Пн", en: "Mon" }, value: 104, values: [100, 104, 97, 107] },
            { label: { ru: "Вт", en: "Tue" }, value: 101, values: [104, 101, 99, 108] },
            { label: { ru: "Ср", en: "Wed" }, value: 109, values: [101, 109, 100, 112] },
            { label: { ru: "Чт", en: "Thu" }, value: 115, values: [109, 115, 106, 118] },
            { label: { ru: "Пт", en: "Fri" }, value: 112, values: [115, 112, 110, 120] },
            { label: { ru: "Сб", en: "Sat" }, value: 118, values: [112, 118, 111, 121] },
        ],
    },
    {
        id: "fan-chart",
        category: "change-time",
        kind: "fan",
        title: { ru: "Веерная диаграмма", en: "Fan chart" },
        description: {
            ru: "Центральная линия показывает прогноз, а расширяющиеся полосы — диапазоны неопределённости.",
            en: "A central line shows the forecast while widening bands show uncertainty ranges.",
        },
        useWhen: {
            ru: "Нужно честно показать прогноз вместе с растущей неопределённостью.",
            en: "You need to communicate a forecast together with increasing uncertainty.",
        },
        avoidWhen: {
            ru: "Диапазоны не основаны на определённой вероятностной модели.",
            en: "The ranges are not based on a defined probabilistic model.",
        },
        unit: { ru: "индекс спроса", en: "demand index" },
        valueLabels: {
            primary: { ru: "Прогноз", en: "Forecast" },
            secondary: { ru: "Нижняя граница", en: "Lower bound" },
            tertiary: { ru: "Верхняя граница", en: "Upper bound" },
        },
        data: [
            { label: { ru: "2025", en: "2025" }, value: 100, value2: 100, value3: 100 },
            { label: { ru: "2026", en: "2026" }, value: 104, value2: 98, value3: 110 },
            { label: { ru: "2027", en: "2027" }, value: 108, value2: 96, value3: 120 },
            { label: { ru: "2028", en: "2028" }, value: 111, value2: 92, value3: 130 },
            { label: { ru: "2029", en: "2029" }, value: 115, value2: 88, value3: 142 },
            { label: { ru: "2030", en: "2030" }, value: 119, value2: 83, value3: 155 },
        ],
    },
    {
        id: "connected-scatter-timeline",
        category: "change-time",
        kind: "timeline-connected",
        title: {
            ru: "Связанная диаграмма рассеяния во времени",
            en: "Connected scatterplot over time",
        },
        description: {
            ru: "Траектория показывает, как совместно менялись два показателя по периодам.",
            en: "A trajectory shows how two measures changed together over successive periods.",
        },
        useWhen: {
            ru: "Важны и связь двух показателей, и последовательность движения.",
            en: "Both the relationship between two measures and the sequence of movement matter.",
        },
        avoidWhen: {
            ru: "Траектория самопересекается слишком часто или периоды нельзя различить.",
            en: "The trajectory crosses itself too often or periods cannot be distinguished.",
        },
        unit: { ru: "индексы мобильности и выбросов", en: "mobility and emissions indices" },
        valueLabels: {
            primary: { ru: "Мобильность", en: "Mobility" },
            secondary: { ru: "Выбросы", en: "Emissions" },
        },
        data: [
            { label: { ru: "2020", en: "2020" }, value: 62, value2: 78 },
            { label: { ru: "2021", en: "2021" }, value: 55, value2: 66 },
            { label: { ru: "2022", en: "2022" }, value: 71, value2: 72 },
            { label: { ru: "2023", en: "2023" }, value: 79, value2: 68 },
            { label: { ru: "2024", en: "2024" }, value: 86, value2: 61 },
            { label: { ru: "2025", en: "2025" }, value: 91, value2: 55 },
        ],
    },
    {
        id: "circles-on-timeline",
        category: "change-time",
        kind: "circle-timeline",
        title: { ru: "Круги на временной шкале", en: "Circles on a timeline" },
        description: {
            ru: "Положение показывает время события, а площадь круга — его величину.",
            en: "Position shows event time while circle area encodes its magnitude.",
        },
        useWhen: {
            ru: "События дискретны и нужно сопоставить их время и масштаб.",
            en: "Events are discrete and both their timing and magnitude should be compared.",
        },
        avoidWhen: {
            ru: "События плотные и круги сильно перекрываются.",
            en: "Events are dense and circles overlap heavily.",
        },
        unit: { ru: "участников", en: "participants" },
        data: [
            { label: { ru: "Янв", en: "Jan" }, value: 120 },
            { label: { ru: "Мар", en: "Mar" }, value: 340 },
            { label: { ru: "Апр", en: "Apr" }, value: 210 },
            { label: { ru: "Июл", en: "Jul" }, value: 520 },
            { label: { ru: "Сен", en: "Sep" }, value: 280 },
            { label: { ru: "Дек", en: "Dec" }, value: 430 },
        ],
    },
    {
        id: "seismogram",
        category: "change-time",
        kind: "seismogram",
        title: { ru: "Сейсмограмма", en: "Seismogram" },
        description: {
            ru: "Плотная линия подчёркивает амплитуду быстрых колебаний вокруг базовой оси.",
            en: "A dense line emphasises the amplitude of rapid oscillations around a baseline.",
        },
        useWhen: {
            ru: "Нужно показать форму сигнала, всплески и затухание во времени.",
            en: "You need to show signal shape, spikes, and decay over time.",
        },
        avoidWhen: {
            ru: "Важны отдельные точные значения, а не рисунок сигнала.",
            en: "Individual exact values matter more than the signal pattern.",
        },
        unit: { ru: "мм/с", en: "mm/s" },
        data: [
            { label: { ru: "0,0", en: "0.0" }, value: 0 },
            { label: { ru: "0,1", en: "0.1" }, value: 3 },
            { label: { ru: "0,2", en: "0.2" }, value: -5 },
            { label: { ru: "0,3", en: "0.3" }, value: 14 },
            { label: { ru: "0,4", en: "0.4" }, value: -22 },
            { label: { ru: "0,5", en: "0.5" }, value: 31 },
            { label: { ru: "0,6", en: "0.6" }, value: -18 },
            { label: { ru: "0,7", en: "0.7" }, value: 11 },
            { label: { ru: "0,8", en: "0.8" }, value: -7 },
            { label: { ru: "0,9", en: "0.9" }, value: 4 },
            { label: { ru: "1,0", en: "1.0" }, value: -2 },
            { label: { ru: "1,1", en: "1.1" }, value: 0 },
        ],
    },
    {
        id: "sunburst-chart",
        category: "part-whole",
        kind: "sunburst",
        title: { ru: "Солнечная диаграмма", en: "Sunburst chart" },
        description: {
            ru: "Концентрические кольца показывают уровни иерархии и доли ветвей в целом.",
            en: "Concentric rings show hierarchy levels and branch shares of the whole.",
        },
        useWhen: {
            ru: "Нужно дать компактный обзор иерархии из двух-трёх уровней.",
            en: "You need a compact overview of a hierarchy with two or three levels.",
        },
        avoidWhen: {
            ru: "Важно точно сравнить узлы из разных ветвей или уровней слишком много.",
            en: "Nodes across branches need precise comparison or there are too many levels.",
        },
        unit: { ru: "% расходов", en: "% of spending" },
        data: [
            { label: { ru: "Обучение|Программы", en: "Teaching|Programmes" }, value: 28 },
            { label: { ru: "Обучение|Библиотека", en: "Teaching|Library" }, value: 14 },
            { label: { ru: "Исследования|Лаборатории", en: "Research|Laboratories" }, value: 22 },
            { label: { ru: "Исследования|Гранты", en: "Research|Grants" }, value: 16 },
            { label: { ru: "Кампус|Здания", en: "Campus|Buildings" }, value: 12 },
            { label: { ru: "Кампус|Среда", en: "Campus|Environment" }, value: 8 },
        ],
    },
    {
        id: "semicircle-chart",
        category: "part-whole",
        kind: "semi-donut",
        title: { ru: "Полукруг", en: "Semicircle chart" },
        description: {
            ru: "Полукольцо показывает несколько крупных долей одного целого в компактной форме.",
            en: "A half donut shows a few large shares of one whole in a compact form.",
        },
        useWhen: {
            ru: "Долей мало, они заметно различаются и точное сравнение не главное.",
            en: "There are few clearly different shares and exact comparison is secondary.",
        },
        avoidWhen: {
            ru: "Долей много или значения близки — столбцы будут точнее.",
            en: "There are many similar shares; bars will be more accurate.",
        },
        unit: { ru: "% поездок", en: "% of trips" },
        data: [
            { label: { ru: "Общественный транспорт", en: "Public transport" }, value: 42 },
            { label: { ru: "Автомобиль", en: "Car" }, value: 31 },
            { label: { ru: "Пешком", en: "Walking" }, value: 18 },
            { label: { ru: "Велосипед", en: "Bicycle" }, value: 9 },
        ],
    },
    {
        id: "symbol-grid",
        category: "part-whole",
        kind: "symbol-grid",
        title: { ru: "Сетка из символов", en: "Symbol grid" },
        description: {
            ru: "Сто одинаковых ячеек превращают процентные доли в наглядный дискретный счёт.",
            en: "One hundred equal cells turn percentage shares into a visible discrete count.",
        },
        useWhen: {
            ru: "Нужно объяснить доли широкой аудитории на основе понятного знаменателя.",
            en: "You need to explain shares to a broad audience using a clear denominator.",
        },
        avoidWhen: {
            ru: "Нужна высокая точность для дробных процентов или категорий слишком много.",
            en: "Fractional percentages require precision or there are too many categories.",
        },
        unit: { ru: "% ответов", en: "% of responses" },
        data: [
            { label: { ru: "Поддерживают", en: "Support" }, value: 47 },
            { label: { ru: "Не определились", en: "Undecided" }, value: 29 },
            { label: { ru: "Не поддерживают", en: "Oppose" }, value: 24 },
        ],
    },
    {
        id: "priestley-timeline",
        category: "change-time",
        kind: "priestley",
        title: { ru: "Временная шкала Пристли", en: "Priestley timeline" },
        description: {
            ru: "Горизонтальные интервалы показывают начало, конец и одновременность длительных событий.",
            en: "Horizontal intervals show the start, end, and overlap of long-running events.",
        },
        useWhen: {
            ru: "Главный вопрос связан с продолжительностью событий и тем, какие из них происходили одновременно.",
            en: "The main question concerns event duration and which events overlapped.",
        },
        avoidWhen: {
            ru: "Важны отдельные даты без продолжительности или требуется сравнить точные числовые значения.",
            en: "Events have no meaningful duration or exact numerical comparison is required.",
        },
        unit: { ru: "год", en: "year" },
        valueLabels: {
            primary: { ru: "Начало", en: "Start" },
            secondary: { ru: "Окончание", en: "End" },
            tertiary: { ru: "Дорожка", en: "Lane" },
        },
        data: [
            {
                label: { ru: "Антонин Дворжак", en: "Antonín Dvořák" },
                value: 1841,
                value2: 1904,
                value3: 0,
            },
            {
                label: { ru: "Густав Малер", en: "Gustav Mahler" },
                value: 1860,
                value2: 1911,
                value3: 1,
            },
            {
                label: { ru: "Клод Дебюсси", en: "Claude Debussy" },
                value: 1862,
                value2: 1918,
                value3: 2,
            },
            {
                label: { ru: "Жан Сибелиус", en: "Jean Sibelius" },
                value: 1865,
                value2: 1957,
                value3: 3,
            },
            {
                label: { ru: "Морис Равель", en: "Maurice Ravel" },
                value: 1875,
                value2: 1937,
                value3: 4,
            },
            {
                label: { ru: "Бела Барток", en: "Béla Bartók" },
                value: 1881,
                value2: 1945,
                value3: 5,
            },
            {
                label: { ru: "Игорь Стравинский", en: "Igor Stravinsky" },
                value: 1882,
                value2: 1971,
                value3: 6,
            },
            {
                label: { ru: "Сергей Прокофьев", en: "Sergei Prokofiev" },
                value: 1891,
                value2: 1953,
                value3: 7,
            },
        ],
    },
    {
        id: "voronoi",
        category: "part-whole",
        kind: "voronoi",
        title: { ru: "Диаграмма Вороного", en: "Voronoi diagram" },
        description: {
            ru: "Карта разделена на зоны вокруг библиотек. Для любой позиции внутри цветной зоны ближайшей будет библиотека, отмеченная точкой в этой зоне.",
            en: "The map is divided into zones around libraries. From anywhere inside a coloured zone, the nearest library is the point marked within that zone.",
        },
        useWhen: {
            ru: "Нужно разделить территорию между ближайшими магазинами, станциями, школами или другими точками.",
            en: "You need to divide an area among the nearest shops, stations, schools, or other locations.",
        },
        avoidWhen: {
            ru: "Площадь цветной области нельзя читать как количество посещений: её определяет только расположение точек.",
            en: "Do not read coloured area as visit volume: cell size is determined only by point locations.",
        },
        unit: { ru: "координаты учебной карты", en: "synthetic map coordinates" },
        valueLabels: {
            primary: { ru: "X", en: "X" },
            secondary: { ru: "Y", en: "Y" },
            tertiary: { ru: "Посещений, тыс.", en: "Visits, thousands" },
        },
        data: [
            { label: { ru: "Северная", en: "North" }, value: 22, value2: 78, value3: 18 },
            { label: { ru: "Речная", en: "Riverside" }, value: 48, value2: 72, value3: 26 },
            { label: { ru: "Восточная", en: "East" }, value: 78, value2: 67, value3: 21 },
            { label: { ru: "Центральная", en: "Central" }, value: 52, value2: 48, value3: 42 },
            { label: { ru: "Парковая", en: "Park" }, value: 25, value2: 35, value3: 24 },
            { label: { ru: "Южная", en: "South" }, value: 57, value2: 20, value3: 17 },
            { label: { ru: "Озёрная", en: "Lakeside" }, value: 82, value2: 28, value3: 15 },
        ],
    },
    {
        id: "venn",
        category: "part-whole",
        kind: "venn",
        title: { ru: "Диаграмма Венна", en: "Venn diagram" },
        description: {
            ru: "Перекрывающиеся области показывают принадлежность объектов одному, двум или трём множествам.",
            en: "Overlapping regions show membership in one, two, or three sets.",
        },
        useWhen: {
            ru: "Нужно объяснить логические пересечения двух или трёх множеств небольшой аудитории.",
            en: "You need to explain logical intersections among two or three sets to a general audience.",
        },
        avoidWhen: {
            ru: "Множеств больше трёх или требуется точно сравнивать размеры пересечений.",
            en: "There are more than three sets or intersection sizes require precise comparison.",
        },
        unit: { ru: "студентов", en: "students" },
        data: [
            { label: { ru: "Музыка", en: "Music" }, value: 18 },
            { label: { ru: "Театр", en: "Theatre" }, value: 14 },
            { label: { ru: "Спорт", en: "Sport" }, value: 21 },
            { label: { ru: "Музыка ∩ Театр", en: "Music ∩ Theatre" }, value: 7 },
            { label: { ru: "Музыка ∩ Спорт", en: "Music ∩ Sport" }, value: 5 },
            { label: { ru: "Театр ∩ Спорт", en: "Theatre ∩ Sport" }, value: 4 },
            { label: { ru: "Все три", en: "All three" }, value: 2 },
        ],
    },
    {
        id: "basic-choropleth",
        category: "spatial",
        kind: "choropleth-map",
        title: { ru: "Хороплетная карта", en: "Choropleth map" },
        description: {
            ru: "Цвет каждого округа США показывает уровень безработицы в августе 2016 года; более тёмный синий означает больший процент.",
            en: "Each US county is coloured by its August 2016 unemployment rate; darker blue represents a higher percentage.",
        },
        useWhen: {
            ru: "Нужно сравнить нормированный показатель между территориями с известными границами.",
            en: "You need to compare a normalised measure across territories with known boundaries.",
        },
        avoidWhen: {
            ru: "Не кодируйте цветом абсолютные итоги: крупные и малые территории будут сравниваться нечестно.",
            en: "Do not encode absolute totals by colour: large and small territories would be compared unfairly.",
        },
        unit: { ru: "% рабочей силы", en: "% of labour force" },
        dataStatus: {
            ru: "Реальные данные · август 2016",
            en: "Observed data · August 2016",
        },
        source: {
            label: {
                ru: "Bureau of Labor Statistics · пример D3",
                en: "Bureau of Labor Statistics · D3 example",
            },
            url: "https://observablehq.com/@d3/choropleth",
        },
        data: [
            {
                key: "01001",
                label: { ru: "Округ Отога, Алабама", en: "Autauga County, Alabama" },
                value: 5.1,
            },
            {
                key: "06037",
                label: {
                    ru: "Округ Лос-Анджелес, Калифорния",
                    en: "Los Angeles County, California",
                },
                value: 5.3,
            },
            {
                key: "17031",
                label: { ru: "Округ Кук, Иллинойс", en: "Cook County, Illinois" },
                value: 5.7,
            },
            {
                key: "36061",
                label: { ru: "Округ Нью-Йорк, Нью-Йорк", en: "New York County, New York" },
                value: 4.9,
            },
            {
                key: "48201",
                label: { ru: "Округ Харрис, Техас", en: "Harris County, Texas" },
                value: 5.8,
            },
            {
                key: "53033",
                label: { ru: "Округ Кинг, Вашингтон", en: "King County, Washington" },
                value: 3.9,
            },
        ],
    },
    {
        id: "proportional-symbol",
        category: "spatial",
        kind: "symbol-map",
        title: { ru: "Карта пропорциональных символов", en: "Proportional symbol map" },
        description: {
            ru: "Площадь круга показывает индекс значимости землетрясения USGS, положение — эпицентр, а цвет помогает различать магнитуду.",
            en: "Circle area represents the USGS earthquake significance index, position marks the epicentre, and colour helps distinguish magnitude.",
        },
        useWhen: {
            ru: "Нужно показать абсолютные величины в конкретных географических точках.",
            en: "You need to show absolute magnitudes at specific geographic locations.",
        },
        avoidWhen: {
            ru: "Слишком много близких точек перекроют друг друга; небольшие различия площадей также читаются плохо.",
            en: "Too many nearby points will overlap, and small area differences are hard to judge.",
        },
        unit: { ru: "индекс значимости USGS", en: "USGS significance index" },
        dataStatus: {
            ru: "Реальные данные · значительные землетрясения 2015",
            en: "Observed data · significant earthquakes in 2015",
        },
        source: {
            label: { ru: "USGS · пример MapLibre", en: "USGS · MapLibre example" },
            url: "https://maplibre.org/maplibre-gl-js/docs/examples/create-a-time-slider/",
        },
        valueLabels: {
            primary: { ru: "Индекс значимости", en: "Significance index" },
            secondary: { ru: "Долгота", en: "Longitude" },
            tertiary: { ru: "Широта", en: "Latitude" },
        },
        data: [
            {
                label: { ru: "Афганистан, Ашхашим", en: "Ashkasham, Afghanistan" },
                value: 877,
                value2: 71.1263,
                value3: 36.4935,
            },
            {
                label: { ru: "Восточно-Тихоокеанское поднятие", en: "Southern East Pacific Rise" },
                value: 591,
                value2: -123.1158,
                value3: -55.755,
            },
            {
                label: { ru: "Индонезия, Таракан", en: "Tarakan, Indonesia" },
                value: 585,
                value2: 117.6359,
                value3: 3.6455,
            },
            {
                label: { ru: "Вануату, Исангел", en: "Isangel, Vanuatu" },
                value: 554,
                value2: 169.3857,
                value3: -18.3819,
            },
            {
                label: { ru: "Мексика, Трес-Пикос", en: "Tres Picos, Mexico" },
                value: 767,
                value2: -93.6294,
                value3: 15.8009,
            },
            {
                label: { ru: "Таджикистан, Мургаб", en: "Murghob, Tajikistan" },
                value: 831,
                value2: 72.7523,
                value3: 38.2271,
            },
        ],
    },
    {
        id: "flow",
        category: "spatial",
        kind: "flow-map",
        title: { ru: "Потоки на карте", en: "Flow map" },
        description: {
            ru: "Линии показывают направления ночных железнодорожных маршрутов между европейскими городами.",
            en: "Lines show the direction of overnight rail routes between European cities.",
        },
        useWhen: {
            ru: "Важны одновременно место отправления, место назначения и направление перемещения.",
            en: "Origin, destination, and movement direction all matter.",
        },
        avoidWhen: {
            ru: "Большое число пересекающихся маршрутов превращает карту в клубок; тогда нужны фильтры или агрегация.",
            en: "Many crossing routes create a tangle; use filtering or aggregation instead.",
        },
        unit: { ru: "тыс. поездок в месяц", en: "thousand trips per month" },
        data: [
            {
                label: { ru: "Париж → Берлин", en: "Paris → Berlin" },
                value: 48,
                values: [2.35, 48.86, 13.41, 52.52],
            },
            {
                label: { ru: "Берлин → Варшава", en: "Berlin → Warsaw" },
                value: 36,
                values: [13.41, 52.52, 21.01, 52.23],
            },
            {
                label: { ru: "Вена → Рим", en: "Vienna → Rome" },
                value: 29,
                values: [16.37, 48.21, 12.5, 41.9],
            },
            {
                label: { ru: "Стокгольм → Копенгаген", en: "Stockholm → Copenhagen" },
                value: 24,
                values: [18.07, 59.33, 12.57, 55.68],
            },
            {
                label: { ru: "Мадрид → Париж", en: "Madrid → Paris" },
                value: 31,
                values: [-3.7, 40.42, 2.35, 48.86],
            },
        ],
    },
    {
        id: "contour",
        category: "spatial",
        kind: "contour-map",
        title: { ru: "Контурная карта", en: "Contour map" },
        description: {
            ru: "Цветные полосы соединяют места с близкой расчётной температурой независимо от государственных границ.",
            en: "Coloured bands connect places with similar estimated temperatures regardless of national boundaries.",
        },
        useWhen: {
            ru: "Показатель меняется непрерывно в пространстве, например температура, высота или давление.",
            en: "A measure varies continuously over space, such as temperature, elevation, or pressure.",
        },
        avoidWhen: {
            ru: "Не интерполируйте редкие точки, если между ними возможны резкие неизвестные изменения.",
            en: "Do not interpolate sparse points when sharp unknown changes may occur between them.",
        },
        unit: { ru: "°C", en: "°C" },
        valueLabels: {
            primary: { ru: "Температура", en: "Temperature" },
            secondary: { ru: "Долгота", en: "Longitude" },
            tertiary: { ru: "Широта", en: "Latitude" },
        },
        data: [
            { label: { ru: "Лиссабон", en: "Lisbon" }, value: 29, value2: -9.14, value3: 38.72 },
            { label: { ru: "Мадрид", en: "Madrid" }, value: 31, value2: -3.7, value3: 40.42 },
            { label: { ru: "Париж", en: "Paris" }, value: 24, value2: 2.35, value3: 48.86 },
            { label: { ru: "Рим", en: "Rome" }, value: 30, value2: 12.5, value3: 41.9 },
            { label: { ru: "Берлин", en: "Berlin" }, value: 22, value2: 13.41, value3: 52.52 },
            { label: { ru: "Варшава", en: "Warsaw" }, value: 21, value2: 21.01, value3: 52.23 },
            {
                label: { ru: "Стокгольм", en: "Stockholm" },
                value: 17,
                value2: 18.07,
                value3: 59.33,
            },
            { label: { ru: "Хельсинки", en: "Helsinki" }, value: 16, value2: 24.94, value3: 60.17 },
            { label: { ru: "Афины", en: "Athens" }, value: 33, value2: 23.73, value3: 37.98 },
        ],
    },
    {
        id: "equalised-cartogram",
        category: "spatial",
        kind: "tile-cartogram",
        title: { ru: "Эквализированная картограмма", en: "Equalised cartogram" },
        description: {
            ru: "Каждая страна заменена одинаковой плиткой: площадь территории больше не влияет на сравнение.",
            en: "Every country is replaced by an equal tile, removing territory area from the comparison.",
        },
        useWhen: {
            ru: "Все территории должны иметь одинаковый визуальный вес, но приблизительное соседство желательно сохранить.",
            en: "Every territory needs equal visual weight while approximate neighbourhoods remain useful.",
        },
        avoidWhen: {
            ru: "Форма границ и точная география важны для вывода.",
            en: "Boundary shape and precise geography are important to the conclusion.",
        },
        unit: { ru: "% городских поездок на велосипеде", en: "% of urban trips by bicycle" },
        valueLabels: {
            primary: { ru: "Доля поездок", en: "Share of trips" },
            secondary: { ru: "Колонка плитки", en: "Tile column" },
            tertiary: { ru: "Строка плитки", en: "Tile row" },
        },
        data: [
            {
                key: "PT",
                label: { ru: "Португалия", en: "Portugal" },
                value: 8,
                value2: 0,
                value3: 4,
            },
            { key: "ES", label: { ru: "Испания", en: "Spain" }, value: 12, value2: 1, value3: 4 },
            { key: "FR", label: { ru: "Франция", en: "France" }, value: 17, value2: 2, value3: 3 },
            {
                key: "GB",
                label: { ru: "Великобритания", en: "United Kingdom" },
                value: 15,
                value2: 1,
                value3: 2,
            },
            {
                key: "NL",
                label: { ru: "Нидерланды", en: "Netherlands" },
                value: 64,
                value2: 3,
                value3: 2,
            },
            {
                key: "DE",
                label: { ru: "Германия", en: "Germany" },
                value: 31,
                value2: 3,
                value3: 3,
            },
            { key: "DK", label: { ru: "Дания", en: "Denmark" }, value: 48, value2: 3, value3: 1 },
            { key: "SE", label: { ru: "Швеция", en: "Sweden" }, value: 36, value2: 4, value3: 0 },
            { key: "PL", label: { ru: "Польша", en: "Poland" }, value: 22, value2: 4, value3: 3 },
            { key: "AT", label: { ru: "Австрия", en: "Austria" }, value: 29, value2: 4, value3: 4 },
            { key: "IT", label: { ru: "Италия", en: "Italy" }, value: 19, value2: 3, value3: 5 },
            { key: "CZ", label: { ru: "Чехия", en: "Czechia" }, value: 27, value2: 5, value3: 3 },
            { key: "GR", label: { ru: "Греция", en: "Greece" }, value: 11, value2: 5, value3: 5 },
        ],
    },
    {
        id: "scaled-cartogram-value",
        category: "spatial",
        kind: "dorling-cartogram",
        title: { ru: "Неконтурная картограмма", en: "Non-contiguous cartogram" },
        description: {
            ru: "Каждый штат уменьшен вокруг своего центра пропорционально доле взрослых с ожирением; переключатель показывает изменение с 2008 по 2018 год.",
            en: "Each state is shrunk around its centre in proportion to adult obesity prevalence; the switch compares 2008 with 2018.",
        },
        useWhen: {
            ru: "Нужно сделать относительный показатель частью самой географической формы и сохранить узнаваемый контур каждой территории.",
            en: "You need to encode a relative measure in geographic shape while keeping each territory recognisable.",
        },
        avoidWhen: {
            ru: "Не используйте для точного чтения границ или площадей: разрывы между штатами намеренно увеличиваются при масштабировании.",
            en: "Do not use it for exact boundaries or areas: scaling intentionally enlarges the gaps between states.",
        },
        unit: { ru: "% взрослых", en: "% of adults" },
        dataStatus: {
            ru: "Реальные данные · CDC, 2008 и 2018",
            en: "Observed data · CDC, 2008 and 2018",
        },
        source: {
            label: {
                ru: "CDC · пример D3 Non-contiguous Cartogram",
                en: "CDC · D3 Non-contiguous Cartogram example",
            },
            url: "https://observablehq.com/@d3/non-contiguous-cartogram",
        },
        valueLabels: {
            primary: { ru: "2018", en: "2018" },
            secondary: { ru: "2008", en: "2008" },
        },
        data: [
            {
                key: "01",
                label: { ru: "Алабама", en: "Alabama" },
                value: 36.2,
                value2: 18.7,
            },
            {
                key: "06",
                label: { ru: "Калифорния", en: "California" },
                value: 25.8,
                value2: 15.1,
            },
            {
                key: "12",
                label: { ru: "Флорида", en: "Florida" },
                value: 30.7,
                value2: 17.2,
            },
            {
                key: "17",
                label: { ru: "Иллинойс", en: "Illinois" },
                value: 31.8,
                value2: 16.7,
            },
            {
                key: "36",
                label: { ru: "Нью-Йорк", en: "New York" },
                value: 27.6,
                value2: 13.9,
            },
            {
                key: "48",
                label: { ru: "Техас", en: "Texas" },
                value: 34.8,
                value2: 15.9,
            },
            {
                key: "53",
                label: { ru: "Вашингтон", en: "Washington" },
                value: 28.7,
                value2: 13.9,
            },
        ],
    },
    {
        id: "dot-density",
        category: "spatial",
        kind: "dot-density-map",
        title: { ru: "Карта плотности точек", en: "Dot density map" },
        description: {
            ru: "Каждая точка обозначает зарегистрированное землетрясение; переключатель показывает исходные события или объединяет близкие точки в кластеры.",
            en: "Each dot represents a recorded earthquake; the switch shows individual events or groups nearby points into clusters.",
        },
        useWhen: {
            ru: "Нужно показать размещение отдельных однотипных объектов и заметить пространственные скопления.",
            en: "You need to show individual like-for-like locations and reveal spatial clusters.",
        },
        avoidWhen: {
            ru: "Точные адреса нельзя раскрывать или точки настолько многочисленны, что сливаются.",
            en: "Exact locations are sensitive or dots are so numerous that they merge.",
        },
        unit: { ru: "1 точка = 1 землетрясение", en: "1 dot = 1 earthquake" },
        dataStatus: {
            ru: "Реальные данные · 6 107 землетрясений",
            en: "Observed data · 6,107 earthquakes",
        },
        source: {
            label: { ru: "USGS · пример MapLibre", en: "USGS · MapLibre example" },
            url: "https://maplibre.org/maplibre-gl-js/docs/examples/create-and-style-clusters/",
        },
        valueLabels: {
            primary: { ru: "Событие", en: "Event" },
            secondary: { ru: "Долгота", en: "Longitude" },
            tertiary: { ru: "Широта", en: "Latitude" },
        },
        data: [
            {
                label: { ru: "Аляска · 01:20 UTC", en: "Alaska · 01:20 UTC" },
                value: 1,
                value2: -151.5129,
                value3: 63.1016,
            },
            {
                label: { ru: "Аляска · 01:14 UTC", en: "Alaska · 01:14 UTC" },
                value: 1,
                value2: -150.4048,
                value3: 63.1224,
            },
            {
                label: { ru: "Калифорния · 00:51 UTC", en: "California · 00:51 UTC" },
                value: 1,
                value2: -118.497,
                value3: 34.2997,
            },
            {
                label: { ru: "Никарагуа · 00:30 UTC", en: "Nicaragua · 00:30 UTC" },
                value: 1,
                value2: -87.6901,
                value3: 12.0623,
            },
            {
                label: { ru: "Фиджи · 23:59 UTC", en: "Fiji · 23:59 UTC" },
                value: 1,
                value2: -178.4576,
                value3: -20.2873,
            },
            {
                label: { ru: "Аляска · 23:36 UTC", en: "Alaska · 23:36 UTC" },
                value: 1,
                value2: -148.789,
                value3: 63.1725,
            },
        ],
    },
    {
        id: "heat-map",
        category: "spatial",
        kind: "spatial-heatmap",
        title: { ru: "Пространственная тепловая карта", en: "Spatial heat map" },
        description: {
            ru: "Размытые цветовые пятна показывают концентрацию значительных землетрясений; ползунок фильтрует события по месяцам 2015 года.",
            en: "Blurred colour fields show concentrations of significant earthquakes; the slider filters events by month in 2015.",
        },
        useWhen: {
            ru: "Нужно увидеть горячие зоны непрерывной или очень плотной пространственной величины.",
            en: "You need to reveal hotspots in a continuous or very dense spatial measure.",
        },
        avoidWhen: {
            ru: "Нужны точные значения отдельных точек или сравнение административных территорий.",
            en: "Exact point values or administrative territory comparisons are required.",
        },
        unit: { ru: "землетрясений за месяц", en: "earthquakes per month" },
        dataStatus: {
            ru: "Реальные данные · значительные землетрясения 2015",
            en: "Observed data · significant earthquakes in 2015",
        },
        source: {
            label: { ru: "USGS · пример MapLibre", en: "USGS · MapLibre example" },
            url: "https://maplibre.org/maplibre-gl-js/docs/examples/create-a-time-slider/",
        },
        data: [
            { label: { ru: "Январь", en: "January" }, value: 4 },
            { label: { ru: "Февраль", en: "February" }, value: 12 },
            { label: { ru: "Март", en: "March" }, value: 12 },
            { label: { ru: "Апрель", en: "April" }, value: 15 },
            { label: { ru: "Май", en: "May" }, value: 21 },
            { label: { ru: "Июнь", en: "June" }, value: 10 },
            { label: { ru: "Июль", en: "July" }, value: 10 },
            { label: { ru: "Август", en: "August" }, value: 6 },
            { label: { ru: "Сентябрь", en: "September" }, value: 34 },
            { label: { ru: "Октябрь", en: "October" }, value: 7 },
            { label: { ru: "Ноябрь", en: "November" }, value: 16 },
            { label: { ru: "Декабрь", en: "December" }, value: 9 },
        ],
    },
];

assertChartCatalog(charts);

export function getChart(id: string) {
    return charts.find((chart) => chart.id === id);
}
