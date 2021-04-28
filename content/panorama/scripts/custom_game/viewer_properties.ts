import type { Combo } from "./lib/combo";
import { Component } from "./lib/component";
import { COMPONENTS } from "./lib/const/component";
import { Action, ParallelSequence, SerialSequence } from "./lib/sequence";

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

export class ViewerProperties extends Component {
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

//   context.viewerProperties = new ViewerProperties();
// })(GameUI.CustomUIConfig(), this);
