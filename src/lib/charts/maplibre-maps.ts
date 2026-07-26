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

function addSymbolLayer(map: Map) {
    map.addSource("significant-earthquakes", {
        type: "geojson",
        data: `${dataBase}significant-earthquakes-2015.geojson`,
    });
    map.addLayer({
        id: "earthquake-symbols",
        type: "circle",
        source: "significant-earthquakes",
        paint: {
            "circle-radius": ["*", 0.72, ["sqrt", ["get", "sig"]]],
            "circle-color": ["interpolate", ["linear"], ["get", "mag"], 5, "#f1b77c", 8, "#9e2a2b"],
            "circle-opacity": 0.76,
            "circle-stroke-color": "#ffffff",
            "circle-stroke-width": 1.5,
        },
    });
}

function addClusterLayers(map: Map) {
    const sourceUrl = `${dataBase}earthquakes.geojson`;
    map.addSource("earthquakes-clustered", {
        type: "geojson",
        data: sourceUrl,
        cluster: true,
        clusterMaxZoom: 7,
        clusterRadius: 42,
    });
    map.addSource("earthquakes-points", { type: "geojson", data: sourceUrl });
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

async function addTimeHeatmap(map: Map) {
    const response = await fetch(`${dataBase}significant-earthquakes-2015.geojson`);
    if (!response.ok) throw new Error(`Unable to load earthquake data: ${response.status}`);
    const collection = (await response.json()) as FeatureCollection<Point, EarthquakeProperties>;
    collection.features.forEach((item) => {
        item.properties.month = new Date(item.properties.time ?? 0).getUTCMonth() + 1;
    });
    map.addSource("earthquakes-time", { type: "geojson", data: collection });
    map.addLayer({
        id: "earthquakes-heat",
        type: "heatmap",
        source: "earthquakes-time",
        paint: {
            "heatmap-weight": ["interpolate", ["linear"], ["get", "mag"], 5, 0.25, 8, 1],
            "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 0, 1, 7, 3],
            "heatmap-color": [
                "interpolate",
                ["linear"],
                ["heatmap-density"],
                0,
                "rgba(47,111,176,0)",
                0.25,
                "#9cc9df",
                0.5,
                "#ffe2a8",
                0.75,
                "#ee8d4d",
                1,
                "#9e2a2b",
            ],
            "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 0, 9, 7, 28],
            "heatmap-opacity": 0.88,
        },
        filter: ["==", ["get", "month"], 1],
    });
    map.addLayer({
        id: "heat-points",
        type: "circle",
        source: "earthquakes-time",
        minzoom: 3,
        paint: {
            "circle-radius": ["interpolate", ["linear"], ["get", "mag"], 5, 3, 8, 10],
            "circle-color": "#9e2a2b",
            "circle-opacity": 0.72,
            "circle-stroke-color": "#ffffff",
            "circle-stroke-width": 1,
        },
        filter: ["==", ["get", "month"], 1],
    });
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
        center: kind === "proportional-symbol" ? [10, 15] : [-105, 35],
        zoom: kind === "proportional-symbol" ? 0.7 : 1.7,
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
        addSymbolLayer(map);
        cleanups.push(attachPointPopup(map, root, "earthquake-symbols", locale, popup));
    } else if (kind === "dot-density") {
        addClusterLayers(map);
        cleanups.push(
            attachPointPopup(map, root, "unclustered-points", locale, popup),
            attachPointPopup(map, root, "all-points", locale, popup),
        );
        const inputs = [...root.querySelectorAll<HTMLInputElement>('input[name^="point-mode-"]')];
        const onMode = (event: Event) => {
            const mode = (event.target as HTMLInputElement).value;
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
    } else {
        await addTimeHeatmap(map);
        cleanups.push(attachPointPopup(map, root, "heat-points", locale, popup));
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
            const filter: ["==", ["get", string], number] = ["==", ["get", "month"], month];
            map.setFilter("earthquakes-heat", filter);
            map.setFilter("heat-points", filter);
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
