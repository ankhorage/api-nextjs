import { createApiRuntime } from '@ankhorage/api';
import { describe, expect, it } from 'bun:test';

import { createNextJsApiHandler } from './apiNextjs.js';

const runtime = createApiRuntime({
  definition: {
    id: 'atlas',
    origin: 'internal',
    protocol: 'rest',
    basePath: '/api',
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
  },
  handlers: {
    'dependency-graph': (request) => ({
      body: { graph: request.body, query: request.query },
    }),
  },
});

describe('createNextJsApiHandler', () => {
  it('dispatches the selected operation with JSON body and repeated query values', async () => {
    const handler = createNextJsApiHandler(runtime, 'dependency-graph');
    const response = await handler(
      new Request('https://atlas.test/api/dependency-graph?depth=1&depth=2', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ source: 'ankhorage/atlas' }),
      }),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      graph: { source: 'ankhorage/atlas' },
      query: { depth: ['1', '2'] },
    });
  });

  it('returns HTTP 400 for malformed JSON without invoking the runtime handler', async () => {
    const handler = createNextJsApiHandler(runtime, 'dependency-graph');
    const response = await handler(
      new Request('https://atlas.test/api/dependency-graph', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: '{bad',
      }),
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: { code: 'invalid_json', operationId: 'dependency-graph' },
    });
  });

  it('rejects an operation id that is not defined by the runtime', () => {
    expect(() => createNextJsApiHandler(runtime, 'missing')).toThrow(
      "Unknown API operation 'missing'.",
    );
  });
});
