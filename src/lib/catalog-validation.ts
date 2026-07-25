import type { ChartDefinition, DataRow } from "./catalog";
import { locales } from "./i18n";

const idPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function fail(path: string, message: string): never {
    throw new Error(`Invalid chart catalog at ${path}: ${message}`);
}

function assertLocalizedText(value: unknown, path: string) {
    if (!value || typeof value !== "object") {
        fail(path, "expected a localized object");
    }

    const keys = Object.keys(value).sort();
    const expectedKeys = [...locales].sort();
    if (
        keys.length !== expectedKeys.length ||
        keys.some((key, index) => key !== expectedKeys[index])
    ) {
        fail(path, `expected exactly the locale keys: ${expectedKeys.join(", ")}`);
    }

    for (const locale of locales) {
        const text = (value as Record<string, unknown>)[locale];
        if (typeof text !== "string" || !text.trim()) {
            fail(`${path}.${locale}`, "expected a non-empty string");
        }
    }
}

function assertFiniteNumber(value: unknown, path: string) {
    if (typeof value !== "number" || !Number.isFinite(value)) {
        fail(path, "expected a finite number");
    }
}

function assertDataRow(row: DataRow, path: string) {
    assertLocalizedText(row.label, `${path}.label`);
    assertFiniteNumber(row.value, `${path}.value`);

    for (const key of ["value2", "value3"] as const) {
        if (row[key] !== undefined) assertFiniteNumber(row[key], `${path}.${key}`);
    }

    if (row.values !== undefined) {
        if (!Array.isArray(row.values) || row.values.length === 0) {
            fail(`${path}.values`, "expected a non-empty number array");
        }
        row.values.forEach((value, index) => assertFiniteNumber(value, `${path}.values[${index}]`));
    }
}

export function assertChartCatalog(definitions: readonly ChartDefinition[]) {
    if (!Array.isArray(definitions) || definitions.length === 0) {
        fail("charts", "expected at least one chart");
    }

    const ids = new Set<string>();
    definitions.forEach((chart, chartIndex) => {
        const path = `charts[${chartIndex}]`;

        if (!idPattern.test(chart.id)) {
            fail(`${path}.id`, "expected a stable lowercase ASCII kebab-case id");
        }
        if (ids.has(chart.id)) fail(`${path}.id`, `duplicate id "${chart.id}"`);
        ids.add(chart.id);

        if (!chart.category) fail(`${path}.category`, "expected a category");
        if (!chart.kind) fail(`${path}.kind`, "expected a chart kind");

        for (const field of ["title", "description", "useWhen", "avoidWhen", "unit"] as const) {
            assertLocalizedText(chart[field], `${path}.${field}`);
        }

        if (chart.valueLabels) {
            assertLocalizedText(chart.valueLabels.primary, `${path}.valueLabels.primary`);
            if (chart.valueLabels.secondary) {
                assertLocalizedText(chart.valueLabels.secondary, `${path}.valueLabels.secondary`);
            }
            if (chart.valueLabels.tertiary) {
                assertLocalizedText(chart.valueLabels.tertiary, `${path}.valueLabels.tertiary`);
            }
        }

        if (!Array.isArray(chart.data) || chart.data.length === 0) {
            fail(`${path}.data`, "expected at least one data row");
        }
        chart.data.forEach((row: DataRow, rowIndex: number) =>
            assertDataRow(row, `${path}.data[${rowIndex}]`),
        );
    });
}
