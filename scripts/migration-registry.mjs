import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const csvPath = `${root}chartTypes.csv`;
const statusPath = `${root}INTERACTIVE_STATUS.md`;
const outputPath = `${root}src/data/migration-registry.json`;

const astroRoutes = new Map([
    ["ranking:Упорядоченные горизонтальные столбцы", "ordered-bar"],
    ["change-time:Линейный график", "line-chart"],
    ["correlation:Диаграмма рассеяния", "scatterplot"],
    ["distribution:Гистограмма", "histogram"],
    ["part-whole:Кольцевая диаграмма", "donut-chart"],
    ["correlation:Двумерная тепловая карта", "heatmap"],
    ["deviation:Расходящиеся столбцы", "diverging-bar"],
    ["magnitude:Сгруппированные горизонтальные столбцы", "grouped-horizontal-bars"],
    ["ranking:Горизонтальный лоллипоп", "ranking-lollipop"],
    ["ranking:График изменения мест", "rank-change"],
    ["magnitude:Буллет-чарт", "bullet-chart"],
    ["magnitude:Радарная диаграмма", "radar-chart"],
    ["change-time:Столбцы по времени", "timeline-columns"],
    ["change-time:Столбцы и линия по времени", "column-line-timeline"],
    ["change-time:График наклона", "slope-timeline"],
    ["change-time:Диаграмма с областями", "stacked-area"],
    ["change-time:Календарная тепловая карта", "calendar-heatmap"],
    ["distribution:Возрастно-половая пирамида", "population-pyramid"],
    ["distribution:Точечный диапазон", "dot-range"],
    ["distribution:Кумулятивная кривая", "cumulative-curve"],
    ["distribution:Полоса отдельных наблюдений", "observation-strip"],
    ["distribution:Штрих-код распределения", "distribution-barcode"],
    ["part-whole:Составные столбцы", "stacked-columns"],
    ["part-whole:Нормированные составные столбцы", "normalized-stacked-bars"],
    ["part-whole:Круговая диаграмма", "pie-chart"],
    ["part-whole:Древовидная карта", "treemap"],
    ["part-whole:Водопад", "waterfall"],
    ["deviation:Расходящиеся составные столбцы", "diverging-stacked-bars"],
    ["deviation:Спайн-график", "spine-chart"],
    ["deviation:Баланс с заливкой", "balance-area"],
    ["distribution:Ящик с усами", "boxplot"],
    ["distribution:Скрипичная диаграмма", "violin-plot"],
    ["ranking:Упорядоченные вертикальные столбцы", "ordered-vertical-bars"],
    ["ranking:Упорядоченные пропорциональные символы", "ranked-proportional-symbols"],
    ["ranking:Точки на полосе", "dots-on-strip"],
    ["ranking:Вертикальный лоллипоп", "vertical-lollipop"],
    ["ranking:Бамп-чарт", "bump-chart"],
    ["correlation:Линия и столбцы", "line-and-columns"],
    ["correlation:Связанная диаграмма рассеяния", "connected-scatterplot"],
    ["correlation:Пузырьковая диаграмма", "bubble-chart"],
]);

function parseCsv(text) {
    const records = [];
    let row = [];
    let value = "";
    let quoted = false;

    for (let index = 0; index < text.length; index += 1) {
        const character = text[index];
        const next = text[index + 1];

        if (character === '"' && quoted && next === '"') {
            value += '"';
            index += 1;
        } else if (character === '"') {
            quoted = !quoted;
        } else if (character === "," && !quoted) {
            row.push(value);
            value = "";
        } else if ((character === "\n" || character === "\r") && !quoted) {
            if (character === "\r" && next === "\n") index += 1;
            row.push(value);
            if (row.some((cell) => cell.trim())) records.push(row);
            row = [];
            value = "";
        } else {
            value += character;
        }
    }

    if (value || row.length) {
        row.push(value);
        records.push(row);
    }

    const headers = records.shift();
    if (!headers) throw new Error("chartTypes.csv does not contain a header");

    return records.map((cells) =>
        Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ""])),
    );
}

function stableId(image) {
    return image
        .replace(/\.svg$/i, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
}

function legacyStatuses(markdown) {
    const statuses = new Map();
    const content = markdown.slice(markdown.indexOf("## "));

    for (const match of content.matchAll(/^- ([✅🔎⬜]) (.+)$/gm)) {
        const [, marker, name] = match;
        statuses.set(
            name.trim(),
            marker === "✅" ? "ready" : marker === "🔎" ? "review" : "missing",
        );
    }

    return statuses;
}

export async function buildRegistry() {
    const [csv, statusMarkdown] = await Promise.all([
        readFile(csvPath, "utf8"),
        readFile(statusPath, "utf8"),
    ]);
    const rows = parseCsv(csv);
    const statuses = legacyStatuses(statusMarkdown);
    const ids = new Set();
    const names = new Set();

    const entries = rows.map((row) => {
        const id = stableId(row.img);
        const legacyStatus = statuses.get(row.chartName) ?? "review";
        const astroRouteId = astroRoutes.get(`${row.category}:${row.chartName}`) ?? null;

        if (!id) throw new Error(`Cannot create an id for "${row.chartName}"`);
        if (ids.has(id)) throw new Error(`Duplicate migration id "${id}"`);
        ids.add(id);
        names.add(row.chartName);

        return {
            id,
            nameRu: row.chartName,
            category: row.category,
            icon: row.img,
            descriptionRu: row.description,
            originalAvailability: row.avail === "TRUE",
            legacySource: "interactive-examples.js",
            legacyStatus,
            astroStatus: astroRouteId ? "ready" : "missing",
            astroRouteId,
        };
    });

    for (const statusName of statuses.keys()) {
        if (!names.has(statusName)) {
            throw new Error(
                `"${statusName}" is present in INTERACTIVE_STATUS.md but not chartTypes.csv`,
            );
        }
    }

    if (entries.length !== 72) {
        throw new Error(`Expected 72 charts, found ${entries.length}`);
    }

    return {
        generatedFrom: ["chartTypes.csv", "INTERACTIVE_STATUS.md"],
        chartCount: entries.length,
        legacyReadyCount: entries.filter((entry) => entry.legacyStatus === "ready").length,
        legacyReviewCount: entries.filter((entry) => entry.legacyStatus === "review").length,
        astroReadyCount: entries.filter((entry) => entry.astroStatus === "ready").length,
        entries,
    };
}

export async function registryJson() {
    return `${JSON.stringify(await buildRegistry(), null, 2)}\n`;
}

async function main() {
    const mode = process.argv[2] ?? "check";
    const expected = await registryJson();

    if (mode === "write") {
        await writeFile(outputPath, expected);
        console.log(`Updated ${outputPath}`);
        return;
    }

    if (mode !== "check") {
        throw new Error(`Unknown mode "${mode}". Use "check" or "write".`);
    }

    const actual = await readFile(outputPath, "utf8").catch(() => "");
    if (actual !== expected) {
        throw new Error("Migration registry is outdated. Run npm run registry:generate.");
    }

    const registry = JSON.parse(actual);
    console.log(
        `Migration registry is valid: ${registry.astroReadyCount}/${registry.chartCount} Astro, ${registry.legacyReadyCount}/${registry.chartCount} legacy.`,
    );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    main().catch((error) => {
        console.error(error.message);
        process.exitCode = 1;
    });
}
