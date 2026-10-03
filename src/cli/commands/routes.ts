import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import type { AnkhCommandHandler } from "@ankhorage/ankh";
import { resolveApiOperationBindings } from "@ankhorage/api";

/*** Inspect the nextjs route projection for one portable internal REST API definition. */
export const runRoutesCommandAsync: AnkhCommandHandler = async (request) => {
  const [definitionPath] = request.argv;
  if (definitionPath === undefined || request.argv.length !== 1) {
    request.context.writeStderr(
      "Usage: ankh api-nextjs routes <api-definition.json>\n",
    );
    return { exitCode: 1 };
  }

  try {
    const absolutePath = resolve(request.context.cwd, definitionPath);
    const definition = JSON.parse(
      await readFile(absolutePath, "utf8"),
    ) as Parameters<typeof resolveApiOperationBindings>[0];
    const routes = resolveApiOperationBindings(definition).map((binding) => ({
      operationId: binding.operationId,
      method: binding.method,
      path: binding.path,
      adapter: "nextjs",
    }));

    request.context.writeStdout(`${JSON.stringify(routes, null, 2)}\n`);
    return { exitCode: 0 };
  } catch (error) {
    request.context.writeStderr(
      `${error instanceof Error ? error.message : String(error)}\n`,
    );
    return { exitCode: 1 };
  }
};
