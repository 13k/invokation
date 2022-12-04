import type { Combo, ID, NetworkCombo } from "./combo";
import type {
  InvokationTable,
  Key as TNetTableKey,
  Name as TNetTableName,
} from "./custom_net_tables";
import type { NetworkValue } from "./net_table";

const {
  lodash: _,

  Combo,
  CustomEvents,
  CustomNetTables: { Name: NetTableName, Key: NetTableKey },
  Dota2: { isOrbAbility, isInvocationAbility, isItemAbility },
  L10n,
  Lua,
  NetTableListener,
} = CustomUIConfig;

type NetworkData = NetworkValue<
  TNetTableName.Invokation,
  InvokationTable,
  TNetTableKey.InvokationCombos
>;

export type Data = Record<ID, Combo>;

class CombosCollection extends NetTableListener<
  TNetTableName.Invokation,
  TNetTableKey.InvokationCombos,
  Data
> {
  constructor() {
    super(NetTableName.Invokation, NetTableKey.InvokationCombos);
  }

  private sendReloadToServer() {
    CustomEvents.sendServer(CustomEvents.Name.COMBOS_RELOAD, {});
  }

  protected normalize(data: NetworkData): Data {
    return _.mapValues(data, (rawCombo) => {
      const nCombo = Lua.fromArrayDeep(rawCombo) as NetworkCombo;
      const combo: Combo = {
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

  get entries(): Combo[] {
    return _.values(this.data);
  }

  get(id: ID): Combo | undefined {
    return this.data ? this.data[id] : undefined;
  }
}

export type { CombosCollection };

CustomUIConfig.CombosCollection = CombosCollection;
