import type * as Dota2 from "../../lib/dota2";

type TTalentLevel = typeof Dota2.TalentLevel;

export type Elements = {
  [K in keyof TTalentLevel as `statRow${TTalentLevel[K]}`]: Panel;
};

const {
  Component,
  Dota2: { TalentLevel, TalentSide, isTalentSelected },
  lodash: _,
  Panorama: { UIEvent },
  Sequence: { ParallelSequence },
} = GameUI.CustomUIConfig();

enum PanelID {
  Tooltip = "TalentDisplayTooltip",
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

class TalentsDisplay extends Component<Elements> {
  selected?: Dota2.Talents;
  heroID?: HeroID;
  tooltipID?: string;

  constructor() {
    super({
      elements: ["statRow10", "statRow15", "statRow20", "statRow25"],
      inputs: {
        Select: "onSelect",
        Reset: "onReset",
      },
    });

    this.debug("init");
  }

  // ----- I/O -----

  row(level: Dota2.TalentLevel) {
    return this.elements[`statRow${level}`];
  }

  // ----- I/O -----

  onSelect(payload: { heroID: HeroID; talents: Dota2.Talents }) {
    this.debug("onSelect()", payload);

    this.heroID = payload.heroID;
    this.selected = payload.talents;

    this.render();
  }

  onReset() {
    this.debug("onReset()");
    this.reset();
  }

  // ----- Actions -----

  selectLevelAction(level: Dota2.TalentLevel, selected: Dota2.Talents) {
    return _.reduce(
      Object.entries(TalentSide),
      (seq, [, side]) =>
        isTalentSelected(level, side, selected)
          ? seq.AddClass(this.row(level), BranchRowClass[side])
          : seq.RemoveClass(this.row(level), BranchRowClass[side]),
      new ParallelSequence()
    );
  }

  resetLevelAction(level: Dota2.TalentLevel) {
    return _.reduce(
      Object.entries(TalentSide),
      (seq, [, side]) => seq.RemoveClass(this.row(level), BranchRowClass[side]),
      new ParallelSequence()
    );
  }

  // ----- Action runners -----

  render() {
    if (!this.heroID || !this.selected) {
      this.warn("tried to render() without hero ID or selected talents");
      return;
    }

    const { heroID, selected } = this;

    const actions = _.map(LEVELS, (level) => this.selectLevelAction(level, selected));
    const seq = new ParallelSequence().Action(...actions);

    this.debugFn(() => ["select()", { heroID, selected, actions: seq.size() }]);

    seq.Run();
  }

  reset() {
    const actions = _.map(LEVELS, (level) => this.resetLevelAction(level));
    const seq = new ParallelSequence().Action(...actions);

    this.debugFn(() => ["reset()", { actions: seq.size() }]);

    seq.Run();
  }

  // ----- UI methods -----

  ShowTooltip() {
    if (!this.heroID || !this.selected) {
      this.warn("tried to ShowTooltip() without hero ID or selected talents");
      return;
    }

    /*
    this.tooltipID = _.uniqueId(PanelID.Tooltip);

    const { heroID, selected, tooltipID } = this;
    const params = { heroID, selected };

    this.showTooltip(this.panel, Layout.ID.TooltipStatBranch, tooltipID, params);
    this.debugFn(() => ["ShowTooltip()", { tooltipID, params }]);
    */

    this.dispatch(this.panel, UIEvent.SHOW_HERO_STAT_BRANCH_TOOLTIP, this.heroID);
  }

  HideTooltip() {
    /*
    if (!this.tooltipID) return;

    const { tooltipID } = this;

    this.hideTooltip(this.panel, tooltipID);

    this.tooltipID = undefined;

    this.debugFn(() => ["HideTooltip()", { tooltipID }]);
    */
    this.dispatch(this.panel, UIEvent.HIDE_HERO_STAT_BRANCH_TOOLTIP);
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const component = new TalentsDisplay();

export type { TalentsDisplay };
