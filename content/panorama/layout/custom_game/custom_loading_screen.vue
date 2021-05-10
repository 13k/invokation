<layout lang="xml">
<root>
  <scripts>
    <include src="file://{resources}/layout/custom_game/custom_loading_screen.js" />
  </scripts>

  <styles>
    <include src="s2r://panorama/styles/dotastyles.css" />

    <include src="file://{resources}/layout/custom_game/custom_loading_screen.css" />
  </styles>

  <Panel class="root" hittest="false">
    <DOTAScenePanel id="title-fx" map="backgrounds/dashboard_parallax_plus" camera="camera" renderdeferred="false" particleonly="true" require-composition-layer="true" hittest="false" />

    <Panel class="title-panel" hittest="false">
      <Label class="title" text="#addon_game_name" hittest="false" />
    </Panel>

    <DOTAScenePanel id="scene" map="custom_game/scenes/loading_screen" light="light" camera="camera" particleonly="false" require-composition-layer="true" hittest="false" />
  </Panel>
</root>
</layout>

<script lang="ts">
import { Component } from "../../scripts/lib/component";
import { UIPanelEvent } from "../../scripts/lib/const/ui_events";
import { SerialSequence } from "../../scripts/lib/sequence";
import { UIEvents } from "../../scripts/lib/ui_events";

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

export default class LoadingScreen extends Component {
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

global.loadingScreen = new LoadingScreen();
</script>

<style lang="scss">
@use "../../styles/variables";

$gradient-bg: gradient(
  linear,
  0% 0%,
  100% 100%,
  from(#0b0c0e),
  color-stop(0.3, #14181d),
  color-stop(0.303, #6c829c),
  color-stop(0.31, #99b8dd),
  color-stop(0.55, #99b8dd),
  color-stop(0.56, #6c829c),
  color-stop(0.563, #14181d),
  to(#0b0c0e)
);

$gradient-invokation-sun: gradient(
  radial,
  50% 50%,
  0% 0%,
  50% 50%,
  from(#2b1d10f1),
  color-stop(0.6, #ff9100c2),
  to(#0000)
);

$gradient-invokation-sun-fading: gradient(
  radial,
  50% 50%,
  0% 0%,
  50% 50%,
  from(#2b1d10f1),
  color-stop(0.6, #ce7909c2),
  to(#0000)
);

.root {
  width: 100%;
  height: 100%;
  background-color: #14181d;
}

.root.initialized {
  background-color: $gradient-bg;
}

#title-fx {
  width: 100%;
  height: 100%;
  transform: translateX(64px) translateY(64px) translateZ(-40px);
  opacity: 0;
  transition-timing-function: ease-in-out;
  transition-duration: 0.4s;
  transition-property: opacity;
}

#title-fx.SceneLoaded {
  opacity: 1;
}

.title-panel {
  width: 300px;
  height: 300px;
  margin-top: 64px;
  margin-left: 64px;
  background-color: $gradient-invokation-sun;
  animation-name: sunstrike-glow;
  animation-duration: 4s;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
}

.title {
  width: 100%;
  color: #bbb6ae;
  font-weight: semi-bold;
  font-size: 80px;
  font-family: variables.$font-title;
  letter-spacing: -2px;
  text-align: center;
  text-transform: uppercase;
  text-overflow: shrink;
  text-shadow: 2px 4px 4px #000;
  align: center center;
}

#scene {
  width: 100%;
  height: 100%;
  margin-left: -200px;
  transform: translateZ(-30px);
  opacity: 0;
}

#scene.SceneLoaded {
  opacity: 1;
}

@keyframes sunstrike-glow {
  0% {
    background-color: $gradient-invokation-sun;
  }
  50% {
    background-color: $gradient-invokation-sun-fading;
  }
  100% {
    background-color: $gradient-invokation-sun;
  }
}
</style>
