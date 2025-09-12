import type { Combo } from "@invokation/panorama-lib/combo";
import type { Action } from "@invokation/panorama-lib/sequence";
import { NoopAction, ParallelSequence, Sequence } from "@invokation/panorama-lib/sequence";

import type { Elements, Inputs } from "../component";
import { Component } from "../component";

export interface ViewerPropertiesElements extends Elements {
  heroLevelLabel: LabelPanel;
  specialtyLabel: LabelPanel;
  stanceLabel: LabelPanel;
  damageRating: Panel;
  difficultyRating: Panel;
}

export interface ViewerPropertiesInputs extends Inputs {
  setCombo: Combo;
}

enum DialogVar {
  HeroLevel = "hero_level",
  Specialty = "specialty",
  Stance = "stance",
  DamageRating = "damage_rating",
  DifficultyRating = "difficulty_rating",
}

const ratingCssClass = (value: number) => `rating_${value}`;

export type { ViewerProperties };

class ViewerProperties extends Component<ViewerPropertiesElements, ViewerPropertiesInputs> {
  combo: Combo | undefined;

  constructor() {
    super({
      elements: {
        heroLevelLabel: "ViewerPropertiesHeroLevelLabel",
        specialtyLabel: "ViewerPropertiesSpecialtyLabel",
        stanceLabel: "ViewerPropertiesStanceLabel",
        damageRating: "ViewerPropertiesDamageRating",
        difficultyRating: "ViewerPropertiesDifficultyRating",
      },
      inputs: {
        setCombo: (payload) => this.setCombo(payload),
      },
    });

    this.debug("init");
  }

  // ----- I/O -----

  setCombo(payload: ViewerPropertiesInputs["setCombo"]) {
    this.combo = payload;

    this.render();
  }

  // ----- Actions -----

  setVariablesAction(): Action {
    if (this.combo == null) {
      return new NoopAction();
    }

    return new ParallelSequence()
      .setDialogVariableInteger(this.panel, DialogVar.HeroLevel, this.combo.heroLevel)
      .setDialogVariableString(this.panel, DialogVar.Specialty, this.combo.l10n.specialty)
      .setDialogVariableString(this.panel, DialogVar.Stance, this.combo.l10n.stance)
      .setDialogVariableString(this.panel, DialogVar.DamageRating, this.combo.l10n.damageRating)
      .setDialogVariableString(
        this.panel,
        DialogVar.DifficultyRating,
        this.combo.l10n.difficultyRating,
      );
  }

  setAttributesAction(): Action {
    if (this.combo == null) {
      return new NoopAction();
    }

    return new ParallelSequence()
      .setAttribute(this.elements.heroLevelLabel, "text", this.combo.heroLevel.toString())
      .setAttribute(this.elements.specialtyLabel, "text", this.combo.l10n.specialty)
      .setAttribute(this.elements.stanceLabel, "text", this.combo.l10n.stance);
  }

  setClassesAction(): Action {
    if (this.combo == null) {
      return new NoopAction();
    }

    return new ParallelSequence()
      .addClass(this.elements.damageRating, ratingCssClass(this.combo.damageRating))
      .addClass(this.elements.difficultyRating, ratingCssClass(this.combo.difficultyRating));
  }

  // ----- Action Runners -----

  render(): void {
    if (this.combo == null) {
      this.warn("Tried to render() without combo");
      return;
    }

    const id = this.combo.id;
    const seq = new Sequence()
      .add(this.setVariablesAction())
      .add(this.setAttributesAction())
      .add(this.setClassesAction());

    this.debugFn(() => ["render()", { id, len: seq.deepLength }]);

    seq.run();
  }
}

(() => {
  new ViewerProperties();
})();
