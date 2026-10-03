import type {
  ApiOperationBinding,
  ApiRequest,
  ApiResponse,
  ApiTransportAdapter,
} from "@ankhorage/api";

import type { NextJsApiTransportRequest } from "../../types/nextJs.js";

/*** Create the Next.js App Router transport mapper for the canonical Ankhorage API runtime. */
export function createNextJsApiAdapter(): ApiTransportAdapter<
  NextJsApiTransportRequest,
  Response
> {
  return {
    toApiRequestAsync,
    fromApiResponseAsync: (response) =>
      Promise.resolve(toWebResponse(response)),
  };
}

/*** Normalize one App Router request and route context into the framework-neutral API request. */
async function toApiRequestAsync(
  transport: NextJsApiTransportRequest,
  binding: ApiOperationBinding,
): Promise<ApiRequest> {
  const url = new URL(transport.request.url);
  const params = await resolveParamsAsync(transport.context);
  const body = await readBodyAsync(transport.request);

  return {
    operationId: binding.operationId,
    method: transport.request.method,
    params,
    query: readQuery(url.searchParams),
    headers: Object.fromEntries(transport.request.headers.entries()),
    ...(body === undefined ? {} : { body }),
  };
}

/*** Convert one framework-neutral API response into a standard Web Response for Next.js. */
function toWebResponse(response: ApiResponse): Response {
  const headers = new Headers(response.headers);
  if (response.body === undefined) {
    return new Response(null, { status: response.status, headers });
  }
  if (typeof response.body === "string") {
    return new Response(response.body, { status: response.status, headers });
  }
  if (!headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }
  return new Response(JSON.stringify(response.body), {
    status: response.status,
    headers,
  });
}

/*** Resolve synchronous or Promise-based Next.js App Router params to scalar API params. */
async function resolveParamsAsync(
  context: NextJsApiTransportRequest["context"],
): Promise<Readonly<Record<string, string>>> {
  const params = await context?.params;
  if (!params) return {};

  return Object.fromEntries(
    Object.entries(params).flatMap(([name, value]) =>
      typeof value === "string" ? [[name, value] as const] : [],
    ),
  );
}

/*** Preserve repeated query parameters as arrays while keeping scalar values compact. */
function readQuery(
  searchParams: URLSearchParams,
): Readonly<Record<string, string | readonly string[]>> {
  const names = [...new Set(searchParams.keys())];
  return Object.fromEntries(
    names.map((name) => {
      const values = searchParams.getAll(name);
      return [name, values.length === 1 ? (values[0] ?? "") : values] as const;
    }),
  );
}

/*** Decode JSON/text request bodies while leaving methods without bodies undefined. */
async function readBodyAsync(request: Request): Promise<unknown> {
  if (request.method === "GET" || request.method === "HEAD") return undefined;
  const text = await request.text();
  if (text.length === 0) return undefined;

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return text;

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}
