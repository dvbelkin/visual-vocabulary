import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const registry = JSON.parse(
    await readFile(new URL("../src/data/migration-registry.json", import.meta.url), "utf8"),
);
const readyEntries = registry.entries.filter((entry) => entry.astroStatus === "ready");

test("every ready chart has a generated RU and EN route", async () => {
    const checks = readyEntries.flatMap((entry) =>
        ["ru", "en"].map(async (locale) => {
            const route = new URL(
                `../dist/${locale}/charts/${entry.astroRouteId}/index.html`,
                import.meta.url,
            );
            await access(route);
        }),
    );

    await Promise.all(checks);
    assert.equal(checks.length, registry.astroReadyCount * 2);
});
