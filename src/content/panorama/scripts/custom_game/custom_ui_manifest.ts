namespace invk {
  export namespace Singleton {
    const {
      Combo: { CombosCollection },
      NetTable: {
        KeyListener: { AbilitiesKeyValues, HeroData, HeroKeyValues },
      },
    } = invk;

    export const ABILITIES_KV = new AbilitiesKeyValues();
    export const COMBOS = new CombosCollection();
    export const HERO_DATA = new HeroData();
    export const HERO_KV = new HeroKeyValues();
  }

  export namespace Components {
    export namespace CustomUiManifest {
      const {
        Constants: { UI_CONFIG },
      } = GameUI.CustomUIConfig().invk;

      import Component = invk.Component.Component;

      export class CustomUiManifest extends Component {
        constructor() {
          super();

          for (const [key, value] of Object.entries(UI_CONFIG)) {
            this.setUi(key as keyof typeof DotaDefaultUIElement_t, value);
          }

          this.debug("init");
        }
      }

      export const component = new CustomUiManifest();
    }
  }
}
