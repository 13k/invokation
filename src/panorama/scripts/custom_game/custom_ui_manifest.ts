namespace invk {
  export namespace Static {
    const {
      CombosCollection: { CombosCollection },
      NetTableListener: { NetTableListener },
    } = invk;

    export const COMBOS = new CombosCollection();

    export const HERO_DATA = new NetTableListener(
      CustomNetTables.Name.Invokation,
      CustomNetTables.Invokation.Key.HeroData
    );

    export const HERO_KV = new NetTableListener(
      CustomNetTables.Name.Hero,
      CustomNetTables.Hero.Key.KeyValues
    );

    export const ABILITIES_KV = new NetTableListener(
      CustomNetTables.Name.Abilities,
      CustomNetTables.Abilities.Key.KeyValues
    );
  }

  export namespace Components {
    export namespace CustomUIManifest {
      export type Elements = never;
      export type Inputs = never;
      export type Outputs = never;
      export type Params = never;

      const {
        Const: { UI_CONFIG },
        Vendor: { lodash: _ },
      } = GameUI.CustomUIConfig().invk;

      export class CustomUIManifest extends Component.Component<Elements, Inputs, Outputs, Params> {
        constructor() {
          super();

          _.each(UI_CONFIG, (value, key) => {
            GameUI.SetDefaultUIEnabled(
              DotaDefaultUIElement_t[key as keyof typeof DotaDefaultUIElement_t],
              value
            );
          });

          this.debug("init");
        }
      }

      export const component = new CustomUIManifest();
    }
  }
}
