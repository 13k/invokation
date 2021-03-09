"use strict";

(function (global, context) {
  var CreateComponent = context.CreateComponent;
  var Sequence = global.Sequence.Sequence;

  var TIMINGS = {
    KID_SPLASH: 1.8,
  };

  var CLASSES = {
    SCENE_LOADED: "SceneLoaded",
    BG_SPLASH: "Initialize",
  };

  var SOUNDS = {
    KID_STINGER: "kidvoker_takeover_stinger",
    KID_SFX: "kidvoker_takeover_sfx",
  };

  var LoadingScreen = CreateComponent({
    constructor: function LoadingScreen() {
      LoadingScreen.super.call(this, {
        elements: {
          scene: "Scene",
        },
      });

      this.setup();
      this.debug("init");
    },

    setup: function () {
      return new Sequence()
        .WaitClass(this.$scene, CLASSES.SCENE_LOADED)
        .PlaySoundEffect(SOUNDS.KID_STINGER)
        .PlaySoundEffect(SOUNDS.KID_SFX)
        .Wait(TIMINGS.KID_SPLASH)
        .AddClass(this.$ctx, CLASSES.BG_SPLASH)
        .Wait(8.2)
        .FireEntityInput(this.$scene, "kid", "SetAnimation", "debut_end")
        .Start();
    },
  });

  context.component = new LoadingScreen();
})(GameUI.CustomUIConfig(), this);
