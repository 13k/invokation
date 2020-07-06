"use strict";

(function (global, context) {
  var _ = global.lodash;
  var L10n = global.L10n;
  var Sequence = global.Sequence.Sequence;
  var ParallelSequence = global.Sequence.ParallelSequence;
  var RunFunctionAction = global.Sequence.RunFunctionAction;
  var CreatePanelWithLayoutSnippet = global.Util.CreatePanelWithLayoutSnippet;
  var IsTalentSelected = global.Util.IsTalentSelected;
  var TalentArrayIndexToLevel = global.Util.TalentArrayIndexToLevel;
  var TalentArrayIndexToSide = global.Util.TalentArrayIndexToSide;
  var CreateComponent = context.CreateComponent;

  var ABILITIES_KV = global.ABILITIES_KV;
  var INVOKER = global.Const.INVOKER;

  var LEVELS = [25, 20, 15, 10];
  var SIDES = ["RIGHT", "LEFT"];

  var BRANCH_ROW_SNIPPET = "TooltipStatBranchRow";
  var BRANCH_ROW_ID_PREFIX = "TooltipStatBranchRow";
  var BRANCH_ROW_VAR_LEVEL = "level";

  var CLASSES = {
    BRANCH_ROW_SIDES: {
      RIGHT: "BranchRight",
      LEFT: "BranchLeft",
    },
    BRANCH_ROW_CHOICE_LABEL: "StatBonusLabel",
    BRANCH_SELECTED: {
      RIGHT: "BranchRightSelected",
      LEFT: "BranchLeftSelected",
    },
  };

  var TALENT_ABILITIES = _.transform(
    INVOKER.TALENT_ABILITIES,
    function (abilities, ability, i) {
      var level = TalentArrayIndexToLevel(i);
      var side = _.toUpper(TalentArrayIndexToSide(i));

      abilities[level] = abilities[level] || {};
      abilities[level][side] = ability;
    },
    {}
  );

  function branchRowId(level) {
    return BRANCH_ROW_ID_PREFIX + _.toString(level);
  }

  var TooltipStatBranch = CreateComponent({
    constructor: function TooltipStatBranch() {
      TooltipStatBranch.super.call(this, {
        elements: {
          container: "TooltipStatBranchContainer",
        },
      });

      ABILITIES_KV.OnChange(this.onAbilitiesKvChange.bind(this));

      this.debug("init");
    },

    // ----- Event handlers -----

    onLoad: function () {
      this.selected = this.$ctx.GetAttributeUInt32("selected", 0);
      this.debug("onLoad()", { selected: this.selected });
      this.update();
    },

    onAbilitiesKvChange: function (kv) {
      this.abilitiesKV = kv;
      this.debug("onAbilitiesKvChange()");
      this.update();
    },

    // ----- Helpers -----

    update: function () {
      if (this.selected != null && this.abilitiesKV != null) {
        this.render();
      }
    },

    resetRows: function () {
      this.$rows = {};
    },

    localizeBranch: function (panel, level, side) {
      var ability = _.get(TALENT_ABILITIES, [level, side]);
      var abilitySpecial = _.get(this.abilitiesKV, [ability, "AbilitySpecial"]);

      var branchPanel = _.first(
        panel.FindChildrenWithClassTraverse(CLASSES.BRANCH_ROW_SIDES[side])
      );

      var branchLabel = _.first(
        branchPanel.FindChildrenWithClassTraverse(CLASSES.BRANCH_ROW_CHOICE_LABEL)
      );

      _.each(abilitySpecial, function (special) {
        _.forOwn(special, function (value, key) {
          if (key === "var_type") return;
          branchLabel.SetDialogVariable(key, value);
        });
      });

      branchLabel.text = L10n.LocalizeAbilityTooltip(ability, branchLabel);
    },

    createBranchRowPanel: function (level) {
      var id = branchRowId(level);
      var panel = CreatePanelWithLayoutSnippet(this.$container, id, BRANCH_ROW_SNIPPET);

      panel.SetDialogVariable(BRANCH_ROW_VAR_LEVEL, level);

      var localizeBranch = _.chain(this.localizeBranch).bind(this, panel, level).unary().value();

      _.each(SIDES, localizeBranch);

      this.$rows[level] = panel;

      return panel;
    },

    // ----- Actions -----

    resetAction: function () {
      return new Sequence().RemoveChildren(this.$container).RunFunction(this, this.resetRows);
    },

    createBranchRowPanelAction: function (level) {
      return new RunFunctionAction(this, this.createBranchRowPanel, level);
    },

    renderRowsAction: function () {
      var createBranchRowPanelAction = _.chain(this.createBranchRowPanelAction)
        .bind(this)
        .unary()
        .value();

      return _.map(LEVELS, createBranchRowPanelAction);
    },

    selectBranchAction: function (level) {
      var seq = new Sequence();
      var side;

      if (IsTalentSelected(level, "right", this.selected)) {
        side = "RIGHT";
      } else if (IsTalentSelected(level, "left", this.selected)) {
        side = "LEFT";
      }

      if (side) {
        seq.RunFunction(this, this.selectBranchSide, level, side);
      }

      return seq;
    },

    selectBranchesAction: function () {
      var selectBranchAction = _.chain(this.selectBranchAction).bind(this).unary().value();

      var actions = _.map(LEVELS, selectBranchAction);

      return new ParallelSequence().Action(actions);
    },

    // ----- Action runners -----

    render: function () {
      var seq = new Sequence()
        .Action(this.resetAction())
        .Action(this.renderRowsAction())
        .Action(this.selectBranchesAction());

      this.debugFn(function () {
        return ["render()", { selected: this.selected, actions: seq.size() }];
      });

      return seq.Start();
    },

    selectBranchSide: function (level, side) {
      var row = this.$rows[level];
      var seq = new Sequence();

      _.each(SIDES, function (s) {
        seq.RemoveClass(row, CLASSES.BRANCH_SELECTED[s]);
      });

      seq.AddClass(row, CLASSES.BRANCH_SELECTED[side]);

      return seq.Start();
    },
  });

  context.component = new TooltipStatBranch();
})(GameUI.CustomUIConfig(), this);
