import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import astro from "eslint-plugin-astro";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
    {
        ignores: [".astro/**", "dist/**", "node_modules/**"],
    },
    {
        files: ["**/*.{js,mjs,ts}"],
        extends: [js.configs.recommended, tseslint.configs.recommended],
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
            },
        },
    },
    ...astro.configs.recommended,
    {
        files: ["**/*.astro"],
        languageOptions: {
            globals: globals.browser,
            parserOptions: {
                parser: tseslint.parser,
                extraFileExtensions: [".astro"],
            },
        },
    },
]);
