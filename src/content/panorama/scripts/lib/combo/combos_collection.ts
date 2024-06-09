import type { Combo, ComboId, Step } from "../combo";
import { OrbName } from "../combo";
import { CustomGameEvent, sendServer } from "../custom_events";
import type { NetworkValue as GenericNetworkValue } from "../custom_net_tables";
import { CustomNetTable } from "../custom_net_tables";
import * as table from "../custom_net_tables/invokation";
import { isInvocationAbility, isOrbAbility } from "../dota2/invoker";
import { isItemAbility } from "../dota2/items";
import * as l10n from "../l10n";
import * as lua from "../lua";
import { NetTableKeyListener } from "../net_table/key_listener";

type NetworkValue = GenericNetworkValue<CustomNetTable.Invokation, table.Key.Combos>;
type Value = Map<ComboId, Combo>;

export class CombosCollection extends NetTableKeyListener<
  CustomNetTable.Invokation,
  table.Key.Combos,
  Value
> {
  constructor() {
    super(CustomNetTable.Invokation, table.Key.Combos);
  }

  #sendReloadToServer() {
    sendServer(CustomGameEvent.CombosReload, {});
  }

  protected override normalize(rvalue: NetworkValue): Value {
    const value: Value = new Map();

    for (const rcombo of Object.values(rvalue)) {
      const tags = lua.fromArray(rcombo.tags);
      const tagset = new Set(tags);
      const items = lua.fromArray(rcombo.items);
      const orbs = lua.fromArray(rcombo.orbs) as [number, number, number];
      const rsequence = lua.fromArray(rcombo.sequence);
      const sequence: Step[] = [];

      for (const [i, rstep] of rsequence.entries()) {
        sequence.push({
          ...rstep,
          id: i,
          required: rstep.required === 1,
          next: lua.indexArray(rstep.next ?? {}),
          isOrbAbility: isOrbAbility(rstep.name),
          isInvocationAbility: isInvocationAbility(rstep.name),
          isItem: isItemAbility(rstep.name),
        });
      }

      const combo: Combo = {
        ...rcombo,
        tags,
        tagset,
        items,
        sequence,
        orbs,
        orbsByName: {
          [OrbName.Quas]: orbs[0],
          [OrbName.Wex]: orbs[1],
          [OrbName.Exort]: orbs[2],
        },
        l10n: {
          ...l10n.comboProps(rcombo),
          name: l10n.comboAttrName(rcombo.id, "name"),
          description: l10n.comboAttrName(rcombo.id, "description"),
        },
      };

      value.set(combo.id, combo);
    }

    return value;
  }

  reload() {
    this.log.debug("reload()");

    this.value = undefined;

    this.#sendReloadToServer();
    this.load();
  }

  [Symbol.iterator](): IterableIterator<Combo> {
    if (this.value == null) {
      return [][Symbol.iterator]();
    }

    return this.value.values();
  }

  get values(): IterableIterator<Combo> | undefined {
    return this.value?.values();
  }

  get entries(): IterableIterator<[ComboId, Combo]> | undefined {
    return this.value?.entries();
  }

  get(id: ComboId): Combo | undefined {
    return this.value?.get(id);
  }
}
