import type { TalentSelection } from "@invokation/panorama-lib/dota2/talents";
import { TalentLevel, TalentSide, Talents } from "@invokation/panorama-lib/dota2/talents";
import type { Action } from "@invokation/panorama-lib/sequence";
import { ParallelSequence } from "@invokation/panorama-lib/sequence";

import type { Inputs } from "../component";
import { Component } from "../component";

type TalentLevelType = typeof TalentLevel;

export type TalentsDisplayElements = {
  [K in keyof TalentLevelType as `statRow${TalentLevelType[K]}`]: Panel;
};

export interface TalentsDisplayInputs extends Inputs {
  reset: undefined;
  select: {
    heroId: HeroID;
    talents: TalentSelection;
  };
}

enum CssClass {
  BranchSelectedLeft = "LeftBranchSelected",
  BranchSelectedRight = "RightBranchSelected",
}

const LEVELS = [TalentLevel.Tier1, TalentLevel.Tier2, TalentLevel.Tier3, TalentLevel.Tier4];

const BranchRowClass = {
  [TalentSide.Left]: CssClass.BranchSelectedLeft,
  [TalentSide.Right]: CssClass.BranchSelectedRight,
};

export type { TalentsDisplay };

class TalentsDisplay extends Component<TalentsDisplayElements, TalentsDisplayInputs> {
  talents: Talents | undefined;
  heroId: HeroID | undefined;
  tooltipId: string | undefined;

  constructor() {
    super({
      elements: {
        statRow10: "StatRow10",
        statRow15: "StatRow15",
        statRow20: "StatRow20",
        statRow25: "StatRow25",
      },
      panelEvents: {
        $: {
          onmouseover: () => this.onMouseOver(),
          onmouseout: () => this.onMouseOut(),
        },
      },
      inputs: {
        select: (payload) => this.onSelect(payload),
        reset: (payload) => this.onReset(payload),
      },
    });

    this.debug("init");
  }

  // ----- I/O -----

  onSelect(payload: TalentsDisplayInputs["select"]): void {
    this.debug("onSelect()", payload);

    this.heroId = payload.heroId;
    this.talents = new Talents(payload.talents);
    this.tooltipId = `TooltipStatBranch_${this.heroId}_${this.talents.value}`;

    this.render();
  }

  onReset(payload: TalentsDisplayInputs["reset"]): void {
    this.debug("onReset()", payload);
    this.reset();
  }

  // ----- Event handlers -----

  onMouseOver(): void {
    if (this.heroId == null || this.talents == null || this.tooltipId == null) {
      this.warn("tried to onMouseOver() without hero ID, selected talents or tooltip ID");
      return;
    }

    // NOTE: disabled. See `TooltipStatBranch` comments.
    // this.showTooltip(this.panel, LayoutId.TooltipStatBranch, this.tooltipId, {
    //   heroId: this.heroId,
    //   selected: this.talents.value,
    // });
  }

  onMouseOut(): void {
    if (this.tooltipId == null) {
      this.warn("tried to onMouseOut() without tooltip ID");
      return;
    }

    // NOTE: disabled. See `TooltipStatBranch` comments.
    // this.hideTooltip(this.panel, this.tooltipId);
  }

  // ----- Helpers -----

  row(level: TalentLevel): Panel {
    return this.elements[`statRow${level}`];
  }

  // ----- Actions -----

  selectLevelAction(level: TalentLevel): Action {
    return Object.values(TalentSide).reduce(
      (seq, side) =>
        this.talents?.isSelected(level, side)
          ? seq.addClass(this.row(level), BranchRowClass[side])
          : seq.removeClass(this.row(level), BranchRowClass[side]),
      new ParallelSequence(),
    );
  }

  resetLevelAction(level: TalentLevel): Action {
    return Object.values(TalentSide).reduce(
      (seq, side) => seq.removeClass(this.row(level), BranchRowClass[side]),
      new ParallelSequence(),
    );
  }

  // ----- Action runners -----

  render(): void {
    if (this.heroId == null || this.talents == null) {
      this.warn("tried to render() without hero ID or selected talents");
      return;
    }

    const seq = LEVELS.reduce(
      (seq, level) => seq.add(this.selectLevelAction(level)),
      new ParallelSequence(),
    );

    this.debugFn(() => [
      "select()",
      { heroId: this.heroId, selected: this.talents?.value, actions: seq.deepSize() },
    ]);

    seq.run();
  }

  reset(): void {
    const seq = LEVELS.reduce(
      (seq, level) => seq.add(this.resetLevelAction(level)),
      new ParallelSequence(),
    );

    this.debugFn(() => ["reset()", { actions: seq.deepSize() }]);

    seq.run();
  }
}

(() => {
  new TalentsDisplay();
})();
