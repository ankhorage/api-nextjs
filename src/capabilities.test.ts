import { isCapability } from "@ankhorage/contracts/capabilities";
import { describe, expect, test } from "bun:test";

import packageJson from "../package.json" with { type: "json" };
import { CAPABILITIES } from "./capabilities/index.js";
import { createApiAdapterCliProvider } from "./cli/createApiAdapterCliProvider.js";

const packageCapabilities = packageJson.ankh.capabilities;

describe("api-nextjs capabilities", () => {
  test("publishes one valid, uniquely identified canonical descriptor", () => {
    expect(CAPABILITIES).toHaveLength(1);
    expect(CAPABILITIES.every(isCapability)).toBeTrue();
    expect(new Set(CAPABILITIES.map((capability) => capability.id)).size).toBe(
      CAPABILITIES.length,
    );
  });

  test("keeps package metadata identical to the source catalog", () => {
    expect(JSON.stringify(packageCapabilities)).toBe(
      JSON.stringify(CAPABILITIES),
    );
    expect(
      packageCapabilities.every((capability) => typeof capability !== "string"),
    ).toBeTrue();
  });

  test("uses the source catalog and has one command for each catalog ID", () => {
    const provider = createApiAdapterCliProvider();
    const commandIds = new Set(
      provider.commands.map((command) => command.capability),
    );
    const capabilityIds = new Set(
      CAPABILITIES.map((capability) => capability.id),
    );

    expect(provider.capabilities).toBe(CAPABILITIES);
    expect(commandIds).toEqual(capabilityIds);
    expect(provider.commands).toHaveLength(CAPABILITIES.length);
  });

  test("is consumable through the public capabilities export", async () => {
    const consumer = await import("@ankhorage/api-nextjs/capabilities");

    expect(JSON.stringify(consumer.CAPABILITIES)).toBe(
      JSON.stringify(packageCapabilities),
    );
  });
});
