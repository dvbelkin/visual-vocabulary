import { geoPath } from "d3-geo";
import { scaleQuantize, scaleSequential } from "d3-scale";
import { interpolateYlOrRd, schemeBlues } from "d3-scale-chromatic";
import { feature, mesh } from "topojson-client";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import type { GeometryCollection, Objects, Topology } from "topojson-specification";

type Locale = "ru" | "en";
type MapTopology = Topology<Objects<{ name?: string }>>;

const svgNamespace = "http://www.w3.org/2000/svg";
const dataBase = `${import.meta.env.BASE_URL}data/maps/`;

async function loadText(file: string) {
    const response = await fetch(`${dataBase}${file}`);
    if (!response.ok) throw new Error(`Unable to load ${file}: ${response.status}`);
    return response.text();
}

async function loadTopology(file: string) {
    const response = await fetch(`${dataBase}${file}`);
    if (!response.ok) throw new Error(`Unable to load ${file}: ${response.status}`);
    return (await response.json()) as MapTopology;
}

function svgElement<K extends keyof SVGElementTagNameMap>(name: K) {
    return document.createElementNS(svgNamespace, name);
}

function parseCsv(source: string) {
    const [header, ...lines] = source.trim().split(/\r?\n/);
    const keys = header.split(",");
    return lines.map((line) =>
        Object.fromEntries(line.split(",").map((value, index) => [keys[index], value])),
    );
}

function createSvg() {
    const svg = svgElement("svg");
    svg.setAttribute("viewBox", "0 0 975 610");
    svg.setAttribute("role", "img");
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
    return svg;
}

function setStatus(root: HTMLElement, value: string) {
    const status = root.querySelector<HTMLElement>(".d3-map__status");
    if (status) status.textContent = value;
}

function addLegend(svg: SVGSVGElement, colors: readonly string[], labels: string[], title: string) {
    const group = svgElement("g");
    group.setAttribute("transform", "translate(42 548)");
    const heading = svgElement("text");
    heading.textContent = title;
    heading.setAttribute("y", "-10");
    heading.setAttribute("font-size", "13");
    heading.setAttribute("font-weight", "700");
    group.append(heading);
    colors.forEach((color, index) => {
        const rect = svgElement("rect");
        rect.setAttribute("x", String(index * 54));
        rect.setAttribute("width", "54");
        rect.setAttribute("height", "12");
        rect.setAttribute("fill", color);
        group.append(rect);
        const label = svgElement("text");
        label.textContent = labels[index];
        label.setAttribute("x", String(index * 54));
        label.setAttribute("y", "29");
        label.setAttribute("font-size", "11");
        group.append(label);
    });
    svg.append(group);
}

async function renderChoropleth(root: HTMLElement, locale: Locale) {
    const canvas = root.querySelector(".d3-map__canvas");
    if (!canvas) return;
    const [topology, unemploymentCsv] = await Promise.all([
        loadTopology("us-counties-albers-10m.json"),
        loadText("us-county-unemployment-2016.csv"),
    ]);
    const countiesObject = topology.objects.counties as GeometryCollection<{ name?: string }>;
    const statesObject = topology.objects.states as GeometryCollection<{ name?: string }>;
    const counties = feature(topology, countiesObject) as FeatureCollection<
        Geometry,
        { name?: string }
    >;
    const states = feature(topology, statesObject) as FeatureCollection<
        Geometry,
        { name?: string }
    >;
    const stateNames = new Map(
        states.features.map((state) => [String(state.id), state.properties.name]),
    );
    const rates = new Map(parseCsv(unemploymentCsv).map((row) => [row.id, Number(row.rate)]));
    const color = scaleQuantize<string>().domain([1, 10]).range(schemeBlues[9]);
    const path = geoPath();
    const svg = createSvg();
    svg.setAttribute(
        "aria-label",
        locale === "ru"
            ? "Уровень безработицы по округам США, август 2016 года"
            : "Unemployment rate by US county, August 2016",
    );

    counties.features.forEach((county) => {
        const id = String(county.id);
        const rate = rates.get(id);
        const countyName = county.properties.name ?? id;
        const stateName = stateNames.get(id.slice(0, 2)) ?? "";
        const text =
            rate === undefined
                ? `${countyName}, ${stateName}`
                : locale === "ru"
                  ? `${countyName}, ${stateName}: безработица ${rate.toLocaleString("ru")} %`
                  : `${countyName}, ${stateName}: ${rate.toLocaleString("en")}% unemployment`;
        const region = svgElement("path");
        region.classList.add("map-region");
        region.setAttribute("d", path(county) ?? "");
        region.setAttribute("fill", rate === undefined ? "#d8dedb" : color(rate));
        region.setAttribute("stroke", "#fff");
        region.setAttribute("stroke-width", "0.35");
        region.setAttribute("aria-hidden", "true");
        region.addEventListener("pointerenter", () => setStatus(root, text));
        const title = svgElement("title");
        title.textContent = text;
        region.append(title);
        svg.append(region);
    });

    const borders = svgElement("path");
    borders.setAttribute(
        "d",
        path(mesh(topology, statesObject, (a, b) => a !== b) as unknown as Feature) ?? "",
    );
    borders.setAttribute("fill", "none");
    borders.setAttribute("stroke", "#fff");
    borders.setAttribute("stroke-width", "1.2");
    borders.setAttribute("pointer-events", "none");
    svg.append(borders);
    addLegend(
        svg,
        schemeBlues[9],
        ["1", "2", "3", "4", "5", "6", "7", "8", "9–10"],
        locale === "ru" ? "Безработица, %" : "Unemployment rate, %",
    );
    canvas.replaceChildren(svg);
}

async function renderCartogram(root: HTMLElement, locale: Locale) {
    const canvas = root.querySelector(".d3-map__canvas");
    if (!canvas) return () => undefined;
    const [topology, obesityCsv] = await Promise.all([
        loadTopology("us-states-albers-10m.json"),
        loadText("us-adult-obesity-2008-2018.csv"),
    ]);
    const statesObject = topology.objects.states as GeometryCollection<{ name?: string }>;
    const states = feature(topology, statesObject) as FeatureCollection<
        Geometry,
        { name?: string }
    >;
    const data = new Map(
        parseCsv(obesityCsv).map((row) => [
            row.id,
            { obesity2008: Number(row.obesity2008), obesity2018: Number(row.obesity2018) },
        ]),
    );
    const path = geoPath();
    const color = scaleSequential(interpolateYlOrRd).domain([0.12, 0.37]);
    const svg = createSvg();
    const group = svgElement("g");
    svg.append(group);
    svg.setAttribute(
        "aria-label",
        locale === "ru"
            ? "Неконтурная картограмма распространённости ожирения среди взрослых в штатах США"
            : "Non-contiguous cartogram of adult obesity prevalence in US states",
    );

    const renderYear = (year: "2008" | "2018") => {
        group.replaceChildren();
        states.features.forEach((state) => {
            const values = data.get(String(state.id));
            if (!values) return;
            const value = values[`obesity${year}`];
            const [x, y] = path.centroid(state);
            const scale = Math.sqrt(value);
            const stateName = state.properties.name ?? String(state.id);
            const text =
                locale === "ru"
                    ? `${stateName}: ${(value * 100).toLocaleString("ru", { maximumFractionDigits: 1 })} % взрослых, ${year}`
                    : `${stateName}: ${(value * 100).toLocaleString("en", { maximumFractionDigits: 1 })}% of adults, ${year}`;
            const region = svgElement("path");
            region.classList.add("map-region");
            region.setAttribute("d", path(state) ?? "");
            region.setAttribute(
                "transform",
                `translate(${x} ${y}) scale(${scale}) translate(${-x} ${-y})`,
            );
            region.setAttribute("fill", color(value));
            region.setAttribute("stroke", "#fff");
            region.setAttribute("stroke-width", String(1 / scale));
            region.setAttribute("tabindex", "0");
            region.setAttribute("aria-label", text);
            region.addEventListener("pointerenter", () => setStatus(root, text));
            region.addEventListener("focus", () => setStatus(root, text));
            const title = svgElement("title");
            title.textContent = text;
            region.append(title);
            group.append(region);
        });
        setStatus(
            root,
            locale === "ru"
                ? `${year}: площадь каждого штата уменьшена пропорционально доле взрослых с ожирением.`
                : `${year}: each state area is reduced in proportion to the adult obesity rate.`,
        );
    };

    const labels = ["12", "15", "18", "21", "24", "27", "30", "33", "36"];
    addLegend(
        svg,
        labels.map((label) => interpolateYlOrRd(Number(label) / 100)),
        labels,
        locale === "ru" ? "Взрослые с ожирением, %" : "Adults with obesity, %",
    );
    const inputs = [...root.querySelectorAll<HTMLInputElement>('input[name^="year-"]')];
    const onChange = (event: Event) =>
        renderYear((event.target as HTMLInputElement).value as "2008" | "2018");
    inputs.forEach((input) => input.addEventListener("change", onChange));
    renderYear("2018");
    canvas.replaceChildren(svg);
    return () => inputs.forEach((input) => input.removeEventListener("change", onChange));
}

export async function renderD3Map(root: HTMLElement) {
    const locale = root.dataset.locale === "ru" ? "ru" : "en";
    if (root.dataset.d3Map === "basic-choropleth") {
        await renderChoropleth(root, locale);
        return () => undefined;
    }
    return await renderCartogram(root, locale);
}
