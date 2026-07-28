import type { EChartsCoreOption } from "echarts/core";
import { Delaunay } from "d3-delaunay";
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
            fontFamily:
                'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
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

    if (payload.kind === "priestley") {
        const minYear = Math.min(...payload.data.map((row) => row.value)) - 5;
        const maxYear = Math.max(...payload.data.map((row) => row.value2 ?? row.value)) + 5;
        return {
            ...base,
            tooltip: {
                trigger: "item",
                confine: true,
                formatter: ({ dataIndex }: { dataIndex: number }) => {
                    const row = payload.data[dataIndex];
                    return `${row.label}: ${row.value}–${row.value2}`;
                },
            },
            grid: { left: 28, right: 28, top: 24, bottom: 46 },
            xAxis: {
                type: "value",
                min: minYear,
                max: maxYear,
                axisLabel: {
                    formatter: (value: number) => String(Math.round(value)),
                },
                splitLine: { lineStyle: { color: gridLine } },
            },
            yAxis: { type: "value", min: -0.6, max: 7.6, show: false },
            series: [
                {
                    type: "custom",
                    data: payload.data.map((row, index) => [
                        row.value,
                        row.value2 ?? row.value,
                        row.value3 ?? index,
                        index,
                    ]),
                    renderItem: (
                        _params: unknown,
                        api: {
                            value: (dimension: number) => number;
                            coord: (point: [number, number]) => [number, number];
                        },
                    ) => {
                        const start = api.coord([api.value(0), api.value(2)]);
                        const end = api.coord([api.value(1), api.value(2)]);
                        const index = api.value(3);
                        const height = 30;
                        return {
                            type: "group",
                            children: [
                                {
                                    type: "rect",
                                    shape: {
                                        x: start[0],
                                        y: start[1] - height / 2,
                                        width: Math.max(2, end[0] - start[0]),
                                        height,
                                        r: 5,
                                    },
                                    style: { fill: index % 2 === 0 ? green : "#2f6fb0" },
                                },
                                {
                                    type: "text",
                                    style: {
                                        x: start[0] + 8,
                                        y: start[1],
                                        text: payload.data[index].label,
                                        fill: "#fff",
                                        fontSize: 11,
                                        verticalAlign: "middle",
                                        overflow: "truncate",
                                        width: Math.max(0, end[0] - start[0] - 14),
                                    },
                                },
                            ],
                        };
                    },
                },
            ],
        };
    }

    if (payload.kind === "voronoi") {
        const points = payload.data.map((row) => [row.value, row.value2 ?? 0] as [number, number]);
        const voronoi = Delaunay.from(points).voronoi([0, 0, 100, 100]);
        const polygons = points.map((_, index) => voronoi.cellPolygon(index) ?? []);
        return {
            ...base,
            tooltip: {
                trigger: "item",
                confine: true,
                formatter: ({ dataIndex }: { dataIndex: number }) => {
                    const row = payload.data[dataIndex];
                    const visits = payload.locale === "ru" ? "тыс. посещений" : "thousand visits";
                    return `${row.label}: ${row.value3} ${visits}`;
                },
            },
            grid: { left: 18, right: 18, top: 18, bottom: 18 },
            xAxis: { type: "value", min: 0, max: 100, show: false },
            yAxis: { type: "value", min: 0, max: 100, show: false },
            series: [
                {
                    type: "custom",
                    silent: true,
                    data: [0],
                    renderItem: (
                        _params: unknown,
                        api: { coord: (point: [number, number]) => [number, number] },
                    ) => {
                        const polygon = (points: Array<[number, number]>) =>
                            points.map((point) => api.coord(point));
                        const line = (points: Array<[number, number]>, width = 4) => ({
                            type: "polyline",
                            shape: { points: polygon(points) },
                            style: {
                                fill: "none",
                                stroke: "#fff",
                                lineWidth: width,
                                opacity: 0.9,
                            },
                        });
                        const riverLabel = api.coord([88, 23]);
                        const parkLabel = api.coord([17, 70]);
                        return {
                            type: "group",
                            children: [
                                {
                                    type: "polygon",
                                    shape: {
                                        points: polygon([
                                            [0, 0],
                                            [100, 0],
                                            [100, 100],
                                            [0, 100],
                                        ]),
                                    },
                                    style: { fill: "#edf0ec" },
                                },
                                {
                                    type: "polygon",
                                    shape: {
                                        points: polygon([
                                            [0, 18],
                                            [19, 22],
                                            [38, 18],
                                            [56, 25],
                                            [76, 20],
                                            [100, 26],
                                            [100, 35],
                                            [78, 29],
                                            [57, 34],
                                            [37, 27],
                                            [18, 31],
                                            [0, 27],
                                        ]),
                                    },
                                    style: { fill: "#a8d2df" },
                                },
                                {
                                    type: "polygon",
                                    shape: {
                                        points: polygon([
                                            [8, 58],
                                            [28, 58],
                                            [31, 78],
                                            [12, 84],
                                        ]),
                                    },
                                    style: { fill: "#b9d6b5" },
                                },
                                line([
                                    [5, 48],
                                    [95, 74],
                                ]),
                                line([
                                    [16, 96],
                                    [36, 5],
                                ]),
                                line([
                                    [67, 96],
                                    [56, 4],
                                ]),
                                line([
                                    [4, 88],
                                    [92, 43],
                                ]),
                                line(
                                    [
                                        [0, 52],
                                        [30, 45],
                                        [68, 48],
                                        [100, 42],
                                    ],
                                    2,
                                ),
                                {
                                    type: "text",
                                    style: {
                                        x: riverLabel[0],
                                        y: riverLabel[1],
                                        text: payload.locale === "ru" ? "река" : "river",
                                        fill: "#326f82",
                                        fontSize: 12,
                                        fontWeight: 700,
                                    },
                                },
                                {
                                    type: "text",
                                    style: {
                                        x: parkLabel[0],
                                        y: parkLabel[1],
                                        text: payload.locale === "ru" ? "парк" : "park",
                                        fill: "#315f39",
                                        fontSize: 12,
                                        fontWeight: 700,
                                    },
                                },
                            ],
                        };
                    },
                },
                {
                    type: "custom",
                    data: payload.data.map((_, index) => index),
                    renderItem: (
                        params: { dataIndex: number },
                        api: { coord: (point: [number, number]) => [number, number] },
                    ) => ({
                        type: "polygon",
                        shape: {
                            points: polygons[params.dataIndex].map((point) =>
                                api.coord([point[0], point[1]]),
                            ),
                        },
                        style: {
                            fill: [green, orange, "#2f6fb0", "#8f5ca6", "#d4a72c"][
                                params.dataIndex % 5
                            ],
                            stroke: "#fff",
                            lineWidth: 3,
                            opacity: 0.42,
                        },
                        emphasis: {
                            style: {
                                opacity: 0.78,
                                shadowBlur: 10,
                                shadowColor: "rgba(23,32,28,.28)",
                            },
                        },
                    }),
                },
                {
                    type: "scatter",
                    data: payload.data.map((row) => ({
                        name: row.label,
                        value: [row.value, row.value2],
                    })),
                    symbolSize: 8,
                    itemStyle: { color: ink },
                    label: {
                        show: true,
                        position: "top",
                        formatter: "{b}",
                        color: ink,
                        backgroundColor: "rgba(255,255,255,.82)",
                        padding: [3, 5],
                        borderRadius: 3,
                    },
                },
            ],
        };
    }

    if (payload.kind === "venn") {
        const labels = payload.data.slice(0, 3).map((row) => row.label);
        const circles = [
            { cx: 39, cy: 58, labelY: 79 },
            { cx: 61, cy: 58, labelY: 79 },
            { cx: 50, cy: 39, labelY: 14 },
        ];
        const radius = 24;
        const intersectionSets = [
            [0, 1],
            [0, 2],
            [1, 2],
            [0, 1, 2],
        ];
        const intersectionPolygon = (indices: number[]) => {
            const points: Array<[number, number]> = [];
            for (const circleIndex of indices) {
                const circle = circles[circleIndex];
                for (let step = 0; step < 240; step += 1) {
                    const angle = (step / 240) * Math.PI * 2;
                    const point: [number, number] = [
                        circle.cx + Math.cos(angle) * radius,
                        circle.cy + Math.sin(angle) * radius,
                    ];
                    if (
                        indices.every((index) => {
                            const candidate = circles[index];
                            return (
                                Math.hypot(point[0] - candidate.cx, point[1] - candidate.cy) <=
                                radius + 0.1
                            );
                        })
                    ) {
                        points.push(point);
                    }
                }
            }
            const center = points.reduce(
                (sum, point) => [
                    sum[0] + point[0] / points.length,
                    sum[1] + point[1] / points.length,
                ],
                [0, 0],
            );
            return points.sort(
                (a, b) =>
                    Math.atan2(a[1] - center[1], a[0] - center[0]) -
                    Math.atan2(b[1] - center[1], b[0] - center[0]),
            );
        };
        const intersections = intersectionSets.map(intersectionPolygon);
        const regionColors = [
            "rgba(80,155,126,.48)",
            "rgba(93,148,196,.48)",
            "rgba(225,139,91,.48)",
            "rgba(73,111,122,.72)",
            "rgba(154,111,78,.72)",
            "rgba(132,105,145,.72)",
            "rgba(73,78,83,.86)",
        ];
        return {
            ...base,
            tooltip: {
                trigger: "item",
                confine: true,
                formatter: ({ dataIndex }: { dataIndex: number }) => {
                    const row = payload.data[dataIndex];
                    return `${row.label}: <strong>${row.value}</strong> ${payload.unit}`;
                },
            },
            grid: { left: 18, right: 18, top: 18, bottom: 18 },
            xAxis: { type: "value", show: false, min: 0, max: 100 },
            yAxis: { type: "value", show: false, min: 0, max: 100 },
            series: [
                {
                    type: "custom",
                    data: payload.data.map((_, index) => index),
                    renderItem: (
                        params: { dataIndex: number },
                        api: {
                            coord: (point: [number, number]) => [number, number];
                            size: (size: [number, number]) => [number, number];
                        },
                    ) => {
                        const chartCenter = api.coord([50, 50]);
                        const pixelRadius = Math.min(
                            Math.abs(api.size([radius, 0])[0]),
                            Math.abs(api.size([0, radius])[1]),
                        );
                        const scale = pixelRadius / radius;
                        const toPixel = (point: [number, number]): [number, number] => [
                            chartCenter[0] + (point[0] - 50) * scale,
                            chartCenter[1] - (point[1] - 50) * scale,
                        ];
                        const index = params.dataIndex;
                        const shape =
                            index < 3
                                ? {
                                      type: "circle",
                                      shape: {
                                          cx: toPixel([circles[index].cx, circles[index].cy])[0],
                                          cy: toPixel([circles[index].cx, circles[index].cy])[1],
                                          r: pixelRadius,
                                      },
                                  }
                                : {
                                      type: "polygon",
                                      shape: {
                                          points: intersections[index - 3].map(toPixel),
                                      },
                                  };
                        return {
                            ...shape,
                            style: {
                                fill: regionColors[index],
                                stroke: "rgba(255,255,255,.35)",
                                lineWidth: index < 3 ? 0 : 1,
                            },
                            emphasis: {
                                style: {
                                    fill: regionColors[index].replace(/,\.[0-9]+\)/, ",.96)"),
                                    shadowBlur: 12,
                                    shadowColor: "rgba(23,32,28,.24)",
                                },
                            },
                        };
                    },
                },
                {
                    type: "custom",
                    silent: true,
                    data: [0, 1, 2],
                    renderItem: (
                        params: { dataIndex: number },
                        api: {
                            coord: (point: [number, number]) => [number, number];
                            size: (size: [number, number]) => [number, number];
                        },
                    ) => {
                        const chartCenter = api.coord([50, 50]);
                        const pixelRadius = Math.min(
                            Math.abs(api.size([radius, 0])[0]),
                            Math.abs(api.size([0, radius])[1]),
                        );
                        const scale = pixelRadius / radius;
                        const toPixel = (point: [number, number]): [number, number] => [
                            chartCenter[0] + (point[0] - 50) * scale,
                            chartCenter[1] - (point[1] - 50) * scale,
                        ];
                        const circle = circles[params.dataIndex];
                        const center = toPixel([circle.cx, circle.cy]);
                        const label = toPixel([circle.cx, circle.labelY]);
                        const children: unknown[] = [
                            {
                                type: "circle",
                                shape: { cx: center[0], cy: center[1], r: pixelRadius },
                                style: { fill: "transparent", stroke: ink, lineWidth: 2 },
                            },
                            {
                                type: "text",
                                style: {
                                    x: label[0],
                                    y: label[1],
                                    text: labels[params.dataIndex],
                                    textAlign: "center",
                                    verticalAlign: "middle",
                                    fill: ink,
                                    fontSize: 13,
                                    fontWeight: 700,
                                },
                            },
                        ];
                        if (params.dataIndex === 0) {
                            const tripleCenter = toPixel([50, 51]);
                            children.push({
                                type: "text",
                                style: {
                                    x: tripleCenter[0],
                                    y: tripleCenter[1],
                                    text: String(payload.data[6]?.value ?? ""),
                                    textAlign: "center",
                                    verticalAlign: "middle",
                                    fill: "#fff",
                                    fontSize: 15,
                                    fontWeight: 700,
                                },
                            });
                        }
                        return {
                            type: "group",
                            children,
                        };
                    },
                },
            ],
        };
    }

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
        const cohortNames =
            payload.locale === "ru"
                ? { "year-1": "1 курс", "year-2": "2 курс" }
                : { "year-1": "First year", "year-2": "Second year" };
        const cohorts = ["year-1", "year-2"] as const;
        return {
            ...base,
            tooltip: {
                trigger: "item",
                confine: true,
                formatter: ({
                    name,
                    value,
                    seriesName,
                    marker,
                }: {
                    name: string;
                    value: [number, number];
                    seriesName: string;
                    marker: string;
                }) => {
                    const labels =
                        payload.locale === "ru"
                            ? ["Часы подготовки", "Результат"]
                            : ["Study hours", "Score"];
                    return `${marker}${seriesName} · ${name}<br>${labels[0]}: ${value[0]}<br>${labels[1]}: ${value[1]}`;
                },
            },
            legend: { top: 0, data: cohorts.map((cohort) => cohortNames[cohort]) },
            grid: { left: 54, right: 28, top: 58, bottom: 50 },
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
            series: cohorts.map((cohort) => ({
                name: cohortNames[cohort],
                type: "scatter",
                symbolSize: 13,
                data: payload.data
                    .filter((row) => row.key === cohort)
                    .map(({ label, value, value2 }) => ({
                        name: label,
                        value: [value, value2],
                    })),
            })),
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
            tooltip: {
                trigger: "item",
                confine: true,
                formatter: ({
                    name,
                    value,
                    marker,
                }: {
                    name: string;
                    value: [number, number, number];
                    marker: string;
                }) => {
                    const labels =
                        payload.locale === "ru"
                            ? ["Практика", "Экзамен", "Студентов"]
                            : ["Practice", "Exam", "Students"];
                    return `${marker}${name}<br>${labels[0]}: ${value[0]}<br>${labels[1]}: ${value[1]}<br>${labels[2]}: ${value[2]}`;
                },
            },
            legend: {
                top: 0,
                data: payload.data.map((row) => row.label),
            },
            grid: { left: 58, right: 32, top: 72, bottom: 54 },
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
            series: payload.data.map((row) => ({
                name: row.label,
                type: "scatter",
                data: [
                    {
                        name: row.label,
                        value: [row.value, row.value2 ?? 0, row.value3 ?? 0],
                    },
                ],
                symbolSize: (value: [number, number, number]) =>
                    18 + Math.sqrt(value[2] / maximum) * 46,
                label: { show: true, position: "top", formatter: "{b}" },
            })),
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
                    tooltip: { valueFormatter: (value: number) => `${Math.abs(value)}%` },
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
                    tooltip: { valueFormatter: (value: number) => `${value}%` },
                },
            ],
        };
    }

    if (payload.kind === "spine") {
        const names = payload.locale === "ru" ? ["Онлайн", "Очно"] : ["Online", "In person"];
        const total = payload.data.reduce((sum, row) => sum + row.value, 0);
        let cumulative = 0;
        const groups = payload.data.map((row, index) => {
            const start = (cumulative / total) * 100;
            cumulative += row.value;
            const end = (cumulative / total) * 100;
            const online = row.value2 ?? 0;
            const inPerson = row.value3 ?? row.value - online;
            const onlineShare = (online / row.value) * 100;
            return {
                index,
                start,
                end,
                online,
                inPerson,
                onlineShare,
                inPersonShare: 100 - onlineShare,
            };
        });
        const groupTooltip = (index: number) => {
            const row = payload.data[index];
            const group = groups[index];
            return `${row.label}<br>${payload.locale === "ru" ? "Всего" : "Total"}: ${row.value} ${payload.unit}<br>${names[0]}: ${group.online} (${Math.round(group.onlineShare)}%)<br>${names[1]}: ${group.inPerson} (${Math.round(group.inPersonShare)}%)`;
        };
        const segmentSeries = (name: string, color: string, data: number[][]) => ({
            name,
            type: "custom",
            data,
            itemStyle: { color },
            tooltip: {
                formatter: ({ dataIndex }: { dataIndex: number }) => groupTooltip(dataIndex),
            },
            renderItem: (
                _params: unknown,
                api: {
                    value: (dimension: number) => number;
                    coord: (point: [number, number]) => [number, number];
                },
            ) => {
                const topLeft = api.coord([api.value(0), api.value(3)]);
                const bottomRight = api.coord([api.value(1), api.value(2)]);
                const width = bottomRight[0] - topLeft[0];
                const height = bottomRight[1] - topLeft[1];
                return {
                    type: "group",
                    children: [
                        {
                            type: "rect",
                            shape: {
                                x: topLeft[0],
                                y: topLeft[1],
                                width,
                                height,
                            },
                            style: {
                                fill: color,
                                stroke: "#fff",
                                lineWidth: 2,
                            },
                        },
                        {
                            type: "text",
                            style: {
                                x: topLeft[0] + width / 2,
                                y: topLeft[1] + height / 2,
                                text:
                                    width > 54 && height > 24 ? `${Math.round(api.value(6))}%` : "",
                                fill: "#fff",
                                fontWeight: 700,
                                align: "center",
                                verticalAlign: "middle",
                            },
                        },
                    ],
                };
            },
        });
        return {
            ...base,
            tooltip: { trigger: "item", confine: true },
            legend: { top: 0, data: names },
            grid: { left: 58, right: 28, top: 72, bottom: 64 },
            xAxis: {
                type: "value",
                min: 0,
                max: 100,
                name:
                    payload.locale === "ru" ? "Доля всех участников" : "Share of all participants",
                nameLocation: "middle",
                nameGap: 34,
                axisLabel: { formatter: (value: number) => `${value}%` },
                splitLine: { lineStyle: { color: gridLine } },
            },
            yAxis: {
                type: "value",
                min: 0,
                max: 100,
                name: payload.locale === "ru" ? "Состав курса" : "Cohort composition",
                axisLabel: { formatter: (value: number) => `${value}%` },
                splitLine: { lineStyle: { color: gridLine } },
            },
            series: [
                segmentSeries(
                    names[0],
                    "#2f6fb0",
                    groups.map((group) => [
                        group.start,
                        group.end,
                        0,
                        group.onlineShare,
                        group.index,
                        group.online,
                        group.onlineShare,
                    ]),
                ),
                segmentSeries(
                    names[1],
                    green,
                    groups.map((group) => [
                        group.start,
                        group.end,
                        group.onlineShare,
                        100,
                        group.index,
                        group.inPerson,
                        group.inPersonShare,
                    ]),
                ),
                {
                    type: "custom",
                    silent: true,
                    clip: false,
                    data: groups.map((group) => [(group.start + group.end) / 2, 100, group.index]),
                    renderItem: (
                        _params: unknown,
                        api: {
                            value: (dimension: number) => number;
                            coord: (point: [number, number]) => [number, number];
                        },
                    ) => {
                        const position = api.coord([api.value(0), api.value(1)]);
                        const row = payload.data[api.value(2)];
                        return {
                            type: "text",
                            style: {
                                x: position[0],
                                y: position[1] - 12,
                                text: `${row.label}\n${row.value}`,
                                fill: ink,
                                fontSize: 11,
                                fontWeight: 700,
                                align: "center",
                                verticalAlign: "bottom",
                            },
                        };
                    },
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
            tooltip: {
                trigger: "item",
                confine: true,
                formatter: ({ value }: { value: [string, number, number] }) =>
                    `${value[0]}: ${value[2]} ${payload.unit}`,
            },
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
            tooltip: {
                trigger: "axis",
                confine: true,
                formatter: (
                    params: Array<{
                        axisValue: string;
                        marker: string;
                        seriesType: string;
                        value: [string, number];
                    }>,
                ) => {
                    const point = params.find((item) => item.seriesType === "scatter");
                    return point
                        ? `${point.axisValue}<br>${point.marker}${point.value[1]} ${payload.unit}`
                        : "";
                },
            },
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
        const colors = ["#2f6fb0", green, orange, "#8f5ca6"];
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
        const summaries = payload.data.map((row) => {
            const values = row.values ?? [row.value];
            return {
                minimum: Math.min(...values),
                q1: quantile(values, 0.25),
                median: quantile(values, 0.5),
                q3: quantile(values, 0.75),
                maximum: Math.max(...values),
            };
        });
        const labels =
            payload.locale === "ru"
                ? {
                      standard: "Обычная скрипичная диаграмма",
                      standardNote: "Обе половины зеркально показывают одно распределение",
                      split: "Разделённая скрипичная диаграмма",
                      splitNote: `Слева — ${payload.data[0].label}; справа — ${payload.data[1].label}`,
                      median: "Медиана",
                      interval: "Межквартильный диапазон",
                      observation: "Наблюдение",
                  }
                : {
                      standard: "Standard violin plot",
                      standardNote: "Both halves mirror the same distribution",
                      split: "Split violin plot",
                      splitNote: `Left — ${payload.data[0].label}; right — ${payload.data[1].label}`,
                      median: "Median",
                      interval: "Interquartile range",
                      observation: "Observation",
                  };
        const summaryTooltip = (index: number) => {
            const summary = summaries[index];
            return `${payload.data[index].label}<br>${labels.median}: ${summary.median} ${payload.unit}<br>${labels.interval}: ${summary.q1}–${summary.q3} ${payload.unit}`;
        };
        return {
            ...base,
            title: [
                {
                    text: labels.standard,
                    subtext: labels.standardNote,
                    left: 54,
                    top: 2,
                    textStyle: { fontSize: 15, color: ink },
                    subtextStyle: { fontSize: 11, color: muted },
                },
                {
                    text: labels.split,
                    subtext: labels.splitNote,
                    left: 54,
                    top: 360,
                    textStyle: { fontSize: 15, color: ink },
                    subtextStyle: { fontSize: 11, color: muted },
                },
            ],
            tooltip: { trigger: "item", confine: true },
            legend: {
                top: 52,
                data: payload.data.map((row) => row.label),
            },
            grid: [
                { left: 58, right: 28, top: 92, height: 230 },
                { left: 58, right: 28, top: 440, height: 230 },
            ],
            xAxis: [
                {
                    type: "value",
                    min: -0.5,
                    max: payload.data.length - 0.5,
                    interval: 1,
                    axisLabel: {
                        formatter: (value: number) =>
                            Number.isInteger(value) ? (payload.data[value]?.label ?? "") : "",
                    },
                    splitLine: { show: false },
                },
                {
                    type: "value",
                    gridIndex: 1,
                    min: -0.7,
                    max: 0.7,
                    axisLabel: { show: false },
                    axisTick: { show: false },
                    splitLine: { show: false },
                },
            ],
            yAxis: [
                {
                    type: "value",
                    name: payload.unit,
                    min: Math.floor(Math.min(...allValues) / step) * step - step,
                    max: Math.ceil(Math.max(...allValues) / step) * step + step,
                    splitLine: { lineStyle: { color: gridLine } },
                },
                {
                    type: "value",
                    gridIndex: 1,
                    name: payload.unit,
                    min: Math.floor(Math.min(...allValues) / step) * step - step,
                    max: Math.ceil(Math.max(...allValues) / step) * step + step,
                    splitLine: { lineStyle: { color: gridLine } },
                },
            ],
            series: [
                {
                    id: "standard-violins",
                    type: "custom",
                    data: payload.data.map((row, index) => [index, row.value]),
                    tooltip: {
                        formatter: ({ dataIndex }: { dataIndex: number }) =>
                            summaryTooltip(dataIndex),
                    },
                    renderItem: (
                        params: { dataIndex: number },
                        api: {
                            coord: (point: [number, number]) => [number, number];
                            size: (size: [number, number]) => [number, number];
                        },
                    ) => {
                        const shape = shapes[params.dataIndex];
                        const categoryWidth = api.size([1, 0])[0] * 0.28;
                        const summary = summaries[params.dataIndex];
                        const right = shape.map(({ point, width }) => {
                            const [x, y] = api.coord([params.dataIndex, point]);
                            return [x + categoryWidth * width, y];
                        });
                        const left = [...shape].reverse().map(({ point, width }) => {
                            const [x, y] = api.coord([params.dataIndex, point]);
                            return [x - categoryWidth * width, y];
                        });
                        const q1 = api.coord([params.dataIndex, summary.q1]);
                        const q3 = api.coord([params.dataIndex, summary.q3]);
                        const median = api.coord([params.dataIndex, summary.median]);
                        return {
                            type: "group",
                            children: [
                                {
                                    type: "polygon",
                                    shape: { points: [...right, ...left] },
                                    style: {
                                        fill: `${colors[params.dataIndex]}38`,
                                        stroke: colors[params.dataIndex],
                                        lineWidth: 2,
                                    },
                                },
                                {
                                    type: "rect",
                                    shape: {
                                        x: q1[0] - 5,
                                        y: q3[1],
                                        width: 10,
                                        height: q1[1] - q3[1],
                                    },
                                    style: { fill: "#fff", stroke: ink, lineWidth: 1 },
                                },
                                {
                                    type: "line",
                                    shape: {
                                        x1: median[0] - 8,
                                        y1: median[1],
                                        x2: median[0] + 8,
                                        y2: median[1],
                                    },
                                    style: { stroke: ink, lineWidth: 3 },
                                },
                            ],
                        };
                    },
                },
                ...payload.data.map((row, rowIndex) => ({
                    name: row.label,
                    type: "scatter",
                    symbolSize: 6,
                    data: (row.values ?? [row.value]).map((value, valueIndex) => ({
                        name: `${labels.observation} ${valueIndex + 1}`,
                        value: [rowIndex + (((valueIndex * 7) % 9) - 4) * 0.018, value],
                    })),
                    itemStyle: {
                        color: colors[rowIndex],
                        opacity: 0.72,
                        borderColor: "#fff",
                        borderWidth: 0.8,
                    },
                    tooltip: {
                        formatter: ({ name, value }: { name: string; value: [number, number] }) =>
                            `${row.label} · ${name}: ${value[1]} ${payload.unit}`,
                    },
                })),
                {
                    id: "split-violin",
                    type: "custom",
                    xAxisIndex: 1,
                    yAxisIndex: 1,
                    data: [[0, 0]],
                    tooltip: {
                        formatter: () => `${summaryTooltip(0)}<br><br>${summaryTooltip(1)}`,
                    },
                    renderItem: (
                        _params: unknown,
                        api: {
                            coord: (point: [number, number]) => [number, number];
                            size: (size: [number, number]) => [number, number];
                        },
                    ) => {
                        const halfWidth = api.size([1, 0])[0] * 0.3;
                        const center = (shape: Array<{ point: number }>) =>
                            shape.map(({ point }) => api.coord([0, point]));
                        const leftOuter = shapes[0].map(({ point, width }) => {
                            const [x, y] = api.coord([0, point]);
                            return [x - halfWidth * width, y];
                        });
                        const rightOuter = shapes[1].map(({ point, width }) => {
                            const [x, y] = api.coord([0, point]);
                            return [x + halfWidth * width, y];
                        });
                        const medianLeft = api.coord([0, summaries[0].median]);
                        const medianRight = api.coord([0, summaries[1].median]);
                        return {
                            type: "group",
                            children: [
                                {
                                    type: "polygon",
                                    shape: {
                                        points: [...center(shapes[0]), ...[...leftOuter].reverse()],
                                    },
                                    style: {
                                        fill: `${colors[0]}55`,
                                        stroke: colors[0],
                                        lineWidth: 2,
                                    },
                                },
                                {
                                    type: "polygon",
                                    shape: {
                                        points: [
                                            ...center(shapes[1]),
                                            ...[...rightOuter].reverse(),
                                        ],
                                    },
                                    style: {
                                        fill: `${colors[1]}55`,
                                        stroke: colors[1],
                                        lineWidth: 2,
                                    },
                                },
                                {
                                    type: "line",
                                    shape: {
                                        x1: medianLeft[0] - 28,
                                        y1: medianLeft[1],
                                        x2: medianLeft[0],
                                        y2: medianLeft[1],
                                    },
                                    style: { stroke: ink, lineWidth: 3 },
                                },
                                {
                                    type: "line",
                                    shape: {
                                        x1: medianRight[0],
                                        y1: medianRight[1],
                                        x2: medianRight[0] + 28,
                                        y2: medianRight[1],
                                    },
                                    style: { stroke: ink, lineWidth: 3 },
                                },
                            ],
                        };
                    },
                },
                ...payload.data.slice(0, 2).map((row, rowIndex) => ({
                    name: row.label,
                    type: "scatter",
                    xAxisIndex: 1,
                    yAxisIndex: 1,
                    symbolSize: 6,
                    data: (row.values ?? [row.value]).map((value, valueIndex) => ({
                        name: `${labels.observation} ${valueIndex + 1}`,
                        value: [
                            (rowIndex === 0 ? -0.16 : 0.16) + (((valueIndex * 7) % 7) - 3) * 0.012,
                            value,
                        ],
                    })),
                    itemStyle: {
                        color: colors[rowIndex],
                        opacity: 0.78,
                        borderColor: "#fff",
                        borderWidth: 0.8,
                    },
                    tooltip: {
                        formatter: ({ name, value }: { name: string; value: [number, number] }) =>
                            `${row.label} · ${name}: ${value[1]} ${payload.unit}`,
                    },
                })),
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

    if (payload.kind === "grouped-column") {
        return {
            ...base,
            legend: { top: 0 },
            grid: { left: 58, right: 28, top: 52, bottom: 48 },
            xAxis: {
                type: "category",
                data: payload.data.map((row) => row.label),
                axisTick: { alignWithLabel: true },
            },
            yAxis: {
                type: "value",
                name: payload.unit,
                min: 0,
                max: 100,
                axisLabel: { formatter: "{value}%" },
                splitLine: { lineStyle: { color: gridLine } },
            },
            series: [
                {
                    name: "2024",
                    type: "bar",
                    data: payload.data.map((row) => row.value),
                    barMaxWidth: 34,
                },
                {
                    name: "2025",
                    type: "bar",
                    data: payload.data.map((row) => row.value2 ?? 0),
                    barMaxWidth: 34,
                },
            ],
        };
    }

    if (payload.kind === "pictogram") {
        const maximum = Math.max(...payload.data.map((row) => row.value));
        return {
            ...base,
            grid: { left: 114, right: 34, top: 28, bottom: 42 },
            xAxis: {
                type: "value",
                max: maximum,
                interval: 1,
                splitLine: { lineStyle: { color: gridLine } },
            },
            yAxis: {
                type: "category",
                inverse: true,
                data: payload.data.map((row) => row.label),
            },
            series: [
                {
                    type: "pictorialBar",
                    symbol: "circle",
                    symbolRepeat: true,
                    symbolSize: 15,
                    symbolMargin: 4,
                    symbolClip: true,
                    data: payload.data.map((row) => row.value),
                    itemStyle: { color: green },
                },
            ],
        };
    }

    if (payload.kind === "parallel") {
        const axisNames =
            payload.locale === "ru"
                ? ["Транспорт", "Зелень", "Услуги", "Жильё", "Культура"]
                : ["Transport", "Green space", "Services", "Housing", "Culture"];
        return {
            ...base,
            parallel: {
                left: 64,
                right: 52,
                top: 42,
                bottom: 42,
                parallelAxisDefault: {
                    type: "value",
                    min: 0,
                    max: 100,
                    nameLocation: "end",
                    nameGap: 14,
                },
            },
            parallelAxis: axisNames.map((name, dim) => ({ dim, name })),
            series: payload.data.map((row, index) => ({
                name: row.label,
                type: "parallel",
                data: [row.values ?? []],
                lineStyle: {
                    width: 3,
                    opacity: 0.72,
                    color: [green, orange, "#2f6fb0", "#8f5ca6"][index],
                },
                emphasis: { lineStyle: { width: 6, opacity: 1 } },
            })),
        };
    }

    if (payload.kind === "lollipop") {
        return {
            ...base,
            tooltip: {
                trigger: "axis",
                confine: true,
                formatter: (
                    params: Array<{
                        axisValue: string;
                        marker: string;
                        seriesType: string;
                        value: [number, string];
                    }>,
                ) => {
                    const point = params.find((item) => item.seriesType === "scatter");
                    return point
                        ? `${point.axisValue}<br>${point.marker}${point.value[0]} ${payload.unit}`
                        : "";
                },
            },
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

    if (payload.kind === "candlestick") {
        return {
            ...base,
            grid: { left: 58, right: 28, top: 28, bottom: 48 },
            xAxis: {
                type: "category",
                data: payload.data.map((row) => row.label),
                boundaryGap: true,
            },
            yAxis: {
                type: "value",
                scale: true,
                name: payload.unit,
                splitLine: { lineStyle: { color: gridLine } },
            },
            series: [
                {
                    type: "candlestick",
                    data: payload.data.map((row) => row.values ?? []),
                    itemStyle: {
                        color: green,
                        color0: orange,
                        borderColor: green,
                        borderColor0: orange,
                    },
                },
            ],
        };
    }

    if (payload.kind === "fan") {
        return {
            ...base,
            legend: {
                top: 0,
                data: [
                    payload.locale === "ru" ? "Диапазон" : "Range",
                    payload.locale === "ru" ? "Прогноз" : "Forecast",
                ],
            },
            grid: { left: 58, right: 28, top: 52, bottom: 46 },
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
                    type: "line",
                    stack: "confidence",
                    symbol: "none",
                    lineStyle: { opacity: 0 },
                    areaStyle: { opacity: 0 },
                    data: payload.data.map((row) => row.value2 ?? 0),
                    silent: true,
                },
                {
                    name: payload.locale === "ru" ? "Диапазон" : "Range",
                    type: "line",
                    stack: "confidence",
                    symbol: "none",
                    lineStyle: { opacity: 0 },
                    areaStyle: { color: "rgba(47, 111, 176, .28)" },
                    data: payload.data.map((row) => (row.value3 ?? 0) - (row.value2 ?? 0)),
                },
                {
                    name: payload.locale === "ru" ? "Прогноз" : "Forecast",
                    type: "line",
                    data: payload.data.map((row) => row.value),
                    symbolSize: 8,
                    lineStyle: { width: 3, color: green },
                    itemStyle: { color: green },
                },
            ],
        };
    }

    if (payload.kind === "timeline-connected") {
        return {
            ...base,
            grid: { left: 58, right: 32, top: 28, bottom: 54 },
            xAxis: {
                type: "value",
                name: payload.locale === "ru" ? "Мобильность" : "Mobility",
                nameLocation: "middle",
                nameGap: 32,
                scale: true,
                splitLine: { lineStyle: { color: gridLine } },
            },
            yAxis: {
                type: "value",
                name: payload.locale === "ru" ? "Выбросы" : "Emissions",
                scale: true,
                splitLine: { lineStyle: { color: gridLine } },
            },
            series: [
                {
                    type: "line",
                    data: payload.data.map((row) => ({
                        name: row.label,
                        value: [row.value, row.value2 ?? 0],
                    })),
                    symbolSize: 10,
                    lineStyle: { width: 3 },
                    label: { show: true, position: "top", formatter: "{b}" },
                },
            ],
        };
    }

    if (payload.kind === "circle-timeline") {
        const maximum = Math.max(...payload.data.map((row) => row.value));
        return {
            ...base,
            tooltip: {
                trigger: "item",
                confine: true,
                formatter: ({ value }: { value: [string, number, number] }) =>
                    `${value[0]}: ${value[2]} ${payload.unit}`,
            },
            grid: { left: 36, right: 36, top: 44, bottom: 54 },
            xAxis: {
                type: "category",
                data: payload.data.map((row) => row.label),
                axisLine: { lineStyle: { color: ink, width: 2 } },
            },
            yAxis: { type: "value", min: -1, max: 1, show: false },
            series: [
                {
                    type: "scatter",
                    data: payload.data.map((row) => [row.label, 0, row.value]),
                    symbolSize: (value: [string, number, number]) =>
                        18 + Math.sqrt(value[2] / maximum) * 58,
                    label: {
                        show: true,
                        position: "top",
                        formatter: ({ value }: { value: [string, number, number] }) =>
                            `${value[2]}`,
                    },
                    itemStyle: { color: green, opacity: 0.8 },
                },
            ],
        };
    }

    if (payload.kind === "seismogram") {
        const maximum = Math.max(...payload.data.map((row) => Math.abs(row.value)));
        return {
            ...base,
            grid: { left: 58, right: 28, top: 28, bottom: 48 },
            xAxis: {
                type: "category",
                boundaryGap: false,
                data: payload.data.map((row) => row.label),
                name: payload.locale === "ru" ? "секунды" : "seconds",
                nameLocation: "middle",
                nameGap: 30,
            },
            yAxis: {
                type: "value",
                min: -maximum,
                max: maximum,
                name: payload.unit,
                splitLine: { lineStyle: { color: gridLine } },
            },
            series: [
                {
                    type: "line",
                    data: payload.data.map((row) => row.value),
                    symbol: "none",
                    lineStyle: { width: 2, color: ink },
                    areaStyle: { color: "rgba(23, 107, 77, .12)" },
                },
            ],
        };
    }

    if (payload.kind === "sunburst") {
        const branches = new Map<string, Array<{ name: string; value: number }>>();
        payload.data.forEach((row) => {
            const [parent, child] = row.label.split("|");
            const children = branches.get(parent) ?? [];
            children.push({ name: child, value: row.value });
            branches.set(parent, children);
        });
        return {
            ...base,
            series: [
                {
                    type: "sunburst",
                    radius: ["12%", "88%"],
                    nodeClick: false,
                    sort: undefined,
                    emphasis: { focus: "ancestor" },
                    label: { rotate: "radial", minAngle: 8 },
                    data: [...branches].map(([name, children]) => ({ name, children })),
                    levels: [
                        {},
                        { r0: "12%", r: "48%", label: { rotate: 0 } },
                        { r0: "48%", r: "88%" },
                    ],
                },
            ],
        };
    }

    if (payload.kind === "semi-donut") {
        return {
            ...base,
            legend: { bottom: 0 },
            series: [
                {
                    type: "pie",
                    radius: ["48%", "78%"],
                    center: ["50%", "72%"],
                    startAngle: 180,
                    endAngle: 360,
                    label: { formatter: "{b}\n{d}%" },
                    data: payload.data.map((row) => ({
                        name: row.label,
                        value: row.value,
                    })),
                },
            ],
        };
    }

    if (payload.kind === "symbol-grid") {
        const colors = [green, "#d4a72c", orange];
        const points: Array<{
            value: [number, number];
            name: string;
            itemStyle: { color: string };
        }> = [];
        let offset = 0;
        payload.data.forEach((row, categoryIndex) => {
            for (let index = 0; index < row.value; index += 1) {
                const position = offset + index;
                points.push({
                    value: [position % 10, 9 - Math.floor(position / 10)],
                    name: row.label,
                    itemStyle: { color: colors[categoryIndex] },
                });
            }
            offset += row.value;
        });
        return {
            ...base,
            legend: {
                bottom: 0,
                data: payload.data.map((row, index) => ({
                    name: row.label,
                    itemStyle: { color: colors[index] },
                })),
            },
            grid: { left: "center", width: 280, top: 24, bottom: 68 },
            xAxis: { type: "value", min: -0.5, max: 9.5, show: false },
            yAxis: { type: "value", min: -0.5, max: 9.5, show: false },
            series: [
                ...payload.data.map((row, index) => ({
                    name: row.label,
                    type: "scatter" as const,
                    data: [] as number[][],
                    itemStyle: { color: colors[index] },
                })),
                {
                    type: "scatter",
                    data: points,
                    symbol: "roundRect",
                    symbolSize: 22,
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
            tooltip: {
                trigger: "axis",
                confine: true,
                formatter: (
                    params: Array<{
                        axisValue: string;
                        marker: string;
                        seriesName: string;
                        seriesType: string;
                        value: [number, string];
                    }>,
                ) => {
                    const points = params.filter((item) => item.seriesType === "scatter");
                    if (points.length === 0) return "";
                    return [
                        points[0].axisValue,
                        ...points.map(
                            (point) =>
                                `${point.marker}${point.seriesName}: ${point.value[0]} ${payload.unit}`,
                        ),
                    ].join("<br>");
                },
            },
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
            tooltip: {
                trigger: "item",
                confine: true,
                formatter: ({ name, value }: { name: string; value: [number, number] }) =>
                    `${name}: ${value[0]} ${payload.unit}`,
            },
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
                    data: payload.data.map((row, index) => ({
                        name: row.label,
                        value: [row.value, ((index * 17) % 11) / 20 - 0.25],
                    })),
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
        const frequencies = new Map<number, number>();
        payload.data.forEach((row) =>
            frequencies.set(row.value, (frequencies.get(row.value) ?? 0) + 1),
        );
        const countLabel = payload.locale === "ru" ? "Наблюдений" : "Observations";
        return {
            ...base,
            tooltip: {
                trigger: "item",
                confine: true,
                formatter: ({ value }: { value: [number, number, number] }) =>
                    `${value[0]} ${payload.unit}<br>${countLabel}: ${value[2]}`,
            },
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
                    symbolSize: (value: [number, number, number]) => [
                        2 + Math.min(value[2], 5) * 2,
                        110,
                    ],
                    data: [...frequencies.entries()].map(([value, count]) => [value, 0, count]),
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
