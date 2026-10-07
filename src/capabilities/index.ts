import type { Capability } from "@ankhorage/contracts/capabilities";

/*** Publish the Next.js adapter-inspection capabilities available to Ankh consumers. */
export const CAPABILITIES = [
  {
    id: "api-nextjs.routes",
    owner: "@ankhorage/api-nextjs",
    access: ["invoke"],
    binding: {
      kind: "action",
      bindableAs: ["target"],
    },
    label: "Inspect Next.js routes",
    description:
      "Inspect the Next.js App Router binding projection for a portable internal REST API definition.",
  },
] as const satisfies readonly Capability[];
