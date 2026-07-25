import type { EChartsCoreOption } from "echarts/core";
import type { ChartKind, DataRow } from "../catalog";

export interface ChartPayload {
    kind: ChartKind;
    title: string;
    unit: string;
    locale: string;
    data: Array<Omit<DataRow, "label"> & { label: string }>;
    reducedMotion: boolean;
}

const ink = "#17201c";
const muted = "#68716c";
const gridLine = "#dfe5e1";
const green = "#176b4d";
const orange = "#db6b35";

function quantile(values: number[], percentile: number) {
    const sorted = [...values].sort((a, b) => a - b);
    const index = (sorted.length - 1) * percentile;
    const lower = Math.floor(index);
    const fraction = index - lower;
    return sorted[lower] + (sorted[lower + 1] - sorted[lower] || 0) * fraction;
}

export function buildChartOption(payload: ChartPayload): EChartsCoreOption {
    const base = {
        animation: !payload.reducedMotion,
        aria: {
            enabled: true,
            description:
                payload.locale === "ru"
                    ? `${payload.title}. Значения представлены в единицах: ${payload.unit}.`
                    : `${payload.title}. Values are shown in ${payload.unit}.`,
            decal: { show: true },
        },
        color: [green, orange, "#2f6fb0", "#8f5ca6", "#d4a72c"],
        textStyle: {
            color: ink,
            fontFamily: 'Inter, "Segoe UI", system-ui, sans-serif',
        },
        tooltip: {
            trigger:
                payload.kind === "pie" ||
                payload.kind === "donut" ||
                payload.kind === "scatter" ||
                payload.kind === "connected-scatter" ||
                payload.kind === "bubble" ||
                payload.kind === "sankey" ||
                payload.kind === "chord" ||
                payload.kind === "network" ||
                payload.kind === "radar"
                    ? "item"
                    : "axis",
            confine: true,
        },
    };

    if (payload.kind === "pie" || payload.kind === "donut") {
        return {
            ...base,
            legend: { bottom: 0, textStyle: { color: muted } },
            series: [
                {
                    type: "pie",
                    radius: payload.kind === "donut" ? ["42%", "70%"] : ["0%", "70%"],
                    center: ["50%", "44%"],
                    label: { formatter: "{b}\n{d}%" },
                    data: payload.data.map(({ label, value }) => ({ name: label, value })),
                },
            ],
        };
    }

    if (payload.kind === "scatter") {
        return {
            ...base,
            grid: { left: 54, right: 28, top: 26, bottom: 50 },
            xAxis: {
                type: "value",
                name: payload.locale === "ru" ? "Часы подготовки" : "Study hours",
                nameLocation: "middle",
                nameGap: 30,
                splitLine: { lineStyle: { color: gridLine } },
            },
            yAxis: {
                type: "value",
                name: payload.locale === "ru" ? "Результат" : "Score",
                splitLine: { lineStyle: { color: gridLine } },
            },
            series: [
                {
                    type: "scatter",
                    symbolSize: 14,
                    data: payload.data.map(({ label, value, value2 }) => ({
                        name: label,
                        value: [value, value2],
                    })),
                },
            ],
        };
    }

    if (payload.kind === "correlation-combo") {
        const labels =
            payload.locale === "ru"
                ? ["Посещения, тыс.", "Доля возвратов, %"]
                : ["Visits, thousands", "Return rate, %"];
        return {
            ...base,
            legend: { top: 0 },
            grid: { left: 58, right: 58, top: 52, bottom: 48 },
            xAxis: {
                type: "category",
                data: payload.data.map((row) => row.label),
            },
            yAxis: [
                {
                    type: "value",
                    name: labels[0],
                    splitLine: { lineStyle: { color: gridLine } },
                },
                {
                    type: "value",
                    name: "%",
                    min: 0,
                    max: 60,
                    splitLine: { show: false },
                },
            ],
            series: [
                {
                    name: labels[0],
                    type: "bar",
                    data: payload.data.map((row) => row.value),
                    barMaxWidth: 42,
                },
                {
                    name: labels[1],
                    type: "line",
                    yAxisIndex: 1,
                    data: payload.data.map((row) => row.value2 ?? 0),
                    symbolSize: 9,
                    lineStyle: { width: 3 },
                },
            ],
        };
    }

    if (payload.kind === "connected-scatter") {
        const axisNames =
            payload.locale === "ru" ? ["Доступность", "Качество"] : ["Affordability", "Quality"];
        const points = payload.data.map((row) => [row.value, row.value2 ?? 0]);
        return {
            ...base,
            grid: { left: 58, right: 32, top: 28, bottom: 54 },
            xAxis: {
                type: "value",
                name: axisNames[0],
                nameLocation: "middle",
                nameGap: 32,
                scale: true,
                splitLine: { lineStyle: { color: gridLine } },
            },
            yAxis: {
                type: "value",
                name: axisNames[1],
                scale: true,
                splitLine: { lineStyle: { color: gridLine } },
            },
            series: [
                {
                    type: "line",
                    data: points,
                    symbolSize: 10,
                    lineStyle: { width: 3 },
                    label: {
                        show: true,
                        position: "top",
                        formatter: ({ dataIndex }: { dataIndex: number }) =>
                            payload.data[dataIndex].label,
                    },
                },
            ],
        };
    }

    if (payload.kind === "bubble") {
        const maximum = Math.max(...payload.data.map((row) => row.value3 ?? 0));
        const axisNames = payload.locale === "ru" ? ["Практика", "Экзамен"] : ["Practice", "Exam"];
        return {
            ...base,
            grid: { left: 58, right: 32, top: 28, bottom: 54 },
            xAxis: {
                type: "value",
                name: axisNames[0],
                nameLocation: "middle",
                nameGap: 32,
                scale: true,
                splitLine: { lineStyle: { color: gridLine } },
            },
            yAxis: {
                type: "value",
                name: axisNames[1],
                scale: true,
                splitLine: { lineStyle: { color: gridLine } },
            },
            series: [
                {
                    type: "scatter",
                    data: payload.data.map((row) => ({
                        name: row.label,
                        value: [row.value, row.value2 ?? 0, row.value3 ?? 0],
                    })),
                    symbolSize: (value: [number, number, number]) =>
                        18 + Math.sqrt(value[2] / maximum) * 46,
                    label: { show: true, position: "top", formatter: "{b}" },
                },
            ],
        };
    }

    if (payload.kind === "diverging-bar") {
        return {
            ...base,
            grid: { left: 88, right: 40, top: 28, bottom: 52 },
            xAxis: {
                type: "value",
                name: payload.unit,
                nameLocation: "middle",
                nameGap: 32,
                splitLine: { lineStyle: { color: gridLine } },
            },
            yAxis: {
                type: "category",
                inverse: true,
                data: payload.data.map((row) => row.label),
            },
            series: [
                {
                    type: "bar",
                    data: payload.data.map((row) => ({
                        value: row.value,
                        itemStyle: { color: row.value < 0 ? orange : green },
                    })),
                    label: {
                        show: true,
                        position: "outside",
                        formatter: ({ value }: { value: number }) =>
                            `${value > 0 ? "+" : ""}${value}`,
                    },
                },
            ],
        };
    }

    if (payload.kind === "diverging-stacked") {
        const names =
            payload.locale === "ru"
                ? ["Не согласны", "Нейтральны", "Согласны"]
                : ["Disagree", "Neutral", "Agree"];
        return {
            ...base,
            legend: { top: 0 },
            grid: { left: 112, right: 34, top: 52, bottom: 48 },
            xAxis: {
                type: "value",
                min: -60,
                max: 80,
                axisLabel: { formatter: (value: number) => `${Math.abs(value)}%` },
                splitLine: { lineStyle: { color: gridLine } },
            },
            yAxis: {
                type: "category",
                inverse: true,
                data: payload.data.map((row) => row.label),
            },
            series: [
                {
                    name: names[0],
                    type: "bar",
                    stack: "negative",
                    data: payload.data.map((row) => -row.value),
                    itemStyle: { color: orange },
                },
                {
                    name: names[1],
                    type: "bar",
                    stack: "negative",
                    data: payload.data.map((row) => -(row.value2 ?? 0) / 2),
                    itemStyle: { color: "#d4a72c" },
                    tooltip: { valueFormatter: (value: number) => `${Math.abs(value * 2)}%` },
                },
                {
                    name: names[1],
                    type: "bar",
                    stack: "positive",
                    data: payload.data.map((row) => (row.value2 ?? 0) / 2),
                    itemStyle: { color: "#d4a72c" },
                    tooltip: { valueFormatter: (value: number) => `${value * 2}%` },
                },
                {
                    name: names[2],
                    type: "bar",
                    stack: "positive",
                    data: payload.data.map((row) => row.value3 ?? 0),
                    itemStyle: { color: green },
                },
            ],
        };
    }

    if (payload.kind === "spine") {
        const names = payload.locale === "ru" ? ["Онлайн", "Очно"] : ["Online", "In person"];
        return {
            ...base,
            legend: { top: 0 },
            grid: { left: 104, right: 32, top: 52, bottom: 48 },
            xAxis: {
                type: "value",
                min: -100,
                max: 100,
                axisLabel: { formatter: (value: number) => `${Math.abs(value)}%` },
                splitLine: { lineStyle: { color: gridLine } },
            },
            yAxis: {
                type: "category",
                inverse: true,
                data: payload.data.map((row) => row.label),
            },
            series: [
                {
                    name: names[0],
                    type: "bar",
                    data: payload.data.map((row) => -row.value),
                    itemStyle: { color: "#2f6fb0" },
                    label: {
                        show: true,
                        position: "insideLeft",
                        formatter: ({ value }: { value: number }) => `${Math.abs(value)}%`,
                    },
                },
                {
                    name: names[1],
                    type: "bar",
                    data: payload.data.map((row) => row.value2 ?? 0),
                    itemStyle: { color: green },
                    label: { show: true, position: "insideRight", formatter: "{c}%" },
                },
            ],
        };
    }

    if (payload.kind === "balance-area") {
        const names = payload.locale === "ru" ? ["Выработка", "Спрос"] : ["Generation", "Demand"];
        const intervals = payload.data.slice(0, -1).map((row, index) => {
            const next = payload.data[index + 1];
            return [
                index,
                row.value,
                row.value2 ?? 0,
                next.value,
                next.value2 ?? 0,
                (row.value + next.value) / 2 >= ((row.value2 ?? 0) + (next.value2 ?? 0)) / 2
                    ? 1
                    : -1,
            ];
        });
        return {
            ...base,
            legend: { top: 0 },
            grid: { left: 58, right: 28, top: 52, bottom: 48 },
            xAxis: {
                type: "category",
                boundaryGap: false,
                data: payload.data.map((row) => row.label),
            },
            yAxis: {
                type: "value",
                name: payload.unit,
                splitLine: { lineStyle: { color: gridLine } },
            },
            series: [
                {
                    type: "custom",
                    silent: true,
                    data: intervals,
                    renderItem: (
                        _params: unknown,
                        api: {
                            value: (dimension: number) => number;
                            coord: (point: [number, number]) => [number, number];
                        },
                    ) => {
                        const index = api.value(0);
                        const generationStart = api.coord([index, api.value(1)]);
                        const demandStart = api.coord([index, api.value(2)]);
                        const generationEnd = api.coord([index + 1, api.value(3)]);
                        const demandEnd = api.coord([index + 1, api.value(4)]);
                        return {
                            type: "polygon",
                            shape: {
                                points: [generationStart, generationEnd, demandEnd, demandStart],
                            },
                            style: {
                                fill:
                                    api.value(5) > 0
                                        ? "rgba(23, 107, 77, .30)"
                                        : "rgba(219, 107, 53, .28)",
                            },
                        };
                    },
                },
                {
                    name: names[0],
                    type: "line",
                    smooth: 0.25,
                    symbolSize: 7,
                    data: payload.data.map((row) => row.value),
                    lineStyle: { width: 3, color: green },
                },
                {
                    name: names[1],
                    type: "line",
                    smooth: 0.25,
                    symbolSize: 7,
                    data: payload.data.map((row) => row.value2 ?? 0),
                    lineStyle: { width: 3, color: orange },
                },
            ],
        };
    }

    if (payload.kind === "boxplot") {
        return {
            ...base,
            grid: { left: 58, right: 28, top: 28, bottom: 52 },
            xAxis: {
                type: "category",
                data: payload.data.map((row) => row.label),
            },
            yAxis: {
                type: "value",
                name: payload.unit,
                scale: true,
                splitLine: { lineStyle: { color: gridLine } },
            },
            series: [
                {
                    type: "boxplot",
                    boxWidth: ["35%", "58%"],
                    itemStyle: { color: "rgba(23, 107, 77, .22)", borderColor: green },
                    data: payload.data.map((row) => {
                        const values = row.values ?? [row.value];
                        return [
                            Math.min(...values),
                            quantile(values, 0.25),
                            quantile(values, 0.5),
                            quantile(values, 0.75),
                            Math.max(...values),
                        ];
                    }),
                },
            ],
        };
    }

    if (payload.kind === "proportional-symbols") {
        const maximum = Math.max(...payload.data.map((row) => row.value));
        return {
            ...base,
            grid: { left: 42, right: 42, top: 28, bottom: 58 },
            xAxis: {
                type: "category",
                data: payload.data.map((row) => row.label),
                axisTick: { show: false },
            },
            yAxis: { type: "value", min: -1, max: 1, show: false },
            series: [
                {
                    type: "scatter",
                    data: payload.data.map((row) => [row.label, 0, row.value]),
                    symbolSize: (value: [string, number, number]) =>
                        22 + Math.sqrt(value[2] / maximum) * 54,
                    label: {
                        show: true,
                        position: "inside",
                        formatter: ({ value }: { value: [string, number, number] }) => value[2],
                        color: "#fff",
                        fontWeight: 700,
                    },
                },
            ],
        };
    }

    if (payload.kind === "dot-strip") {
        return {
            ...base,
            grid: { left: 90, right: 42, top: 28, bottom: 52 },
            xAxis: {
                type: "value",
                name: payload.unit,
                nameLocation: "middle",
                nameGap: 30,
                scale: true,
                splitLine: { lineStyle: { color: gridLine } },
            },
            yAxis: {
                type: "category",
                inverse: true,
                data: payload.data.map((row) => row.label),
            },
            series: [
                {
                    type: "scatter",
                    symbolSize: 18,
                    data: payload.data.map((row) => [row.value, row.label]),
                    label: {
                        show: true,
                        position: "right",
                        formatter: ({ value }: { value: [number, string] }) => value[0],
                        color: ink,
                        fontWeight: 700,
                    },
                },
            ],
        };
    }

    if (payload.kind === "vertical-lollipop") {
        return {
            ...base,
            grid: { left: 54, right: 28, top: 28, bottom: 52 },
            xAxis: {
                type: "category",
                data: payload.data.map((row) => row.label),
            },
            yAxis: {
                type: "value",
                name: payload.unit,
                splitLine: { lineStyle: { color: gridLine } },
            },
            series: [
                {
                    type: "bar",
                    data: payload.data.map((row) => row.value),
                    barWidth: 3,
                    itemStyle: { color: "#aeb9b2" },
                    silent: true,
                },
                {
                    type: "scatter",
                    symbolSize: 18,
                    data: payload.data.map((row) => [row.label, row.value]),
                    label: {
                        show: true,
                        position: "top",
                        formatter: ({ value }: { value: [string, number] }) => value[1],
                        color: ink,
                        fontWeight: 700,
                    },
                },
            ],
        };
    }

    if (payload.kind === "bump") {
        const periods =
            payload.locale === "ru"
                ? ["Семестр 1", "Семестр 2", "Семестр 3", "Семестр 4"]
                : ["Term 1", "Term 2", "Term 3", "Term 4"];
        return {
            ...base,
            legend: { top: 0 },
            grid: { left: 54, right: 84, top: 52, bottom: 48 },
            xAxis: { type: "category", data: periods, boundaryGap: false },
            yAxis: {
                type: "value",
                min: 1,
                max: payload.data.length,
                interval: 1,
                inverse: true,
                name: payload.unit,
                splitLine: { lineStyle: { color: gridLine } },
            },
            series: payload.data.map((row) => ({
                name: row.label,
                type: "line",
                data: row.values ?? [row.value],
                symbolSize: 10,
                lineStyle: { width: 3 },
                label: {
                    show: true,
                    position: "right",
                    formatter: ({ dataIndex }: { dataIndex: number }) =>
                        dataIndex === periods.length - 1 ? row.label : "",
                },
                emphasis: { focus: "series" },
            })),
        };
    }

    if (payload.kind === "violin") {
        const step = 2;
        const bandwidth = 4.5;
        const allValues = payload.data.flatMap((row) => row.values ?? [row.value]);
        const shapes = payload.data.map((row) => {
            const values = row.values ?? [row.value];
            const min = Math.floor(Math.min(...values) / step) * step - step;
            const max = Math.ceil(Math.max(...values) / step) * step + step;
            const density = [];
            for (let point = min; point <= max; point += step) {
                const weight = values.reduce((sum, value) => {
                    const distance = (point - value) / bandwidth;
                    return sum + Math.exp(-0.5 * distance * distance);
                }, 0);
                density.push({ point, weight });
            }
            const peak = Math.max(...density.map((item) => item.weight));
            return density.map((item) => ({ point: item.point, width: item.weight / peak }));
        });
        return {
            ...base,
            tooltip: { trigger: "item", confine: true },
            grid: { left: 58, right: 28, top: 28, bottom: 52 },
            xAxis: {
                type: "category",
                data: payload.data.map((row) => row.label),
                axisLabel: { interval: 0, rotate: 18, fontSize: 10 },
            },
            yAxis: {
                type: "value",
                name: payload.unit,
                min: Math.floor(Math.min(...allValues) / step) * step - step,
                max: Math.ceil(Math.max(...allValues) / step) * step + step,
                splitLine: { lineStyle: { color: gridLine } },
            },
            series: [
                {
                    type: "custom",
                    data: payload.data.map((row, index) => [index, row.value]),
                    renderItem: (
                        params: { dataIndex: number },
                        api: {
                            coord: (point: [number, number]) => [number, number];
                            size: (size: [number, number]) => [number, number];
                        },
                    ) => {
                        const shape = shapes[params.dataIndex];
                        const categoryWidth = api.size([1, 0])[0] * 0.28;
                        const right = shape.map(({ point, width }) => {
                            const [x, y] = api.coord([params.dataIndex, point]);
                            return [x + categoryWidth * width, y];
                        });
                        const left = [...shape].reverse().map(({ point, width }) => {
                            const [x, y] = api.coord([params.dataIndex, point]);
                            return [x - categoryWidth * width, y];
                        });
                        return {
                            type: "polygon",
                            shape: { points: [...right, ...left] },
                            style: {
                                fill: "rgba(47, 111, 176, .28)",
                                stroke: "#2f6fb0",
                                lineWidth: 2,
                            },
                        };
                    },
                },
                {
                    type: "scatter",
                    symbolSize: [18, 5],
                    data: payload.data.map((row, index) => [index, row.value]),
                    itemStyle: { color: ink },
                    tooltip: {
                        formatter: ({ value }: { value: [number, number] }) =>
                            `${payload.data[value[0]].label}: ${value[1]} ${payload.unit}`,
                    },
                },
            ],
        };
    }

    if (payload.kind === "grouped-bar") {
        const labels =
            payload.locale === "ru"
                ? ["Самооценка", "Практическое задание"]
                : ["Self-assessment", "Practical task"];
        return {
            ...base,
            legend: { top: 0, textStyle: { color: muted } },
            grid: { left: 124, right: 30, top: 52, bottom: 48 },
            xAxis: {
                type: "value",
                name: payload.unit,
                nameLocation: "middle",
                nameGap: 30,
                splitLine: { lineStyle: { color: gridLine } },
            },
            yAxis: {
                type: "category",
                inverse: true,
                data: payload.data.map((row) => row.label),
            },
            series: [
                {
                    name: labels[0],
                    type: "bar",
                    data: payload.data.map((row) => row.value),
                },
                {
                    name: labels[1],
                    type: "bar",
                    data: payload.data.map((row) => row.value2),
                },
            ],
        };
    }

    if (payload.kind === "lollipop") {
        return {
            ...base,
            grid: { left: 108, right: 48, top: 28, bottom: 48 },
            xAxis: {
                type: "value",
                name: payload.unit,
                nameLocation: "middle",
                nameGap: 30,
                splitLine: { lineStyle: { color: gridLine } },
            },
            yAxis: {
                type: "category",
                inverse: true,
                data: payload.data.map((row) => row.label),
            },
            series: [
                {
                    name: payload.unit,
                    type: "bar",
                    data: payload.data.map((row) => row.value),
                    barWidth: 3,
                    itemStyle: { color: "#aeb9b2" },
                    silent: true,
                },
                {
                    name: payload.unit,
                    type: "scatter",
                    symbolSize: 18,
                    data: payload.data.map((row) => [row.value, row.label]),
                    label: {
                        show: true,
                        position: "right",
                        formatter: ({ value }: { value: Array<string | number> }) => value[0],
                        color: ink,
                        fontWeight: 700,
                    },
                },
            ],
        };
    }

    if (payload.kind === "rank-change") {
        return {
            ...base,
            grid: { left: 54, right: 96, top: 28, bottom: 42 },
            xAxis: {
                type: "category",
                data: payload.locale === "ru" ? ["2024", "2026"] : ["2024", "2026"],
                boundaryGap: false,
            },
            yAxis: {
                type: "value",
                min: 1,
                max: payload.data.length,
                interval: 1,
                inverse: true,
                name: payload.unit,
                splitLine: { lineStyle: { color: gridLine } },
            },
            series: payload.data.map((row) => ({
                name: row.label,
                type: "line",
                data: [row.value, row.value2],
                symbolSize: 10,
                lineStyle: { width: 3 },
                label: {
                    show: true,
                    position: "right",
                    formatter: ({ dataIndex }: { dataIndex: number }) =>
                        dataIndex === 1 ? row.label : "",
                },
                emphasis: { focus: "series" },
            })),
        };
    }

    if (payload.kind === "bullet") {
        const targetName = payload.locale === "ru" ? "Цель" : "Target";
        const actualName = payload.locale === "ru" ? "Факт" : "Actual";
        return {
            ...base,
            legend: { top: 0, data: [actualName, targetName] },
            grid: { left: 118, right: 36, top: 52, bottom: 48 },
            xAxis: {
                type: "value",
                min: 0,
                max: 100,
                name: payload.unit,
                nameLocation: "middle",
                nameGap: 30,
                splitLine: { lineStyle: { color: gridLine } },
            },
            yAxis: {
                type: "category",
                inverse: true,
                data: payload.data.map((row) => row.label),
            },
            series: [
                {
                    name: payload.locale === "ru" ? "Диапазон" : "Range",
                    type: "bar",
                    data: payload.data.map(() => 100),
                    barWidth: 26,
                    itemStyle: { color: "#dfe5e1" },
                    silent: true,
                },
                {
                    name: actualName,
                    type: "bar",
                    data: payload.data.map((row) => row.value),
                    barWidth: 11,
                    barGap: "-72%",
                    itemStyle: { color: green },
                },
                {
                    name: targetName,
                    type: "scatter",
                    symbol: "rect",
                    symbolSize: [4, 25],
                    data: payload.data.map((row) => [row.value2, row.label]),
                    itemStyle: { color: ink },
                },
            ],
        };
    }

    if (payload.kind === "radar") {
        return {
            ...base,
            legend: {
                bottom: 0,
                data:
                    payload.locale === "ru"
                        ? ["Программа А", "Программа Б"]
                        : ["Programme A", "Programme B"],
            },
            radar: {
                center: ["50%", "48%"],
                radius: "56%",
                indicator: payload.data.map((row) => ({ name: row.label, max: 100 })),
                splitArea: { areaStyle: { color: ["#fbfcfa", "#f0f4f1"] } },
                splitLine: { lineStyle: { color: gridLine } },
                axisLine: { lineStyle: { color: gridLine } },
            },
            series: [
                {
                    type: "radar",
                    data: [
                        {
                            name: payload.locale === "ru" ? "Программа А" : "Programme A",
                            value: payload.data.map((row) => row.value),
                            areaStyle: { opacity: 0.16 },
                        },
                        {
                            name: payload.locale === "ru" ? "Программа Б" : "Programme B",
                            value: payload.data.map((row) => row.value2),
                            areaStyle: { opacity: 0.12 },
                        },
                    ],
                },
            ],
        };
    }

    if (payload.kind === "timeline-bar") {
        return {
            ...base,
            grid: { left: 56, right: 28, top: 28, bottom: 52 },
            xAxis: {
                type: "category",
                data: payload.data.map((row) => row.label),
                axisTick: { alignWithLabel: true },
            },
            yAxis: {
                type: "value",
                name: payload.unit,
                splitLine: { lineStyle: { color: gridLine } },
            },
            series: [
                {
                    type: "bar",
                    data: payload.data.map((row) => row.value),
                    barMaxWidth: 42,
                    itemStyle: { color: green },
                },
            ],
        };
    }

    if (payload.kind === "combo") {
        const names =
            payload.locale === "ru"
                ? ["Заявки", "Доля одобрения"]
                : ["Applications", "Approval rate"];
        return {
            ...base,
            legend: { top: 0 },
            grid: { left: 58, right: 58, top: 52, bottom: 48 },
            xAxis: {
                type: "category",
                data: payload.data.map((row) => row.label),
            },
            yAxis: [
                {
                    type: "value",
                    name: payload.locale === "ru" ? "Заявки" : "Applications",
                    splitLine: { lineStyle: { color: gridLine } },
                },
                {
                    type: "value",
                    name: "%",
                    min: 0,
                    max: 100,
                    splitLine: { show: false },
                },
            ],
            series: [
                {
                    name: names[0],
                    type: "bar",
                    data: payload.data.map((row) => row.value),
                    barMaxWidth: 42,
                },
                {
                    name: names[1],
                    type: "line",
                    yAxisIndex: 1,
                    data: payload.data.map((row) => row.value2),
                    symbolSize: 9,
                    lineStyle: { width: 3 },
                },
            ],
        };
    }

    if (payload.kind === "slope") {
        return {
            ...base,
            legend: { bottom: 0 },
            grid: { left: 58, right: 100, top: 28, bottom: 58 },
            xAxis: {
                type: "category",
                data: ["2022", "2026"],
                boundaryGap: false,
            },
            yAxis: {
                type: "value",
                name: payload.unit,
                min: 40,
                max: 90,
                splitLine: { lineStyle: { color: gridLine } },
            },
            series: payload.data.map((row) => ({
                name: row.label,
                type: "line",
                data: [row.value, row.value2],
                symbolSize: 10,
                lineStyle: { width: 3 },
                label: {
                    show: true,
                    position: "right",
                    formatter: ({ dataIndex }: { dataIndex: number }) =>
                        dataIndex === 1 ? row.label : "",
                },
                emphasis: { focus: "series" },
            })),
        };
    }

    if (payload.kind === "stacked-area") {
        const names = payload.locale === "ru" ? ["Солнце", "Ветер"] : ["Solar", "Wind"];
        return {
            ...base,
            legend: { top: 0 },
            grid: { left: 56, right: 28, top: 52, bottom: 46 },
            xAxis: {
                type: "category",
                boundaryGap: false,
                data: payload.data.map((row) => row.label),
            },
            yAxis: {
                type: "value",
                name: payload.unit,
                splitLine: { lineStyle: { color: gridLine } },
            },
            series: [
                {
                    name: names[0],
                    type: "line",
                    stack: "total",
                    symbol: "none",
                    lineStyle: { width: 2 },
                    areaStyle: { opacity: 0.7 },
                    data: payload.data.map((row) => row.value),
                },
                {
                    name: names[1],
                    type: "line",
                    stack: "total",
                    symbol: "none",
                    lineStyle: { width: 2 },
                    areaStyle: { opacity: 0.62 },
                    data: payload.data.map((row) => row.value2),
                },
            ],
        };
    }

    if (payload.kind === "calendar") {
        return {
            ...base,
            tooltip: {
                formatter: ({ value }: { value: [string, number] }) =>
                    `${value[0]}<br>${value[1]} ${payload.unit}`,
            },
            visualMap: {
                min: Math.min(...payload.data.map((row) => row.value)),
                max: Math.max(...payload.data.map((row) => row.value)),
                calculable: true,
                orient: "horizontal",
                left: "center",
                bottom: 0,
                inRange: { color: ["#e8f2ec", green] },
            },
            calendar: {
                top: 48,
                left: 40,
                right: 24,
                cellSize: ["auto", 24],
                range: ["2026-01-01", "2026-03-31"],
                itemStyle: { borderColor: "#fbfcfa", borderWidth: 3 },
                yearLabel: { show: false },
                dayLabel: {
                    firstDay: 1,
                    nameMap:
                        payload.locale === "ru" ? ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"] : "EN",
                },
                monthLabel: {
                    nameMap:
                        payload.locale === "ru"
                            ? [
                                  "Янв",
                                  "Фев",
                                  "Мар",
                                  "Апр",
                                  "Май",
                                  "Июн",
                                  "Июл",
                                  "Авг",
                                  "Сен",
                                  "Окт",
                                  "Ноя",
                                  "Дек",
                              ]
                            : "EN",
                },
            },
            series: [
                {
                    type: "heatmap",
                    coordinateSystem: "calendar",
                    data: payload.data.map((row) => [row.label, row.value]),
                },
            ],
        };
    }

    if (payload.kind === "population-pyramid") {
        const names = payload.locale === "ru" ? ["Мужчины", "Женщины"] : ["Men", "Women"];
        const max =
            Math.ceil(
                Math.max(...payload.data.flatMap((row) => [row.value, row.value2 ?? 0])) / 10,
            ) * 10;
        return {
            ...base,
            legend: { top: 0 },
            grid: { left: 52, right: 28, top: 48, bottom: 48 },
            xAxis: {
                type: "value",
                min: -max,
                max,
                name: payload.unit,
                nameLocation: "middle",
                nameGap: 30,
                axisLabel: { formatter: (value: number) => Math.abs(value) },
                splitLine: { lineStyle: { color: gridLine } },
            },
            yAxis: {
                type: "category",
                data: payload.data.map((row) => row.label),
            },
            series: [
                {
                    name: names[0],
                    type: "bar",
                    stack: "population",
                    data: payload.data.map((row) => -row.value),
                },
                {
                    name: names[1],
                    type: "bar",
                    stack: "population",
                    data: payload.data.map((row) => row.value2),
                },
            ],
        };
    }

    if (payload.kind === "dot-range") {
        const minimum = payload.locale === "ru" ? "Минимум" : "Minimum";
        const maximum = payload.locale === "ru" ? "Максимум" : "Maximum";
        return {
            ...base,
            legend: { top: 0, data: [minimum, maximum] },
            grid: { left: 92, right: 38, top: 52, bottom: 48 },
            xAxis: {
                type: "value",
                name: payload.unit,
                nameLocation: "middle",
                nameGap: 30,
                splitLine: { lineStyle: { color: gridLine } },
            },
            yAxis: {
                type: "category",
                inverse: true,
                data: payload.data.map((row) => row.label),
            },
            series: [
                {
                    type: "bar",
                    stack: "range",
                    data: payload.data.map((row) => row.value),
                    itemStyle: { color: "transparent" },
                    silent: true,
                },
                {
                    type: "bar",
                    stack: "range",
                    data: payload.data.map((row) => (row.value2 ?? row.value) - row.value),
                    barWidth: 3,
                    itemStyle: { color: "#9eaaa3" },
                    silent: true,
                },
                {
                    name: minimum,
                    type: "scatter",
                    symbolSize: 15,
                    data: payload.data.map((row) => [row.value, row.label]),
                },
                {
                    name: maximum,
                    type: "scatter",
                    symbolSize: 15,
                    data: payload.data.map((row) => [row.value2, row.label]),
                },
            ],
        };
    }

    if (payload.kind === "cumulative") {
        return {
            ...base,
            grid: { left: 58, right: 28, top: 28, bottom: 52 },
            xAxis: {
                type: "category",
                data: payload.data.map((row) => row.label),
                name: payload.locale === "ru" ? "Порог" : "Threshold",
                nameLocation: "middle",
                nameGap: 30,
                boundaryGap: false,
            },
            yAxis: {
                type: "value",
                min: 0,
                max: 100,
                name: payload.unit,
                axisLabel: { formatter: "{value}%" },
                splitLine: { lineStyle: { color: gridLine } },
            },
            series: [
                {
                    type: "line",
                    data: payload.data.map((row) => row.value),
                    symbolSize: 8,
                    lineStyle: { width: 3, color: green },
                    itemStyle: { color: green },
                    areaStyle: { color: "rgba(23, 107, 77, .10)" },
                },
            ],
        };
    }

    if (payload.kind === "observation-strip") {
        return {
            ...base,
            grid: { left: 34, right: 28, top: 28, bottom: 58 },
            xAxis: {
                type: "value",
                name: payload.unit,
                nameLocation: "middle",
                nameGap: 32,
                splitLine: { lineStyle: { color: gridLine } },
            },
            yAxis: {
                type: "value",
                min: -0.5,
                max: 0.5,
                show: false,
            },
            series: [
                {
                    type: "scatter",
                    symbolSize: 14,
                    data: payload.data.map((row, index) => [
                        row.value,
                        ((index * 17) % 11) / 20 - 0.25,
                    ]),
                    itemStyle: {
                        color: green,
                        opacity: 0.72,
                        borderColor: "#fff",
                        borderWidth: 1.5,
                    },
                },
            ],
        };
    }

    if (payload.kind === "barcode") {
        return {
            ...base,
            grid: { left: 34, right: 28, top: 42, bottom: 58 },
            xAxis: {
                type: "value",
                name: payload.unit,
                nameLocation: "middle",
                nameGap: 32,
                splitLine: { lineStyle: { color: gridLine } },
            },
            yAxis: {
                type: "value",
                min: -1,
                max: 1,
                show: false,
            },
            series: [
                {
                    type: "scatter",
                    symbol: "rect",
                    symbolSize: [3, 110],
                    data: payload.data.map((row) => [row.value, 0]),
                    itemStyle: { color: green, opacity: 0.72 },
                },
            ],
        };
    }

    if (payload.kind === "stacked-bar" || payload.kind === "normalized-stacked") {
        const normalized = payload.kind === "normalized-stacked";
        const names =
            payload.locale === "ru"
                ? normalized
                    ? ["Согласны", "Нейтральны", "Не согласны"]
                    : ["Персонал", "Инфраструктура", "Программы"]
                : normalized
                  ? ["Agree", "Neutral", "Disagree"]
                  : ["Staff", "Facilities", "Programmes"];
        const values = [
            payload.data.map((row) => row.value),
            payload.data.map((row) => row.value2 ?? 0),
            payload.data.map((row) => row.value3 ?? 0),
        ];
        return {
            ...base,
            legend: { top: 0 },
            grid: { left: normalized ? 108 : 58, right: 30, top: 52, bottom: 48 },
            xAxis: normalized
                ? {
                      type: "value",
                      min: 0,
                      max: 100,
                      axisLabel: { formatter: "{value}%" },
                      splitLine: { lineStyle: { color: gridLine } },
                  }
                : {
                      type: "category",
                      data: payload.data.map((row) => row.label),
                  },
            yAxis: normalized
                ? {
                      type: "category",
                      inverse: true,
                      data: payload.data.map((row) => row.label),
                  }
                : {
                      type: "value",
                      name: payload.unit,
                      splitLine: { lineStyle: { color: gridLine } },
                  },
            series: names.map((name, index) => ({
                name,
                type: "bar",
                stack: "total",
                data: values[index],
                label: normalized
                    ? {
                          show: true,
                          formatter: ({ value }: { value: number }) =>
                              value >= 15 ? `${value}%` : "",
                      }
                    : undefined,
            })),
        };
    }

    if (payload.kind === "treemap") {
        return {
            ...base,
            tooltip: {
                formatter: ({ name, value }: { name: string; value: number }) =>
                    `${name}: ${value} ${payload.unit}`,
            },
            series: [
                {
                    type: "treemap",
                    roam: false,
                    breadcrumb: { show: false },
                    nodeClick: false,
                    label: { show: true, formatter: "{b}\n{c}", lineHeight: 18 },
                    upperLabel: { show: false },
                    itemStyle: {
                        borderColor: "#fbfcfa",
                        borderWidth: 3,
                        gapWidth: 2,
                    },
                    data: payload.data.map((row) => ({
                        name: row.label,
                        value: row.value,
                    })),
                },
            ],
        };
    }

    if (payload.kind === "waterfall" || payload.kind === "process-waterfall") {
        const changes = payload.data.slice(0, -1);
        const total = payload.data.at(-1);
        let running = 0;
        const bases = changes.map((row, index) => {
            if (index === 0) {
                running = row.value;
                return 0;
            }
            const baseValue = row.value >= 0 ? running : running + row.value;
            running += row.value;
            return baseValue;
        });
        return {
            ...base,
            grid: { left: 58, right: 28, top: 28, bottom: 58 },
            xAxis: {
                type: "category",
                data: payload.data.map((row) => row.label),
                axisLabel: { interval: 0 },
            },
            yAxis: {
                type: "value",
                name: payload.unit,
                splitLine: { lineStyle: { color: gridLine } },
            },
            series: [
                {
                    name: "base",
                    type: "bar",
                    stack: "waterfall",
                    data: [...bases, 0],
                    itemStyle: { color: "transparent", opacity: 0 },
                    emphasis: { disabled: true },
                    silent: true,
                },
                {
                    name: payload.locale === "ru" ? "Изменение" : "Change",
                    type: "bar",
                    stack: "waterfall",
                    data: [
                        ...changes.map((row, index) => ({
                            value: Math.abs(row.value),
                            raw: row.value,
                            itemStyle: {
                                color: index === 0 ? green : row.value >= 0 ? "#2f6fb0" : orange,
                            },
                        })),
                        {
                            value: total?.value ?? running,
                            raw: total?.value ?? running,
                            itemStyle: { color: green },
                        },
                    ],
                    label: {
                        show: true,
                        position: "top",
                        formatter: ({ data }: { data: { raw: number } }) =>
                            `${data.raw > 0 ? "+" : ""}${data.raw}`,
                    },
                },
            ],
        };
    }

    if (payload.kind === "sankey") {
        const links = payload.data.map((row) => {
            const [source, target] = row.label.split("|");
            return { source, target, value: row.value };
        });
        const nodeNames = [...new Set(links.flatMap((link) => [link.source, link.target]))];
        return {
            ...base,
            series: [
                {
                    type: "sankey",
                    left: 18,
                    right: 82,
                    top: 18,
                    bottom: 18,
                    nodeWidth: 18,
                    nodeGap: 14,
                    emphasis: { focus: "adjacency" },
                    lineStyle: { color: "gradient", curveness: 0.5, opacity: 0.5 },
                    label: { color: ink },
                    labelLayout: { hideOverlap: true },
                    data: nodeNames.map((name) => ({ name })),
                    links,
                },
            ],
        };
    }

    if (payload.kind === "chord" || payload.kind === "network") {
        const links = payload.data.map((row) => {
            const [source, target] = row.label.split("|");
            return { source, target, value: row.value };
        });
        const nodeNames = [...new Set(links.flatMap((link) => [link.source, link.target]))];
        const totals = new Map(
            nodeNames.map((name) => [
                name,
                links
                    .filter((link) => link.source === name || link.target === name)
                    .reduce((sum, link) => sum + link.value, 0),
            ]),
        );
        const circular = payload.kind === "chord";
        return {
            ...base,
            series: [
                {
                    type: "graph",
                    layout: circular ? "circular" : "force",
                    roam: true,
                    zoom: circular ? 1 : 1.55,
                    draggable: !circular,
                    circular: circular ? { rotateLabel: true } : undefined,
                    force: circular
                        ? undefined
                        : { repulsion: 380, edgeLength: [80, 140], gravity: 0.12 },
                    emphasis: { focus: "adjacency", lineStyle: { width: 5 } },
                    label: { show: true, position: "right", color: ink },
                    edgeSymbol: circular ? ["none", "arrow"] : ["none", "none"],
                    edgeSymbolSize: 7,
                    lineStyle: { curveness: circular ? 0.28 : 0.08, opacity: 0.58 },
                    data: nodeNames.map((name) => ({
                        name,
                        value: totals.get(name),
                        symbolSize: 22 + Math.sqrt(totals.get(name) ?? 0) * 4,
                    })),
                    links: links.map((link) => ({
                        ...link,
                        lineStyle: { width: 1 + Math.sqrt(link.value) },
                    })),
                },
            ],
        };
    }

    if (payload.kind === "choropleth" || payload.kind === "spatial-heatmap") {
        const maximum = Math.max(...payload.data.map((row) => row.value));
        return {
            ...base,
            grid: { left: 52, right: 72, top: 24, bottom: 44 },
            xAxis: { type: "category", data: ["1", "2", "3"], show: false },
            yAxis: { type: "category", data: ["1", "2", "3"], inverse: true, show: false },
            visualMap: {
                min: 0,
                max: maximum,
                orient: "vertical",
                right: 4,
                top: "middle",
                text: [payload.unit, "0"],
                textGap: 8,
                inRange: { color: ["#edf5f0", "#8bc3a9", green] },
            },
            series: [
                {
                    type: "heatmap",
                    data: payload.data.map((row) => [
                        row.values?.[0] ?? 0,
                        row.values?.[1] ?? 0,
                        row.value,
                        row.label,
                    ]),
                    label: {
                        show: true,
                        formatter: ({ data }: { data: [number, number, number, string] }) =>
                            payload.kind === "choropleth"
                                ? `${data[3]}\n${data[2]}%`
                                : `${data[2]}`,
                    },
                    itemStyle: {
                        borderColor: "#ffffff",
                        borderWidth: payload.kind === "choropleth" ? 5 : 2,
                    },
                },
            ],
        };
    }

    if (
        payload.kind === "proportional-map" ||
        payload.kind === "equalized-cartogram" ||
        payload.kind === "scaled-cartogram" ||
        payload.kind === "dot-density-map"
    ) {
        const maximum = Math.max(...payload.data.map((row) => row.value));
        const isEqual = payload.kind === "equalized-cartogram";
        const isDots = payload.kind === "dot-density-map";
        return {
            ...base,
            grid: { left: 22, right: 22, top: 22, bottom: 30 },
            xAxis: {
                type: "value",
                min: isEqual ? -0.7 : 0,
                max: isEqual ? 2.7 : 100,
                show: false,
            },
            yAxis: {
                type: "value",
                min: isEqual ? -0.7 : 0,
                max: isEqual ? 2.7 : 100,
                show: false,
            },
            series: [
                {
                    type: "scatter",
                    data: payload.data.map((row) => ({
                        name: row.label,
                        value: isEqual
                            ? [row.values?.[0] ?? 0, 2 - (row.values?.[1] ?? 0), row.value]
                            : payload.kind === "scaled-cartogram"
                              ? [row.values?.[0] ?? 0, row.values?.[1] ?? 0, row.value]
                              : [row.value2 ?? 0, row.value3 ?? 0, row.value],
                    })),
                    symbol: isEqual ? "rect" : "circle",
                    symbolSize: (value: [number, number, number]) =>
                        isEqual ? 76 : isDots ? 12 : 24 + Math.sqrt(value[2] / maximum) * 58,
                    label: {
                        show: !isDots,
                        position: "inside",
                        color: "#fff",
                        fontWeight: 700,
                        formatter: ({ name, value }: { name: string; value: number[] }) =>
                            `${name}\n${value[2]}`,
                    },
                    itemStyle: {
                        color: isDots ? green : "#2f6fb0",
                        opacity: isDots ? 0.75 : 0.82,
                        borderColor: "#fff",
                        borderWidth: 2,
                    },
                },
            ],
        };
    }

    if (payload.kind === "flow-map") {
        return {
            ...base,
            grid: { left: 22, right: 22, top: 22, bottom: 28 },
            xAxis: { type: "value", min: 0, max: 100, show: false },
            yAxis: { type: "value", min: 0, max: 100, show: false },
            series: [
                {
                    type: "lines",
                    coordinateSystem: "cartesian2d",
                    polyline: false,
                    effect: {
                        show: !payload.reducedMotion,
                        symbol: "arrow",
                        symbolSize: 8,
                        trailLength: 0.15,
                    },
                    lineStyle: { color: green, opacity: 0.62, curveness: 0.18 },
                    data: payload.data.map((row) => ({
                        name: row.label,
                        value: row.value,
                        coords: [
                            [row.values?.[0] ?? 0, row.values?.[1] ?? 0],
                            [row.values?.[2] ?? 0, row.values?.[3] ?? 0],
                        ],
                        lineStyle: { width: 1 + Math.sqrt(row.value) / 1.8 },
                    })),
                },
                {
                    type: "scatter",
                    data: [
                        [50, 48],
                        ...payload.data.map((row) => [row.values?.[0] ?? 0, row.values?.[1] ?? 0]),
                    ],
                    symbolSize: 14,
                    itemStyle: { color: orange, borderColor: "#fff", borderWidth: 2 },
                },
            ],
        };
    }

    if (payload.kind === "contour-map") {
        return {
            ...base,
            legend: { bottom: 0 },
            grid: { left: 24, right: 24, top: 20, bottom: 42 },
            xAxis: { type: "value", min: 0, max: 100, show: false },
            yAxis: { type: "value", min: 0, max: 100, show: false },
            series: payload.data.map((row) => {
                const coordinates: number[][] = [];
                for (let index = 0; index < (row.values?.length ?? 0); index += 2) {
                    coordinates.push([row.values?.[index] ?? 0, row.values?.[index + 1] ?? 0]);
                }
                return {
                    name: row.label,
                    type: "line",
                    data: coordinates,
                    smooth: 0.45,
                    symbol: "none",
                    lineStyle: { width: 4 },
                };
            }),
        };
    }

    if (payload.kind === "heatmap") {
        const pairs = payload.data.map((row) => row.label.split("|"));
        const x = [...new Set(pairs.map(([day]) => day))];
        const y = [...new Set(pairs.map(([, period]) => period))];
        return {
            ...base,
            grid: { left: 74, right: 28, top: 28, bottom: 68 },
            xAxis: { type: "category", data: x, splitArea: { show: true } },
            yAxis: { type: "category", data: y, splitArea: { show: true } },
            visualMap: {
                min: 0,
                max: Math.max(...payload.data.map((row) => row.value)),
                calculable: true,
                orient: "horizontal",
                left: "center",
                bottom: 4,
                inRange: { color: ["#edf5f0", green] },
            },
            series: [
                {
                    type: "heatmap",
                    data: payload.data.map((row) => {
                        const [day, period] = row.label.split("|");
                        return [x.indexOf(day), y.indexOf(period), row.value];
                    }),
                    label: { show: true },
                },
            ],
        };
    }

    const horizontal = payload.kind === "bar";
    const isLine = payload.kind === "line";

    return {
        ...base,
        grid: {
            left: horizontal ? 104 : 54,
            right: 28,
            top: 26,
            bottom: 48,
            containLabel: false,
        },
        xAxis: horizontal
            ? {
                  type: "value",
                  name: payload.unit,
                  nameLocation: "middle",
                  nameGap: 30,
                  splitLine: { lineStyle: { color: gridLine } },
              }
            : {
                  type: "category",
                  data: payload.data.map((row) => row.label),
                  axisTick: { alignWithLabel: true },
              },
        yAxis: horizontal
            ? {
                  type: "category",
                  inverse: true,
                  data: payload.data.map((row) => row.label),
              }
            : {
                  type: "value",
                  name: payload.unit,
                  splitLine: { lineStyle: { color: gridLine } },
              },
        series: [
            {
                type: isLine ? "line" : "bar",
                data: payload.data.map((row) => row.value),
                symbolSize: isLine ? 9 : undefined,
                smooth: false,
                barMaxWidth: 46,
                itemStyle:
                    payload.kind === "histogram"
                        ? { color: green, borderColor: "#fff" }
                        : undefined,
                areaStyle: isLine ? { color: "rgba(23, 107, 77, .10)" } : undefined,
            },
        ],
    };
}
