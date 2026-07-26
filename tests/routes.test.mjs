import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

test("both locales generate the same 72 chart routes", async () => {
    const routes = await Promise.all(
        ["ru", "en"].map((locale) =>
            readdir(new URL(`../dist/${locale}/charts/`, import.meta.url)),
        ),
    );

    assert.equal(routes[0].length, 72);
    assert.equal(routes[1].length, 72);
    assert.deepEqual(routes[0].sort(), routes[1].sort());
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
