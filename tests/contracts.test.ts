import { describe, expect, it } from "vitest";
import { assertChartCatalog } from "../src/lib/catalog-validation";
import { charts, type ChartDefinition } from "../src/lib/catalog";
import { buildChartOption } from "../src/lib/charts/options";
import { locales, t } from "../src/lib/i18n";

describe("chart catalog contract", () => {
    it("accepts the production catalog", () => {
        expect(() => assertChartCatalog(charts)).not.toThrow();
    });

    it("rejects duplicate ids", () => {
        const duplicate = { ...charts[0] };
        expect(() => assertChartCatalog([...charts, duplicate])).toThrow(/duplicate id/);
    });

    it("rejects incomplete localized content", () => {
        const invalid = structuredClone(charts) as ChartDefinition[];
        invalid[0].title = { ru: "Только русский" } as ChartDefinition["title"];
        expect(() => assertChartCatalog(invalid)).toThrow(/locale keys/);
    });

    it("rejects non-finite data values", () => {
        const invalid = structuredClone(charts) as ChartDefinition[];
        invalid[0].data[0].value = Number.NaN;
        expect(() => assertChartCatalog(invalid)).toThrow(/finite number/);
    });
});

describe("translation contract", () => {
    it("keeps interface keys in parity across locales", () => {
        const keySets = locales.map((locale) => Object.keys(t(locale)).sort());
        expect(keySets[1]).toEqual(keySets[0]);
    });
});

describe("ECharts option factories", () => {
    it.each(charts.map((chart) => [chart.id, chart] as const))(
        "builds an option for %s",
        (_id, chart) => {
            const option = buildChartOption({
                kind: chart.kind,
                title: chart.title.en,
                unit: chart.unit.en,
                locale: "en",
                data: chart.data.map((row) => ({
                    label: row.label.en,
                    value: row.value,
                    value2: row.value2,
                    value3: row.value3,
                    values: row.values,
                })),
                reducedMotion: true,
            });

            expect(option).toHaveProperty("series");
            expect(option).toMatchObject({ animation: false });
        },
    );
});
