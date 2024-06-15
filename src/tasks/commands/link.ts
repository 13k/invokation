import { each as asyncEach } from "async";
import type { Command } from "commander";

import { Link, LinkType } from "../fs";
import { Label } from "../logger";
import { BaseCommand } from "./base";

export type Args = null;

export interface Options {
  dryRun?: boolean;
  // wslNetworkDrive?: string;
}

export class LinkCommand extends BaseCommand<Args, Options> {
  override subcommand(parent: Command): Command {
    return parent
      .command("link")
      .description("Link source code paths to Dota 2 addon paths")
      .option("-n, --dry-run", "Only print paths that would be linked", false);
    // .option(
    //   "-w, --wsl-network-drive <drive>",
    //   "Creates links through a WSL network mounted drive",
    // )
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  override parseArgs(..._args: unknown[]): Args {
    return null;
  }

  override async run(): Promise<void> {
    const { rootDir: rootPath, sources, dota2, customGame } = this.config;

    this.log.fields({ baseSrc: rootPath, baseDest: dota2.baseDir }).info("Link");

    const links = [
      new Link({
        type: LinkType.Junction,
        src: sources.contentDir,
        dest: customGame.contentDir,
      }),
      new Link({
        type: LinkType.Junction,
        src: sources.gameDir,
        dest: customGame.gameDir,
      }),
    ];

    await asyncEach(links, async (link) => await this.#createLink(link));
  }

  async #createLink(link: Link): Promise<void> {
    const { rootDir, dota2 } = this.config;
    const { src, dest } = link;
    const { dryRun /*, wslNetworkDrive */ } = this.options;

    const log = this.log.label(Label.Link).fields({
      srcPath: rootDir.relative(src),
      destPath: dota2.baseDir.relative(dest),
    });

    if (dryRun) {
      log.info("skip (dry run)");
      return;
    }

    if (await link.create({ log: this.log /*, wslNetworkDrive */ })) {
      log.field("type", link.type).info("created");
    } else {
      log.info("skip (already exists)");
    }
  }
}
