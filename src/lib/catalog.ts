import type { Locale } from "./i18n";

export type CategoryId =
    "magnitude" | "change-time" | "correlation" | "distribution" | "part-whole";

export type ChartKind = "bar" | "line" | "scatter" | "histogram" | "pie" | "heatmap";

type LocalizedText = Record<Locale, string>;

export interface DataRow {
    label: LocalizedText;
    value: number;
    value2?: number;
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
    data: DataRow[];
}

export const categoryNames: Record<CategoryId, LocalizedText> = {
    magnitude: { ru: "Величина", en: "Magnitude" },
    "change-time": { ru: "Изменение во времени", en: "Change over time" },
    correlation: { ru: "Связь", en: "Correlation" },
    distribution: { ru: "Распределение", en: "Distribution" },
    "part-whole": { ru: "Части целого", en: "Part to whole" },
};

export const charts: readonly ChartDefinition[] = [
    {
        id: "ordered-bar",
        category: "magnitude",
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
        kind: "pie",
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
];

export function getChart(id: string) {
    return charts.find((chart) => chart.id === id);
}
