import { CustomEvent, PopupTextEntrySubmitEvent } from "../lib/const/events";
import { CustomEvents } from "../lib/custom_events";
import { ParallelSequence } from "../lib/sequence";
import { Inputs as BaseInputs, Outputs as BaseOutputs, Popup } from "./popup";

export type Inputs = BaseInputs;
export type Outputs = BaseOutputs;

interface Elements {
  textEntry: TextEntry;
  image: ImagePanel;
  econItemImage: EconItemPanel;
  heroImage: HeroImage;
  abilityImage: AbilityImage;
  itemImage: ItemImage;
}

const ATTRIBUTES = {
  title: "string",
  description: "string",
  image: "string",
  econItem: "int",
  econItemStyle: "int",
  hero: "string",
  heroID: "heroID",
  heroStyle: "heroImageStyle",
  ability: "string",
  item: "string",
} as const;

const DIALOG_VARS = {
  TITLE: "title",
  DESCRIPTION: "description",
};

enum PopupType {
  None,
  Image,
  EconItem,
  Hero,
  Ability,
  Item,
}

const TYPE_CLASSES = {
  [PopupType.None]: "type-simple",
  [PopupType.Image]: "type-image",
  [PopupType.EconItem]: "type-econ-item",
  [PopupType.Hero]: "type-hero",
  [PopupType.Ability]: "type-ability",
  [PopupType.Item]: "type-item",
};

const CLASSES = {
  EMPTY_DESCRIPTION: "empty-description",
};

export class PopupTextEntry extends Popup<typeof ATTRIBUTES> {
  #elements: Elements;

  constructor() {
    super({
      attributes: ATTRIBUTES,
    });

    this.#elements = this.findAll<Elements>({
      textEntry: "text-entry",
      image: "image",
      econItemImage: "econ-item-image",
      heroImage: "hero-image",
      abilityImage: "ability-image",
      itemImage: "item-image",
    });
  }

  get type(): PopupType {
    const { image, econItem, hero, heroID, ability, item } = this.attributes;

    if (image) return PopupType.Image;
    if (econItem) return PopupType.EconItem;
    if (heroID || hero) return PopupType.Hero;
    if (ability) return PopupType.Ability;
    if (item) return PopupType.Item;

    return PopupType.None;
  }

  get typeClass(): string {
    return TYPE_CLASSES[this.type];
  }

  get text(): string {
    return this.#elements.textEntry.text;
  }

  render(): void {
    const {
      title,
      description,
      image,
      econItem,
      econItemStyle,
      hero,
      heroID,
      heroStyle,
      ability,
      item,
    } = this.attributes;

    const seq = new ParallelSequence()
      .SetDialogVariable(this.ctx, DIALOG_VARS.TITLE, title)
      .SetDialogVariable(this.ctx, DIALOG_VARS.DESCRIPTION, description);

    switch (this.type) {
      case PopupType.Image:
        seq.SetImage(this.#elements.image, image);

        break;
      case PopupType.EconItem:
        seq.SetEconItem(this.#elements.econItemImage, { id: econItem, style: econItemStyle });

        break;
      case PopupType.Hero:
        seq.SetHeroImage(this.#elements.heroImage, {
          heroid: heroID,
          heroname: hero,
          heroimagestyle: heroStyle,
        });

        break;
      case PopupType.Ability:
        seq.SetAbilityImage(this.#elements.abilityImage, {
          abilityname: ability,
        });

        break;
      case PopupType.Item:
        seq.SetItemImage(this.#elements.itemImage, { itemname: item });

        break;
    }

    if (this.typeClass) {
      seq.AddClass(this.ctx, this.typeClass);
    }

    if (!description) {
      seq.AddClass(this.ctx, CLASSES.EMPTY_DESCRIPTION);
    }

    seq.Focus(this.#elements.textEntry);

    this.debugFn(() => ["render()", { actions: seq.length }]);

    seq.run();
  }

  submit(): void {
    const payload: PopupTextEntrySubmitEvent = {
      channel: this.channel,
      text: this.text,
    };

    this.debug("submit()", payload);

    CustomEvents.sendClientSide(CustomEvent.POPUP_TEXT_ENTRY_SUBMIT, payload);

    this.close();
  }
}

//   context.popup = new PopupTextEntry();
// })(GameUI.CustomUIConfig(), this);
