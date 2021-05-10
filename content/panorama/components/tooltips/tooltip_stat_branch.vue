<layout lang="xml">
<root>
  <scripts>
    <include src="file://{resources}/components/tooltips/tooltip_stat_branch.js" />
  </scripts>

  <styles>
    <include src="s2r://panorama/styles/dotastyles.css" />

    <include src="file://{resources}/components/tooltips/tooltip_stat_branch.css" />
  </styles>

  <snippets>
    <snippet name="stat-branch-row">
      <Panel class="row">
        <Panel class="branch branch-left">
          <Button class="branch-choice" disabled="true">
            <Label class="bonus-label" />
          </Button>
        </Panel>

        <Panel class="branch branch-right">
          <Button class="branch-choice" disabled="true">
            <Label class="bonus-label" />
          </Button>
        </Panel>

        <Panel class="center-node">
          <Panel class="level-bg">
            <Label text="{s:level}" class="hero-level-label" />
          </Panel>
        </Panel>
      </Panel>
    </snippet>
  </snippets>

  <Tooltip class="root" onload="tooltip.onLoad()">
    <Label class="title" text="#DOTA_StatBranch_TooltipTitle" />
    <Panel id="stat-branch-container" />
  </Tooltip>
</root>
</layout>

<script lang="ts">
import { first, forOwn, get } from "lodash";

import type { ChangeEvent as AbilitiesChangeEvent } from "../../scripts/lib/abilities_collection";
import { Component } from "../../scripts/lib/component";
import type { AbilitiesKeyValues } from "../../scripts/lib/dota";
import { Talent, talentSelectedSide, TalentSide, TalentTier } from "../../scripts/lib/dota";
import { TALENTS } from "../../scripts/lib/invoker";
import { localizeAbilityTooltip } from "../../scripts/lib/l10n";
import {
  Action,
  ParallelSequence,
  RunFunctionAction,
  SerialSequence,
} from "../../scripts/lib/sequence";
import { UI } from "../../scripts/lib/ui";

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

export default class TooltipStatBranch extends Component {
  #elements: Elements;
  #rows: RowPanels = {} as RowPanels;
  #selected: Talent = Talent.NONE;
  #abilitiesKV?: AbilitiesKeyValues;

  constructor() {
    super();

    this.#elements = this.findAll<Elements>({
      container: "stat-branch-container",
    });

    UI.config.abilities.onChange(this.onAbilitiesKvChange.bind(this));

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

global.tooltip = new TooltipStatBranch();
</script>

<style lang="scss">
@use "../../styles/variables";

#Contents {
  padding: 12px 12px 8px;
  background-color: gradient(linear, 0% 0%, 0% 100%, from (#181b1d), to (#22292f));
}

.root {
  flow-children: down;
  width: 430px;
  height: fit-children;
}

.title {
  height: 24px;
  margin-top: 6px;
  margin-bottom: 4px;
  color: #e1e1e1;
  letter-spacing: 2px;
  text-transform: uppercase;
  text-shadow: 0 0 4px 2 #000;
  vertical-align: top;
  horizontal-align: center;
}

#stat-branch-container {
  flow-children: down;
  width: 100%;
}

.row {
  width: 100%;
}

.row .branch {
  width: 50%;
  height: 45px;
  padding: 8px 4px 0;
}

.row .branch.branch-left {
  padding-right: 20px;
  background-color: gradient(linear, 0% 0%, 100% 0%, from (#0e1011), to (#22292f00));
}

.row .branch.branch-right {
  padding-left: 20px;
  horizontal-align: right;
  tooltip-position: right;
  background-color: gradient(linear, 0% 0%, 100% 0%, from (#22292f00), to (#0e1011));
}

.row .branch .branch-choice {
  width: 100%;
  height: 100%;
}

.row .branch.branch-left .branch-choice {
  tooltip-position: left;
}

.row .branch .bonus-label {
  color: #676e70;
  font-size: 15px;
  line-height: 16px;
  text-align: center;
  text-overflow: clip;
  text-shadow: 1px 1px 2px 2 #0006;
  vertical-align: middle;
  horizontal-align: middle;
}

.row.branch-right-selected .branch.branch-right .bonus-label,
.row.branch-left-selected .branch.branch-left .bonus-label {
  color: #e7d291c8;
  text-shadow: 0 0 1px 1.3 #ec780e24;
}

.row .center-node {
  flow-children: right;
  horizontal-align: center;
}

.row .center-node .level-bg {
  width: 52px;
  height: 52px;
  margin-bottom: -1px;
  background-image: variables.$hud-stat-branch-level-bg;
  background-repeat: no-repeat;
  background-position: center;
  background-size: 80% 80%;
}

.row .center-node .hero-level-label {
  z-index: 50;
  width: 30px;
  margin-top: 14px;
  margin-right: 1px;
  color: #e7d291;
  font-weight: normal;
  font-size: 20px;
  font-family: variables.$font-monospace-numbers;
  text-align: center;
  text-shadow: 0 0 3px 3.7 #ec780e24;
  horizontal-align: center;
}
</style>
