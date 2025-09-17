import temp from "temp";

import { capture, exec } from "../../exec";
import type { Logger } from "../../logger";
import { Label } from "../../logger";
import { Path } from "../../path";

export interface BuildOptions {
  force?: boolean;
  log?: Logger;
}

async function grass(srcPath: Path, destPath: Path, log?: Logger): Promise<void> {
  exec("grass", [srcPath.toString(), destPath.toString()], { echo: true, log });
}

interface BuildInfo {
  files: string[];
  version: string;
}

interface Source {
  srcDir: Path;
  srcPath: Path;
  srcRelPath: Path;
  destPath?: Path;
  destRelPath?: Path;
}

interface Artifact extends Source {
  buildPath: Path;
  destPath: Path;
  destRelPath: Path;
}

function isArtifact(src: Source): src is Artifact {
  return src.destPath != null;
}

export async function build(
  srcDir: Path,
  destDir: Path,
  options?: BuildOptions,
): Promise<void> {
  const force = options?.force ?? false;
  const log = options?.log;

  const infoPath = srcDir.join("build.json");
  const srcPaths = await srcDir.glob("**/*.scss", { nodir: true });
  const sources: Source[] = srcPaths.map((srcPath) => {
    const filename = `${srcPath.basename(".scss")}.css`;
    const srcRelPath = srcDir.relative(srcPath);
    const srcRelDir = srcRelPath.dirname();

    // partial
    if (srcPath.basename().toString().startsWith("_")) {
      const src: Source = {
        srcDir,
        srcPath,
        srcRelPath,
      };

      return src;
    }

    const destRelPath = srcRelDir.join(filename);
    const destPath = destDir.join(destRelPath);
    const src: Source = {
      srcDir,
      srcPath,
      srcRelPath,
      destPath,
      destRelPath,
    };

    return src;
  });

  let dirty = false;

  if (!force) {
    if (await infoPath.exists()) {
      const infoSt = await infoPath.stat();

      for (const src of sources) {
        if (isArtifact(src) && (!await src.destPath.exists())) {
          dirty = true;
          break;
        }

        const st = await src.srcPath.stat();

        if (st.mtime > infoSt.mtime) {
          dirty = true;
          break;
        }
      }
    } else {
      dirty = true;
    }
  }

  dirty ||= force;

  if (!dirty) {
    log?.info("No files need building");

    return;
  }

  const version = capture("grass", ["--version"], { log })
    .replace("grass ", "")
    .trimEnd();

  const info: BuildInfo = {
    files: [],
    version,
  };

  const buildDir = Path.new(await temp.mkdir("invk.grass-build."));

  log?.fields({ buildDir }).debug("grass build");

  for (const src of sources) {
    // skip partials
    if (!isArtifact(src)) {
      continue;
    }

    src.buildPath = buildDir.join(src.destRelPath);

    log
      ?.label(Label.BuildStep)
      .fields({ src: src.srcRelPath, dest: src.destRelPath })
      .info("artifact");

    await src.buildPath.dirname().mkdir({ recursive: true });
    await grass(src.srcPath, src.buildPath, log);
    await postProcess(src);

    info.files.push(src.srcRelPath.toString());
  }

  const infoJson = JSON.stringify(info, null, 2);

  await infoPath.writeFile(infoJson);
}

const KEYFRAMES_RE = /@keyframes\s+"([^"]+)"/g;

// FIXME: this is garbage
async function postProcess(artifact: Artifact): Promise<void> {
  const src = await artifact.buildPath.readFile();

  // @keyframes must always be single-quote quoted
  const modified = src.replaceAll(KEYFRAMES_RE, "@keyframes '$1'");

  await artifact.destPath.writeFile(modified);
}
