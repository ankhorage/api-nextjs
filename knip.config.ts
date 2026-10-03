import { createKnipConfig } from '@ankhorage/devtools/knip';

export default createKnipConfig({
  entry: [
    'src/apiNextJs.ts',
    'examples/**/*.ts',
    'paradox.config.ts',
    'eslint.config.mjs',
  ],
});
