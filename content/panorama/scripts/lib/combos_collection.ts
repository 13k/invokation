import { forOwn, mapValues } from "lodash";

import { Callbacks } from "./callbacks";
import type { Combo, ComboKeyValues, Step, StepKeyValues } from "./combo";
import { CustomEvent } from "./const/events";
import {
  ChangeEvent as NetTablesChangeEvent,
  InvokationTable,
  InvokationTableKey,
  Table,
} from "./const/net_table";
import { CustomEvents } from "./custom_events";
import { ENV } from "./env";
import { isInvocationAbility, isOrbAbility } from "./invoker";
import { localizeComboProperties } from "./l10n";
import { Logger, LogLevel } from "./logger";
import { fromSequence } from "./lua";
import { NetTable } from "./net_table";
import { isItemAbility } from "./util";

const WARN_UNDEF_VALUE = "Tried to set data with an undefined value";

interface Combos {
  [id: string]: Combo;
}

type NetTableKeyType = InvokationTable[InvokationTableKey.Combos];
type NetTableValueType = NetworkedData<NetTableKeyType>;
type NetTableChangeEvent = NetTablesChangeEvent<Table.Invokation, InvokationTableKey.Combos>;

export interface ChangeEvent {
  combos: Combos;
}

interface CombosCallbacks {
  change: ChangeEvent;
}

const normalizeStep = (kv: NetworkedData<StepKeyValues>, index: number): Step => ({
  ...kv,
  index,
  required: kv.required === 1,
  next: fromSequence(kv.next),
  isOrbAbility: isOrbAbility(kv.name),
  isInvocationAbility: isInvocationAbility(kv.name),
  isItem: isItemAbility(kv.name),
});

const normalizeOrbs = (kv: NetworkedData<ComboKeyValues["orbs"]>): [number, number, number] => {
  const [quas, wex, exort] = fromSequence(kv);
  return [quas, wex, exort];
};

const normalizeCombo = (kv: NetworkedData<ComboKeyValues>): Combo => ({
  ...kv,
  orbs: normalizeOrbs(kv.orbs),
  tags: fromSequence(kv.tags),
  items: fromSequence(kv.items),
  l10n: localizeComboProperties(kv),
  sequence: fromSequence(kv.sequence).map(normalizeStep),
});

const normalize = (kv: NetTableValueType): Combos => mapValues(kv, normalizeCombo);

export class CombosCollection {
  #data: Combos;
  #cb: Callbacks<CombosCallbacks>;
  #table: NetTable<Table.Invokation>;
  #log: Logger;

  constructor() {
    this.#data = {};
    this.#cb = new Callbacks();
    this.#table = new NetTable(Table.Invokation);
    this.#log = new Logger({
      level: ENV.development ? LogLevel.DEBUG : LogLevel.INFO,
      progname: "combos_collection",
    });

    this._listenToNetTableChange();
  }

  private _sendReloadToServer(): void {
    CustomEvents.sendServer(CustomEvent.COMBOS_RELOAD);
  }

  private _loadFromNetTable(): NetTableValueType {
    return this.#table.get(InvokationTableKey.Combos);
  }

  private _listenToNetTableChange(): void {
    this.#table.onKeyChange(InvokationTableKey.Combos, this._onNetTableChange.bind(this));
  }

  private _onNetTableChange(ev: NetTableChangeEvent): void {
    if (ev.key !== InvokationTableKey.Combos) {
      return;
    }

    this.#log.debug("_onNetTableChange()");

    this._set(ev.value);
  }

  private _changeEvent(): ChangeEvent {
    return { combos: this.#data };
  }

  private _set(value: NetTableValueType): void {
    if (!value) {
      this.#log.warn(WARN_UNDEF_VALUE);
      return;
    }

    this.#data = normalize(value);
    this.#cb.run("change", this._changeEvent());
  }

  load(): boolean {
    this.#log.debug("load()");

    if (!this.#data) {
      this._set(this._loadFromNetTable());
      return true;
    }

    return false;
  }

  reload(): void {
    this.#log.debug("reload()");
    this.#data = {};

    this._sendReloadToServer();
    this.load();
  }

  onChange(cb: (ev: ChangeEvent) => void): void {
    this.#cb.on("change", cb);

    if (this.ids.length > 0) {
      cb(this._changeEvent());
    }
  }

  get length(): number {
    return this.ids.length;
  }

  get ids(): string[] {
    return Object.keys(this.#data);
  }

  get combos(): Combo[] {
    return Object.values(this.#data);
  }

  entries(): [string, Combo][] {
    return Object.entries(this.#data);
  }

  get(id: string): Combo | undefined {
    return this.#data[id];
  }

  forEach(iter: (combo: Combo, id: string, collection: Combos) => void): Combos {
    return forOwn(this.#data, iter);
  }
}
