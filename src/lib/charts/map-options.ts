import { contours } from "d3-contour";
import { forceCollide, forceSimulation, forceX, forceY } from "d3-force";
import {
    CustomChart,
    EffectScatterChart,
    LinesChart,
    MapChart,
    ScatterChart,
} from "echarts/charts";
import {
    GeoComponent,
    GridComponent,
    TooltipComponent,
    VisualMapComponent,
} from "echarts/components";
import { registerMap, use, type EChartsCoreOption } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import europe from "../../data/geo/europe-110m.geo.json";
import type { ChartPayload } from "./options";

const mapName = "teaching-europe";
const ink = "#17201c";
const muted = "#68716c";
const orange = "#db6b35";
const blue = "#2f6fb0";

export function registerMapCharts() {
    use([
        CanvasRenderer,
        CustomChart,
        EffectScatterChart,
        GeoComponent,
        GridComponent,
        LinesChart,
        MapChart,
        ScatterChart,
        TooltipComponent,
        VisualMapComponent,
    ]);
    registerMap(mapName, europe as Parameters<typeof registerMap>[1]);
}

function formatValue(value: number, locale: string) {
    return new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(value);
}

function geoBase(payload: ChartPayload) {
    return {
        animation: !payload.reducedMotion,
        aria: {
            enabled: true,
            description:
                payload.locale === "ru"
                    ? `${payload.title}. Синтетические данные, ${payload.unit}.`
                    : `${payload.title}. Synthetic data, ${payload.unit}.`,
        },
        textStyle: {
            color: ink,
            fontFamily:
                'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
        },
        tooltip: { trigger: "item", confine: true },
        geo: {
            map: mapName,
            roam: true,
            top: 16,
            bottom: 16,
            left: 16,
            right: 16,
            scaleLimit: { min: 1, max: 6 },
            itemStyle: { areaColor: "#eef2ef", borderColor: "#ffffff", borderWidth: 1 },
            emphasis: {
                itemStyle: { areaColor: "#dfe8e3", borderColor: ink },
                label: { show: false },
            },
            select: { disabled: true },
        },
    };
}

function mapTooltip(payload: ChartPayload) {
    return {
        trigger: "item",
        confine: true,
        formatter: ({ name, value }: { name: string; value?: number | number[] }) => {
            const metric = Array.isArray(value) ? value.at(-1) : value;
            return typeof metric === "number" && Number.isFinite(metric)
                ? `${name}<br>${formatValue(metric, payload.locale)} ${payload.unit}`
                : name;
        },
    };
}

function contourOption(payload: ChartPayload): EChartsCoreOption {
    const width = 38;
    const height = 28;
    const samples = payload.data.map((row) => ({
        lon: row.value2 ?? 0,
        lat: row.value3 ?? 0,
        value: row.value,
    }));
    const values: number[] = [];
    for (let y = 0; y < height; y += 1) {
        const lat = 71 - (y / (height - 1)) * 35;
        for (let x = 0; x < width; x += 1) {
            const lon = -11 + (x / (width - 1)) * 52;
            let weighted = 0;
            let totalWeight = 0;
            for (const sample of samples) {
                const distanceSquared =
                    (lon - sample.lon) ** 2 + ((lat - sample.lat) * 1.45) ** 2 + 0.4;
                const weight = 1 / distanceSquared;
                weighted += sample.value * weight;
                totalWeight += weight;
            }
            values.push(weighted / totalWeight);
        }
    }
    const thresholds = [12, 16, 20, 24, 28];
    const polygons = contours().size([width, height]).thresholds(thresholds)(values);
    const colors = ["#d9ecf2", "#a8d5dc", "#73b6b2", "#eea56f", "#d85f45"];
    const polygonRows = polygons.flatMap((contour, level) =>
        contour.coordinates.map((polygon) => ({ polygon, level, value: contour.value })),
    );

    return {
        ...geoBase(payload),
        tooltip: {
            trigger: "item",
            formatter: ({ data }: { data: { value: number } }) =>
                `${formatValue(data.value, payload.locale)} ${payload.unit}`,
        },
        series: [
            {
                type: "custom",
                coordinateSystem: "geo",
                data: polygonRows,
                renderItem: (
                    params: { dataIndex: number },
                    api: { coord: (point: [number, number]) => [number, number] },
                ) => {
                    const row = polygonRows[params.dataIndex];
                    const rings = row.polygon.map((ring) =>
                        ring.map(([x, y]) =>
                            api.coord([-11 + (x / (width - 1)) * 52, 71 - (y / (height - 1)) * 35]),
                        ),
                    );
                    return {
                        type: "polygon",
                        shape: { points: rings[0] },
                        style: {
                            fill: colors[row.level],
                            stroke: "#ffffff",
                            lineWidth: 0.7,
                            opacity: 0.72,
                        },
                    };
                },
            },
            {
                type: "map",
                map: mapName,
                geoIndex: 0,
                silent: true,
                itemStyle: {
                    areaColor: "transparent",
                    borderColor: "rgba(23, 32, 28, 0.48)",
                    borderWidth: 0.8,
                },
            },
            {
                type: "scatter",
                coordinateSystem: "geo",
                symbolSize: 6,
                itemStyle: { color: ink },
                data: samples.map((sample, index) => ({
                    name: payload.data[index].label,
                    value: [sample.lon, sample.lat, sample.value],
                })),
            },
        ],
    };
}

function tileCartogramOption(payload: ChartPayload): EChartsCoreOption {
    return {
        animation: !payload.reducedMotion,
        aria: { enabled: true },
        tooltip: mapTooltip(payload),
        grid: { left: 20, right: 20, top: 20, bottom: 20 },
        xAxis: { min: -0.7, max: 7.7, show: false },
        yAxis: { min: -0.7, max: 6.7, inverse: true, show: false },
        visualMap: {
            min: Math.min(...payload.data.map((row) => row.value)),
            max: Math.max(...payload.data.map((row) => row.value)),
            left: "center",
            bottom: 0,
            orient: "horizontal",
            calculable: false,
            inRange: { color: ["#e4f0e9", "#176b4d"] },
            textStyle: { color: muted },
        },
        series: [
            {
                type: "scatter",
                symbol: "roundRect",
                symbolSize: 44,
                data: payload.data.map((row) => ({
                    name: row.label,
                    value: [row.value2, row.value3, row.value],
                    label: {
                        show: true,
                        formatter: row.key,
                        color: row.value > 55 ? "#fff" : ink,
                        fontWeight: 700,
                    },
                })),
            },
        ],
    };
}

function dorlingOption(payload: ChartPayload): EChartsCoreOption {
    interface DorlingNode {
        index: number;
        x: number;
        y: number;
        targetX: number;
        targetY: number;
        radius: number;
        vx?: number;
        vy?: number;
        fx?: number | null;
        fy?: number | null;
    }
    const nodes: DorlingNode[] = payload.data.map((row, index) => {
        const radius = 2.5 + Math.sqrt(row.value) * 0.16;
        return {
            index,
            x: ((row.value2 ?? 0) + 11) * 1.65,
            y: (71 - (row.value3 ?? 0)) * 2.25,
            targetX: ((row.value2 ?? 0) + 11) * 1.65,
            targetY: (71 - (row.value3 ?? 0)) * 2.25,
            radius,
        };
    });
    forceSimulation<DorlingNode>(nodes)
        .force("x", forceX<DorlingNode>((node) => node.targetX).strength(0.22))
        .force("y", forceY<DorlingNode>((node) => node.targetY).strength(0.22))
        .force(
            "collide",
            forceCollide<DorlingNode>((node) => node.radius + 1.5),
        )
        .stop()
        .tick(180);

    return {
        animation: !payload.reducedMotion,
        aria: { enabled: true },
        tooltip: mapTooltip(payload),
        grid: { left: 20, right: 20, top: 20, bottom: 20 },
        xAxis: { min: -4, max: 92, show: false },
        yAxis: { min: -4, max: 86, inverse: true, show: false },
        series: [
            {
                type: "scatter",
                data: nodes.map((node) => {
                    const row = payload.data[node.index];
                    return {
                        name: row.label,
                        value: [node.x, node.y, row.value],
                        symbolSize: 22 + Math.sqrt(row.value) * 2.2,
                        label: {
                            show: true,
                            formatter: row.key,
                            color: "#fff",
                            fontWeight: 700,
                        },
                    };
                }),
                itemStyle: { color: blue, opacity: 0.86, borderColor: "#fff", borderWidth: 2 },
            },
        ],
    };
}

export function buildMapOption(payload: ChartPayload): EChartsCoreOption {
    if (payload.kind === "contour-map") return contourOption(payload);
    if (payload.kind === "tile-cartogram") return tileCartogramOption(payload);
    if (payload.kind === "dorling-cartogram") return dorlingOption(payload);

    const base = geoBase(payload);
    if (payload.kind === "choropleth-map") {
        const values = payload.data.map((row) => row.value);
        return {
            ...base,
            tooltip: mapTooltip(payload),
            visualMap: {
                min: Math.min(...values),
                max: Math.max(...values),
                left: "center",
                bottom: 2,
                orient: "horizontal",
                inRange: { color: ["#e7f1eb", "#176b4d"] },
                textStyle: { color: muted },
            },
            series: [
                {
                    type: "map",
                    map: mapName,
                    geoIndex: 0,
                    data: payload.data.map((row) => ({ name: row.key, value: row.value })),
                },
            ],
        };
    }

    if (payload.kind === "flow-map") {
        return {
            ...base,
            tooltip: mapTooltip(payload),
            series: [
                {
                    type: "lines",
                    coordinateSystem: "geo",
                    effect: { show: !payload.reducedMotion, symbolSize: 4, trailLength: 0.15 },
                    lineStyle: { color: orange, width: 1.5, opacity: 0.72, curveness: 0.16 },
                    data: payload.data.map((row) => ({
                        name: row.label,
                        value: row.value,
                        coords: [
                            [row.values?.[0] ?? 0, row.values?.[1] ?? 0],
                            [row.values?.[2] ?? 0, row.values?.[3] ?? 0],
                        ],
                    })),
                },
            ],
        };
    }

    const isHeatmap = payload.kind === "spatial-heatmap";
    const isDots = payload.kind === "dot-density-map";
    return {
        ...base,
        tooltip: mapTooltip(payload),
        visualMap: isHeatmap
            ? {
                  min: 15,
                  max: 80,
                  left: "center",
                  bottom: 2,
                  orient: "horizontal",
                  inRange: { color: ["#fff3c4", "#ee8d4d", "#9e2a2b"] },
              }
            : undefined,
        series: [
            {
                type: "scatter",
                coordinateSystem: "geo",
                symbolSize: isDots
                    ? 5
                    : (value: number[]) =>
                          payload.kind === "symbol-map"
                              ? 8 + Math.sqrt(value[2]) * 1.8
                              : 12 + value[2] / 5,
                data: payload.data.map((row) => ({
                    name: row.label,
                    value: [row.value2, row.value3, row.value],
                })),
                itemStyle: {
                    color: isHeatmap ? undefined : isDots ? orange : blue,
                    opacity: isHeatmap ? 0.42 : 0.78,
                    borderColor: isDots ? undefined : "#fff",
                    borderWidth: isDots ? 0 : 1,
                    shadowBlur: isHeatmap ? 24 : 0,
                    shadowColor: isHeatmap ? "#d94d32" : undefined,
                },
            },
        ],
    };
}
