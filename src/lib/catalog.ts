import type { Locale } from "./i18n";

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
    | "waterfall";

type LocalizedText = Record<Locale, string>;

export interface DataRow {
    label: LocalizedText;
    value: number;
    value2?: number;
    value3?: number;
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
];

export function getChart(id: string) {
    return charts.find((chart) => chart.id === id);
}
