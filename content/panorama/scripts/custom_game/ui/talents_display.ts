import { uniqueId } from "lodash";
import { Component } from "../lib/component";
import { ComponentLayout, COMPONENTS } from "../lib/const/component";
import { isTalentSelected, Talent, TalentSide, TalentTier } from "../lib/dota";
import { Action, ParallelSequence } from "../lib/sequence";
import { UIEvents } from "../lib/ui_events";
import type { Attributes as TooltipAttrs } from "../tooltips/tooltip_stat_branch";

export interface Inputs {
  [INPUTS.RESET]: never;
  [INPUTS.SELECT]: { talents: Talent };
}

export type Outputs = never;

type Elements = {
  [K in keyof typeof ELEMENTS]: Panel;
};

type TierRows = Record<TalentTier, Panel>;

const { inputs: INPUTS } = COMPONENTS.UI_TALENTS_DISPLAY;

const TOOLTIP_ID_PREFIX = "ui-talents-display-tooltip";

const CLASSES = {
  BRANCH_SELECTED: {
    LEFT: "LeftBranchSelected",
    RIGHT: "RightBranchSelected",
  },
};

const ELEMENTS = {
  [TalentTier.Tier1]: `StatRow${TalentTier.Tier1}`,
  [TalentTier.Tier2]: `StatRow${TalentTier.Tier2}`,
  [TalentTier.Tier3]: `StatRow${TalentTier.Tier3}`,
  [TalentTier.Tier4]: `StatRow${TalentTier.Tier4}`,
} as const;

export class UITalentsDisplay extends Component {
  #elements: Elements;
  #rows: TierRows;
  #selected: Talent = Talent.NONE;
  #tooltipID?: string;

  constructor() {
    super();

    this.#elements = this.findAll<Elements>(ELEMENTS);

    this.#rows = Object.values(TalentTier).reduce((rows, tier) => {
      if (typeof tier === "number") {
        rows[tier] = this.#elements[tier];
      }

      return rows;
    }, {} as TierRows);

    this.registerInputs({
      [INPUTS.SELECT]: this.onSelect,
      [INPUTS.RESET]: this.onReset,
    });

    this.debug("init");
  }

  // ----- I/O -----

  onSelect(payload: Inputs[typeof INPUTS.SELECT]): void {
    this.debug("onSelect()", payload);
    this.select(payload.talents);
  }

  onReset(): void {
    this.debug("onReset()");
    this.reset();
  }

  // ----- Actions -----

  selectTierAction(tier: TalentTier, choices: Talent): Action {
    const seq = new ParallelSequence();

    if (isTalentSelected(tier, TalentSide.RIGHT, choices)) {
      seq.AddClass(this.#rows[tier], CLASSES.BRANCH_SELECTED.RIGHT);
      seq.RemoveClass(this.#rows[tier], CLASSES.BRANCH_SELECTED.LEFT);
    } else if (isTalentSelected(tier, TalentSide.LEFT, choices)) {
      seq.RemoveClass(this.#rows[tier], CLASSES.BRANCH_SELECTED.RIGHT);
      seq.AddClass(this.#rows[tier], CLASSES.BRANCH_SELECTED.LEFT);
    }

    return seq;
  }

  resetTierAction(tier: TalentTier): Action {
    return new ParallelSequence()
      .RemoveClass(this.#rows[tier], CLASSES.BRANCH_SELECTED.LEFT)
      .RemoveClass(this.#rows[tier], CLASSES.BRANCH_SELECTED.RIGHT);
  }

  // ----- Action runners -----

  select(choices: Talent): void {
    this.#selected = choices;

    const actions = Object.values(TalentTier).reduce(
      (actions, tier) =>
        typeof tier === "number" ? [...actions, this.selectTierAction(tier, choices)] : actions,
      [] as Action[]
    );

    const seq = new ParallelSequence().Action(...actions);

    this.debugFn(() => ["select()", { choices, actions: seq.length }]);

    seq.run();
  }

  reset(): void {
    const actions = Object.values(TalentTier).reduce(
      (actions, tier) =>
        typeof tier === "number" ? [...actions, this.resetTierAction(tier)] : actions,
      [] as Action[]
    );

    const seq = new ParallelSequence().Action(...actions);

    this.debugFn(() => ["reset()", { actions: seq.length }]);

    seq.run();
  }

  // ----- UI methods -----

  showTooltip(): void {
    this.#tooltipID = uniqueId(TOOLTIP_ID_PREFIX);

    const params: TooltipAttrs = {
      // heroID: this.heroId,
      selected: this.#selected,
    };

    this.debug("showTooltip()", this.#tooltipID, params);

    UIEvents.showTooltip(this.ctx, this.#tooltipID, ComponentLayout.TooltipStatBranch, params);
  }

  hideTooltip(): void {
    if (this.#tooltipID) {
      UIEvents.hideTooltip(this.ctx, this.#tooltipID);

      this.#tooltipID = undefined;
    }
  }
}

//   context.component = new TalentsDisplay();
// })(GameUI.CustomUIConfig(), this);
