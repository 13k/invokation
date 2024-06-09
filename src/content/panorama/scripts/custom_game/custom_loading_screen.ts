import "@invokation/panorama-lib/api";

import { SoundEvent, UiEvent } from "@invokation/panorama-lib/panorama";
import { Sequence } from "@invokation/panorama-lib/sequence";

import type { Elements } from "./component";
import { Component } from "./component";

interface CustomLoadingScreenElements extends Elements {
  scene: ScenePanel;
}

enum CssClass {
  SceneLoaded = "SceneLoaded",
  BackgroundSplash = "Initialize",
}

enum Timing {
  KidSplash = 1.8,
  KidSoundEnd = 8.2,
}

export type { CustomLoadingScreen };

class CustomLoadingScreen extends Component<CustomLoadingScreenElements> {
  constructor() {
    super({
      elements: {
        scene: "Scene",
      },
      uiEvents: {
        scene: {
          [UiEvent.ScenePanelLoaded]: () => this.start(),
        },
      },
    });

    this.debug("init");
  }

  start() {
    new Sequence()
      .waitClass(this.elements.scene, CssClass.SceneLoaded)
      .playSoundEffect(SoundEvent.InvokerKidTakeoverStinger)
      .playSoundEffect(SoundEvent.InvokerKidTakeoverSfx)
      .wait(Timing.KidSplash)
      .addClass(this.panel, CssClass.BackgroundSplash)
      .wait(Timing.KidSoundEnd)
      .fireEntityInput(this.elements.scene, "kid", "SetAnimation", "debut_end")
      .run();
  }
}

(() => {
  new CustomLoadingScreen();
})();
