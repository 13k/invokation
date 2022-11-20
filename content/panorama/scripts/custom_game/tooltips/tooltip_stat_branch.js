"use strict";

(function (global, context) {
  var _ = global.lodash;
  var L10n = global.L10n;
  var Util = global.Util;
  var Sequence = global.Sequence.Sequence;
  var ParallelSequence = global.Sequence.ParallelSequence;
  // var RunFunctionAction = global.Sequence.RunFunctionAction;
  var CreateComponent = context.CreateComponent;

  var HERO_DATA = global.HERO_DATA;
  // var INVOKER = global.Const.INVOKER;

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

      HERO_DATA.OnChange(this.onHeroDataChange.bind(this));

      this.debug("init");
    },

    // ----- Event handlers -----

    onLoad: function () {
      this.selected = this.$ctx.GetAttributeUInt32("selected", 0);
      this.debug("onLoad()", { selected: this.selected });
      this.update();
    },

    onHeroDataChange: function (kv) {
      this.heroData = kv;

      this.talents = _.transform(
        this.heroData.TALENT_ABILITIES,
        function (abilities, ability, i) {
          var level = Util.TalentArrayIndexToLevel(i);
          var side = _.toUpper(Util.TalentArrayIndexToSide(i));

          abilities[level] = abilities[level] || {};
          abilities[level][side] = ability;
        },
        {}
      );

      this.debug("onHeroDataChange()");
      this.update();
    },

    // ----- Helpers -----

    update: function () {
      if (this.selected != null && this.heroData != null) {
        this.render();
      }
    },

    resetRows: function () {
      this.$rows = {};
    },

    localizeBranch: function (panel, level, side) {
      this.debug("localizeBranch()", { level: level, side: side });

      var ability = _.get(this.talents, [level, side]);

      if (ability == null) {
        this.error(
          "could not find ability for talent level " + _.toString(level) + " and side " + side
        );

        return;
      }

      /*
      var abilitySpecial = _.get(this.heroData, [ability, "AbilitySpecial"]);

      if (abilitySpecial == null) {
        this.error("could not find AbilitySpecial for ability " + ability);
        return;
      }
      */

      this.debug("localizeBranch()", {
        ability: ability || "UNDEFINED!!!",
        // abilitySpecial: abilitySpecial || "UNDEFINED!!!",
      });

      this.debug("localizeBranch() : FindChildrenWithClassTraverse [panel]", {
        class: CLASSES.BRANCH_ROW_SIDES[side],
      });

      var branchPanel = _.first(
        panel.FindChildrenWithClassTraverse(CLASSES.BRANCH_ROW_SIDES[side])
      );

      this.debug("localizeBranch()", { branchPanel: branchPanel });
      this.debug("localizeBranch() : FindChildrenWithClassTraverse [label]", {
        class: CLASSES.BRANCH_ROW_CHOICE_LABEL,
      });

      var branchLabel = _.first(
        branchPanel.FindChildrenWithClassTraverse(CLASSES.BRANCH_ROW_CHOICE_LABEL)
      );

      this.debug("localizeBranch()", { branchLabel: branchLabel });

      /*
      _.each(abilitySpecial, function (special) {
        _.forOwn(special, function (value, key) {
          if (key === "var_type") return;

          this.debug("localizeBranch() : SetDialogVariable", { key: key, value: value });

          branchLabel.SetDialogVariable(key, value);
        });
      });
      */

      this.debug("localizeBranch() : L10n.LocalizeAbilityTooltip()", {
        ability: ability,
        branchLabel: branchLabel,
      });

      var labelText = L10n.LocalizeAbilityTooltip(ability, branchLabel);

      this.debug("localizeBranch() : set branchLabel.text", { labelText: labelText });

      branchLabel.text = labelText;
    },

    createBranchRowPanel: function (level) {
      this.debug("createBranchRowPanel()", { level: level });

      var id = branchRowId(level);

      this.debug("createBranchRowPanel() : CreatePanelWithLayoutSnippet()", {
        id: id,
        snippet: BRANCH_ROW_SNIPPET,
      });

      var panel = Util.CreatePanelWithLayoutSnippet(this.$container, id, BRANCH_ROW_SNIPPET);

      this.debug("createBranchRowPanel() : SetDialogVariable", {
        var_name: BRANCH_ROW_VAR_LEVEL,
        value: level,
      });

      panel.SetDialogVariable(BRANCH_ROW_VAR_LEVEL, level);

      _.each(
        SIDES,
        function (side) {
          this.localizeBranch(panel, level, side);
        }.bind(this)
      );

      this.$rows[level] = panel;

      this.debug("createBranchRowPanel() : panel created");

      return panel;
    },

    // ----- Actions -----

    resetAction: function () {
      return new Sequence()
        .RunFunction(this, function () {
          this.debug("resetAction() : RemoveChildren");
        })
        .RemoveChildren(this.$container)
        .RunFunction(this, function () {
          this.debug("resetAction() : resetRows()");
        })
        .RunFunction(this, this.resetRows);
    },

    createBranchRowPanelAction: function (level) {
      return new Sequence()
        .RunFunction(this, function () {
          this.debug("createBranchRowPanelAction()", { level: level });
        })
        .RunFunction(this, this.createBranchRowPanel, level);
    },

    renderRowsAction: function () {
      return _.map(LEVELS, this.createBranchRowPanelAction.bind(this));
    },

    selectBranchAction: function (level) {
      var seq = new Sequence();
      var side;

      if (Util.IsTalentSelected(level, "right", this.selected)) {
        side = "RIGHT";
      } else if (Util.IsTalentSelected(level, "left", this.selected)) {
        side = "LEFT";
      }

      seq = seq.RunFunction(this, function () {
        this.debug("selectBranchAction()", { level: level, side: side });
      });

      if (side) {
        seq = seq.RunFunction(this, this.selectBranchSide, level, side);
      }

      return seq;
    },

    selectBranchesAction: function () {
      var actions = _.map(LEVELS, this.selectBranchAction.bind(this));

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
        seq.RunFunction(this, function () {
          this.debug("selectBranchSide() : RemoveClass", {
            level: level,
            side: s,
            class: CLASSES.BRANCH_SELECTED[s],
          });
        });

        seq.RemoveClass(row, CLASSES.BRANCH_SELECTED[s]);
      });

      seq.RunFunction(this, function () {
        this.debug("selectBranchSide() : AddClass", {
          level: level,
          side: side,
          class: CLASSES.BRANCH_SELECTED[side],
        });
      });

      seq.AddClass(row, CLASSES.BRANCH_SELECTED[side]);

      return seq.Start();
    },
  });

  context.component = new TooltipStatBranch();
})(GameUI.CustomUIConfig(), this);
