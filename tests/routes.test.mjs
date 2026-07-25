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

test("localized routes expose complete language and SEO metadata", async () => {
    for (const locale of ["ru", "en"]) {
        const route = new URL(`../dist/${locale}/index.html`, import.meta.url);
        const html = await readFile(route, "utf8");

        assert.match(html, new RegExp(`<html lang="${locale}"`));
        assert.match(html, /<meta name="description" content="[^"]+"/);
        assert.match(html, /<link rel="canonical" href="https:\/\/dvbelkin\.github\.io\//);
        assert.match(html, /<link rel="alternate" hreflang="ru"/);
        assert.match(html, /<link rel="alternate" hreflang="en"/);
        assert.match(html, /<link rel="alternate" hreflang="x-default"/);
        assert.match(html, /<meta property="og:title" content="[^"]+"/);
        assert.match(html, /<meta property="og:description" content="[^"]+"/);
    }
});

test("catalog pages do not load the ECharts runtime", async () => {
    for (const locale of ["ru", "en"]) {
        const route = new URL(`../dist/${locale}/index.html`, import.meta.url);
        const html = await readFile(route, "utf8");

        assert.doesNotMatch(html, /EChart\.astro|register-specialized/);
    }
});
