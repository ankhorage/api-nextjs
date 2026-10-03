export interface NextJsApiRouteParams {
  readonly action: string | readonly string[];
}

export interface NextJsApiRouteContext {
  readonly params: NextJsApiRouteParams | Promise<NextJsApiRouteParams>;
}

export interface NextJsApiRoute {
  POST(request: Request, context: NextJsApiRouteContext): Promise<Response>;
}
