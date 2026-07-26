import {
    Map,
    NavigationControl,
    Popup,
    type MapLayerMouseEvent,
    type StyleSpecification,
} from "maplibre-gl";
import type { FeatureCollection, Point } from "geojson";

type Locale = "ru" | "en";
type EarthquakeProperties = {
    mag?: number;
    place?: string;
    time?: number;
    title?: string;
    month?: number;
    sig?: number;
};

const dataBase = `${import.meta.env.BASE_URL}data/maps/`;
const style: StyleSpecification = {
    version: 8,
    sources: {
        osm: {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution: "© OpenStreetMap contributors",
        },
    },
    layers: [
        {
            id: "osm",
            type: "raster",
            source: "osm",
            paint: { "raster-saturation": -0.78, "raster-opacity": 0.72 },
        },
    ],
};

function status(root: HTMLElement, message: string) {
    const target = root.querySelector<HTMLElement>(".maplibre-example__status");
    if (target) target.textContent = message;
}

function formatMagnitude(value: unknown, locale: Locale) {
    const magnitude = typeof value === "number" ? value : Number(value);
    return Number.isFinite(magnitude)
        ? magnitude.toLocaleString(locale, { maximumFractionDigits: 1 })
        : "—";
}

async function loadEarthquakes(file: string) {
    const response = await fetch(`${dataBase}${file}`);
    if (!response.ok) throw new Error(`Unable to load ${file}: ${response.status}`);
    const source = (await response.json()) as FeatureCollection<Point, EarthquakeProperties>;
    return {
        type: "FeatureCollection",
        features: source.features.map((item) => ({
            type: "Feature",
            id: item.id,
            properties: { ...item.properties },
            geometry: {
                type: "Point",
                coordinates: [item.geometry.coordinates[0], item.geometry.coordinates[1]],
            },
        })),
    } satisfies FeatureCollection<Point, EarthquakeProperties>;
}

function attachPointPopup(
    map: Map,
    root: HTMLElement,
    layer: string,
    locale: Locale,
    popup: Popup,
) {
    const show = (event: MapLayerMouseEvent) => {
        const point = event.features?.[0];
        if (!point || point.geometry.type !== "Point") return;
        const properties = point.properties as EarthquakeProperties;
        const place =
            properties.place ??
            properties.title ??
            (locale === "ru" ? "Землетрясение" : "Earthquake");
        const message =
            locale === "ru"
                ? `${place}: магнитуда ${formatMagnitude(properties.mag, locale)}, индекс значимости ${properties.sig ?? "—"}`
                : `${place}: magnitude ${formatMagnitude(properties.mag, locale)}, significance index ${properties.sig ?? "—"}`;
        map.getCanvas().style.cursor = "pointer";
        status(root, message);
        popup
            .setLngLat(point.geometry.coordinates as [number, number])
            .setText(message)
            .addTo(map);
    };
    const hide = () => {
        map.getCanvas().style.cursor = "";
        popup.remove();
    };
    map.on("mousemove", layer, show);
    map.on("mouseleave", layer, hide);
    return () => {
        map.off("mousemove", layer, show);
        map.off("mouseleave", layer, hide);
    };
}

function addSymbolLayer(map: Map, collection: FeatureCollection<Point, EarthquakeProperties>) {
    map.addSource("significant-earthquakes", {
        type: "geojson",
        data: collection,
    });
    map.addLayer({
        id: "earthquake-symbols",
        type: "circle",
        source: "significant-earthquakes",
        paint: {
            "circle-radius": ["interpolate", ["linear"], ["get", "sig"], 500, 7, 1200, 24],
            "circle-color": ["interpolate", ["linear"], ["get", "mag"], 5, "#f1b77c", 8, "#9e2a2b"],
            "circle-opacity": 0.76,
            "circle-stroke-color": "#ffffff",
            "circle-stroke-width": 1.5,
        },
    });
}

function addClusterLayers(map: Map, collection: FeatureCollection<Point, EarthquakeProperties>) {
    map.addSource("earthquakes-clustered", {
        type: "geojson",
        data: collection,
        cluster: true,
        clusterMaxZoom: 7,
        clusterRadius: 42,
    });
    map.addSource("earthquakes-points", { type: "geojson", data: collection });
    map.addLayer({
        id: "clusters",
        type: "circle",
        source: "earthquakes-clustered",
        filter: ["has", "point_count"],
        paint: {
            "circle-color": [
                "step",
                ["get", "point_count"],
                "#8fc8bd",
                50,
                "#3b9780",
                250,
                "#176b4d",
            ],
            "circle-radius": ["step", ["get", "point_count"], 15, 50, 21, 250, 29],
            "circle-stroke-color": "#ffffff",
            "circle-stroke-width": 1.5,
        },
    });
    map.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "earthquakes-clustered",
        filter: ["has", "point_count"],
        layout: {
            "text-field": ["get", "point_count_abbreviated"],
            "text-size": 12,
        },
        paint: { "text-color": "#ffffff" },
    });
    map.addLayer({
        id: "unclustered-points",
        type: "circle",
        source: "earthquakes-clustered",
        filter: ["!", ["has", "point_count"]],
        paint: {
            "circle-color": "#db6b35",
            "circle-radius": 4,
            "circle-stroke-color": "#ffffff",
            "circle-stroke-width": 1,
        },
    });
    map.addLayer({
        id: "all-points",
        type: "circle",
        source: "earthquakes-points",
        layout: { visibility: "none" },
        paint: {
            "circle-color": "#db6b35",
            "circle-radius": 3,
            "circle-opacity": 0.68,
            "circle-stroke-color": "#ffffff",
            "circle-stroke-width": 0.5,
        },
    });
}

function createCanvasOverlay(
    map: Map,
    collection: FeatureCollection<Point, EarthquakeProperties>,
    kind: "symbols" | "clusters",
) {
    const canvas = document.createElement("canvas");
    canvas.style.cssText =
        "position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:2";
    map.getContainer().append(canvas);
    let pointMode: "clusters" | "points" = "clusters";

    const circle = (
        context: CanvasRenderingContext2D,
        x: number,
        y: number,
        radius: number,
        fill: string,
    ) => {
        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2);
        context.fillStyle = fill;
        context.fill();
        context.strokeStyle = "#ffffff";
        context.lineWidth = 1.25;
        context.stroke();
    };

    const draw = () => {
        const ratio = window.devicePixelRatio || 1;
        const width = map.getContainer().clientWidth;
        const height = map.getContainer().clientHeight;
        if (canvas.width !== width * ratio || canvas.height !== height * ratio) {
            canvas.width = width * ratio;
            canvas.height = height * ratio;
        }
        const context = canvas.getContext("2d");
        if (!context) return;
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
        context.clearRect(0, 0, width, height);
        const visible = collection.features
            .map((item) => ({
                item,
                point: map.project([item.geometry.coordinates[0], item.geometry.coordinates[1]]),
            }))
            .filter(
                ({ point }) =>
                    point.x >= -30 &&
                    point.x <= width + 30 &&
                    point.y >= -30 &&
                    point.y <= height + 30,
            );

        if (kind === "symbols") {
            visible.forEach(({ item, point }) => {
                const significance = item.properties.sig ?? 500;
                const radius = Math.max(7, Math.min(24, 7 + ((significance - 500) / 700) * 17));
                circle(context, point.x, point.y, radius, "rgba(158, 42, 43, 0.78)");
            });
            return;
        }
        if (pointMode === "points") {
            visible.forEach(({ point }) =>
                circle(context, point.x, point.y, 2.6, "rgba(219, 107, 53, 0.72)"),
            );
            return;
        }

        const cells = new globalThis.Map<string, { x: number; y: number; count: number }>();
        visible.forEach(({ point }) => {
            const key = `${Math.floor(point.x / 44)}:${Math.floor(point.y / 44)}`;
            const cell = cells.get(key);
            if (cell) {
                cell.x += point.x;
                cell.y += point.y;
                cell.count += 1;
            } else {
                cells.set(key, { x: point.x, y: point.y, count: 1 });
            }
        });
        cells.forEach((cell) => {
            const x = cell.x / cell.count;
            const y = cell.y / cell.count;
            const radius = Math.min(30, 7 + Math.sqrt(cell.count) * 1.35);
            circle(
                context,
                x,
                y,
                radius,
                cell.count > 100 ? "#176b4d" : cell.count > 20 ? "#3b9780" : "#8fc8bd",
            );
            if (cell.count > 1) {
                context.fillStyle = cell.count > 20 ? "#ffffff" : "#17201c";
                context.font = "700 11px system-ui";
                context.textAlign = "center";
                context.textBaseline = "middle";
                context.fillText(
                    cell.count > 999 ? `${Math.round(cell.count / 100) / 10}k` : String(cell.count),
                    x,
                    y,
                );
            }
        });
    };

    map.on("move", draw);
    map.on("resize", draw);
    draw();
    return {
        setMode(value: "clusters" | "points") {
            pointMode = value;
            draw();
        },
        cleanup() {
            map.off("move", draw);
            map.off("resize", draw);
            canvas.remove();
        },
    };
}

function createHeatCanvasOverlay(
    map: Map,
    collection: FeatureCollection<Point, EarthquakeProperties>,
) {
    const canvas = document.createElement("canvas");
    canvas.style.cssText =
        "position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:2";
    map.getContainer().append(canvas);
    let month = 1;

    const draw = () => {
        const ratio = window.devicePixelRatio || 1;
        const width = map.getContainer().clientWidth;
        const height = map.getContainer().clientHeight;
        if (canvas.width !== width * ratio || canvas.height !== height * ratio) {
            canvas.width = width * ratio;
            canvas.height = height * ratio;
        }
        const context = canvas.getContext("2d");
        if (!context) return;
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
        context.clearRect(0, 0, width, height);
        context.globalCompositeOperation = "multiply";

        collection.features
            .filter((item) => item.properties.month === month)
            .forEach((item) => {
                const point = map.project([
                    item.geometry.coordinates[0],
                    item.geometry.coordinates[1],
                ]);
                if (
                    point.x < -60 ||
                    point.x > width + 60 ||
                    point.y < -60 ||
                    point.y > height + 60
                ) {
                    return;
                }
                const magnitude = item.properties.mag ?? 6;
                const radius = 30 + Math.max(0, magnitude - 6) * 13;
                const gradient = context.createRadialGradient(
                    point.x,
                    point.y,
                    0,
                    point.x,
                    point.y,
                    radius,
                );
                gradient.addColorStop(0, "rgba(158, 42, 43, 0.92)");
                gradient.addColorStop(0.28, "rgba(238, 141, 77, 0.7)");
                gradient.addColorStop(0.62, "rgba(255, 226, 168, 0.42)");
                gradient.addColorStop(1, "rgba(47, 111, 176, 0)");
                context.beginPath();
                context.arc(point.x, point.y, radius, 0, Math.PI * 2);
                context.fillStyle = gradient;
                context.fill();
            });
        context.globalCompositeOperation = "source-over";
    };

    map.on("move", draw);
    map.on("resize", draw);
    draw();
    return {
        setMonth(value: number) {
            month = value;
            draw();
        },
        cleanup() {
            map.off("move", draw);
            map.off("resize", draw);
            canvas.remove();
        },
    };
}

export async function renderMapLibreExample(root: HTMLElement) {
    const locale: Locale = root.dataset.locale === "ru" ? "ru" : "en";
    const canvas = root.querySelector<HTMLElement>(".maplibre-example__canvas");
    if (!canvas) return () => undefined;
    const kind = root.dataset.maplibreMap;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const map = new Map({
        container: canvas,
        style,
        center: kind === "dot-density" ? [-105, 35] : [10, 15],
        zoom: kind === "dot-density" ? 1.7 : 0.7,
        cooperativeGestures: true,
        attributionControl: {},
        fadeDuration: reducedMotion ? 0 : 300,
    });
    map.addControl(new NavigationControl({ showCompass: false }), "top-right");
    map.getCanvas().setAttribute(
        "aria-label",
        locale === "ru" ? "Интерактивная карта землетрясений" : "Interactive earthquake map",
    );
    const popup = new Popup({ closeButton: false, closeOnClick: false, offset: 10 });
    const cleanups: Array<() => void> = [];

    await new Promise<void>((resolve, reject) => {
        map.once("load", () => resolve());
        map.once("error", (event) => {
            if (!map.loaded()) reject(event.error);
        });
    });

    if (kind === "proportional-symbol") {
        const collection = await loadEarthquakes("significant-earthquakes-2015.geojson");
        addSymbolLayer(map, collection);
        const overlay = createCanvasOverlay(map, collection, "symbols");
        cleanups.push(overlay.cleanup);
        cleanups.push(attachPointPopup(map, root, "earthquake-symbols", locale, popup));
        status(
            root,
            locale === "ru"
                ? `Показано ${collection.features.length} значительных землетрясений за 2015 год.`
                : `${collection.features.length} significant earthquakes in 2015 are shown.`,
        );
    } else if (kind === "dot-density") {
        const collection = await loadEarthquakes("earthquakes.geojson");
        addClusterLayers(map, collection);
        const overlay = createCanvasOverlay(map, collection, "clusters");
        cleanups.push(overlay.cleanup);
        cleanups.push(
            attachPointPopup(map, root, "unclustered-points", locale, popup),
            attachPointPopup(map, root, "all-points", locale, popup),
        );
        const inputs = [...root.querySelectorAll<HTMLInputElement>('input[name^="point-mode-"]')];
        const onMode = (event: Event) => {
            const mode = (event.target as HTMLInputElement).value;
            overlay.setMode(mode as "clusters" | "points");
            const clusterVisibility = mode === "clusters" ? "visible" : "none";
            map.setLayoutProperty("clusters", "visibility", clusterVisibility);
            map.setLayoutProperty("cluster-count", "visibility", clusterVisibility);
            map.setLayoutProperty("unclustered-points", "visibility", clusterVisibility);
            map.setLayoutProperty(
                "all-points",
                "visibility",
                mode === "points" ? "visible" : "none",
            );
            status(
                root,
                mode === "clusters"
                    ? locale === "ru"
                        ? "Близкие землетрясения объединены; число показывает размер кластера."
                        : "Nearby earthquakes are grouped; the number shows cluster size."
                    : locale === "ru"
                      ? "Показаны все 6 107 зарегистрированных землетрясений."
                      : "All 6,107 recorded earthquakes are shown.",
            );
        };
        inputs.forEach((input) => input.addEventListener("change", onMode));
        cleanups.push(() => inputs.forEach((input) => input.removeEventListener("change", onMode)));
        status(
            root,
            locale === "ru"
                ? `Загружено ${collection.features.length.toLocaleString("ru")} событий; близкие точки объединены в кластеры.`
                : `${collection.features.length.toLocaleString("en")} events loaded; nearby points are clustered.`,
        );
    } else {
        const collection = await loadEarthquakes("significant-earthquakes-2015.geojson");
        collection.features.forEach((item) => {
            item.properties.month = new Date(item.properties.time ?? 0).getUTCMonth() + 1;
        });
        const overlay = createHeatCanvasOverlay(map, collection);
        cleanups.push(overlay.cleanup);
        const slider = root.querySelector<HTMLInputElement>("[data-month-slider]");
        const output = root.querySelector<HTMLOutputElement>("[data-month-output]");
        const monthNames =
            locale === "ru"
                ? [
                      "январь",
                      "февраль",
                      "март",
                      "апрель",
                      "май",
                      "июнь",
                      "июль",
                      "август",
                      "сентябрь",
                      "октябрь",
                      "ноябрь",
                      "декабрь",
                  ]
                : [
                      "January",
                      "February",
                      "March",
                      "April",
                      "May",
                      "June",
                      "July",
                      "August",
                      "September",
                      "October",
                      "November",
                      "December",
                  ];
        const onMonth = () => {
            const month = Number(slider?.value ?? 1);
            overlay.setMonth(month);
            if (output) output.textContent = monthNames[month - 1];
            status(
                root,
                locale === "ru"
                    ? `${monthNames[month - 1]} 2015: показаны значительные землетрясения за выбранный месяц.`
                    : `${monthNames[month - 1]} 2015: significant earthquakes in the selected month.`,
            );
        };
        slider?.addEventListener("input", onMonth);
        onMonth();
        cleanups.push(() => slider?.removeEventListener("input", onMonth));
    }

    return () => {
        cleanups.forEach((cleanup) => cleanup());
        popup.remove();
        map.remove();
    };
}
