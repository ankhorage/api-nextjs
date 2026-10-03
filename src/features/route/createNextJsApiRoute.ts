import type { Api, ApiDispatchFailureCode } from '@ankhorage/api';

import type { NextJsApiRoute, NextJsApiRouteContext } from '../../types/nextjsApi.js';

/*** Create a Next.js App Router POST route that dispatches one canonical API action. */
export function createNextJsApiRoute(api: Api): NextJsApiRoute {
  return {
    POST: async (request, context) => {
      const action = await readActionAsync(context);
      if (action === undefined) {
        return jsonResponse(400, {
          ok: false,
          code: 'invalid-action',
          message: 'Exactly one API action route segment is required.',
        });
      }

      const parsedInput = await readJsonInputAsync(request);
      if (!parsedInput.ok) return parsedInput.response;

      const endpointId = new URL(request.url).searchParams.get('endpoint') ?? undefined;
      const result = await api.executeAsync({
        operationId: action,
        ...(endpointId === undefined ? {} : { endpointId }),
        ...(parsedInput.value === undefined ? {} : { input: parsedInput.value }),
        signal: request.signal,
      });

      return result.ok
        ? jsonResponse(200, result)
        : jsonResponse(resolveFailureStatus(result.code), result);
    },
  };
}

type ParsedInput =
  | { readonly ok: true; readonly value?: unknown }
  | { readonly ok: false; readonly response: Response };

/*** Read an optional JSON request body without treating an empty body as invalid JSON. */
async function readJsonInputAsync(request: Request): Promise<ParsedInput> {
  const text = await request.text();
  if (text.trim() === '') return { ok: true };

  try {
    return { ok: true, value: JSON.parse(text) as unknown };
  } catch {
    return {
      ok: false,
      response: jsonResponse(400, {
        ok: false,
        code: 'invalid-json',
        message: 'Request body must be valid JSON.',
      }),
    };
  }
}

/*** Resolve one action id from the dynamic App Router route parameter. */
async function readActionAsync(context: NextJsApiRouteContext): Promise<string | undefined> {
  const params = await context.params;
  if (typeof params.action === 'string') return params.action.length > 0 ? params.action : undefined;
  return params.action.length === 1 && params.action[0] !== undefined
    ? params.action[0]
    : undefined;
}

/*** Map framework-neutral API dispatch failures to HTTP transport status codes. */
function resolveFailureStatus(code: ApiDispatchFailureCode): number {
  switch (code) {
    case 'endpoint-required':
      return 400;
    case 'endpoint-not-found':
    case 'operation-not-found':
      return 404;
    case 'handler-not-found':
      return 501;
    case 'handler-error':
      return 500;
  }
}

/*** Serialize one JSON response with the canonical content type. */
function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}
