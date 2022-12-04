import * as path from "node:path";
import * as fs from "fs/promises";
import { inspect } from "node:util";

import { each as asyncEach } from "async";
import type { Command } from "commander";
import * as fse from "fs-extra";

import type { ConfigOptions } from "../config.mjs";
import { Label } from "../logger.mjs";
import Base from "./base.mjs";

export interface Options {
  dryRun?: boolean;
}

enum LinkType {
  SymbolicLink = "SymbolicLink",
  HardLink = "HardLink",
  Junction = "Junction",
}

interface Link {
  src: string;
  dest: string;
  type?: LinkType;
}

const POWERSHELL_BIN = "pwsh.exe";

export default class LinkCommand extends Base<Options> {
  static subcommand(parent: Command, configOptions: ConfigOptions) {
    const command = parent
      .command("link")
      .description(`Link source code paths to Dota 2 addon paths`)
      .option(`-n, --dry-run`, `Only print paths that would be linked`, false)
      .action(async () => await new LinkCommand(command.opts(), configOptions).run());
  }

  constructor(options: Options, configOptions: ConfigOptions) {
    super([], options, configOptions);
  }

  override async run() {
    const { rootPath, dota2 } = this.config;

    this.log.info("Linking custom game");
    this.log
      .emojify()
      .field("src", rootPath)
      .field("dest", dota2.path)
      .debug(":link: base directories");

    const links = await this.findLinks();

    await asyncEach(links, async (link) => await this.mklink(link));
  }

  async pwshLink({ src, dest, type }: Link) {
    const linkType = type || LinkType.SymbolicLink;
    const winSrc = await this.windowsPath(src, { absolute: true });
    const destDir = path.dirname(dest);
    const winDestDir = await this.windowsPath(destDir, { absolute: true });
    const winDest = `${winDestDir}\\${path.basename(dest)}`;
    const args = [
      "-Command",
      `New-Item -ItemType '${linkType}' -Path '${winDest}' -Target '${winSrc}'`,
    ];

    this.log.field("cmd", inspect([POWERSHELL_BIN, ...args])).debug("pwsh link");

    await this.exec(POWERSHELL_BIN, args);
  }

  async mklink(link: Link) {
    const { src, dest } = link;
    const { rootPath, dota2 } = this.config;

    const log = this.log
      .label(Label.Link)
      .field("src", path.relative(rootPath, src))
      .field("dest", path.relative(dota2.path, dest));

    if (this.options.dryRun) {
      log.info(`skip (dry run)`);
      return;
    }

    if (await fse.pathExists(dest)) {
      // TODO: check if dest is a link pointing to src
      log.info(`skip (already exists)`);
      return;
    }

    const srcSt = await fs.stat(src);

    if (srcSt.isDirectory()) {
      link.type = LinkType.Junction;

      await fse.mkdirp(path.dirname(dest));
      await this.pwshLink(link);
    } else if (srcSt.isFile()) {
      link.type = LinkType.HardLink;

      await fse.ensureLink(link.src, link.dest);
    } else {
      throw new Error(`${src}: invalid link source (not a file or directory)`);
    }

    // await fse.mkdirp(path.dirname(dest));
    // await this.pwshLink(link);

    log.field("type", link.type).info(`created`);
  }

  async findLinks() {
    const { sources, customGame } = this.config;
    const contentLinks: Link[] = [{ src: sources.contentPath, dest: customGame.contentPath }];
    const gameFiles = await this.glob(path.join(sources.gamePath, "*"), { strict: true });
    const gameLinks: Link[] = gameFiles.map((src) => {
      const relPath = path.relative(sources.gamePath, src);
      const dest = path.join(customGame.gamePath, relPath);

      return { src, dest };
    });

    return [...contentLinks, ...gameLinks];
  }
}
