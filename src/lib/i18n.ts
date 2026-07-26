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
        catalogTitle: "Каталог учебных примеров",
        catalogLead: "Все 72 интерактивных примера готовы на русском и английском языках.",
        progressLabel: "Готово примеров",
        searchLabel: "Поиск по каталогу",
        searchPlaceholder: "Название, задача или категория",
        searchResults: "Найдено",
        noResults: "Ничего не найдено. Попробуйте изменить запрос.",
        categoryFilter: "Фильтр по категории",
        allCategories: "Все категории",
        openChart: "Изучить диаграмму",
        back: "Вернуться в каталог",
        whenToUse: "Когда использовать",
        avoidWhen: "Когда выбрать другую форму",
        dataTitle: "Учебные данные",
        showData: "Показать таблицу данных",
        synthetic: "Небольшой синтетический набор данных",
        chartLabel: "Интерактивная диаграмма",
        category: "Категория",
        observation: "Наблюдение",
        value: "Значение",
        secondValue: "Второе значение",
        thirdValue: "Третье значение",
        skipToContent: "К содержанию",
        languageSelector: "Выбор языка",
        basedOn: "На основе",
        footer: "Учебный проект по выбору визуализации данных.",
    },
    en: {
        languageName: "English",
        otherLanguage: "Русский",
        eyebrow: "Choose a visualisation by task",
        title: "Visual Vocabulary",
        lead: "Identify the relationship that matters most, choose a suitable form, and explore it through a small interactive example.",
        catalogTitle: "Catalogue of learning examples",
        catalogLead: "All 72 interactive examples are available in both Russian and English.",
        progressLabel: "Examples ready",
        searchLabel: "Search the catalogue",
        searchPlaceholder: "Name, task, or category",
        searchResults: "Found",
        noResults: "No matches. Try changing your search.",
        categoryFilter: "Filter by category",
        allCategories: "All categories",
        openChart: "Explore this chart",
        back: "Back to the catalogue",
        whenToUse: "When to use it",
        avoidWhen: "Choose another form when",
        dataTitle: "Learning data",
        showData: "Show data table",
        synthetic: "Small synthetic dataset",
        chartLabel: "Interactive chart",
        category: "Category",
        observation: "Observation",
        value: "Value",
        secondValue: "Second value",
        thirdValue: "Third value",
        skipToContent: "Skip to content",
        languageSelector: "Language selector",
        basedOn: "Based on",
        footer: "A learning project for choosing data visualisations.",
    },
} as const;

type MessageKey = keyof (typeof messages)["ru"];
const messageContract: Record<Locale, Record<MessageKey, string>> = messages;

function assertMessageParity(dictionaries: Record<Locale, Record<MessageKey, string>>) {
    const referenceKeys = Object.keys(dictionaries[defaultLocale]).sort();

    for (const locale of locales) {
        const dictionary = dictionaries[locale];
        const keys = Object.keys(dictionary).sort();
        if (
            keys.length !== referenceKeys.length ||
            keys.some((key, index) => key !== referenceKeys[index])
        ) {
            throw new Error(`Translation keys for "${locale}" do not match "${defaultLocale}"`);
        }

        for (const key of referenceKeys) {
            const value = dictionary[key as MessageKey];
            if (!value.trim()) {
                throw new Error(`Translation "${locale}.${key}" must not be empty`);
            }
        }
    }
}

assertMessageParity(messageContract);

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
