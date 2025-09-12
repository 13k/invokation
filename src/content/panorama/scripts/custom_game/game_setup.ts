import { CustomGameEvent, GameEvent } from "@invokation/panorama-lib/custom_events";
import type { Facet, FacetId, FacetVariant } from "@invokation/panorama-lib/dota2/invoker";
import { FacetVariantObject, ParseFacetVariant, HERO_ID } from "@invokation/panorama-lib/dota2/invoker";
import type { FacetDropDown } from "@invokation/panorama-lib/panorama";
import { UiEvent } from "@invokation/panorama-lib/panorama";

import type { Elements } from "./component";
import { Component } from "./component";

enum PanelId {
  FacetPicker = "facet-picker",
  BtnPlay = "play",
}

interface GameSetupElements extends Elements {
  facetPicker: FacetDropDown;
  btnPlay: Button;
}

export type { GameSetup };

class GameSetup extends Component<GameSetupElements> {
  facet: Facet | undefined;

  constructor() {
    super({
      elements: {
        facetPicker: PanelId.FacetPicker,
        btnPlay: PanelId.BtnPlay,
      },
      panelEvents: {
        btnPlay: {
          onactivate: () => this.onBtnPlay(),
          onmouseover: () => this.onBtnPlayMouseOver(true),
          onmouseout: () => this.onBtnPlayMouseOver(false),
        },
      },
      uiEvents: {
        facetPicker: {
          [UiEvent.FacetDropdownFacetSelected]: (...args: unknown[]) => {
            this.debug(`facetPicker!${UiEvent.FacetDropdownFacetSelected}`, args);

            if ((typeof args[0] !== "number") || (typeof args[1] !== "string")) {
              this.warn(`received invalid arguments for ui event ${UiEvent.FacetDropdownFacetSelected}:`, args);
              return;
            }

            const variant = ParseFacetVariant(args[1]);

            if (variant == null) {
              this.warn(`received invalid arguments for ui event ${UiEvent.FacetDropdownFacetSelected}:`, args);
              return;
            }

            this.onFacetSelected(args[0] as HeroID, variant);
          },
        },
      },
    });

    this.elements.facetPicker.Init(HERO_ID, 0 as FacetId);

    this.debug("init");
  }

  onFacetSelected(heroId: HeroID, variant: FacetVariant) {
    this.facet = FacetVariantObject(variant);

    this.elements.btnPlay.enabled = true;

    this.debug("facet : select", { heroId, variant }, this.facet);
    this.sendClientSide(GameEvent.FacetSelect, { id: this.facet.id });
  }

  onBtnPlayMouseOver(isHover: boolean) {
    if (this.facet) {
      return;
    }

    if (isHover) {
      this.showTextTooltip(this.elements.btnPlay, "Choose a facet");
    } else {
      this.hideTextTooltip(this.elements.btnPlay);
    }
  }

  onBtnPlay() {
    if (!this.facet) {
      return;
    }

    this.debug("facet : submit", this.facet);
    this.sendServer(CustomGameEvent.PlayerFacetSelect, this.facet);
  }
}

(() => {
  new GameSetup();
})();
