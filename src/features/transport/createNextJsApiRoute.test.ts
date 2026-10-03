import { createApiRuntime } from "@ankhorage/api";
import { describe, expect, test } from "bun:test";

import { createNextJsApiRoute } from "./createNextJsApiRoute.js";

describe("createNextJsApiRoute", () => {
  test("dispatches App Router requests through the shared API runtime", async () => {
    const runtime = createApiRuntime({
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

    const handler = createNextJsApiRoute(runtime, "project.read");
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
    const runtime = createApiRuntime({
      definition: {
        id: "empty",
        origin: "internal",
        protocol: "rest",
        basePath: "/api",
        endpoints: {},
      },
      handlers: {},
    });

    expect(() => createNextJsApiRoute(runtime, "missing")).toThrow(
      "Unknown API operation: missing",
    );
  });
});
