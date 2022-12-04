import type { Elements as CElements } from "../lib/component";

export interface Elements extends CElements {
  scene: ScenePanel;
}

const {
  Component,
  Sequence: { Sequence },
} = CustomUIConfig;

enum CssClass {
  SceneLoaded = "SceneLoaded",
  BackgroundSplash = "Initialize",
}

enum SoundEvent {
  KidStinger = "kidvoker_takeover_stinger",
  KidSfx = "kidvoker_takeover_sfx",
}

enum Timing {
  KidSplash = 1.8,
}

class CustomLoadingScreen extends Component<Elements> {
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
    new Sequence()
      .WaitClass(this.elements.scene, CssClass.SceneLoaded)
      .PlaySoundEffect(SoundEvent.KidStinger)
      .PlaySoundEffect(SoundEvent.KidSfx)
      .Wait(Timing.KidSplash)
      .AddClass(this.panel, CssClass.BackgroundSplash)
      .Wait(8.2)
      .FireEntityInput(this.elements.scene, "kid", "SetAnimation", "debut_end")
      .Run();
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const component = new CustomLoadingScreen();

export type { CustomLoadingScreen };
