"use strict";

((global, context) => {
  const { Component } = context;
  const { lodash: _, ABILITIES_KV, L10n } = global;
  const { Sequence, ParallelSequence, RunFunctionAction } = global.Sequence;
  const { IsTalentSelected, TalentArrayIndexToLevel, TalentArrayIndexToSide } = global.Util;
  const { INVOKER, TALENT_LEVELS } = global.Const;

  const DYN_ELEMS = {
    BRANCH_ROW: {
      name: "stat-branch-row",
      idPrefix: "stat-branch-row",
      dialogVarLevel: "level",
    },
  };

  const CLASSES = {
    BRANCH_ROW_SIDES: {
      RIGHT: "branch-right",
      LEFT: "branch-left",
    },
    BRANCH_ROW_CHOICE_LABEL: "bonus-label",
    BRANCH_SELECTED: {
      RIGHT: "branch-right-selected",
      LEFT: "branch-left-selected",
    },
  };

  const LEVELS = _.reverse(TALENT_LEVELS);
  const SIDES = ["RIGHT", "LEFT"];
  const TALENT_ABILITIES = _.transform(
    INVOKER.TALENT_ABILITIES,
    (abilities, ability, i) => {
      const level = TalentArrayIndexToLevel(i);
      const side = _.toUpper(TalentArrayIndexToSide(i));

      abilities[level] = abilities[level] || {};
      abilities[level][side] = ability;
    },
    {}
  );

  const branchRowId = (level) => `${DYN_ELEMS.BRANCH_ROW.idPrefix}-${level}`;

  class TooltipStatBranch extends Component {
    constructor() {
      super({
        elements: {
          container: "stat-branch-container",
        },
      });

      ABILITIES_KV.OnChange(this.onAbilitiesKvChange.bind(this));

      this.debug("init");
    }

    // ----- Event handlers -----

    onLoad() {
      this.selected = this.$ctx.GetAttributeUInt32("selected", 0);
      this.debug("onLoad()", { selected: this.selected });
      this.update();
    }

    onAbilitiesKvChange(kv) {
      this.abilitiesKV = kv;
      this.debug("onAbilitiesKvChange()");
      this.update();
    }

    // ----- Helpers -----

    update() {
      if (this.selected && this.abilitiesKV) {
        this.render();
      }
    }

    resetRows() {
      this.$rows = {};
    }

    localizeBranch(panel, level, side) {
      const ability = _.get(TALENT_ABILITIES, [level, side]);
      const abilitySpecial = _.get(this.abilitiesKV, [ability, "AbilitySpecial"]);

      const branchPanel = _.first(
        panel.FindChildrenWithClassTraverse(CLASSES.BRANCH_ROW_SIDES[side])
      );

      const branchLabel = _.first(
        branchPanel.FindChildrenWithClassTraverse(CLASSES.BRANCH_ROW_CHOICE_LABEL)
      );

      _.each(abilitySpecial, (special) => {
        _.forOwn(special, (value, key) => {
          if (key === "var_type") return;

          branchLabel.SetDialogVariable(key, value);
        });
      });

      branchLabel.text = L10n.LocalizeAbilityTooltip(ability, branchLabel);
    }

    createBranchRowPanel(level) {
      const { name, dialogVarLevel } = DYN_ELEMS.BRANCH_ROW;
      const id = branchRowId(level);
      const panel = this.createSnippet(this.$container, id, name, {
        dialogVars: {
          [dialogVarLevel]: level,
        },
      });

      const localizeBranch = _.chain(this.localizeBranch).bind(this, panel, level).unary().value();

      _.each(SIDES, localizeBranch);

      this.$rows[level] = panel;

      return panel;
    }

    // ----- Actions -----

    resetAction() {
      return new Sequence().RemoveChildren(this.$container).RunFunction(() => this.resetRows());
    }

    createBranchRowPanelAction(level) {
      return new RunFunctionAction(() => this.createBranchRowPanel(level));
    }

    renderRowsAction() {
      const createBranchRowPanelAction = _.chain(this.createBranchRowPanelAction)
        .bind(this)
        .unary()
        .value();

      return _.map(LEVELS, createBranchRowPanelAction);
    }

    selectBranchAction(level) {
      const seq = new Sequence();
      let side = null;

      if (IsTalentSelected(level, "right", this.selected)) {
        side = "RIGHT";
      } else if (IsTalentSelected(level, "left", this.selected)) {
        side = "LEFT";
      }

      if (side) {
        seq.RunFunction(() => this.selectBranchSide(level, side));
      }

      return seq;
    }

    selectBranchesAction() {
      const selectBranchAction = _.chain(this.selectBranchAction).bind(this).unary().value();
      const actions = _.map(LEVELS, selectBranchAction);

      return new ParallelSequence().Action(actions);
    }

    // ----- Action runners -----

    render() {
      const seq = new Sequence()
        .Action(this.resetAction())
        .Action(this.renderRowsAction())
        .Action(this.selectBranchesAction());

      this.debugFn(() => ["render()", { selected: this.selected, actions: seq.length }]);

      return seq.Start();
    }

    selectBranchSide(level, side) {
      const row = this.$rows[level];
      const seq = new Sequence();

      _.each(SIDES, (s) => seq.RemoveClass(row, CLASSES.BRANCH_SELECTED[s]));

      seq.AddClass(row, CLASSES.BRANCH_SELECTED[side]);

      return seq.Start();
    }
  }

  context.tooltip = new TooltipStatBranch();
})(GameUI.CustomUIConfig(), this);
