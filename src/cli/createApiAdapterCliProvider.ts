import type { AnkhRuntimeCommandProvider } from "@ankhorage/ankh";
import type { Capability } from "@ankhorage/contracts/capabilities";

import packageJson from "../../package.json" with { type: "json" };
import { CAPABILITIES } from "../capabilities/index.js";
import { runRoutesCommandAsync } from "./commands/routes.js";

/*** Create the Ankh provider for api-nextjs adapter inspection commands. */
export function createApiAdapterCliProvider(): AnkhRuntimeCommandProvider {
  return {
    id: packageJson.name,
    category: "api-nextjs",
    version: packageJson.version,
    capabilities: CAPABILITIES,
    commands: [
      {
        path: ["routes"],
        capability: "api-nextjs.routes" satisfies Capability["id"],
        summary:
          "Inspect the Next.js App Router binding projection for a portable internal REST API definition.",
      },
    ],
    handlers: [
      {
        path: ["routes"],
        handler: runRoutesCommandAsync,
      },
    ],
  };
}
