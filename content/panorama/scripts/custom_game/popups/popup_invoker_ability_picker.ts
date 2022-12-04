import type { Elements as CElements } from "../../lib/component";

export interface Elements extends CElements {
  abilities: Panel;
}

export interface Params {
  channel: string;
}

const {
  Component,
  Const: { INVOKER },
  CustomEvents,
  lodash: _,
  Panorama: { createAbilityImage },
  Util: { pascalCase },
} = GameUI.CustomUIConfig();

enum PanelID {
  AbilityImagePrefix = "PopupInvokerAbilityPicker",
}

enum CssClass {
  Ability = "PopupInvokerAbilityPickerAbility",
  AbilityHighlight = "Highlighted",
}

const INVALID_CHANNEL = "<invalid>";
const INVALID_ABILITY = "<invalid>";

const abilityImageID = (name: string): string => `${PanelID.AbilityImagePrefix}${pascalCase(name)}`;

class PopupInvokerAbilityPicker extends Component<Elements> {
  abilityPanels: Record<string, AbilityImage> = {};
  channel: string = INVALID_CHANNEL;
  selected: string = INVALID_ABILITY;

  constructor() {
    super({
      elements: {
        abilities: "PopupInvokerAbilityPickerAbilityList",
      },
    });

    this.debug("init");
  }

  // ----- Event handlers -----

  onLoad() {
    this.channel = this.panel.GetAttributeString("channel", INVALID_CHANNEL);

    this.debug("onLoad()", { channel: this.channel });
    this.render();
  }

  onImageActivate(imagePanel: AbilityImage) {
    this.debug("onImageActivate()", imagePanel.id);
    this.select(imagePanel);
  }

  // ----- Helpers -----

  select(imagePanel: AbilityImage) {
    const highlighted = this.elements.abilities.FindChildrenWithClassTraverse(
      CssClass.AbilityHighlight
    );

    _.each(highlighted, (panel) => panel.RemoveClass(CssClass.AbilityHighlight));

    imagePanel.AddClass(CssClass.AbilityHighlight);

    this.selected = imagePanel.abilityname;

    this.Submit();
  }

  render() {
    _.each(INVOKER.SPELL_ABILITIES, (ability) =>
      this.createAbilityImage(this.elements.abilities, ability)
    );

    this.debug("render()");
  }

  createAbilityImage(parent: Panel, abilityName: string) {
    const abilityId = abilityImageID(abilityName);
    const panel = createAbilityImage(parent, abilityId, abilityName);

    panel.AddClass(CssClass.Ability);
    panel.SetPanelEvent("onactivate", () => this.onImageActivate(panel));

    this.abilityPanels[abilityName] = panel;
  }

  // ----- UI methods -----

  Close() {
    this.closePopup(this.panel);
  }

  Submit() {
    const { channel, selected: ability } = this;
    const payload = { channel, ability };

    this.debug("Submit()", payload);
    this.sendClientSide(CustomEvents.Name.POPUP_ABILITY_PICKER_SUBMIT, payload);
    this.Close();
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const component = new PopupInvokerAbilityPicker();

export type { PopupInvokerAbilityPicker };
