import type { BuildArtifact } from "bun";

import { Label, type Logger } from "../../logger";
import type { Path } from "../../path";

export async function build(srcDir: Path, outDir: Path, log?: Logger): Promise<void> {
  log?.label(Label.Compile).fields({ srcDir, outDir }).info("bun building");

  const glob = new Bun.Glob("**/*.ts");
  const paths = await Array.fromAsync(glob.scan(srcDir.toString()));
  const entrypoints = paths.map((p) => srcDir.join(p).toString());

  log?.fields({ entrypoints }).debug("entrypoints");

  const build = await Bun.build({
    target: "browser",
    format: "esm",
    entrypoints,
    root: srcDir.toString(),
    outdir: outDir.toString(),
    sourcemap: "inline",
    minify: { syntax: true },
  });

  if (!build.success) {
    throw new AggregateError(build.logs, "Build failed");
  }

  for (const artifact of build.outputs) {
    if (artifact.kind === "entry-point") {
      // FIXME: this is garbage
      postProcess(artifact);
    }

    log?.fields({ path: artifact.path }).debug("artifact");
  }
}

async function postProcess(artifact: BuildArtifact): Promise<void> {
  const src = await artifact.text();
  const modified = `
((root) => {
  root.globalThis = root.global = root;
})(this);

${src}
`;

  await Bun.write(artifact.path, modified);
}
