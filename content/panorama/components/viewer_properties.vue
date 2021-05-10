<layout lang="xml">
<root>
  <scripts>
    <include src="file://{resources}/components/viewer_properties.js" />
  </scripts>

  <styles>
    <include src="s2r://panorama/styles/dotastyles.css" />

    <include src="file://{resources}/components/viewer_properties.css" />
  </styles>

  <Panel class="root" hittest="false">
    <Panel class="row" hittest="false">
      <Button class="property-icon hero-level-icon" onmouseover="DOTAShowTextTooltip(#invokation_combo_tooltip_hero_level)" onmouseout="DOTAHideTextTooltip()" />
      <Label class="property-label" text="#invokation_combo_properties__hero_level" hittest="false" />
      <Button class="property-value hero-level-badge">
        <Label id="hero-level-label" class="hero-level-label MonoNumbersFont" hittest="false" />
      </Button>
    </Panel>

    <Panel class="row" hittest="false">
      <Button class="property-icon specialty-icon" onmouseover="DOTAShowTextTooltip(#invokation_combo_tooltip_specialty)" onmouseout="DOTAHideTextTooltip()" />
      <Label class="property-label" text="#invokation_combo_properties__specialty" hittest="false" />
      <Label id="specialy-label" class="property-value property-label" hittest="false" />
    </Panel>

    <Panel class="row" hittest="false">
      <Button class="property-icon stance-icon" onmouseover="DOTAShowTextTooltip(#invokation_combo_tooltip_stance)" onmouseout="DOTAHideTextTooltip()" />
      <Label class="property-label" text="#invokation_combo_properties__stance" hittest="false" />
      <Label id="stance-label" class="property-value property-label" hittest="false" />
    </Panel>

    <Panel class="row" hittest="false">
      <Button class="property-icon damage-icon" onmouseover="DOTAShowTextTooltip(#invokation_combo_tooltip_damage_rating)" onmouseout="DOTAHideTextTooltip()" />
      <Label class="property-label" text="#invokation_combo_properties__damage_rating" hittest="false" />
      <Panel id="damage-rating" class="property-value rating">
        <Panel class="rating-active" />
      </Panel>
    </Panel>

    <Panel class="row" hittest="false">
      <Button class="property-icon difficulty-icon" onmouseover="DOTAShowTextTooltip(#invokation_combo_tooltip_difficulty_rating)" onmouseout="DOTAHideTextTooltip()" />
      <Label class="property-label" text="#invokation_combo_properties__difficulty_rating" hittest="false" />
      <Panel id="difficulty-rating" class="property-value rating">
        <Panel class="rating-active" />
      </Panel>
    </Panel>
  </Panel>
</root>
</layout>

<script lang="ts">
import type { Combo } from "../scripts/lib/combo";
import { Component } from "../scripts/lib/component";
import { COMPONENTS } from "../scripts/lib/const/component";
import { Action, ParallelSequence, SerialSequence } from "../scripts/lib/sequence";

export interface Inputs {
  [INPUTS.SET_COMBO]: { combo: Combo };
}

export type Outputs = never;

interface Elements {
  heroLevelLabel: LabelPanel;
  specialtyLabel: LabelPanel;
  stanceLabel: LabelPanel;
  damageRating: Panel;
  difficultyRating: Panel;
}

const { inputs: INPUTS } = COMPONENTS.VIEWER_PROPERTIES;

const DIALOG_VARS = {
  HERO_LEVEL: "hero_level",
  SPECIALTY: "specialty",
  STANCE: "stance",
  DAMAGE_RATING: "damage_rating",
  DIFFICULTY_RATING: "difficulty_rating",
};

const ratingCssClass = (value: number) => `rating-${value}`;

export default class ViewerProperties extends Component {
  elements: Elements;
  combo?: Combo;

  constructor() {
    super();

    this.elements = this.findAll<Elements>({
      heroLevelLabel: "hero-level-label",
      specialtyLabel: "specialy-label",
      stanceLabel: "stance-label",
      damageRating: "damage-rating",
      difficultyRating: "difficulty-rating",
    });

    this.registerInputs({
      [INPUTS.SET_COMBO]: this.setCombo,
    });

    this.debug("init");
  }

  hasCombo(): this is { combo: Combo } {
    return this.combo != null;
  }

  setCombo(combo: Combo): void {
    this.combo = combo;
    this.render();
  }

  setVariablesAction(): Action {
    if (!this.hasCombo()) {
      throw Error(`ViewerProperties.setVariablesAction was called without a combo`);
    }

    return new ParallelSequence()
      .SetDialogVariable(this.ctx, DIALOG_VARS.HERO_LEVEL, String(this.combo.heroLevel))
      .SetDialogVariable(this.ctx, DIALOG_VARS.SPECIALTY, this.combo.l10n.specialty)
      .SetDialogVariable(this.ctx, DIALOG_VARS.STANCE, this.combo.l10n.stance)
      .SetDialogVariable(this.ctx, DIALOG_VARS.DAMAGE_RATING, this.combo.l10n.damageRating)
      .SetDialogVariable(this.ctx, DIALOG_VARS.DIFFICULTY_RATING, this.combo.l10n.difficultyRating);
  }

  setPropertiesAction(): Action {
    if (!this.hasCombo()) {
      throw Error(`ViewerProperties.setPropertiesAction was called without a combo`);
    }

    return new ParallelSequence()
      .SetText(this.elements.heroLevelLabel, String(this.combo.heroLevel))
      .SetText(this.elements.specialtyLabel, this.combo.l10n.specialty)
      .SetText(this.elements.stanceLabel, this.combo.l10n.stance);
  }

  setClassesAction(): Action {
    if (!this.hasCombo()) {
      throw Error(`ViewerProperties.setClassesAction was called without a combo`);
    }

    return new ParallelSequence()
      .AddClass(this.elements.damageRating, ratingCssClass(this.combo.damageRating))
      .AddClass(this.elements.difficultyRating, ratingCssClass(this.combo.difficultyRating));
  }

  render(): void {
    const seq = new SerialSequence()
      .Action(this.setVariablesAction())
      .Action(this.setPropertiesAction())
      .Action(this.setClassesAction());

    this.debugFn(() => ["render()", { id: this.combo?.id, actions: seq.length }]);

    seq.run();
  }
}

global.viewerProperties = new ViewerProperties();
</script>

<style lang="scss">
@use "../styles/variables";
@use "../styles/ui";

$color-fg: #3c1b18;

.root {
  flow-children: down;
  width: 100%;
  height: 230px;
  padding: 15px;
}

.row {
  flow-children: right;
  width: 100%;
  height: 40px;
}

.property-label {
  color: color-fg;
  font-weight: semi-bold;
  font-size: 18px;
  vertical-align: center;
}

.property-icon {
  width: 28px;
  height: 28px;
  margin: 6px 8px;
  vertical-align: center;
  tooltip-position: left;
  tooltip-body-position: 50% 10%;
}

.property-value {
  align: right center;
}

.property-icon.hero-level-icon {
  wash-color: $color-fg;
  background-image: variables.$control-icon-escalation-arrow;
  background-repeat: no-repeat;
  background-position: 50% 50%;
  background-size: contain;
}

.hero-level-badge {
  width: 30px;
  height: 32px;
  background-color: #121212;
  border-radius: 50%;
}

.hero-level-badge .hero-level-label {
  width: 14px;
  margin-top: 3px;
  color: #e7d291;
  font-weight: normal;
  font-size: 14px;
  text-align: center;
  text-overflow: shrink;
  text-shadow: 0 0 3px 3.7 #ec780e24;
  align: center center;
}

.property-icon.specialty-icon {
  wash-color: $color-fg;
  background-image: variables.$control-icon-filter-support;
  background-repeat: no-repeat;
  background-position: 50% 50%;
  background-size: contain;
}

.property-icon.stance-icon {
  wash-color: $color-fg;
  background-image: variables.$control-icon-filter-carry;
  background-repeat: no-repeat;
  background-position: 50% 50%;
  background-size: contain;
}

.property-icon.damage-icon {
  wash-color: $color-fg;
  background-image: variables.$control-icon-filter-melee;
  background-repeat: no-repeat;
  background-position: 50% 50%;
  background-size: contain;
}

.property-icon.difficulty-icon {
  wash-color: $color-fg;
  background-image: variables.$control-icon-filter-complexity;
  background-repeat: no-repeat;
  background-position: 50% 50%;
  background-size: contain;
}

.rating .rating-active {
  wash-color: $color-fg&99;
}
</style>
