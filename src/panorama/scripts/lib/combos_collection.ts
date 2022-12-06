/// <reference path="./vendor/lodash.js" />
/// <reference path="./combo.ts" />
/// <reference path="./custom_events.ts" />
/// <reference path="./custom_net_tables.ts" />
/// <reference path="./dota2.ts" />
/// <reference path="./l10n.ts" />
/// <reference path="./lua.ts" />
/// <reference path="./net_table_listener.ts" />

namespace invk {
  export namespace CombosCollection {
    const {
      CustomEvents: { Name: CustomEventName },
      NetTableListener: { NetTableListener },
      Dota2: {
        isItemAbility,
        Invoker: { isOrbAbility, isInvocationAbility },
      },
    } = invk;

    type NetworkData = CustomNetTables.NetworkValue<
      CustomNetTables.Name.Invokation,
      CustomNetTables.Invokation.Key.Combos
    >;

    export type Data = Record<Combo.ID, Combo.Combo>;

    export class CombosCollection extends NetTableListener<
      CustomNetTables.Name.Invokation,
      CustomNetTables.Invokation.Key.Combos,
      Data
    > {
      constructor() {
        super(CustomNetTables.Name.Invokation, CustomNetTables.Invokation.Key.Combos);
      }

      private sendReloadToServer() {
        CustomEvents.sendServer(CustomEventName.COMBOS_RELOAD, {});
      }

      protected override normalize(data: NetworkData): Data {
        return _.mapValues(data, (rawCombo) => {
          const nCombo = Lua.fromArrayDeep(rawCombo) as Combo.NetworkCombo;
          const combo: Combo.Combo = {
            ...nCombo,
            orbsByName: {
              [Combo.OrbName.Quas]: nCombo.orbs[0],
              [Combo.OrbName.Wex]: nCombo.orbs[1],
              [Combo.OrbName.Exort]: nCombo.orbs[2],
            },
            l10n: {
              ...L10n.comboProps(nCombo),
              name: L10n.comboAttrName(nCombo.id, "name"),
              description: L10n.comboAttrName(nCombo.id, "description"),
            },
            sequence: _.map(nCombo.sequence, (nstep, i) => ({
              ...nstep,
              id: i,
              isOrbAbility: isOrbAbility(nstep.name),
              isInvocationAbility: isInvocationAbility(nstep.name),
              isItem: isItemAbility(nstep.name),
            })),
          };

          return combo;
        });
      }

      reload() {
        this.log.debug("reload()");

        this.data = undefined;

        this.sendReloadToServer();
        this.load();
      }

      get entries(): Combo.Combo[] {
        return _.values(this.data);
      }

      get(id: Combo.ID): Combo.Combo | undefined {
        return this.data ? this.data[id] : undefined;
      }
    }
  }
}
