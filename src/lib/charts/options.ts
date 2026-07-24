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
                payload.kind === "pie" || payload.kind === "scatter" || payload.kind === "radar"
                    ? "item"
                    : "axis",
            confine: true,
        },
    };

    if (payload.kind === "pie") {
        return {
            ...base,
            legend: { bottom: 0, textStyle: { color: muted } },
            series: [
                {
                    type: "pie",
                    radius: ["42%", "70%"],
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
