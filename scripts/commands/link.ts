import assert from "node:assert";
import { each as asyncEach } from "async";
import type { Command } from "commander";

import { Label } from "../logger";
import type { Link } from "../path";
import { LinkType } from "../path";
import BaseCommand from "./base";

export type Args = null;

export interface Options {
  dryRun?: boolean;
}

const POWERSHELL_BIN = "pwsh.exe";
const GAME_SRCS = ["resource", "scripts", "addoninfo.txt"];

export default class LinkCommand extends BaseCommand<Args, Options> {
  override subcommand(parent: Command): Command {
    return parent
      .command("link")
      .description("Link source code paths to Dota 2 addon paths")
      .option("-n, --dry-run", "Only print paths that would be linked", false);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  override parseArgs(..._args: unknown[]): Args {
    return null;
  }

  override async run(): Promise<void> {
    const { rootDir: rootPath, dota2 } = this.config;

    this.log.info("Linking custom game");
    this.log
      .label(Label.Link)
      .field("src", rootPath)
      .field("dest", dota2.baseDir)
      .debug("base directories");

    const links = await this.findLinks();

    await asyncEach(links, async (link) => await this.mklink(link));
  }

  async findLinks(): Promise<Link[]> {
    return [...(await this.contentLinks()), ...(await this.gameLinks())];
  }

  async contentLinks(): Promise<Link[]> {
    const { sources, customGame } = this.config;

    return [
      {
        type: LinkType.Symbolic,
        src: sources.contentDir,
        dest: customGame.contentDir,
      },
    ];
  }

  async gameLinks(): Promise<Link[]> {
    const {
      sources: { gameDir: srcDir },
      customGame: { gameDir: destDir },
    } = this.config;

    return GAME_SRCS.map((relPath) => ({
      type: LinkType.Symbolic,
      src: srcDir.join(relPath),
      dest: destDir.join(relPath),
    }));
  }

  // TODO: implement links on unix
  async mklink(link: Link): Promise<void> {
    const { src, dest } = link;
    const { rootDir, dota2 } = this.config;

    const log = this.log
      .label(Label.Link)
      .field("src", rootDir.relative(src))
      .field("dest", dota2.baseDir.relative(dest));

    if (this.options.dryRun) {
      log.info("skip (dry run)");
      return;
    }

    if (await dest.exists()) {
      // TODO: check if dest is a link pointing to src
      log.info("skip (already exists)");
      return;
    }

    const srcSt = await src.stat();

    if (srcSt.isDirectory()) {
      link.type = LinkType.Junction;

      await dest.dirname().mkdir({ recursive: true });
      await this.pwshLink(link);
    } else if (srcSt.isFile()) {
      link.type = LinkType.Hard;
      // NOTE: it seems regular hard-link from WSL works, so avoid spawning a process
      await src.link(dest);
    } else {
      throw new Error(`${src}: invalid link source (not a file or directory)`);
    }

    log.field("type", link.type).info("created");
  }

  async pwshLink({ src, dest, type }: Link): Promise<void> {
    assert(src.isWslPosix());
    assert(dest.isWslPosix());

    const winSrc = src.windows({ absolute: true });
    const destDir = dest.dirname();
    const winDestDir = destDir.windows({ absolute: true });
    const winDest = `${winDestDir}\\${dest.basename()}`;
    const args = [
      "-Command",
      `New-Item -ItemType '${type}' -Path '${winDest}' -Target '${winSrc}'`,
    ];

    this.exec(POWERSHELL_BIN, args, { log: this.log });
  }
}
