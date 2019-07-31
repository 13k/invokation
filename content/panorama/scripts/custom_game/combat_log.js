"use strict";

var C = GameUI.CustomUIConfig(),
  CreateComponent = C.CreateComponent,
  Grid = C.Grid,
  IsInvocationAbility = C.Util.IsInvocationAbility,
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

    this.grid = new Grid(15);

    this.bindElements();
    this.bindEvents();
    this.start();

    this.debug("init");
  },

  bindElements: function() {
    this.$combatLog = $("#CombatLog");
    this.$contents = $("#CombatLogContents");
    this.$filterInvocations = $("#FilterInvocations");
    this.$row = null;
  },

  bindEvents: function() {
    this.grid.OnRowChange(this.onGridRowChange.bind(this));

    this.subscribe(EVENTS.COMBAT_LOG_ABILITY_USED, this.onAbilityUsed);
    this.subscribe(EVENTS.COMBAT_LOG_CLEAR, this.onClear);
  },

  onClear: function() {
    this.debug("onClear()");
    this.Clear();
  },

  onGridRowChange: function(idx) {
    this.debug("onGridRowChange() ", idx);
    this.addRow(idx);
  },

  onAbilityUsed: function(payload) {
    this.debug("onAbilityUsed() ", payload);

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

var combatLog = new CombatLog();
