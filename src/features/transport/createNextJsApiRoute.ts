import { type ApiRuntime, createApiTransportHandler } from "@ankhorage/api";

import type {
  NextJsApiRouteHandler,
  NextJsApiTransportRequest,
} from "../../types/nextJs.js";
import { createNextJsApiAdapter } from "./createNextJsApiAdapter.js";

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

  return (request, context) =>
    handler({
      request,
      ...(context === undefined ? {} : { context }),
    });
}
