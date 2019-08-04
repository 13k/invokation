"use strict";

(function(global, context) {
  var EVENTS = global.Const.EVENTS;
  var Grid = global.Grid;
  var IsItemAbility = global.Util.IsItemAbility;
  var IsInvocationAbility = global.Util.IsInvocationAbility;
  var CreatePanelWithLayoutSnippet = global.Util.CreatePanelWithLayoutSnippet;
  var CreateComponent = context.CreateComponent;

  function createRow(parent, idx) {
    var id = "row_" + idx;
    var panel = CreatePanelWithLayoutSnippet(parent, id, "CombatLogRow");
    return panel;
  }

  function createAbilityIcon(parent, abilityName) {
    var snippetName;
    var imageProperty;

    if (IsItemAbility(abilityName)) {
      snippetName = "CombatLogItem";
      imageProperty = "itemname";
    } else {
      snippetName = "CombatLogAbility";
      imageProperty = "abilityname";
    }

    var id = "ability_" + abilityName;
    var panel = CreatePanelWithLayoutSnippet(parent, id, snippetName);

    var image = panel.FindChildTraverse("Image");
    image[imageProperty] = abilityName;

    return panel;
  }

  var CombatLog = CreateComponent({
    constructor: function CombatLog() {
      CombatLog.super.call(this, {
        elements: {
          combatLog: "CombatLog",
          contents: "CombatLogContents",
          filterInvocations: "FilterInvocations",
        },
        customEvents: {
          "!COMBAT_LOG_ABILITY_USED": "onAbilityUsed",
          "!COMBAT_LOG_CLEAR": "onClear",
        },
      });

      this.grid = new Grid(15);
      this.$row = null;

      this.bindEvents();
      this.start();

      this.debug("init");
    },

    bindEvents: function() {
      this.grid.OnRowChange(this.onGridRowChange.bind(this));
    },

    onClear: function() {
      this.debug("onClear()");
      this.Clear();
    },

    onGridRowChange: function(idx) {
      this.debug("onGridRowChange()", idx);
      this.addRow(idx);
    },

    onAbilityUsed: function(payload) {
      this.debug("onAbilityUsed()", payload);

      if (this.isFilteringInvocations() && IsInvocationAbility(payload.ability)) {
        return;
      }

      this.addColumn(payload.ability);
    },

    addRow: function(idx) {
      this.$row = createRow(this.$contents, idx);
      this.scrollToBottom();
    },

    addColumn: function(abilityName) {
      this.grid.Add(abilityName);
      createAbilityIcon(this.$row, abilityName);
      this.scrollToBottom();
    },

    scrollToBottom: function() {
      this.$contents.ScrollToBottom();
    },

    startCapturing: function() {
      this.sendServer(EVENTS.COMBAT_LOG_CAPTURE_START);
    },

    stopCapturing: function() {
      this.sendServer(EVENTS.COMBAT_LOG_CAPTURE_STOP);
    },

    open: function() {
      this.$combatLog.RemoveClass("Closed");
    },

    close: function() {
      this.$combatLog.AddClass("Closed");
    },

    isOpen: function() {
      return !this.$combatLog.BHasClass("Closed");
    },

    isFilteringInvocations: function() {
      return this.$filterInvocations.checked;
    },

    start: function() {
      this.debug("start()");
      this.startCapturing();
    },

    stop: function() {
      this.debug("stop()");
      this.stopCapturing();
    },

    Toggle: function() {
      if (this.isOpen()) {
        this.close();
      } else {
        this.open();
      }
    },

    Clear: function() {
      this.grid.Clear();
      this.$row = null;
      this.$contents.RemoveAndDeleteChildren();
    },
  });

  context.combatLog = new CombatLog();
})(GameUI.CustomUIConfig(), this);
