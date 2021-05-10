import { forOwn, mapValues } from "lodash";

import { Callbacks } from "./callbacks";
import {
  ChangeEvent as NetTablesChangeEvent,
  InvokationTable,
  InvokationTableKey,
  Table,
} from "./const/net_table";
import type { AbilitiesKeyValues, AbilityKeyValues } from "./dota";
import { ENV } from "./env";
import { Logger, LogLevel } from "./logger";
import { fromSequence } from "./lua";
import { NetTable } from "./net_table";

const WARN_UNDEF_VALUE = "Tried to set data with an undefined value";

type NetTableKeyType = InvokationTable[InvokationTableKey.AbilitiesKeyValues];
type NetTableValueType = NetworkedData<NetTableKeyType>;
type NetTableChangeEvent = NetTablesChangeEvent<
  Table.Invokation,
  InvokationTableKey.AbilitiesKeyValues
>;

export interface ChangeEvent {
  kv: AbilitiesKeyValues;
}

interface AbilitiesKeyValuesCallbacks {
  change: ChangeEvent;
}

const normalizeAbility = (kv: NetworkedData<AbilityKeyValues>) => ({
  ...kv,
  HasScepterUpgrade: kv.HasScepterUpgrade === 1,
  AbilitySpecial: fromSequence(kv.AbilitySpecial),
});

const normalize = (kv: NetTableValueType) => mapValues(kv, normalizeAbility);

export class AbilitiesCollection {
  #data: AbilitiesKeyValues;
  #cb: Callbacks<AbilitiesKeyValuesCallbacks>;
  #table: NetTable<Table.Invokation>;
  #log: Logger;

  constructor() {
    this.#data = {};
    this.#cb = new Callbacks();
    this.#table = new NetTable(Table.Invokation);
    this.#log = new Logger({
      level: ENV.development ? LogLevel.DEBUG : LogLevel.INFO,
      progname: "abilities_kv",
    });

    this._listenToNetTableChange();
  }

  private _listenToNetTableChange(): void {
    this.#table.onKeyChange(
      InvokationTableKey.AbilitiesKeyValues,
      this._onNetTableChange.bind(this)
    );
  }

  private _loadFromNetTable(): NetTableValueType {
    return this.#table.get(InvokationTableKey.AbilitiesKeyValues);
  }

  private _onNetTableChange(ev: NetTableChangeEvent): void {
    if (ev.key !== InvokationTableKey.AbilitiesKeyValues) {
      return;
    }

    this.#log.debug("_onNetTableChange()");

    this._set(ev.value);
  }

  private _changeEvent(): ChangeEvent {
    return { kv: this.#data };
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

  onChange(cb: (ev: ChangeEvent) => void): void {
    this.#cb.on("change", cb);

    if (this.names.length > 0) {
      cb(this._changeEvent());
    }
  }

  get names(): string[] {
    return Object.keys(this.#data);
  }

  get abilities(): AbilityKeyValues[] {
    return Object.values(this.#data);
  }

  get entries(): [string, AbilityKeyValues][] {
    return Object.entries(this.#data);
  }

  get(id: string): AbilityKeyValues | undefined {
    return this.#data[id];
  }

  forEach(
    iter: (ability: AbilityKeyValues, name: string, collection: AbilitiesKeyValues) => void
  ): AbilitiesKeyValues {
    return forOwn(this.#data, iter);
  }
}
