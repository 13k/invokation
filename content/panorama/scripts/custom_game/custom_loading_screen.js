"use strict";

((global, context) => {
  const { Component } = context;
  const { Sequence } = global.Sequence;

  const TIMINGS = {
    KID_SPLASH: 1.8,
  };

  const CLASSES = {
    SCENE_LOADED: "SceneLoaded",
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
          scene: "Scene",
        },
      });

      this.setup();
      this.debug("init");
    }

    setup() {
      return new Sequence()
        .WaitClass(this.$scene, CLASSES.SCENE_LOADED)
        .PlaySoundEffect(SOUNDS.KID_STINGER)
        .PlaySoundEffect(SOUNDS.KID_SFX)
        .Wait(TIMINGS.KID_SPLASH)
        .AddClass(this.$ctx, CLASSES.BG_SPLASH)
        .Wait(8.2)
        .FireEntityInput(this.$scene, "kid", "SetAnimation", "debut_end")
        .Start();
    }
  }

  context.loadingScreen = new LoadingScreen();
})(GameUI.CustomUIConfig(), this);
