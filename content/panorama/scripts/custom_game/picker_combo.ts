import type { Combo, Properties } from "../lib/combo";
import type { Elements as CElements } from "../lib/component";

export interface Elements extends CElements {
  titleLabel: LabelPanel;
  heroLevelLabel: LabelPanel;
  damageRating: Panel;
  difficultyRating: Panel;
}

const {
  Combo: { PropertyName },
  Component,
  lodash: _,
  Sequence: { Sequence, ParallelSequence, NoopAction },
} = GameUI.CustomUIConfig();

function propertyCssClass<K extends keyof Properties>(prop: K, value: Properties[K]): string {
  let baseClass: string;

  switch (prop) {
    case PropertyName.DamageRating:
    case PropertyName.DifficultyRating:
      baseClass = "rating";
      break;
    default:
      baseClass = _.snakeCase(prop);
  }

  return `${baseClass}_${value}`;
}

enum CssClass {
  Finished = "PickerComboFinished",
}

enum DVar {
  HeroLevel = "hero_level",
  Specialty = "specialty",
  Stance = "stance",
  DamageRating = "damage_rating",
  DifficultyRating = "difficulty_rating",
}

class PickerCombo extends Component<Elements> {
  combo?: Combo;

  constructor() {
    super({
      elements: {
        titleLabel: "PickerComboTitle",
        heroLevelLabel: "PickerComboHeroLevelLabel",
        damageRating: "PickerComboDamageRating",
        difficultyRating: "PickerComboDifficultyRating",
      },
      inputs: {
        SetCombo: "setCombo",
        SetFinished: "onSetFinished",
        UnsetFinished: "onUnsetFinished",
      },
    });
  }

  // --- Inputs ---

  setCombo(combo: Combo) {
    this.combo = combo;

    this.render();
  }

  onSetFinished() {
    this.panel.AddClass(CssClass.Finished);
  }

  onUnsetFinished() {
    this.panel.RemoveClass(CssClass.Finished);
  }

  // --- Actions ---

  setVariablesAction() {
    if (!this.combo) {
      return new NoopAction();
    }

    return new ParallelSequence()
      .SetDialogVariableInt(this.panel, DVar.HeroLevel, this.combo.heroLevel)
      .SetDialogVariable(this.panel, DVar.Specialty, this.combo.l10n.specialty)
      .SetDialogVariable(this.panel, DVar.Stance, this.combo.l10n.stance)
      .SetDialogVariable(this.panel, DVar.DamageRating, this.combo.l10n.damageRating)
      .SetDialogVariable(this.panel, DVar.DifficultyRating, this.combo.l10n.difficultyRating);
  }

  setAttributesAction() {
    if (!this.combo) {
      return new NoopAction();
    }

    return new ParallelSequence()
      .SetAttribute(this.elements.titleLabel, "text", this.combo.l10n.name)
      .SetAttribute(this.elements.heroLevelLabel, "text", _.toString(this.combo.heroLevel));
  }

  setClassesAction() {
    if (!this.combo) {
      return new NoopAction();
    }

    return new ParallelSequence()
      .AddClass(this.panel, propertyCssClass(PropertyName.Specialty, this.combo.specialty))
      .AddClass(this.panel, propertyCssClass(PropertyName.Stance, this.combo.stance))
      .AddClass(
        this.elements.damageRating,
        propertyCssClass(PropertyName.DamageRating, this.combo.damageRating)
      )
      .AddClass(
        this.elements.difficultyRating,
        propertyCssClass(PropertyName.DifficultyRating, this.combo.difficultyRating)
      );
  }

  // ----- Action Runners -----

  render() {
    if (!this.combo) {
      this.warn("tried to render() without combo");
      return;
    }

    const { id } = this.combo;
    const seq = new Sequence()
      .Action(this.setVariablesAction())
      .Action(this.setAttributesAction())
      .Action(this.setClassesAction());

    this.debugFn(() => ["render()", { id, actions: seq.size() }]);

    seq.Run();
  }

  ShowDetails() {
    if (!this.combo) {
      this.warn("tried to ShowDetails() without combo");
      return;
    }

    const payload = { id: this.combo.id };

    this.debug("ShowDetails()", payload);
    this.runOutput("OnShowDetails", payload);
  }

  Play() {
    if (!this.combo) {
      this.warn("tried to Play() without combo");
      return;
    }

    const payload = { id: this.combo.id };

    this.debug("Play()", payload);
    this.runOutput("OnPlay", payload);
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const component = new PickerCombo();

export type { PickerCombo };
