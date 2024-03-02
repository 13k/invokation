/// <reference path="../custom_events.ts" />
/// <reference path="../dota2.ts" />
/// <reference path="../l10n.ts" />
/// <reference path="../lua.ts" />
/// <reference path="../net_table.ts" />
/// <reference path="combo.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace invk {
  export namespace combo {
    import l10n = invk.l10n;
    import lua = invk.lua;

    import Combo = invk.combo.Combo;
    import ComboID = invk.combo.ComboID;
    import CustomGameEvent = invk.custom_events.CustomGameEvent;
    import NetTableKeyListener = invk.net_table.key_listener.NetTableKeyListener;
    import OrbName = invk.combo.OrbName;
    import Step = invk.combo.Step;

    import isInvocationAbility = invk.dota2.invoker.isInvocationAbility;
    import isItemAbility = invk.dota2.isItemAbility;
    import isOrbAbility = invk.dota2.invoker.isOrbAbility;

    import table = invk.net_table.CustomNetTable.Invokation;
    import key = invk.net_table.invokation.Key.Combos;

    type NetworkValue = invk.net_table.NetworkValue<table, key>;
    type Value = Map<ComboID, Combo>;

    export class CombosCollection extends NetTableKeyListener<table, key, Value> {
      constructor() {
        super(table, key);
      }

      private sendReloadToServer() {
        custom_events.sendServer(CustomGameEvent.COMBOS_RELOAD, {});
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

        this.sendReloadToServer();
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

      get entries(): IterableIterator<[ComboID, Combo]> | undefined {
        return this.value?.entries();
      }

      get(id: ComboID): Combo | undefined {
        return this.value?.get(id);
      }
    }
  }
}
