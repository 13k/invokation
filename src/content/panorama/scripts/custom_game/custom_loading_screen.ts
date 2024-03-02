// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace invk {
  export namespace components {
    export namespace CustomLoadingScreen {
      const {
        sequence: { Sequence },
        panorama: { SoundEvent, UIEvent },
      } = GameUI.CustomUIConfig().invk;

      import Component = invk.component.Component;

      export interface Elements extends component.Elements {
        scene: ScenePanel;
      }

      enum CssClass {
        SceneLoaded = "SceneLoaded",
        BackgroundSplash = "Initialize",
      }

      enum Timing {
        KidSplash = 1.8,
      }

      export class CustomLoadingScreen extends Component<Elements> {
        constructor() {
          super({
            elements: {
              scene: "Scene",
            },
            uiEvents: {
              scene: {
                [UIEvent.SCENE_PANEL_LOADED]: () => this.start(),
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
