import type { HeroData } from "@invokation/panorama-lib/custom_net_tables/invokation";
import type { Ability } from "@invokation/panorama-lib/dota2/invoker";
import type { TalentMap, TalentSelection } from "@invokation/panorama-lib/dota2/talents";
import { TalentLevel, TalentSide, Talents } from "@invokation/panorama-lib/dota2/talents";
import * as l10n from "@invokation/panorama-lib/l10n";
import { createPanelSnippet } from "@invokation/panorama-lib/panorama";
import type { Action } from "@invokation/panorama-lib/sequence";
import { ParallelSequence, Sequence } from "@invokation/panorama-lib/sequence";

import type { Elements, Params } from "../component";
import { Component, ParamType } from "../component";

export interface TooltipStatBranchElements extends Elements {
  container: Panel;
}

export interface TooltipStatBranchParams extends Params {
  heroId: HeroID;
  selected: TalentSelection;
}

const { HERO_DATA } = GameUI.CustomUIConfig().invk;

const LEVELS = [TalentLevel.Tier4, TalentLevel.Tier3, TalentLevel.Tier2, TalentLevel.Tier1];
const SIDES = [TalentSide.Right, TalentSide.Left];

const BRANCH_ROW_SNIPPET = "TooltipStatBranchRow";
const BRANCH_ROW_ID_PREFIX = "TooltipStatBranchRow";
const BRANCH_ROW_VAR_LEVEL = "level";

const CLASSES = {
  branchRowChoiceLabel: "StatBonusLabel",
  branchRowSides: {
    [TalentSide.Right]: "BranchRight",
    [TalentSide.Left]: "BranchLeft",
  },
  branchSelected: {
    [TalentSide.Right]: "BranchRightSelected",
    [TalentSide.Left]: "BranchLeftSelected",
  },
};

const branchRowId = (level: TalentLevel) => `${BRANCH_ROW_ID_PREFIX}${level}`;

export type { TooltipStatBranch };

class TooltipStatBranch extends Component<
  TooltipStatBranchElements,
  never,
  never,
  TooltipStatBranchParams
> {
  selected: Talents | undefined;
  talents: TalentMap<Ability> | undefined;
  heroData: HeroData | undefined;
  rows: Map<TalentLevel, Panel> = new Map();

  constructor() {
    super({
      elements: {
        container: "TooltipStatBranchContainer",
      },
      params: {
        heroId: { type: ParamType.Uint32, default: 0 },
        selected: { type: ParamType.Uint32, default: 0 },
      },
    });

    HERO_DATA.onChange(this.onHeroDataChange.bind(this));

    this.debug("init");
  }

  // ----- Event handlers -----

  override onLoad(): void {
    this.selected = new Talents(this.params.selected);

    this.debug("onLoad()", { selected: this.selected.value });
    this.render();
  }

  onHeroDataChange(data: HeroData): void {
    this.heroData = data;

    if (this.heroData == null) {
      return;
    }

    this.talents = this.heroData.TALENT_ABILITIES.reduce(
      (abilities, ability, i) => {
        const level = Talents.indexToLevel(i);
        const side = Talents.indexToSide(i);
        let sides = abilities.get(level);

        if (sides == null) {
          sides = new Map();
          abilities.set(level, sides);
        }

        sides.set(side, ability);

        return abilities;
      },
      new Map() as TalentMap<Ability>,
    );

    this.debug("onHeroDataChange()");
    this.render();
  }

  // ----- Helpers -----

  resetRows(): void {
    this.rows.clear();
  }

  localizeBranch(panel: Panel, level: TalentLevel, side: TalentSide): void {
    this.debug("localizeBranch()", { level, side });

    if (this.talents == null) {
      return;
    }

    const ability = this.talents.get(level)?.get(side);

    if (ability == null) {
      this.error(`Could not find ability for talent [${level}, ${side}]`);
      return;
    }

    this.debug("localizeBranch()", { ability });

    const branchClass = CLASSES.branchRowSides[side];

    this.debug("localizeBranch() : FindChildrenWithClassTraverse [panel]", { branchClass });

    const branchPanel = panel.FindChildrenWithClassTraverse(branchClass)[0];

    if (branchPanel == null) {
      this.error(
        `Could not find branch panel with class ${branchClass} for talent [${level}, ${side}]`,
      );

      return;
    }

    this.debug("localizeBranch()", { branchPanel });

    const branchLabelClass = CLASSES.branchRowChoiceLabel;

    this.debug("localizeBranch() : FindChildrenWithClassTraverse [label]", {
      branchLabelClass,
    });

    const branchLabel = branchPanel.FindChildrenWithClassTraverse(
      branchLabelClass,
    )[0] as LabelPanel;

    if (branchLabel == null) {
      this.error(
        `Could not find branch label with class ${branchLabelClass} for talent [${level}, ${side}]`,
      );

      return;
    }

    this.debug("localizeBranch()", { branchLabel });

    this.debug("localizeBranch() : L10n.LocalizeAbilityTooltip()", {
      ability,
      branchLabel: branchLabel.id,
    });

    const labelText = l10n.abilityTooltip(ability, branchLabel);

    this.debug("localizeBranch() : set branchLabel.text", { labelText });

    branchLabel.text = labelText;

    this.debug("localizeBranch() ---");
  }

  createBranchRowPanel(level: TalentLevel): void {
    this.debug("createBranchRowPanel()", { level });

    const id = branchRowId(level);

    this.debug("createBranchRowPanel() : CreatePanelWithLayoutSnippet()", {
      id,
      snippet: BRANCH_ROW_SNIPPET,
    });

    const panel = createPanelSnippet(this.elements.container, id, BRANCH_ROW_SNIPPET);

    this.debug("createBranchRowPanel() : SetDialogVariable", {
      var: BRANCH_ROW_VAR_LEVEL,
      value: level,
    });

    panel.SetDialogVariable(BRANCH_ROW_VAR_LEVEL, level.toString());

    for (const side of SIDES) {
      this.localizeBranch(panel, level, side);
    }

    this.rows.set(level, panel);

    this.debug("createBranchRowPanel() : panel created");
  }

  // ----- Actions -----

  resetAction(): Action {
    return new Sequence()
      .runFn(() => this.debug("resetAction() : RemoveChildren"))
      .removeChildren(this.elements.container)
      .runFn(() => this.debug("resetAction() : resetRows()"))
      .runFn(() => this.resetRows());
  }

  createBranchRowPanelAction(level: TalentLevel): Action {
    return new Sequence()
      .runFn(() => this.debug("createBranchRowPanelAction()", { level }))
      .runFn(() => this.createBranchRowPanel(level));
  }

  renderRowsActions(): Action[] {
    return LEVELS.map((level) => this.createBranchRowPanelAction(level));
  }

  selectBranchAction(level: TalentLevel): Action {
    const seq = new Sequence();

    if (this.selected == null) {
      return seq;
    }

    const sides = SIDES.filter((side) => this.selected?.isSelected(level, side));

    seq.runFn(() => this.debug("selectBranchAction()", { level, sides }));

    for (const side of sides) {
      seq.runFn(() => this.selectBranchSide(level, side));
    }

    return seq;
  }

  selectBranchesAction(): Action {
    const actions = LEVELS.map((level) => this.selectBranchAction(level));

    return new ParallelSequence().add(...actions);
  }

  // ----- Action runners -----

  render(): void {
    if (this.selected == null || this.talents == null) {
      this.warn("Tried to render without selected or talents");
      return;
    }

    const seq = new Sequence()
      .add(this.resetAction())
      .add(...this.renderRowsActions())
      .add(this.selectBranchesAction());

    this.debugFn(() => ["render()", { selected: this.selected?.value, actions: seq.deepSize() }]);

    seq.run();
  }

  selectBranchSide(level: TalentLevel, side: TalentSide): void {
    const row = this.rows.get(level);

    if (row == null) {
      throw new Error(`Could not find talent branch row for talent [${level}, ${side}]`);
    }

    const seq = new Sequence();

    for (const side of SIDES) {
      seq.runFn(() =>
        this.debug("selectBranchSide() : RemoveClass", {
          level,
          side,
          class: CLASSES.branchSelected[side],
        }),
      );

      seq.removeClass(row, CLASSES.branchSelected[side]);
    }

    seq.runFn(() =>
      this.debug("selectBranchSide() : AddClass", {
        level,
        side,
        class: CLASSES.branchSelected[side],
      }),
    );

    seq.addClass(row, CLASSES.branchSelected[side]);
    seq.run();
  }
}

(() => {
  new TooltipStatBranch();
})();
