namespace invk {
  export namespace Components {
    export namespace CustomLoadingScreen {
      const {
        Sequence: { Sequence },
        Panorama: { SoundEvent, UiEvent },
      } = GameUI.CustomUIConfig().invk;

      import Component = invk.Component.Component;

      export interface Elements extends Component.Elements {
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

      export class CustomLoadingScreen extends Component<Elements> {
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

      export const component = new CustomLoadingScreen();
    }
  }
}
