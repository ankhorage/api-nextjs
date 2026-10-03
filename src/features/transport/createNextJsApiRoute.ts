import { type ApiRuntime, createApiTransportHandler } from "@ankhorage/api";

import type {
  NextJsApiRouteHandler,
  NextJsApiTransportRequest,
} from "../../types/nextJs.js";
import { createNextJsApiAdapter } from "./createNextJsApiAdapter.js";
import { InvalidJsonBodyError } from "./InvalidJsonBodyError.js";

/*** Bind one runtime operation to a thin Next.js App Router route handler. */
export function createNextJsApiRoute(
  runtime: ApiRuntime,
  operationId: string,
): NextJsApiRouteHandler {
  const binding = runtime.getBinding(operationId);
  if (!binding) {
    throw new Error(`Unknown API operation: ${operationId}`);
  }

  const adapter = createNextJsApiAdapter();
  const handler = createApiTransportHandler<
    NextJsApiTransportRequest,
    Response
  >(runtime, adapter, binding);

  return async (request, context) => {
    try {
      return await handler({
        request,
        ...(context === undefined ? {} : { context }),
      });
    } catch (error) {
      if (error instanceof InvalidJsonBodyError) {
        return invalidJsonResponse(operationId);
      }
      throw error;
    }
  };
}

/*** Return the stable HTTP diagnostic for malformed JSON request bodies. */
function invalidJsonResponse(operationId: string): Response {
  return new Response(
    JSON.stringify({
      error: {
        code: "invalid_json",
        operationId,
      },
    }),
    {
      status: 400,
      headers: { "content-type": "application/json; charset=utf-8" },
    },
  );
}
