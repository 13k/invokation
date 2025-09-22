import type { Logger } from "../../logger";
import { Label } from "../../logger";
import type { Path } from "../../path";

interface Source {
  srcPath: Path;
  srcRelPath: Path;
  destPath: Path;
  destRelPath: Path;
}

export async function build(srcDir: Path, destDir: Path, log?: Logger): Promise<void> {
  const srcPaths = await srcDir.glob("**/*.ts", { nodir: true });
  const sources = srcPaths.map((srcPath) => {
    const filename = `${srcPath.basename(".ts")}.js`;
    const srcRelPath = srcDir.relative(srcPath);
    const srcRelDir = srcRelPath.dirname();
    const destRelPath = srcRelDir.join(filename);
    const destPath = destDir.join(destRelPath);

    const src: Source = {
      srcPath,
      srcRelPath,
      destPath,
      destRelPath,
    };

    return src;
  });

  const entrypoints = sources.map(src => src.srcPath.toString());

  const build = await Bun.build({
    throw: true,
    target: "browser",
    format: "esm",
    root: srcDir.toString(),
    outdir: destDir.toString(),
    entrypoints,
    sourcemap: "inline",
    minify: false,
    banner: `
((root) => {
  root.globalThis = root.global = root;
})(this);
`,
  });

  if (log != null && build.logs.length > 0) {
    for (const message of build.logs) {
      log.warn(message);
    }
  }

  for (const src of sources) {
    log
      ?.label(Label.BuildStep)
      .fields({ src: src.srcRelPath, dest: src.destRelPath })
      .info("artifact");
  }
}
