import { createApiRuntime } from "@ankhorage/api";
import { describe, expect, test } from "bun:test";

import { createNextJsApiRoute } from "./createNextJsApiRoute.js";

const PROJECT_RUNTIME = createApiRuntime({
  definition: {
    id: "example",
    origin: "internal",
    protocol: "rest",
    basePath: "/api",
    endpoints: {
      project: {
        id: "project",
        kind: "http",
        operations: {
          "project.read": {
            id: "project.read",
            protocol: "http",
            intent: "read",
            method: "GET",
            path: "/projects/:id",
          },
        },
      },
    },
  },
  handlers: {
    "project.read": (request) => ({
      status: 200,
      headers: { "x-operation": request.operationId },
      body: {
        id: request.params.id,
        tags: request.query.tag,
      },
    }),
  },
});

const ACTION_RUNTIME = createApiRuntime({
  definition: {
    id: "actions",
    origin: "internal",
    protocol: "rest",
    basePath: "/api",
    endpoints: {
      actions: {
        id: "actions",
        kind: "http",
        operations: {
          "dependency-graph": {
            id: "dependency-graph",
            endpointId: "actions",
            protocol: "http",
            intent: "action",
            method: "POST",
            path: "/dependency-graph",
          },
        },
      },
    },
  },
  handlers: {
    "dependency-graph": (request) => ({
      body: {
        input: request.body,
      },
    }),
  },
});

const EMPTY_RUNTIME = createApiRuntime({
  definition: {
    id: "empty",
    origin: "internal",
    protocol: "rest",
    basePath: "/api",
    endpoints: {},
  },
  handlers: {},
});

describe("createNextJsApiRoute", () => {
  test("dispatches App Router requests through the shared API runtime", async () => {
    const handler = createNextJsApiRoute(PROJECT_RUNTIME, "project.read");
    const response = await handler(
      new Request("https://example.test/api/projects/one?tag=a&tag=b"),
      { params: Promise.resolve({ id: "one" }) },
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("x-operation")).toBe("project.read");
    expect(await response.json()).toEqual({
      id: "one",
      tags: ["a", "b"],
    });
  });

  test("returns HTTP 400 for malformed JSON bodies", async () => {
    const handler = createNextJsApiRoute(
      ACTION_RUNTIME,
      "dependency-graph",
    );
    const response = await handler(
      new Request("https://example.test/api/dependency-graph", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "{bad",
      }),
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: {
        code: "invalid_json",
        operationId: "dependency-graph",
      },
    });
  });

  test("rejects unknown operation bindings at composition time", () => {
    expect(() => createNextJsApiRoute(EMPTY_RUNTIME, "missing")).toThrow(
      "Unknown API operation: missing",
    );
  });
});
