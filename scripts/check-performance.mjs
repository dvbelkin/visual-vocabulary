import { readdir, stat } from "node:fs/promises";
import { resolve } from "node:path";

const assetsDirectory = resolve("dist/_astro");
const maximumJavaScriptChunk = 450 * 1024;
const maximumTotalJavaScript = 1100 * 1024;
const maximumStylesheet = 80 * 1024;

const assets = await Promise.all(
    (await readdir(assetsDirectory)).map(async (name) => ({
        name,
        size: (await stat(resolve(assetsDirectory, name))).size,
    })),
);

const scripts = assets.filter((asset) => asset.name.endsWith(".js"));
const styles = assets.filter((asset) => asset.name.endsWith(".css"));
const totalJavaScript = scripts.reduce((total, asset) => total + asset.size, 0);
const violations = [
    ...scripts
        .filter((asset) => asset.size > maximumJavaScriptChunk)
        .map(
            (asset) =>
                `${asset.name}: ${asset.size} bytes exceeds the ${maximumJavaScriptChunk}-byte JS chunk budget`,
        ),
    ...styles
        .filter((asset) => asset.size > maximumStylesheet)
        .map(
            (asset) =>
                `${asset.name}: ${asset.size} bytes exceeds the ${maximumStylesheet}-byte CSS budget`,
        ),
];

if (totalJavaScript > maximumTotalJavaScript) {
    violations.push(
        `Total JavaScript: ${totalJavaScript} bytes exceeds the ${maximumTotalJavaScript}-byte budget`,
    );
}

if (violations.length > 0) {
    console.error(
        `Performance budget exceeded:\n${violations.map((item) => `- ${item}`).join("\n")}`,
    );
    process.exitCode = 1;
} else {
    const largestScript = scripts.sort((a, b) => b.size - a.size)[0];
    console.log(
        `Performance budget passed: ${scripts.length} JS chunks, ${totalJavaScript} bytes total, largest ${largestScript.name} (${largestScript.size} bytes).`,
    );
}
