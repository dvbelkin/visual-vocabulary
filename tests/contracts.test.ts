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

    it("contains 72 editorially complete bilingual examples", () => {
        expect(charts).toHaveLength(72);
        const issues: string[] = [];

        for (const locale of locales) {
            const titles = charts.map((chart) => chart.title[locale]);
            if (new Set(titles).size !== titles.length) {
                issues.push(`duplicate ${locale} titles`);
            }
        }

        for (const chart of charts) {
            for (const locale of locales) {
                const fields = [
                    chart.description[locale],
                    chart.useWhen[locale],
                    chart.avoidWhen[locale],
                ];
                if (new Set(fields).size !== fields.length) {
                    issues.push(`${chart.id} repeats ${locale} editorial copy`);
                }
                fields.forEach((text) => {
                    const minimumLength = locale === "ru" ? 45 : 40;
                    if (text.length < minimumLength) {
                        issues.push(`${chart.id} has short ${locale} copy: "${text}"`);
                    }
                    if (!/[.!?:]$/u.test(text)) {
                        issues.push(`${chart.id} has unfinished ${locale} copy: "${text}"`);
                    }
                });

                const labels = chart.data.map((row) => row.label[locale]);
                if (new Set(labels).size !== labels.length) {
                    issues.push(`${chart.id} repeats ${locale} data labels`);
                }
            }

            if (chart.data.length < 3) {
                issues.push(`${chart.id} has too few observations`);
            }
            if (
                chart.data.some((row) => row.value2 !== undefined) &&
                !chart.valueLabels?.secondary
            ) {
                issues.push(`${chart.id} does not name its secondary value`);
            }
            if (
                chart.data.some((row) => row.value3 !== undefined) &&
                !chart.valueLabels?.tertiary
            ) {
                issues.push(`${chart.id} does not name its tertiary value`);
            }
        }

        expect(issues).toEqual([]);
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

    it.each([
        {
            kind: "lollipop" as const,
            scatterValue: [42, "Category"],
        },
        {
            kind: "vertical-lollipop" as const,
            scatterValue: ["Category", 42],
        },
    ])("shows only the primary point in $kind tooltips", ({ kind, scatterValue }) => {
        const option = buildChartOption({
            kind,
            title: "Lollipop",
            unit: "points",
            locale: "en",
            data: [{ label: "Category", value: 42 }],
            reducedMotion: true,
        }) as {
            tooltip: {
                formatter: (
                    params: Array<{
                        axisValue: string;
                        marker: string;
                        seriesType: string;
                        value: Array<string | number>;
                    }>,
                ) => string;
            };
        };

        const tooltip = option.tooltip.formatter([
            {
                axisValue: "Category",
                marker: "grey",
                seriesType: "bar",
                value: [42, "Category"],
            },
            {
                axisValue: "Category",
                marker: "green",
                seriesType: "scatter",
                value: scatterValue,
            },
        ]);

        expect(tooltip).toBe("Category<br>green42 points");
        expect(tooltip).not.toContain("grey");
    });

    it("hides the technical y coordinate in circle timeline tooltips", () => {
        const option = buildChartOption({
            kind: "circle-timeline",
            title: "Circles on a timeline",
            unit: "participants",
            locale: "en",
            data: [{ label: "Jan", value: 120 }],
            reducedMotion: true,
        }) as {
            tooltip: {
                formatter: (params: { value: [string, number, number] }) => string;
            };
        };

        const tooltip = option.tooltip.formatter({ value: ["Jan", 0, 120] });

        expect(tooltip).toBe("Jan: 120 participants");
        expect(tooltip).not.toContain(": 0");
    });

    it("formats Priestley timeline years without thousands separators", () => {
        const option = buildChartOption({
            kind: "priestley",
            title: "Priestley timeline",
            unit: "years",
            locale: "ru",
            data: [{ label: "Период", value: 1836, value2: 1872 }],
            reducedMotion: true,
        }) as {
            xAxis: {
                axisLabel: {
                    formatter: (value: number) => string;
                };
            };
        };

        expect(option.xAxis.axisLabel.formatter(1836)).toBe("1836");
    });

    it("uses one colour series per programme in the bubble chart", () => {
        const option = buildChartOption({
            kind: "bubble",
            title: "Bubble chart",
            unit: "scores / students",
            locale: "en",
            data: [
                { label: "Programme A", value: 72, value2: 78, value3: 420 },
                { label: "Programme B", value: 64, value2: 69, value3: 260 },
            ],
            reducedMotion: true,
        }) as {
            legend: { data: string[] };
            series: Array<{ name: string; data: Array<{ value: number[] }> }>;
            tooltip: {
                formatter: (params: {
                    name: string;
                    value: [number, number, number];
                    marker: string;
                }) => string;
            };
        };

        expect(option.legend.data).toEqual(["Programme A", "Programme B"]);
        expect(option.series.map((series) => series.name)).toEqual(["Programme A", "Programme B"]);
        expect(
            option.tooltip.formatter({
                name: "Programme A",
                value: [72, 78, 420],
                marker: "● ",
            }),
        ).toContain("Students: 420");
    });

    it("separates scatter observations into two cohort series", () => {
        const option = buildChartOption({
            kind: "scatter",
            title: "Scatterplot",
            unit: "score and hours",
            locale: "en",
            data: [
                { key: "year-1", label: "Student 1.01", value: 2, value2: 52 },
                { key: "year-2", label: "Student 2.01", value: 2, value2: 64 },
            ],
            reducedMotion: true,
        }) as {
            legend: { data: string[] };
            series: Array<{ name: string; data: Array<{ name: string; value: number[] }> }>;
        };

        expect(option.legend.data).toEqual(["First year", "Second year"]);
        expect(option.series.map((series) => series.name)).toEqual(["First year", "Second year"]);
        expect(option.series.map((series) => series.data)).toHaveLength(2);
        expect(option.series.every((series) => series.data.length === 1)).toBe(true);
    });

    it("hides technical range-building series from dot range tooltips", () => {
        const option = buildChartOption({
            kind: "dot-range",
            title: "Dot range",
            unit: "minutes",
            locale: "en",
            data: [{ label: "Route A", value: 24, value2: 41 }],
            reducedMotion: true,
        }) as {
            tooltip: {
                formatter: (
                    params: Array<{
                        axisValue: string;
                        marker: string;
                        seriesName: string;
                        seriesType: string;
                        value: [number, string];
                    }>,
                ) => string;
            };
        };

        const tooltip = option.tooltip.formatter([
            {
                axisValue: "Route A",
                marker: "",
                seriesName: "",
                seriesType: "bar",
                value: [24, "Route A"],
            },
            {
                axisValue: "Route A",
                marker: "● ",
                seriesName: "Minimum",
                seriesType: "scatter",
                value: [24, "Route A"],
            },
            {
                axisValue: "Route A",
                marker: "● ",
                seriesName: "Maximum",
                seriesType: "scatter",
                value: [41, "Route A"],
            },
        ]);

        expect(tooltip).toBe("Route A<br>● Minimum: 24 minutes<br>● Maximum: 41 minutes");
    });

    it("hides vertical jitter from observation strip tooltips", () => {
        const option = buildChartOption({
            kind: "observation-strip",
            title: "Strip plot",
            unit: "points",
            locale: "en",
            data: [{ label: "Observation 1", value: 42 }],
            reducedMotion: true,
        }) as {
            tooltip: {
                formatter: (params: { name: string; value: [number, number] }) => string;
            };
        };

        expect(
            option.tooltip.formatter({
                name: "Observation 1",
                value: [42, -0.25],
            }),
        ).toBe("Observation 1: 42 points");
    });

    it("uses barcode thickness for duplicate counts without exposing the technical zero", () => {
        const option = buildChartOption({
            kind: "barcode",
            title: "Distribution barcode",
            unit: "seconds",
            locale: "en",
            data: [
                { label: "Reading 1", value: 24 },
                { label: "Reading 2", value: 24 },
                { label: "Reading 3", value: 31 },
            ],
            reducedMotion: true,
        }) as {
            series: Array<{
                data: Array<[number, number, number]>;
                symbolSize: (value: [number, number, number]) => number[];
            }>;
            tooltip: {
                formatter: (params: { value: [number, number, number] }) => string;
            };
        };

        expect(option.series[0].data).toContainEqual([24, 0, 2]);
        expect(option.series[0].symbolSize([24, 0, 2])[0]).toBeGreaterThan(
            option.series[0].symbolSize([31, 0, 1])[0],
        );
        expect(option.tooltip.formatter({ value: [24, 0, 2] })).toBe(
            "24 seconds<br>Observations: 2",
        );
    });

    it("builds standard and split violin variants from observations", () => {
        const option = buildChartOption({
            kind: "violin",
            title: "Violin plot",
            unit: "travel minutes",
            locale: "en",
            data: [
                { label: "Bus", value: 30, values: [20, 25, 30, 35, 40] },
                { label: "Tram", value: 26, values: [18, 22, 26, 30, 34] },
                { label: "Metro", value: 22, values: [16, 19, 22, 25, 28] },
            ],
            reducedMotion: true,
        }) as {
            title: Array<{ text: string; subtext: string }>;
            grid: unknown[];
            series: Array<{ id?: string }>;
        };

        expect(option.title.map((title) => title.text)).toEqual([
            "Standard violin plot",
            "Split violin plot",
        ]);
        expect(option.title[1].subtext).toContain("Left — Bus; right — Tram");
        expect(option.grid).toHaveLength(2);
        expect(option.series).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ id: "standard-violins" }),
                expect.objectContaining({ id: "split-violin" }),
            ]),
        );
    });
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
