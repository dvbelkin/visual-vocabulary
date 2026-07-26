import { readdir, readFile } from "node:fs/promises";
import { extname, relative, resolve, sep } from "node:path";
import process from "node:process";

const root = process.cwd();
const ignoredDirectories = new Set([".git", "dist", "node_modules"]);
const retainedReferenceDirectories = new Set([
    "map-us-choropleth",
    "uk-constituency-cartogram-2017",
    "uk-constituency-map-2017",
]);
const allowedAlgorithmImports = new Map([
    ["src/lib/charts/options.ts", ['from "d3-delaunay"']],
    ["src/lib/charts/map-options.ts", ['from "d3-contour"', 'from "d3-force"']],
]);
const runtimeExtensions = new Set([".astro", ".html", ".js", ".mjs", ".ts"]);
const d3RuntimePattern =
    /(?:<script[^>]+(?:d3(?:\.min)?\.js|d3\.v\d)|(?:from|import)\s*["'][^"']*d3|\bd3\.(?:select|scale|axis|time|geo|layout|svg|csv|json|nest|range|extent|format|sum|ascending|descending)\b)/i;

const violations = [];

async function visit(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
        if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;

        const absolutePath = resolve(directory, entry.name);
        const repositoryPath = relative(root, absolutePath).split(sep).join("/");
        const topLevelDirectory = repositoryPath.split("/")[0];

        if (retainedReferenceDirectories.has(topLevelDirectory)) continue;
        if (repositoryPath === "scripts/check-legacy-d3.mjs") continue;

        if (entry.isDirectory()) {
            await visit(absolutePath);
            continue;
        }

        if (/(?:^|\/)d3(?:\.v\d+)?(?:\.min)?\.js$/i.test(repositoryPath)) {
            violations.push(repositoryPath);
            continue;
        }

        if (!runtimeExtensions.has(extname(entry.name))) continue;

        const source = await readFile(absolutePath, "utf8");
        const allowedImports = allowedAlgorithmImports.get(repositoryPath);
        if (
            allowedImports?.every((moduleImport) => source.includes(moduleImport)) &&
            !/\bd3\./i.test(source)
        ) {
            continue;
        }
        if (d3RuntimePattern.test(source)) violations.push(repositoryPath);
    }
}

await visit(root);

if (violations.length > 0) {
    console.error(
        `D3 runtime найден вне сохранённых референсов:\n${violations
            .sort()
            .map((path) => `- ${path}`)
            .join("\n")}`,
    );
    process.exitCode = 1;
} else {
    console.log(
        "Старый D3 runtime отсутствует; разрешены только согласованные модульные алгоритмы D3.",
    );
}
