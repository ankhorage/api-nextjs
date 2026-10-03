import { describe, expect, it } from 'bun:test';
import { createApi } from '@ankhorage/api';
import type { InternalRestApiDefinition } from '@ankhorage/contracts';

import { createNextJsApiRoute } from './apiNextjs.js';

const definition: InternalRestApiDefinition = {
  id: 'atlas',
  origin: 'internal',
  protocol: 'rest',
  basePath: '/api/atlas',
  endpoints: {
    actions: {
      id: 'actions',
      kind: 'http',
      operations: {
        'dependency-graph': {
          id: 'dependency-graph',
          endpointId: 'actions',
          protocol: 'http',
          intent: 'action',
          method: 'POST',
          path: '/dependency-graph',
        },
      },
    },
  },
};

describe('createNextJsApiRoute', () => {
  it('dispatches the dynamic action parameter and JSON body', async () => {
    const route = createNextJsApiRoute(
      createApi({
        definition,
        handlers: {
          'dependency-graph': ({ input }) => ({ graph: input }),
        },
      }),
    );
    const response = await route.POST(
      new Request('https://atlas.test/api/dependency-graph', {
        method: 'POST',
        body: JSON.stringify({ source: 'ankhorage/atlas' }),
      }),
      { params: Promise.resolve({ action: 'dependency-graph' }) },
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      ok: true,
      data: { graph: { source: 'ankhorage/atlas' } },
    });
  });

  it('rejects malformed JSON', async () => {
    const route = createNextJsApiRoute(createApi({ definition, handlers: {} }));
    const response = await route.POST(
      new Request('https://atlas.test/api/dependency-graph', {
        method: 'POST',
        body: '{bad',
      }),
      { params: { action: 'dependency-graph' } },
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ code: 'invalid-json', ok: false });
  });

  it('maps missing operations to HTTP 404', async () => {
    const route = createNextJsApiRoute(createApi({ definition, handlers: {} }));
    const response = await route.POST(
      new Request('https://atlas.test/api/missing', { method: 'POST' }),
      { params: { action: 'missing' } },
    );

    expect(response.status).toBe(404);
  });
});
