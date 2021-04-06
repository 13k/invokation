"use strict";

((global, context) => {
  const { Component } = context;
  const { lodash: _ } = global;
  const { ParallelSequence } = global.Sequence;
  const { IsTalentSelected } = global.Util;
  const { LAYOUTS, TALENT_LEVELS } = global.Const;

  const TOOLTIP_ID = "tooltip";

  const CLASSES = {
    BRANCH_SELECTED: {
      LEFT: "LeftBranchSelected",
      RIGHT: "RightBranchSelected",
    },
  };

  const statRowAttr = (level) => `statRow${level}`;

  class UITalentsDisplay extends Component {
    constructor() {
      super({
        elements: ["StatRow10", "StatRow15", "StatRow20", "StatRow25"],
        inputs: {
          Select: "onSelect",
          Reset: "onReset",
        },
      });

      this.bindRows();
      this.debug("init");
    }

    // ----- I/O -----

    onSelect(payload) {
      this.debug("onSelect()", payload);
      this.select(payload.talents);
    }

    onReset() {
      this.debug("onReset()");
      this.reset();
    }

    // ----- Helpers -----

    bindRows() {
      this.$rows = {};

      _.each(TALENT_LEVELS, this.bindRow.bind(this));
    }

    bindRow(level) {
      this.$rows[level] = this.element(statRowAttr(level));
    }

    // ----- Actions -----

    selectLevelAction(level, choices) {
      const seq = new ParallelSequence();

      if (IsTalentSelected(level, "right", choices)) {
        seq.AddClass(this.$rows[level], CLASSES.BRANCH_SELECTED.RIGHT);
        seq.RemoveClass(this.$rows[level], CLASSES.BRANCH_SELECTED.LEFT);
      } else if (IsTalentSelected(level, "left", choices)) {
        seq.RemoveClass(this.$rows[level], CLASSES.BRANCH_SELECTED.RIGHT);
        seq.AddClass(this.$rows[level], CLASSES.BRANCH_SELECTED.LEFT);
      }

      return seq;
    }

    resetLevelAction(level) {
      return new ParallelSequence()
        .RemoveClass(this.$rows[level], CLASSES.BRANCH_SELECTED.LEFT)
        .RemoveClass(this.$rows[level], CLASSES.BRANCH_SELECTED.RIGHT);
    }

    // ----- Action runners -----

    select(choices) {
      this.selected = choices;

      const selectLevelAction = _.chain(this.selectLevelAction)
        .bind(this, _, choices)
        .unary()
        .value();

      const actions = _.map(TALENT_LEVELS, selectLevelAction);
      const seq = new ParallelSequence().Action(actions);

      this.debugFn(() => ["select()", { choices, actions: seq.size() }]);

      return seq.Start();
    }

    reset() {
      const resetLevelAction = _.chain(this.resetLevelAction).bind(this).unary().value();
      const actions = _.map(TALENT_LEVELS, resetLevelAction);
      const seq = new ParallelSequence().Action(actions);

      this.debugFn(() => ["reset()", { actions: seq.size() }]);

      return seq.Start();
    }

    // ----- UI methods -----

    ShowTooltip() {
      this.tooltipId = _.uniqueId(TOOLTIP_ID);

      const params = {
        heroId: this.heroId,
        selected: this.selected,
      };

      this.debug("ShowTooltip()", this.tooltipId, params);
      this.showTooltip(this.$ctx, this.tooltipId, LAYOUTS.TOOLTIPS.STAT_BRANCH, params);
    }

    HideTooltip() {
      if (this.tooltipId) {
        this.hideTooltip(this.$ctx, this.tooltipId);
        this.tooltipId = null;
      }
    }
  }

  context.component = new UITalentsDisplay();
})(GameUI.CustomUIConfig(), this);
