import {
  createApiTransportHandler,
  type ApiRequest,
  type ApiResponse,
  type ApiRuntime,
  type ApiTransportAdapter,
} from '@ankhorage/api';

/*** Create one Next.js App Router handler for a canonical API operation id. */
export function createNextJsApiHandler(
  runtime: ApiRuntime,
  operationId: string,
): (request: Request) => Promise<Response> {
  const binding = runtime.getBinding(operationId);
  if (binding === undefined) {
    throw new Error(`Unknown API operation '${operationId}'.`);
  }

  const handler = createApiTransportHandler(runtime, NEXTJS_API_TRANSPORT, binding);
  return async (request) => {
    try {
      return await handler(request);
    } catch (error) {
      if (error instanceof InvalidJsonBodyError) {
        return createJsonResponse(400, {
          error: { code: 'invalid_json', operationId },
        });
      }
      throw error;
    }
  };
}

const NEXTJS_API_TRANSPORT: ApiTransportAdapter<Request, Response> = {
  toApiRequestAsync: async (request, binding) => ({
    operationId: binding.operationId,
    method: request.method,
    params: {},
    query: readQuery(new URL(request.url).searchParams),
    headers: Object.fromEntries(request.headers.entries()),
    ...(await readBodyAsync(request)),
  }),
  fromApiResponseAsync: async (response) => createResponse(response),
};

/*** Read a Next request body while preserving empty bodies and parsing JSON content. */
async function readBodyAsync(request: Request): Promise<Pick<ApiRequest, 'body'>> {
  if (request.method === 'GET' || request.method === 'HEAD') return {};
  const text = await request.text();
  if (text.length === 0) return {};
  if (!request.headers.get('content-type')?.includes('application/json')) {
    return { body: text };
  }

  try {
    return { body: JSON.parse(text) as unknown };
  } catch {
    throw new InvalidJsonBodyError();
  }
}

/*** Convert URL search params to the canonical query contract while retaining repeated values. */
function readQuery(searchParams: URLSearchParams): ApiRequest['query'] {
  return [...new Set(searchParams.keys())].reduce<ApiRequest['query']>(
    (query, key) => {
      const values = searchParams.getAll(key);
      return {
        ...query,
        [key]: values.length === 1 ? (values[0] ?? '') : values,
      };
    },
    {},
  );
}

/*** Convert the framework-neutral API response to a standard Response accepted by Next.js. */
function createResponse(response: ApiResponse): Response {
  if (response.body === undefined) {
    return new Response(null, { status: response.status, headers: response.headers });
  }
  if (typeof response.body === 'string') {
    return new Response(response.body, { status: response.status, headers: response.headers });
  }
  return createJsonResponse(response.status, response.body, response.headers);
}

/*** Serialize one JSON response without discarding runtime-provided headers. */
function createJsonResponse(
  status: number,
  body: unknown,
  headers: Readonly<Record<string, string>> = {},
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...headers,
    },
  });
}

class InvalidJsonBodyError extends Error {}
