import { forOwn, mapValues } from "lodash";
import { Callbacks } from "./callbacks";
import { CustomEvents } from "./custom_events";
import { ENV } from "./env";
import { localizeComboProperties } from "./l10n";
import { Logger, LogLevel } from "./logger";
import { fromSequence } from "./lua";
import { NetTable } from "./net_table";
import { isInvocationAbility, isItemAbility, isOrbAbility } from "./util";

const WARN_UNDEF_VALUE = "Tried to set data with an undefined value";

interface Combos {
  [id: string]: invk.Combo.Combo;
}

type NetTableKeyType = invk.NetTables.Invokation[invk.NetTables.InvokationKey.Combos];
type NetTableValueType = NetworkedData<NetTableKeyType>;
type NetTableChangeEvent = invk.NetTables.ChangeEvent<
  invk.NetTables.Name.INVOKATION,
  invk.NetTables.InvokationKey.Combos
>;

interface ChangeEvent {
  combos: Combos;
}

interface CombosCallbacks {
  change: ChangeEvent;
}

const normalizeStep = (kv: NetworkedData<invk.Combo.StepKeyValues>): invk.Combo.Step => ({
  ...kv,
  required: kv.required === 1,
  next: fromSequence(kv.next),
  isOrbAbility: isOrbAbility(kv.name),
  isInvocationAbility: isInvocationAbility(kv.name),
  isItem: isItemAbility(kv.name),
});

const normalizeOrbs = (
  kv: NetworkedData<invk.Combo.ComboKeyValues["orbs"]>
): [number, number, number] => {
  const [quas, wex, exort] = fromSequence(kv);
  return [quas, wex, exort];
};

const normalizeCombo = (kv: NetworkedData<invk.Combo.ComboKeyValues>): invk.Combo.Combo => ({
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
  #table: NetTable<invk.NetTables.Name.INVOKATION>;
  #log: Logger;

  constructor() {
    this.#data = {};
    this.#cb = new Callbacks();
    this.#table = new NetTable(invk.NetTables.Name.INVOKATION);
    this.#log = new Logger({
      level: ENV.development ? LogLevel.DEBUG : LogLevel.INFO,
      progname: "combos_collection",
    });

    this._listenToNetTableChange();
  }

  private _sendReloadToServer(): void {
    CustomEvents.sendServer(invk.CustomEvents.Name.COMBOS_RELOAD);
  }

  private _loadFromNetTable(): NetTableValueType {
    return this.#table.get(invk.NetTables.InvokationKey.Combos);
  }

  private _listenToNetTableChange(): void {
    this.#table.onKeyChange(invk.NetTables.InvokationKey.Combos, this._onNetTableChange.bind(this));
  }

  private _onNetTableChange(ev: NetTableChangeEvent): void {
    if (ev.key !== invk.NetTables.InvokationKey.Combos) {
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

  get ids(): string[] {
    return Object.keys(this.#data);
  }

  get combos(): invk.Combo.Combo[] {
    return Object.values(this.#data);
  }

  entries(): [string, invk.Combo.Combo][] {
    return Object.entries(this.#data);
  }

  get(id: string): invk.Combo.Combo | undefined {
    return this.#data[id];
  }

  forEach(iter: (combo: invk.Combo.Combo, id: string, collection: Combos) => void): Combos {
    return forOwn(this.#data, iter);
  }
}
