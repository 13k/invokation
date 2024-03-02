/// <reference path="../custom_events.ts" />
/// <reference path="../dota2.ts" />
/// <reference path="../l10n.ts" />
/// <reference path="../lua.ts" />
/// <reference path="../net_table.ts" />
/// <reference path="combo.ts" />

namespace invk {
  export namespace Combo {
    import l10n = invk.L10n;
    import lua = invk.Lua;

    import Combo = invk.Combo.Combo;
    import ComboId = invk.Combo.ComboId;
    import CustomGameEvent = invk.CustomEvents.CustomGameEvent;
    import NetTableKeyListener = invk.NetTable.KeyListener.NetTableKeyListener;
    import OrbName = invk.Combo.OrbName;
    import Step = invk.Combo.Step;

    import isInvocationAbility = invk.Dota2.Invoker.isInvocationAbility;
    import isItemAbility = invk.Dota2.isItemAbility;
    import isOrbAbility = invk.Dota2.Invoker.isOrbAbility;

    import table = invk.NetTable.CustomNetTable.Invokation;
    import key = invk.NetTable.Invokation.Key.Combos;

    type NetworkValue = invk.NetTable.NetworkValue<table, key>;
    type Value = Map<ComboId, Combo>;

    export class CombosCollection extends NetTableKeyListener<table, key, Value> {
      constructor() {
        super(table, key);
      }

      #sendReloadToServer() {
        CustomEvents.sendServer(CustomGameEvent.CombosReload, {});
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
  }
}
