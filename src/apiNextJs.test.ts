import { describe, expect, test } from "bun:test";

import {
  createNextJsApiAdapter,
  createNextJsApiRoute,
} from "./apiNextJs.js";

describe("@ankhorage/api-nextjs public entrypoint", () => {
  test("exports the canonical adapter operations", () => {
    expect(createNextJsApiAdapter).toBeFunction();
    expect(createNextJsApiRoute).toBeFunction();
  });
});
