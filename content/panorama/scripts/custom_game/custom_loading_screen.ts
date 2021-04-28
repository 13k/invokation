import { Component } from "./lib/component";
import { UIPanelEvent } from "./lib/const/ui_events";
import { SerialSequence } from "./lib/sequence";
import { UIEvents } from "./lib/ui_events";

export type Inputs = never;
export type Outputs = never;

interface Elements {
  scene: ScenePanel;
}

const TIMINGS = {
  KID_SPLASH: 1.8,
  KID_ANIM_END: 8.2,
};

const CLASSES = {
  BG_SPLASH: "initialized",
};

const SOUNDS = {
  KID_STINGER: "kidvoker_takeover_stinger",
  KID_SFX: "kidvoker_takeover_sfx",
};

export class LoadingScreen extends Component {
  #elements: Elements;

  constructor() {
    super();

    this.#elements = this.findAll<Elements>({
      scene: "scene",
    });

    UIEvents.listen(
      this.#elements.scene,
      UIPanelEvent.ScenePanelSceneLoaded,
      this.onSceneLoad.bind(this)
    );

    this.debug("init");
  }

  onSceneLoad(): void {
    this.debug("onSceneLoad()");
    this.start();
  }

  start(): void {
    new SerialSequence()
      .PlaySoundEffect(SOUNDS.KID_STINGER)
      .PlaySoundEffect(SOUNDS.KID_SFX)
      .Wait(TIMINGS.KID_SPLASH)
      .AddClass(this.ctx, CLASSES.BG_SPLASH)
      .Wait(TIMINGS.KID_ANIM_END)
      .FireEntityInput(this.#elements.scene, "kid", "SetAnimation", "debut_end")
      .run();
  }
}

//   context.loadingScreen = new LoadingScreen();
// })(GameUI.CustomUIConfig(), this);
