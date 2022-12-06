namespace invk {
  export namespace Components {
    export namespace CustomLoadingScreen {
      export interface Elements extends Component.Elements {
        scene: ScenePanel;
      }

      export type Inputs = never;
      export type Outputs = never;

      const {
        Sequence: { Sequence },
        Panorama: { SoundEvent },
      } = GameUI.CustomUIConfig().invk;

      enum CssClass {
        SceneLoaded = "SceneLoaded",
        BackgroundSplash = "Initialize",
      }

      enum Timing {
        KidSplash = 1.8,
      }

      export class CustomLoadingScreen extends Component.Component<Elements, Inputs, Outputs> {
        constructor() {
          super({
            elements: {
              scene: "Scene",
            },
            elementEvents: {
              scene: {
                SCENE_PANEL_LOADED: "start",
              },
            },
          });

          this.debug("init");
        }

        start() {
          new Sequence()
            .WaitClass(this.elements.scene, CssClass.SceneLoaded)
            .PlaySoundEffect(SoundEvent.InvokerKidTakeoverStinger)
            .PlaySoundEffect(SoundEvent.InvokerKidTakeoverSfx)
            .Wait(Timing.KidSplash)
            .AddClass(this.panel, CssClass.BackgroundSplash)
            .Wait(8.2)
            .FireEntityInput(this.elements.scene, "kid", "SetAnimation", "debut_end")
            .Run();
        }
      }

      export const component = new CustomLoadingScreen();
    }
  }
}
