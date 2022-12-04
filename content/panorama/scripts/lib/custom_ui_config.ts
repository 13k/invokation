import type { Cache } from "./cache";
import type { Callbacks } from "./callbacks";
import type { ComboModule as Combo } from "./combo";
import type { CombosCollection } from "./combos_collection";
import type { CombosView } from "./combos_view";
import type { Component } from "./component";
import type { Const } from "./const";
import type { CustomEvents } from "./custom_events";
import type {
  CustomNetTables,
  Key as NetTableKey,
  Name as NetTableName,
} from "./custom_net_tables";
import type { Dota2 } from "./dota2";
import type { Env } from "./env";
import type { Grid } from "./grid";
import type { L10n } from "./l10n";
import type { Layout } from "./layout";
import type { Logger } from "./logger";
import type { Lua } from "./lua";
import type { NetTable } from "./net_table";
import type { NetTableListener } from "./net_table_listener";
import type { Panorama } from "./panorama";
import type { SequenceModule as Sequence } from "./sequence";
import type { Util } from "./util";

declare global {
  const CustomUIConfig: CustomUIConfig;

  interface CustomUIConfig {
    lodash: _.LoDashStatic;

    Cache: typeof Cache;
    Callbacks: typeof Callbacks;
    Combo: Combo;
    CombosCollection: typeof CombosCollection;
    CombosView: typeof CombosView;
    Component: typeof Component;
    Const: Const;
    CustomEvents: CustomEvents;
    CustomNetTables: CustomNetTables;
    Dota2: Dota2;
    Env: typeof Env;
    Grid: typeof Grid;
    L10n: L10n;
    Layout: Layout;
    Logger: typeof Logger;
    Lua: Lua;
    NetTable: typeof NetTable;
    NetTableListener: typeof NetTableListener;
    Panorama: Panorama;
    Sequence: Sequence;
    Util: Util;

    ENV: Env;
    COMBOS: CombosCollection;
    HERO_DATA: NetTableListener<NetTableName.Invokation, NetTableKey.InvokationHeroData>;
    HERO_KV: NetTableListener<NetTableName.Hero, NetTableKey.HeroKeyValues>;
    ABILITIES_KV: NetTableListener<NetTableName.Abilities, NetTableKey.AbilitiesKeyValues>;
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const CustomUIConfig = GameUI.CustomUIConfig();
