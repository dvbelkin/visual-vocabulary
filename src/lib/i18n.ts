export const locales = ["ru", "en"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "ru";

const messages = {
    ru: {
        languageName: "Русский",
        otherLanguage: "English",
        eyebrow: "Выбор визуализации по задаче",
        title: "Визуальный словарь",
        lead: "Разберитесь, какая связь в данных важнее всего, выберите подходящую форму и изучите её на небольшом интерактивном примере.",
        catalogTitle: "Первые учебные примеры",
        catalogLead:
            "Это первый вертикальный срез новой версии. Остальные типы будут добавляться семействами.",
        openChart: "Изучить диаграмму",
        back: "Вернуться в каталог",
        whenToUse: "Когда использовать",
        avoidWhen: "Когда выбрать другую форму",
        dataTitle: "Учебные данные",
        synthetic: "Небольшой синтетический набор данных",
        chartLabel: "Интерактивная диаграмма",
        category: "Категория",
        footer: "Учебный проект по выбору визуализации данных.",
    },
    en: {
        languageName: "English",
        otherLanguage: "Русский",
        eyebrow: "Choose a visualisation by task",
        title: "Visual Vocabulary",
        lead: "Identify the relationship that matters most, choose a suitable form, and explore it through a small interactive example.",
        catalogTitle: "First learning examples",
        catalogLead:
            "This is the first vertical slice of the new site. More chart families will follow.",
        openChart: "Explore this chart",
        back: "Back to the catalogue",
        whenToUse: "When to use it",
        avoidWhen: "Choose another form when",
        dataTitle: "Learning data",
        synthetic: "Small synthetic dataset",
        chartLabel: "Interactive chart",
        category: "Category",
        footer: "A learning project for choosing data visualisations.",
    },
} as const;

export function t(locale: Locale) {
    return messages[locale];
}

export function isLocale(value: string | undefined): value is Locale {
    return locales.includes(value as Locale);
}

export function localePath(locale: Locale, path = "") {
    const base = import.meta.env.BASE_URL.replace(/\/$/, "");
    const suffix = path ? `/${path.replace(/^\/|\/$/g, "")}` : "";
    return `${base}/${locale}${suffix}/`;
}
