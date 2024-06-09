import snakeCase from "lodash-es/snakeCase";

import type { Combo, ComboId, Properties } from "@invokation/panorama-lib/combo";
import { Property } from "@invokation/panorama-lib/combo";
import type { Action } from "@invokation/panorama-lib/sequence";
import { NoopAction, ParallelSequence, Sequence } from "@invokation/panorama-lib/sequence";

import type { Elements, Inputs, Outputs } from "../component";
import { Component } from "../component";

export interface PickerComboElements extends Elements {
  titleLabel: LabelPanel;
  heroLevelLabel: LabelPanel;
  damageRating: Panel;
  difficultyRating: Panel;
  btnShowDetails: Button;
  btnPlay: Button;
}

export interface PickerComboInputs extends Inputs {
  setCombo: Combo;
  setFinished: undefined;
  unsetFinished: undefined;
}

export interface PickerComboOutputs extends Outputs {
  onPlay: { id: ComboId };
  onShowDetails: { id: ComboId };
}

enum CssClass {
  Finished = "PickerComboFinished",
}

enum DialogVar {
  HeroLevel = "hero_level",
  Specialty = "specialty",
  Stance = "stance",
  DamageRating = "damage_rating",
  DifficultyRating = "difficulty_rating",
}

export type { PickerCombo };

class PickerCombo extends Component<PickerComboElements, PickerComboInputs, PickerComboOutputs> {
  combo: Combo | undefined;

  constructor() {
    super({
      elements: {
        titleLabel: "PickerComboTitle",
        heroLevelLabel: "PickerComboHeroLevelLabel",
        damageRating: "PickerComboDamageRating",
        difficultyRating: "PickerComboDifficultyRating",
        btnShowDetails: "BtnShowDetails",
        btnPlay: "BtnPlay",
      },
      panelEvents: {
        btnShowDetails: { onactivate: () => this.onBtnShowDetails() },
        btnPlay: { onactivate: () => this.onBtnPlay() },
      },
      inputs: {
        setCombo: (payload) => this.setCombo(payload),
        setFinished: (payload) => this.onSetFinished(payload),
        unsetFinished: (payload) => this.onUnsetFinished(payload),
      },
    });
  }

  // ----- Event handlers -----

  onBtnShowDetails(): void {
    if (this.combo == null) {
      this.warn("Tried to ShowDetails() without combo");
      return;
    }

    const payload = { id: this.combo.id };

    this.debug("ShowDetails()", payload);
    this.sendOutputs({ onShowDetails: payload });
  }

  onBtnPlay(): void {
    if (this.combo == null) {
      this.warn("Tried to Play() without combo");
      return;
    }

    const payload = { id: this.combo.id };

    this.debug("Play()", payload);
    this.sendOutputs({ onPlay: payload });
  }

  // ----- I/O -----

  setCombo(payload: PickerComboInputs["setCombo"]): void {
    this.combo = payload;

    this.render();
  }

  onSetFinished(_payload: PickerComboInputs["setFinished"]): void {
    this.panel.AddClass(CssClass.Finished);
  }

  onUnsetFinished(_payload: PickerComboInputs["unsetFinished"]): void {
    this.panel.RemoveClass(CssClass.Finished);
  }

  // ----- Actions -----

  setVariablesAction(): Action {
    if (this.combo == null) {
      return new NoopAction();
    }

    return new ParallelSequence()
      .setDialogVariableInt(this.panel, DialogVar.HeroLevel, this.combo.heroLevel)
      .setDialogVariable(this.panel, DialogVar.Specialty, this.combo.l10n.specialty)
      .setDialogVariable(this.panel, DialogVar.Stance, this.combo.l10n.stance)
      .setDialogVariable(this.panel, DialogVar.DamageRating, this.combo.l10n.damageRating)
      .setDialogVariable(this.panel, DialogVar.DifficultyRating, this.combo.l10n.difficultyRating);
  }

  setAttributesAction(): Action {
    if (this.combo == null) {
      return new NoopAction();
    }

    return new ParallelSequence()
      .setAttribute(this.elements.titleLabel, "text", this.combo.l10n.name)
      .setAttribute(this.elements.heroLevelLabel, "text", this.combo.heroLevel.toString());
  }

  setClassesAction(): Action {
    if (this.combo == null) {
      return new NoopAction();
    }

    return new ParallelSequence()
      .addClass(this.panel, propertyCssClass(Property.Specialty, this.combo.specialty))
      .addClass(this.panel, propertyCssClass(Property.Stance, this.combo.stance))
      .addClass(
        this.elements.damageRating,
        propertyCssClass(Property.DamageRating, this.combo.damageRating),
      )
      .addClass(
        this.elements.difficultyRating,
        propertyCssClass(Property.DifficultyRating, this.combo.difficultyRating),
      );
  }

  // ----- Action Runners -----

  render(): void {
    if (this.combo == null) {
      this.warn("Tried to render() without combo");
      return;
    }

    const { id } = this.combo;
    const seq = new Sequence()
      .add(this.setVariablesAction())
      .add(this.setAttributesAction())
      .add(this.setClassesAction());

    this.debugFn(() => ["render()", { id, actions: seq.deepSize() }]);

    seq.run();
  }
}

const propertyCssClass = <K extends keyof Properties>(prop: K, value: Properties[K]): string => {
  let baseClass: string;

  switch (prop) {
    case Property.DamageRating:
    case Property.DifficultyRating: {
      baseClass = "rating";
      break;
    }
    default:
      baseClass = snakeCase(prop);
  }

  return `${baseClass}_${value}`;
};

(() => {
  new PickerCombo();
})();
