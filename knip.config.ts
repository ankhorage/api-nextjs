import { createKnipConfig } from "@ankhorage/devtools/knip";

export default createKnipConfig({
  entry: [
    "src/apiNextJs.ts",
    "src/cli/index.ts",
    "examples/**/*.ts",
    "paradox.config.ts",
    "eslint.config.mjs",
  ],
});
