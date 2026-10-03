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

  test("rejects unknown operation bindings at composition time", () => {
    expect(() => createNextJsApiRoute(EMPTY_RUNTIME, "missing")).toThrow(
      "Unknown API operation: missing",
    );
  });
});
