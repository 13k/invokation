"use strict";

(function(global, context) {
  var _ = global.lodash;
  var ParallelSequence = global.Sequence.ParallelSequence;
  var IsTalentSelected = global.Util.IsTalentSelected;
  var CreateComponent = context.CreateComponent;

  var LEVELS = [10, 15, 20, 25];

  var TOOLTIP_LAYOUT = "file://{resources}/layout/custom_game/tooltips/tooltip_stat_branch.xml";
  var TOOLTIP_ID = "TalentDisplayTooltip";

  var CLASSES = {
    BRANCH_SELECTED: {
      LEFT: "LeftBranchSelected",
      RIGHT: "RightBranchSelected",
    },
  };

  function statRowAttr(level) {
    return "statRow" + String(level);
  }

  var UITalentsDisplay = CreateComponent({
    constructor: function UITalentsDisplay() {
      UITalentsDisplay.super.call(this, {
        elements: ["StatRow10", "StatRow15", "StatRow20", "StatRow25"],
        inputs: {
          Select: "onSelect",
          Reset: "onReset",
        },
      });

      this.bindRows();
      this.debug("init");
    },

    // ----- I/O -----

    onSelect: function(payload) {
      this.debug("onSelect()", payload);
      this.select(payload.talents);
    },

    onReset: function() {
      this.debug("onReset()");
      this.reset();
    },

    // ----- Helpers -----

    bindRows: function() {
      this.$rows = {};
      _.each(LEVELS, this.bindRow.bind(this));
    },

    bindRow: function(level) {
      this.$rows[level] = this.element(statRowAttr(level));
    },

    // ----- Actions -----

    selectLevelAction: function(level, choices) {
      var seq = new ParallelSequence();

      if (IsTalentSelected(level, "right", choices)) {
        seq.AddClass(this.$rows[level], CLASSES.BRANCH_SELECTED.RIGHT);
        seq.RemoveClass(this.$rows[level], CLASSES.BRANCH_SELECTED.LEFT);
      } else if (IsTalentSelected(level, "left", choices)) {
        seq.RemoveClass(this.$rows[level], CLASSES.BRANCH_SELECTED.RIGHT);
        seq.AddClass(this.$rows[level], CLASSES.BRANCH_SELECTED.LEFT);
      }

      return seq;
    },

    resetLevelAction: function(level) {
      return new ParallelSequence()
        .RemoveClass(this.$rows[level], CLASSES.BRANCH_SELECTED.LEFT)
        .RemoveClass(this.$rows[level], CLASSES.BRANCH_SELECTED.RIGHT);
    },

    // ----- Action runners -----

    select: function(choices) {
      this.selected = choices;

      var selectLevelAction = _.chain(this.selectLevelAction)
        .bind(this, _, choices)
        .unary()
        .value();

      var actions = _.map(LEVELS, selectLevelAction);
      var seq = new ParallelSequence().Action(actions);

      this.debugFn(function() {
        return ["select()", { choices: choices, actions: seq.size() }];
      });

      return seq.Start();
    },

    reset: function() {
      var resetLevelAction = _.chain(this.resetLevelAction)
        .bind(this)
        .unary()
        .value();

      var actions = _.map(LEVELS, resetLevelAction);
      var seq = new ParallelSequence().Action(actions);

      this.debugFn(function() {
        return ["reset()", { actions: seq.size() }];
      });

      return seq.Start();
    },

    // ----- UI methods -----

    ShowTooltip: function() {
      this.tooltipId = _.uniqueId(TOOLTIP_ID);

      var params = {
        heroId: this.heroId,
        selected: this.selected,
      };

      this.debug("ShowTooltip()", this.tooltipId, params);
      this.showTooltip(this.$ctx, this.tooltipId, TOOLTIP_LAYOUT, params);
    },

    HideTooltip: function() {
      if (this.tooltipId) {
        this.hideTooltip(this.$ctx, this.tooltipId);
        this.tooltipId = null;
      }
    },
  });

  context.component = new UITalentsDisplay();
})(GameUI.CustomUIConfig(), this);
