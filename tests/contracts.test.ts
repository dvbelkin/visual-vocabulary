import { describe, expect, it } from "vitest";
import { assertChartCatalog } from "../src/lib/catalog-validation";
import { charts, type ChartDefinition } from "../src/lib/catalog";
import { buildChartOption } from "../src/lib/charts/options";
import { buildMapOption } from "../src/lib/charts/map-options";
import { mountChart } from "../src/lib/charts/lifecycle";
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
            const payload = {
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
            };
            const option =
                chart.category === "spatial" ? buildMapOption(payload) : buildChartOption(payload);

            expect(option).toHaveProperty("series");
            expect(option).toMatchObject({ animation: false });
        },
    );
});

describe("ECharts lifecycle", () => {
    it("resizes, reapplies reduced motion, and releases resources", () => {
        let motionListener: (() => void) | undefined;
        let resizeListener: (() => void) | undefined;
        let reducedMotion = false;
        const calls = { resize: 0, dispose: 0, disconnect: 0, options: [] as unknown[] };
        const chart = {
            resize: () => calls.resize++,
            dispose: () => calls.dispose++,
            setOption: (option: unknown) => calls.options.push(option),
        };
        const motionPreference = {
            get matches() {
                return reducedMotion;
            },
            addEventListener: (_type: "change", listener: () => void) => {
                motionListener = listener;
            },
            removeEventListener: (_type: "change", listener: () => void) => {
                if (motionListener === listener) motionListener = undefined;
            },
        };

        const cleanup = mountChart({
            root: {} as Element,
            chart,
            payload: { id: "example" },
            motionPreference,
            createOption: (_payload, prefersReducedMotion) => ({
                animation: !prefersReducedMotion,
            }),
            createResizeObserver: (listener) => {
                resizeListener = listener;
                return {
                    observe: () => undefined,
                    disconnect: () => calls.disconnect++,
                };
            },
        });

        expect(calls.options).toEqual([{ animation: true }]);
        resizeListener?.();
        expect(calls.resize).toBe(1);

        reducedMotion = true;
        motionListener?.();
        expect(calls.options).toEqual([{ animation: true }, { animation: false }]);

        cleanup();
        expect(calls).toMatchObject({ dispose: 1, disconnect: 1 });
        expect(motionListener).toBeUndefined();
    });
});
