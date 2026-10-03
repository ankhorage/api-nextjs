import { createApiRuntime } from '@ankhorage/api';

import { createNextJsApiRoute } from '../../src/apiNextJs.js';

/***
 * @title Basic Usage
 *
 * Create a framework-neutral API runtime and bind one operation to a Next.js App Router route
 * handler.
 *
 * @usage
 * @readme
 */
const runtime = createApiRuntime({
  definition: {
    id: 'health-api',
    origin: 'internal',
    protocol: 'rest',
    basePath: '/api',
    endpoints: {
      health: {
        id: 'health',
        kind: 'http',
        operations: {
          'health.read': {
            id: 'health.read',
            protocol: 'http',
            intent: 'read',
            method: 'GET',
            path: '/health',
          },
        },
      },
    },
  },
  handlers: {
    'health.read': () => ({ body: { ok: true } }),
  },
});

export const GET = createNextJsApiRoute(runtime, 'health.read');
