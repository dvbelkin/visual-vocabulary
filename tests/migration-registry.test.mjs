import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const registry = JSON.parse(
    await readFile(new URL("../src/data/migration-registry.json", import.meta.url), "utf8"),
);

test("registry contains every vocabulary chart", () => {
    assert.equal(registry.chartCount, 72);
    assert.equal(registry.entries.length, 72);
    assert.equal(new Set(registry.entries.map((entry) => entry.id)).size, 72);
});

test("every legacy chart has a migration status", () => {
    assert.equal(registry.legacyReadyCount + registry.legacyReviewCount, 72);
    assert.ok(registry.entries.every((entry) => ["ready", "review"].includes(entry.legacyStatus)));
});

test("Astro routes are unique and agree with the ready count", () => {
    const routes = registry.entries
        .filter((entry) => entry.astroStatus === "ready")
        .map((entry) => entry.astroRouteId);

    assert.equal(routes.length, registry.astroReadyCount);
    assert.equal(new Set(routes).size, routes.length);
    assert.ok(routes.every(Boolean));
});
