# Public API

## createNextJsApiAdapter

Kind: `function`
Module: `src/features/transport/createNextJsApiAdapter.ts`
Source: `src/features/transport/createNextJsApiAdapter.ts:12:1`

Create the Next.js App Router transport mapper for the canonical Ankhorage API runtime.

### Signatures

- `() => ApiTransportAdapter<NextJsApiTransportRequest, Response>`
  - returns: `ApiTransportAdapter<NextJsApiTransportRequest, Response>`

## createNextJsApiRoute

Kind: `function`
Module: `src/features/transport/createNextJsApiRoute.ts`
Source: `src/features/transport/createNextJsApiRoute.ts:11:1`

Bind one runtime operation to a thin Next.js App Router route handler.

### Signatures

- `(runtime: ApiRuntime, operationId: string) => NextJsApiRouteHandler`
  - operationId: `string`
  - runtime: `ApiRuntime`
  - returns: `NextJsApiRouteHandler`

## NextJsApiRouteHandler

Kind: `unknown`
Module: `src/types/nextJs.ts`
Source: `src/types/nextJs.ts:12:1`

## NextJsApiTransportRequest

Kind: `type`
Module: `src/types/nextJs.ts`
Source: `src/types/nextJs.ts:7:1`

### Members

| Name | Kind | Type | Required | Description |
| --- | --- | --- | --- | --- |
| context | property | `NextJsRouteContext` | no |  |
| request | property | `Request` | yes |  |

## NextJsRouteContext

Kind: `type`
Module: `src/types/nextJs.ts`
Source: `src/types/nextJs.ts:1:1`

### Members

| Name | Kind | Type | Required | Description |
| --- | --- | --- | --- | --- |
| params | property | `Readonly<Record<string, string \| readonly string[]>> \| Promise<Readonly<Record<string, string \| readonly string[]>>>` | no |  |
