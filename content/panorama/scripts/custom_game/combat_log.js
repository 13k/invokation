"use strict";

(function (global, context) {
  var Grid = global.Grid;
  var Sequence = global.Sequence.Sequence;
  var IsInvocationAbility = global.Util.IsInvocationAbility;
  var CreateAbilityOrItemImage = global.Util.CreateAbilityOrItemImage;
  var CreateComponent = context.CreateComponent;

  var EVENTS = global.Const.EVENTS;

  var ROW_ID_PREFIX = "CombatLogRow";
  var ROW_CLASS = "CombatLogRow";

  var ICON_ID_PREFIX = "CombatLogIcon";
  var ICON_CLASS = "CombatLogIcon";
  var ICON_IMAGE_ID_SUFFIX = "Image";
  var ICON_IMAGE_CLASS = "CombatLogIconImage";
  var ICON_IMAGE_SCALING = "stretch-to-fit-y-preserve-aspect";

  var GRID_COLUMNS = 20;
  var CLOSED_CLASS = "Closed";

  function rowId(index) {
    return ROW_ID_PREFIX + String(index);
  }

  function iconId(row, col) {
    return [ICON_ID_PREFIX, row, col].join("_");
  }

  function iconImageId(iconId) {
    return iconId + "_" + ICON_IMAGE_ID_SUFFIX;
  }

  var CombatLog = CreateComponent({
    constructor: function CombatLog() {
      CombatLog.super.call(this, {
        elements: {
          contents: "CombatLogContents",
          filterInvocations: "CombatLogFilterInvocations",
        },
        customEvents: {
          "!COMBAT_LOG_ABILITY_USED": "onAbilityUsed",
          "!COMBAT_LOG_CLEAR": "onClear",
        },
      });

      this.grid = new Grid(GRID_COLUMNS);
      this.$row = null;

      this.bindEvents();
      this.start();

      this.debug("init");
    },

    // ----- Event handlers -----

    onClear: function () {
      this.debug("onClear()");
      this.clear();
    },

    onGridRowChange: function (idx) {
      this.debug("onGridRowChange()", idx);
      this.addRow(idx);
    },

    onAbilityUsed: function (payload) {
      this.debug("onAbilityUsed()", payload);

      if (this.isFilteringInvocations() && IsInvocationAbility(payload.ability)) {
        return;
      }

      this.addColumn(payload.ability);
    },

    // ----- Helpers -----

    bindEvents: function () {
      this.grid.OnRowChange(this.onGridRowChange.bind(this));
    },

    startCapturing: function () {
      this.sendServer(EVENTS.COMBAT_LOG_CAPTURE_START);
    },

    stopCapturing: function () {
      this.sendServer(EVENTS.COMBAT_LOG_CAPTURE_STOP);
    },

    isOpen: function () {
      return !this.$ctx.BHasClass(CLOSED_CLASS);
    },

    isFilteringInvocations: function () {
      return this.$filterInvocations.checked;
    },

    start: function () {
      this.startCapturing();
    },

    stop: function () {
      this.stopCapturing();
    },

    appendToGrid: function (abilityName) {
      this.grid.Add(abilityName);
    },

    clearGrid: function () {
      this.grid.Clear();
    },

    resetRow: function () {
      this.$row = null;
    },

    createRow: function (rowIndex) {
      var id = rowId(rowIndex);
      var panel = $.CreatePanel("Panel", this.$contents, id);

      panel.AddClass(ROW_CLASS);

      this.$row = panel;
      return panel;
    },

    createAbilityIcon: function (abilityName) {
      var id = iconId(this.grid.Row(), this.grid.Column());
      var panel = $.CreatePanel("Panel", this.$row, id);

      panel.AddClass(ICON_CLASS);

      var imageId = iconImageId(id);
      var image = CreateAbilityOrItemImage(panel, imageId, abilityName);

      image.AddClass(ICON_IMAGE_CLASS);
      image.scaling = ICON_IMAGE_SCALING;

      this.debug("createAbilityIcon()", {
        ability: abilityName,
        iconId: panel.id,
        imageId: image.id,
        imageType: image.paneltype,
      });

      return panel;
    },

    // ----- Action runners -----

    open: function () {
      return new Sequence().RemoveClass(this.$ctx, CLOSED_CLASS).Start();
    },

    close: function () {
      return new Sequence().AddClass(this.$ctx, CLOSED_CLASS).Start();
    },

    addRow: function (rowIndex) {
      return new Sequence()
        .RunFunction(this, this.createRow, rowIndex)
        .ScrollToBottom(this.$contents)
        .Start();
    },

    addColumn: function (abilityName) {
      return new Sequence()
        .RunFunction(this, this.appendToGrid, abilityName)
        .RunFunction(this, this.createAbilityIcon, abilityName)
        .ScrollToBottom(this.$contents)
        .Start();
    },

    clear: function () {
      return new Sequence()
        .RunFunction(this, this.clearGrid)
        .RunFunction(this, this.resetRow)
        .RemoveChildren(this.$contents)
        .Start();
    },

    // ----- UI methods -----

    Toggle: function () {
      if (this.isOpen()) {
        return this.close();
      }

      return this.open();
    },

    Clear: function () {
      return this.clear();
    },
  });

  context.combatLog = new CombatLog();
})(GameUI.CustomUIConfig(), this);
