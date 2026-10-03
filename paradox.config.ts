import { defineParadoxConfig } from '@ankhorage/paradox';

export default defineParadoxConfig({
  mode: 'write',
  docs: {
    title: '@ankhorage/api-nextjs',
    description: 'Next.js App Router transport adapter for the Ankhorage API runtime.',
  },
  package: {
    root: '.',
    entrypoints: ['src/apiNextJs.ts'],
  },
  output: { dir: './paradox' },
});
