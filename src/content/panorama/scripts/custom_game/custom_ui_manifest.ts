import "@invokation/panorama-lib/api";

import { CombosCollection } from "@invokation/panorama-lib/combo/combos_collection";
import type { PlayerHeroInGame } from "@invokation/panorama-lib/custom_events";
import { CustomGameEvent } from "@invokation/panorama-lib/custom_events";
import {
  AbilitiesKeyValues,
  HeroData,
  HeroKeyValues,
} from "@invokation/panorama-lib/net_table/key_listener";
import { CONFIG } from "@invokation/panorama-lib/ui";

import { Component } from "./component";

GameUI.CustomUIConfig().invk = {
  // biome-ignore lint/style/useNamingConvention: constant
  ABILITIES_KV: new AbilitiesKeyValues(),
  // biome-ignore lint/style/useNamingConvention: constant
  COMBOS: new CombosCollection(),
  // biome-ignore lint/style/useNamingConvention: constant
  HERO_DATA: new HeroData(),
  // biome-ignore lint/style/useNamingConvention: constant
  HERO_KV: new HeroKeyValues(),

  hero: null,
};

export type { CustomUiManifest };

class CustomUiManifest extends Component {
  constructor() {
    super({
      customEvents: {
        [CustomGameEvent.PlayerHeroInGame]: (payload) => this.onHeroInGame(payload),
      },
    });

    for (const [key, value] of Object.entries(CONFIG)) {
      this.setUi(key as keyof typeof DotaDefaultUIElement_t, value);
    }

    this.debug("init");
  }

  onHeroInGame(payload: PlayerHeroInGame) {
    this.debug("onHeroInGame", payload);

    GameUI.CustomUIConfig().invk.hero = payload;
  }
}

(() => {
  new CustomUiManifest();
})();
