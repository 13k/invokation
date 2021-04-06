"use strict";

((global /*, context */) => {
  const { lodash: _, ENV, L10n, Logger, NetTable, Callbacks, CustomEvents } = global;
  const { IsOrbAbility, IsInvocationAbility, IsItemAbility, LuaArrayDeep } = global.Util;
  const { EVENTS, NET_TABLE } = global.Const;

  const WARN_UNDEF_VALUE = "Tried to set data with an undefined value";

  class CombosCollection {
    constructor() {
      this.data = null;
      this.callbacks = new Callbacks();
      this.netTable = new NetTable(NET_TABLE.MAIN);
      this.logger = new Logger({
        level: ENV.development ? Logger.DEBUG : Logger.INFO,
        progname: "combos_collection",
      });

      this.listenToNetTableChange();
    }

    sendReloadToServer() {
      CustomEvents.SendServer(EVENTS.COMBOS_RELOAD);
    }

    loadFromNetTable() {
      return this.netTable.Get(NET_TABLE.KEYS.MAIN.COMBOS);
    }

    listenToNetTableChange() {
      return this.netTable.OnKeyChange(
        NET_TABLE.KEYS.MAIN.COMBOS,
        this.onNetTableChange.bind(this)
      );
    }

    onNetTableChange(key, value) {
      if (key !== NET_TABLE.KEYS.MAIN.COMBOS) {
        return;
      }

      this.logger.debug("onNetTableChange()");
      this.set(value);
    }

    set(value) {
      if (!value) {
        this.logger.warning(WARN_UNDEF_VALUE);
        return;
      }

      this.data = value;
      this.onChange();
    }

    onChange() {
      this.normalize();
      this.callbacks.Run("change", this.data);
    }

    normalize() {
      _.forEach(this.data, (combo) => {
        LuaArrayDeep(combo, { inplace: true });

        combo.l10n = L10n.LocalizeComboProperties(combo);
        combo.l10n.name = L10n.LocalizeComboKey(combo, "name");

        _.forEach(combo.sequence, (step) => {
          step.isOrbAbility = IsOrbAbility(step.name);
          step.isInvocationAbility = IsInvocationAbility(step.name);
          step.isItem = IsItemAbility(step.name);
        });
      });
    }

    Load() {
      this.logger.debug("Load()");

      if (!this.data) {
        this.set(this.loadFromNetTable());
        return true;
      }

      return false;
    }

    Reload() {
      this.logger.debug("Reload()");
      this.data = null;
      this.sendReloadToServer();

      return this.Load();
    }

    OnChange(fn) {
      this.callbacks.On("change", fn);

      if (this.data) {
        fn(this.data);
      }
    }

    Entries() {
      return _.values(this.data);
    }

    Get(id) {
      return _.get(this.data, id);
    }

    Each(fn) {
      return _.forOwn(this.data, fn);
    }
  }

  global.CombosCollection = CombosCollection;
})(GameUI.CustomUIConfig(), this);
