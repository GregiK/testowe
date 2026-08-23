import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // server.js to własny entrypoint pod Passenger (CommonJS, wymagany przez hosting) -
    // celowo poza regułami TS/ESM stosowanymi do reszty repo. Patrz docs/assumptions.md.
    "server.js",
    // Śmieci z wcześniejszego, ręcznego kopiowania plików przez panel hostingu -
    // do usunięcia z repo (patrz commit porządkujący).
    "_to_delete/**",
  ]),
]);

export default eslintConfig;
