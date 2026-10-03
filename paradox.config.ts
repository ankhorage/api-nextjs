import { defineParadoxConfig } from '@ankhorage/paradox';

export default defineParadoxConfig({
  mode: 'write',
  docs: {
    title: '@ankhorage/api-nextjs',
    description: 'Next.js App Router transport adapter for @ankhorage/api.',
  },
  package: {
    root: '.',
    entrypoints: ['src/apiNextjs.ts'],
  },
  output: { dir: './paradox' },
});
