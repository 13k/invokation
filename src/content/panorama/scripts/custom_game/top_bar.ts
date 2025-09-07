import type { FacetVariant, FacetId } from "@invokation/panorama-lib/dota2/invoker";
import type { PlayerHero, PlayerHeroInGame, PlayerHeroFacetResponse } from "@invokation/panorama-lib/custom_events";
import { CustomGameEvent } from "@invokation/panorama-lib/custom_events";

import type { Elements } from "./component";
import { Component } from "./component";
import { LayoutId } from "./layout";

export interface TopBarElements extends Elements {
  dropdownFacet: Panel;
  btnShowGameInfo: Button;
  btnQuit: Button;
  btnDebug: Button;
}

enum PanelId {
  PopupGameInfo = "PopupGameInfo",
}

enum CssClass {
  Netgraph = "Netgraph",
}

export type { TopBar };

class TopBar extends Component<TopBarElements> {
  hero: PlayerHero | undefined = undefined;

  constructor() {
    super({
      elements: {
        dropdownFacet: "DropdownHeroFacet",
        btnShowGameInfo: "BtnShowGameInfo",
        btnQuit: "BtnQuit",
        btnDebug: "BtnDebug",
      },
      panelEvents: {
        btnShowGameInfo: { onactivate: () => this.onBtnShowGameInfo() },
        btnQuit: { onactivate: () => this.onBtnQuit() },
        btnDebug: { onactivate: () => this.onBtnDebug() },
      },
      uiEvents: {
        // @ts-ignore
        dropdownFacet: {
          // @ts-ignore
          "DOTAHeroFacetDropdownFacetSelected": (id: HeroID, variant: FacetVariant) => {
            this.onFacetSelect(id, variant);
          },
        },
      },
      customEvents: {
        [CustomGameEvent.PlayerHeroInGame]: (payload) => this.onHeroInGame(payload),
        [CustomGameEvent.PlayerHeroFacetResponse]: (resp) => this.onFacetSelectResponse(resp),
      },
    });

    if (Game.GetConvarBool("dota_hud_netgraph")) {
      this.panel.AddClass(CssClass.Netgraph);
    }

    const hero = GameUI.CustomUIConfig().invk.hero;

    if (hero != null) {
      this.hero = hero;
      this.updateHeroFacet(hero.id, hero.facet);
    }

    this.debug("init");
  }

  // ----- Helpers -----

  updateHeroFacet(id: HeroID, facet: FacetId) {
    // @ts-ignore
    this.elements.dropdownFacet.Init(id, facet);
  }

  // ----- Events -----

  onHeroInGame(payload: PlayerHeroInGame) {
    this.debug("onHeroInGame", payload);

    this.updateHeroFacet(payload.id, payload.facet);
  }

  onFacetSelect(id: HeroID, variant: FacetVariant) {
    this.debug("onFacetSelect", { id, variant });
    this.sendServer(CustomGameEvent.PlayerHeroFacetRequest, { variant });
  }

  onFacetSelectResponse(resp: PlayerHeroFacetResponse) {
    this.debug("onFacetSelectResponse", resp);

    if (resp.error != null) {
      this.hudError(resp.error, "General.InvalidTarget_Invulnerable");

      if (this.hero != null) {
        this.updateHeroFacet(this.hero.id, this.hero.facet);
      }
    } else {
      this.hero = resp.hero;
    }
  }

  // ----- UI methods -----

  onBtnShowGameInfo(): void {
    this.debug("onBtnShowGameInfo");
    this.showPopup(this.panel, LayoutId.PopupGameInfo, PanelId.PopupGameInfo);
  }

  onBtnQuit(): void {
    this.debug("onBtnQuit");
    this.sendServer(CustomGameEvent.PlayerQuitRequest, {});
  }

  onBtnDebug(): void {
    this.debug("onBtnDebug");
  }
}

(() => {
  new TopBar();
})();
