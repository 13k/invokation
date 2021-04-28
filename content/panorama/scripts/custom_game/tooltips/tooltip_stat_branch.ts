import { first, forOwn, get } from "lodash";
import { ABILITIES_KV } from "../custom_ui_manifest";
import type { ChangeEvent as AbilitiesChangeEvent } from "../lib/abilities_collection";
import { Component } from "../lib/component";
import type { AbilitiesKeyValues } from "../lib/dota";
import { Talent, talentSelectedSide, TalentSide, TalentTier } from "../lib/dota";
import { TALENTS } from "../lib/invoker";
import { localizeAbilityTooltip } from "../lib/l10n";
import { Action, ParallelSequence, RunFunctionAction, SerialSequence } from "../lib/sequence";

export type Inputs = never;
export type Outputs = never;

export type Attributes = {
  selected: Talent;
};

interface Elements {
  container: Panel;
}

type RowPanels = Record<TalentTier, Panel>;

const DYN_ELEMS = {
  BRANCH_ROW: {
    snippet: "stat-branch-row",
    idPrefix: "stat-branch-row",
    dialogVarLevel: "level",
  },
};

const CLASSES = {
  BRANCH_ROW_SIDES: {
    [TalentSide.RIGHT]: "branch-right",
    [TalentSide.LEFT]: "branch-left",
  },
  BRANCH_ROW_CHOICE_LABEL: "bonus-label",
  BRANCH_SELECTED: {
    [TalentSide.RIGHT]: "branch-right-selected",
    [TalentSide.LEFT]: "branch-left-selected",
  },
};

const branchRowID = (tier: TalentTier) => `${DYN_ELEMS.BRANCH_ROW.idPrefix}-${tier}`;
const isTalentTier = (tier: string | TalentTier): tier is TalentTier => typeof tier === "number";

export class TooltipStatBranch extends Component {
  #elements: Elements;
  #rows: RowPanels = {} as RowPanels;
  #selected: Talent = Talent.NONE;
  #abilitiesKV?: AbilitiesKeyValues;

  constructor() {
    super();

    this.#elements = this.findAll<Elements>({
      container: "stat-branch-container",
    });

    ABILITIES_KV.onChange(this.onAbilitiesKvChange.bind(this));

    this.debug("init");
  }

  // ----- Event handlers -----

  load(): void {
    this.#selected = this.ctx.GetAttributeUInt32("selected", 0);
    this.debug("onLoad()", { selected: this.#selected });
    this.update();
  }

  onAbilitiesKvChange({ kv }: AbilitiesChangeEvent): void {
    this.#abilitiesKV = kv;
    this.debug("onAbilitiesKvChange()");
    this.update();
  }

  // ----- Helpers -----

  update(): void {
    if (this.#abilitiesKV != null) {
      this.render();
    }
  }

  resetRows(): void {
    this.#rows = {} as RowPanels;
  }

  localizeBranch(panel: Panel, tier: TalentTier, side: TalentSide): void {
    const ability = get(TALENTS, [tier, side]);

    if (ability == null) {
      return;
    }

    const abilitySpecial = get(this.#abilitiesKV, [ability, "AbilitySpecial"]);

    if (abilitySpecial == null) {
      return;
    }

    const branchPanel = first(panel.FindChildrenWithClassTraverse(CLASSES.BRANCH_ROW_SIDES[side]));

    if (branchPanel == null) {
      return;
    }

    const branchLabel = first(
      branchPanel.FindChildrenWithClassTraverse(CLASSES.BRANCH_ROW_CHOICE_LABEL)
    ) as LabelPanel;

    if (branchLabel == null) {
      return;
    }

    abilitySpecial.forEach((special) => {
      forOwn(special, (value, key) => {
        if (key === "var_type") return;

        branchLabel.SetDialogVariable(key, value);
      });
    });

    branchLabel.text = localizeAbilityTooltip(ability, branchLabel);
  }

  createBranchRowPanel(tier: TalentTier): void {
    const { snippet, dialogVarLevel } = DYN_ELEMS.BRANCH_ROW;
    const id = branchRowID(tier);
    const panel = this.createSnippet(this.#elements.container, id, snippet, {
      dialogVars: {
        [dialogVarLevel]: String(tier),
      },
    });

    Object.values(TalentSide).forEach((side) => {
      if (typeof side === "number") {
        this.localizeBranch(panel, tier, side);
      }
    });

    this.#rows[tier] = panel;
  }

  // ----- Actions -----

  resetAction(): Action {
    return new SerialSequence()
      .RemoveChildren(this.#elements.container)
      .RunFunction(() => this.resetRows());
  }

  createBranchRowPanelAction(tier: TalentTier): Action {
    return new RunFunctionAction(() => this.createBranchRowPanel(tier));
  }

  renderRowsAction(): Action {
    const actions = Object.values(TalentTier)
      .filter(isTalentTier)
      .sort()
      .map((tier) => this.createBranchRowPanelAction(tier));

    return new SerialSequence().Action(...actions);
  }

  selectBranchesAction(): Action {
    const actions = Object.values(TalentTier)
      .filter(isTalentTier)
      .map((tier) => this.selectBranchAction(tier));

    return new ParallelSequence().Action(...actions);
  }

  selectBranchAction(tier: TalentTier): Action {
    const seq = new SerialSequence();
    const side = talentSelectedSide(tier, this.#selected);

    if (side != null) {
      seq.Action(this.selectBranchSideAction(tier, side));
    }

    return seq;
  }

  selectBranchSideAction(tier: TalentTier, side: TalentSide): Action {
    const row = this.#rows[tier];
    const otherSide = side === TalentSide.RIGHT ? TalentSide.LEFT : TalentSide.RIGHT;

    return new SerialSequence()
      .RemoveClass(row, CLASSES.BRANCH_SELECTED[otherSide])
      .AddClass(row, CLASSES.BRANCH_SELECTED[side]);
  }

  // ----- Action runners -----

  render(): void {
    const seq = new SerialSequence()
      .Action(this.resetAction())
      .Action(this.renderRowsAction())
      .Action(this.selectBranchesAction());

    this.debugFn(() => ["render()", { selected: this.#selected, actions: seq.length }]);

    seq.run();
  }
}

//   context.tooltip = new TooltipStatBranch();
// })(GameUI.CustomUIConfig(), this);
