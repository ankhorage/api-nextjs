import {
  areCapabilityCatalogsEqual,
  isCapability,
  isCapabilityCatalog,
} from "@ankhorage/capability";
import { describe, expect, test } from "bun:test";

import packageJson from "../package.json" with { type: "json" };
import { CAPABILITIES } from "./capabilities/index.js";
import { createApiAdapterCliProvider } from "./cli/createApiAdapterCliProvider.js";

const packageCapabilities: unknown = packageJson.ankh.capabilities;

if (!isCapabilityCatalog(packageCapabilities)) {
  throw new Error("Package metadata must contain a valid capability catalog.");
}

describe("api-nextjs capabilities", () => {
  test("publishes one valid, uniquely identified canonical descriptor", () => {
    expect(CAPABILITIES).toHaveLength(1);
    expect(CAPABILITIES.every(isCapability)).toBeTrue();
    expect(new Set(CAPABILITIES.map((capability) => capability.id)).size).toBe(
      CAPABILITIES.length,
    );
  });

  test("keeps package metadata identical to the source catalog", () => {
    expect(areCapabilityCatalogsEqual(packageCapabilities, CAPABILITIES)).toBe(
      true,
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
});
