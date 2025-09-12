import type { HeroData } from "@invokation/panorama-lib/custom_net_tables/invokation";
import type { Ability } from "@invokation/panorama-lib/dota2/invoker";
import type { TalentMap, TalentSelection } from "@invokation/panorama-lib/dota2/talents";
import { TalentLevel, TalentSide, Talents } from "@invokation/panorama-lib/dota2/talents";
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

// FIXME: No l10n alternative seems to work out-of-the-box.
//
// `GameUI.SetupDOTATalentNameLabel` is broken and is probably legacy.
//
// `GameUI.ReplaceDOTAAbilitySpecialValues` requires an l10n key that changes according to which
// facet is currently active, but it seems it's only possible to get the facet numeric ID as
// opposed to facet name. Even if a mapping of {facet_id: facet_name} is hardcoded, it doesn't
// seem to be possible to check (using KeyValues) which l10n keys are using facets or not.
//
// For now, it doesn't seem to be any alternatives besides implementing l10n manually with all
// `AbilityValues` interpolated, which would be a huge effort and probably not worth it.
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

    this.debug("talents = {");
    for (const [level, sides] of this.talents.entries()) {
      this.debug(`  ${level} : {`);

      for (const [side, ability] of sides.entries()) {
        this.debug(`    ${side}: ${ability}`);
      }

      this.debug("  }");
    }
    this.debug("}");

    this.render();
  }

  // ----- Helpers -----

  resetRows(): void {
    this.rows.clear();
  }

  localizeBranch(panel: Panel, level: TalentLevel, side: TalentSide): void {
    const debug = (...args: unknown[]) => this.debug("localizeBranch", ":", ...args);

    debug({ level, side });

    if (this.talents == null) {
      return;
    }

    const ability = this.talents.get(level)?.get(side);

    if (ability == null) {
      this.error(`Could not find ability for talent [${level}, ${side}]`);
      return;
    }

    debug({ ability });

    const branchClass = CLASSES.branchRowSides[side];

    debug("FindChildrenWithClassTraverse [branchPanel]", { branchClass });

    const branchPanels = panel.FindChildrenWithClassTraverse(branchClass);
    const branchPanel = branchPanels[0];

    if (branchPanel == null) {
      this.error(`Could not find panel with class ${branchClass} for talent [${level}, ${side}]`);
      return;
    }

    debug({ branchPanel });

    const branchLabelClass = CLASSES.branchRowChoiceLabel;

    debug("FindChildrenWithClassTraverse [branchLabel]", { branchLabelClass });

    const branchLabels = branchPanel.FindChildrenWithClassTraverse(branchLabelClass);
    const branchLabel = branchLabels[0] as LabelPanel;

    if (branchLabel == null) {
      this.error(
        `Could not find panel with class ${branchLabelClass} for talent [${level}, ${side}]`,
      );

      return;
    }

    debug({ branchLabel });

    // This renders wrong talents.
    /*
    GameUI.SetupDOTATalentNameLabel(branchLabel, ability);
    */

    // This crashes the game.
    /*
    const l10nKey = l10n.abilityTooltipKey(ability);

    debug("l10n", { ability, l10nKey });

    let text = l10n.l(l10nKey);

    debug("l10n", { ability, l10nKey, text });

    if (text.startsWith("#")) {
      this.warn(`Could not localize ability "${ability}" with key "${l10nKey}"`);

      text = `!${text.substring(1)}`;
    } else {
      const expandedText = GameUI.ReplaceDOTAAbilitySpecialValues(ability, text);

      debug("GameUI.ReplaceDOTAAbilitySpecialValues", { expandedText });

      if (expandedText == null) {
        this.warn(
          `Could not replace ability special values for ability "${ability}" in text "${text}"`,
        );
      } else {
        text = expandedText;
      }
    }

    branchLabel.text = text;
    */

    debug("---");
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

    this.debugFn(() => ["render()", { selected: this.selected?.value, len: seq.deepLength }]);

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
