"use strict";

var C = GameUI.CustomUIConfig(),
  CreateComponent = C.CreateComponent,
  Grid = C.Grid,
  IsOrbAbility = C.Util.IsOrbAbility,
  IsItemAbility = C.Util.IsItemAbility,
  EVENTS = C.EVENTS;

function createRow(parent, idx) {
  var panel = $.CreatePanel("Panel", parent, "row_" + idx);
  panel.BLoadLayoutSnippet("CombatLogRow");
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

  var panel = $.CreatePanel("Panel", parent, "ability_" + abilityName);
  panel.BLoadLayoutSnippet(snippetName);

  var image = panel.FindChildTraverse("Image");
  image[imageProperty] = abilityName;

  return panel;
}

var CombatLog = CreateComponent({
  constructor: function CombatLog() {
    CombatLog.super.call(this, $.GetContextPanel());

    this.capturing = false;
    this.grid = new Grid(15);

    this.bindElements();
    this.bindEvents();
    this.Stop();

    this.log("init");
  },

  bindElements: function() {
    this.$combatLog = $("#CombatLog");
    this.$contents = $("#CombatLogContents");
    this.$filterOrbs = $("#FilterOrbs");
    this.$row = null;
  },

  bindEvents: function() {
    this.grid.OnRowChange(this.onGridRowChange.bind(this));

    this.subscribe(EVENTS.COMBAT_LOG_ABILITY_USED, this.onAbilityUsed);
    this.subscribe(EVENTS.COMBAT_LOG_CLEAR, this.onClear);
    this.subscribe(EVENTS.COMBO_STARTED, this.onComboStarted);
    this.subscribe(EVENTS.COMBO_STOPPED, this.onComboStopped);
  },

  onClear: function() {
    this.log("onClear()");
    this.Clear();
  },

  onGridRowChange: function(idx) {
    this.log("onGridRowChange() ", idx);
    this.addRow(idx);
  },

  onAbilityUsed: function(payload) {
    this.log("onAbilityUsed() ", payload);

    if (!this.capturing) {
      return;
    }

    if (this.isFilteringOrbs() && IsOrbAbility(payload.ability)) {
      return;
    }

    this.addColumn(payload.ability);
  },

  onComboStarted: function() {
    this.log("onComboStarted()");
    this.Start();
  },

  onComboStopped: function() {
    this.log("onComboStopped()");
    this.Stop();
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
    this.capturing = true;
    this.sendServer(EVENTS.COMBAT_LOG_CAPTURE_START);
  },

  stopCapturing: function() {
    this.capturing = false;
    this.sendServer(EVENTS.COMBAT_LOG_CAPTURE_STOP);
  },

  showCombatLog: function() {
    this.$combatLog.RemoveClass("Closed");
  },

  hideCombatLog: function() {
    this.$combatLog.AddClass("Closed");
  },

  isFilteringOrbs: function() {
    return this.$filterOrbs.checked;
  },

  Start: function() {
    this.log("Start()");
    this.Clear();
    this.startCapturing();
    this.showCombatLog();
  },

  Stop: function() {
    this.log("Stop()");
    this.Clear();
    this.stopCapturing();
    this.hideCombatLog();
  },

  Toggle: function() {
    if (this.capturing) {
      this.Stop();
    } else {
      this.Start();
    }
  },

  Clear: function() {
    this.grid.Clear();
    this.$row = null;
    this.$contents.RemoveAndDeleteChildren();
  },
});

var combatLog = new CombatLog();
