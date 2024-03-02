// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace invk {
  export namespace singleton {
    const {
      combo: { CombosCollection },
      net_table: {
        key_listener: { AbilitiesKeyValues, HeroData, HeroKeyValues },
      },
    } = invk;

    export const ABILITIES_KV = new AbilitiesKeyValues();
    export const COMBOS = new CombosCollection();
    export const HERO_DATA = new HeroData();
    export const HERO_KV = new HeroKeyValues();
  }

  export namespace components {
    export namespace CustomUIManifest {
      const {
        constants: { UI_CONFIG },
      } = GameUI.CustomUIConfig().invk;

      import Component = invk.component.Component;

      export class CustomUIManifest extends Component {
        constructor() {
          super();

          for (const [key, value] of Object.entries(UI_CONFIG)) {
            GameUI.SetDefaultUIEnabled(
              DotaDefaultUIElement_t[key as keyof typeof DotaDefaultUIElement_t],
              value,
            );
          }

          this.debug("init");
        }
      }

      export const component = new CustomUIManifest();
    }
  }
}
