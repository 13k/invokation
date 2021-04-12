"use strict";

((global, context) => {
  const { Component } = context;
  const { lodash: _ } = global;
  const { ParallelSequence } = global.Sequence;
  const { IsTalentSelected } = global.Util;
  const { COMPONENTS, TALENT_LEVELS } = global.Const;

  const TOOLTIP_ID_PREFIX = "ui-talents-display-tooltip";

  const CLASSES = {
    BRANCH_SELECTED: {
      LEFT: "LeftBranchSelected",
      RIGHT: "RightBranchSelected",
    },
  };

  const statRowAttr = (level) => `statRow${level}`;

  class TalentsDisplay extends Component {
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

      TALENT_LEVELS.forEach(this.bindRow.bind(this));
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

      const actions = TALENT_LEVELS.map((level) => this.selectLevelAction(level, choices));
      const seq = new ParallelSequence().Action(actions);

      this.debugFn(() => ["select()", { choices, actions: seq.length }]);

      return seq.Start();
    }

    reset() {
      const actions = TALENT_LEVELS.map(this.resetLevelAction.bind(this));
      const seq = new ParallelSequence().Action(actions);

      this.debugFn(() => ["reset()", { actions: seq.length }]);

      return seq.Start();
    }

    // ----- UI methods -----

    ShowTooltip() {
      const { layout } = COMPONENTS.TOOLTIPS.STAT_BRANCH;

      this.tooltipId = _.uniqueId(TOOLTIP_ID_PREFIX);

      const params = {
        heroId: this.heroId,
        selected: this.selected,
      };

      this.debug("ShowTooltip()", this.tooltipId, params);
      this.showTooltip(this.$ctx, this.tooltipId, layout, params);
    }

    HideTooltip() {
      if (this.tooltipId) {
        this.hideTooltip(this.$ctx, this.tooltipId);
        this.tooltipId = null;
      }
    }
  }

  context.component = new TalentsDisplay();
})(GameUI.CustomUIConfig(), this);
