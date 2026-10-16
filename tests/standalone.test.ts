import { mkdir, mkdtemp, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "bun:test";

const repositoryRoot = fileURLToPath(new URL("..", import.meta.url));

test("installs the packed adapter into a fresh consumer", async () => {
  const temporaryDirectory = await mkdtemp(
    join(tmpdir(), "api-nextjs-consumer-"),
  );
  const packageDirectory = join(temporaryDirectory, "package");
  const consumerDirectory = join(temporaryDirectory, "consumer");

  try {
    await runAsync(
      ["bun", "pm", "pack", "--destination", packageDirectory, "--quiet"],
      repositoryRoot,
    );
    const [tarball] = await readdir(packageDirectory);
    if (tarball === undefined)
      throw new Error("Expected the packed package tarball.");

    await mkdir(consumerDirectory, { recursive: true });
    await writeFile(
      join(consumerDirectory, "package.json"),
      JSON.stringify({
        name: "api-nextjs-consumer",
        private: true,
        type: "module",
      }),
    );
    await runAsync(
      ["bun", "add", `file:${join(packageDirectory, tarball)}`],
      consumerDirectory,
    );
    const result = await runAsync(
      [
        "bun",
        "--eval",
        "import { createNextJsApiRoute } from '@ankhorage/api-nextjs'; import { CAPABILITIES } from '@ankhorage/api-nextjs/capabilities'; if (typeof createNextJsApiRoute !== 'function' || CAPABILITIES[0]?.id !== 'api-nextjs.routes') process.exit(1);",
      ],
      consumerDirectory,
    );

    expect(result.exitCode).toBe(0);
  } finally {
    await rm(temporaryDirectory, { force: true, recursive: true });
  }
});

/*** Run one command in an isolated fresh-consumer directory. */
async function runAsync(
  command: readonly string[],
  cwd: string,
): Promise<{ readonly exitCode: number }> {
  const process = Bun.spawn(command, { cwd, stderr: "pipe", stdout: "pipe" });
  const exitCode = await process.exited;
  if (exitCode !== 0) {
    throw new Error(await new Response(process.stderr).text());
  }
  return { exitCode };
}
