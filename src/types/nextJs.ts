export interface NextJsRouteContext {
  readonly params?:
    | Readonly<Record<string, string | readonly string[]>>
    | Promise<Readonly<Record<string, string | readonly string[]>>>;
}

export interface NextJsApiTransportRequest {
  readonly request: Request;
  readonly context?: NextJsRouteContext;
}

export type NextJsApiRouteHandler = (
  request: Request,
  context?: NextJsRouteContext,
) => Promise<Response>;
