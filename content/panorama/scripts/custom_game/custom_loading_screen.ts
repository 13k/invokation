// const { Component } = context;
// const { Sequence } = global.Sequence;

import { Component } from "./lib/component";

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

class LoadingScreen extends Component {
  constructor() {
    super({
      elements: {
        scene: "scene",
      },
      elementEvents: {
        scene: {
          DOTAScenePanelSceneLoaded: "onSceneLoad",
        },
      },
    });

    this.debug("init");
  }

  onSceneLoad() {
    this.debug("onSceneLoad()");
    this.start();
  }

  start() {
    return new Sequence()
      .PlaySoundEffect(SOUNDS.KID_STINGER)
      .PlaySoundEffect(SOUNDS.KID_SFX)
      .Wait(TIMINGS.KID_SPLASH)
      .AddClass(this.$ctx, CLASSES.BG_SPLASH)
      .Wait(TIMINGS.KID_ANIM_END)
      .FireEntityInput(this.$scene, "kid", "SetAnimation", "debut_end")
      .Start();
  }
}

//   context.loadingScreen = new LoadingScreen();
// })(GameUI.CustomUIConfig(), this);
