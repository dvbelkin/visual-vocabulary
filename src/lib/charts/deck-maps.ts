import { Deck, MapView, type MapViewState, type PickingInfo } from "@deck.gl/core";
import { HexagonLayer } from "@deck.gl/aggregation-layers";
import { BitmapLayer, ArcLayer } from "@deck.gl/layers";
import { TileLayer, TripsLayer } from "@deck.gl/geo-layers";

type Point = [number, number];

interface MigrationFlow {
    source: string;
    sourcePosition: Point;
    target: string;
    targetPosition: Point;
    value: number;
}

interface Trip {
    vendor: number;
    path: Point[];
    timestamps: number[];
}

const baseUrl = import.meta.env.BASE_URL;
const tileLayer = () =>
    new TileLayer({
        id: "base-map",
        data: "https://a.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png",
        minZoom: 0,
        maxZoom: 19,
        tileSize: 256,
        renderSubLayers: (props) => {
            const bounds = props.tile.boundingBox;
            return new BitmapLayer(props, {
                data: undefined,
                image: props.data,
                bounds: [bounds[0][0], bounds[0][1], bounds[1][0], bounds[1][1]],
            });
        },
    });

function createDeck(
    container: HTMLDivElement,
    initialViewState: MapViewState,
    getTooltip?: (info: PickingInfo) => { text: string } | null,
) {
    return new Deck({
        parent: container,
        views: new MapView({ repeat: true }),
        initialViewState,
        controller: true,
        getTooltip,
        layers: [tileLayer()],
    });
}

async function renderHexagons(container: HTMLDivElement) {
    const csv = await fetch(`${baseUrl}data/maps/deck/uk-road-accidents.csv`).then((response) =>
        response.text(),
    );
    const points = csv
        .trim()
        .split("\n")
        .slice(1)
        .map((line) => line.split(",").map(Number) as Point);
    const deck = createDeck(
        container,
        { longitude: -1.4, latitude: 52.2, zoom: 5.8, pitch: 45, bearing: -18 },
        ({ object }) =>
            object
                ? {
                      text: `${object.elevationValue.toLocaleString()} accidents`,
                  }
                : null,
    );
    deck.setProps({
        layers: [
            tileLayer(),
            new HexagonLayer<Point>({
                id: "accident-hexagons",
                data: points,
                getPosition: (point) => point,
                radius: 3500,
                elevationScale: 100,
                elevationRange: [0, 2200],
                extruded: true,
                opacity: 0.78,
                pickable: true,
                colorRange: [
                    [44, 123, 182],
                    [102, 194, 165],
                    [171, 221, 164],
                    [253, 174, 97],
                    [215, 48, 39],
                ],
            }),
        ],
    });
    return () => deck.finalize();
}

async function renderArcs(container: HTMLDivElement) {
    const flows = (await fetch(`${baseUrl}data/maps/deck/la-county-flows.json`).then((response) =>
        response.json(),
    )) as MigrationFlow[];
    const deck = createDeck(
        container,
        { longitude: -101, latitude: 39, zoom: 3.2, pitch: 28, bearing: 12 },
        ({ object }) =>
            object
                ? {
                      text: `${object.source} → ${object.target}\n${Math.abs(object.value).toLocaleString()} people`,
                  }
                : null,
    );
    deck.setProps({
        layers: [
            tileLayer(),
            new ArcLayer<MigrationFlow>({
                id: "migration-arcs",
                data: flows,
                getSourcePosition: (flow) => flow.sourcePosition,
                getTargetPosition: (flow) => flow.targetPosition,
                getSourceColor: (flow) => (flow.value >= 0 ? [32, 137, 163] : [227, 74, 51]),
                getTargetColor: (flow) => (flow.value >= 0 ? [227, 74, 51] : [32, 137, 163]),
                getWidth: (flow) => Math.max(1, Math.sqrt(Math.abs(flow.value)) / 12),
                widthMinPixels: 1.5,
                widthMaxPixels: 8,
                pickable: true,
            }),
        ],
    });
    return () => deck.finalize();
}

async function renderTrips(root: HTMLElement, container: HTMLDivElement) {
    const trips = (await fetch(`${baseUrl}data/maps/deck/nyc-taxi-trips.json`).then((response) =>
        response.json(),
    )) as Trip[];
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const slider = root.querySelector<HTMLInputElement>("[data-trip-time]");
    const toggle = root.querySelector<HTMLButtonElement>("[data-trip-toggle]");
    let currentTime = reducedMotion ? 900 : 0;
    let playing = !reducedMotion;
    let frame = 0;
    let previous = performance.now();
    const deck = createDeck(container, {
        longitude: -74,
        latitude: 40.72,
        zoom: 12.5,
        pitch: 42,
        bearing: -8,
    });
    const update = () => {
        if (slider) slider.value = String(Math.round(currentTime));
        deck.setProps({
            layers: [
                tileLayer(),
                new TripsLayer<Trip>({
                    id: "taxi-trips",
                    data: trips,
                    getPath: (trip) => trip.path,
                    getTimestamps: (trip) => trip.timestamps,
                    getColor: (trip) => (trip.vendor === 0 ? [241, 116, 84] : [13, 175, 191]),
                    widthMinPixels: 3,
                    opacity: 0.85,
                    capRounded: true,
                    jointRounded: true,
                    trailLength: 220,
                    currentTime,
                }),
            ],
        });
    };
    const animate = (now: number) => {
        if (playing) {
            currentTime = (currentTime + (now - previous) * 0.045) % 1800;
            update();
        }
        previous = now;
        frame = requestAnimationFrame(animate);
    };
    slider?.addEventListener("input", () => {
        currentTime = Number(slider.value);
        update();
    });
    toggle?.addEventListener("click", () => {
        playing = !playing;
        toggle.textContent =
            root.dataset.locale === "ru"
                ? playing
                    ? "Пауза"
                    : "Продолжить"
                : playing
                  ? "Pause"
                  : "Resume";
    });
    if (toggle && reducedMotion)
        toggle.textContent = root.dataset.locale === "ru" ? "Запустить" : "Play";
    update();
    frame = requestAnimationFrame(animate);
    return () => {
        cancelAnimationFrame(frame);
        deck.finalize();
    };
}

export async function renderDeckExample(root: HTMLElement) {
    const container = root.querySelector<HTMLDivElement>(".deck-example__canvas");
    if (!container) throw new Error("Deck map container is missing");
    if (root.dataset.deckMap === "contour") return renderHexagons(container);
    if (root.dataset.deckMap === "flow") return renderArcs(container);
    if (root.dataset.deckMap === "equalised-cartogram") return renderTrips(root, container);
    throw new Error(`Unknown deck map: ${root.dataset.deckMap}`);
}
