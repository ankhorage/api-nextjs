import { describe, expect, test } from "bun:test";

import { CAPABILITIES } from "../capabilities/index.js";
import { createApiAdapterCliProvider } from "./createApiAdapterCliProvider.js";

describe("createApiAdapterCliProvider", () => {
  test("exposes the canonical routes command", () => {
    const provider = createApiAdapterCliProvider();

    expect(provider.category).toBe("api-nextjs");
    expect(provider.capabilities).toBe(CAPABILITIES);
    expect(provider.commands).toEqual([
      expect.objectContaining({
        path: ["routes"],
        capability: "api-nextjs.routes",
      }),
    ]);
    expect(provider.handlers?.[0]?.path).toEqual(["routes"]);
  });
});
