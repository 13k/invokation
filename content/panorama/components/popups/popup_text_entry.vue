<layout lang="xml">
<root>
  <scripts>
    <include src="file://{resources}/components/popups/popup_text_entry.js" />
  </scripts>

  <styles>
    <include src="s2r://panorama/styles/popups/popups_shared.css" />
    <include src="s2r://panorama/styles/dotastyles.css" />

    <include src="file://{resources}/components/popups/popup_text_entry.css" />
  </styles>

  <Popup class="root PopupPanel" popupbackground="dim" onload="popup.load()" oncancel="popup.close()">
    <Panel class="header" hittest="false">
      <Label class="PopupTitle title" text="{s:title}" hittest="false" />
    </Panel>

    <Panel class="body" hittest="false">
      <Panel class="icon-container" hittest="false">
        <Image id="image" class="icon-image" scaling="stretch-to-fit-y-preserve-aspect" />
        <DOTAEconItem id="econ-item-image" class="icon-image DisableInspect" scaling="stretch-to-fit-y-preserve-aspect" />
        <DOTAHeroImage id="hero-image" class="icon-image" heroimagestyle="landscape" scaling="stretch-to-fit-y-preserve-aspect" />
        <DOTAAbilityImage id="ability-image" class="icon-image" scaling="stretch-to-fit-y-preserve-aspect" />
        <DOTAItemImage id="item-image" class="icon-image" scaling="stretch-to-fit-y-preserve-aspect" />
      </Panel>

      <Label class="description" text="{s:description}" html="true" hittest="false" />
    </Panel>

    <TextEntry id="text-entry" oninputsubmit="popup.submit()" />

    <Panel class="PopupButtonRow footer" hittest="false">
      <Button class="PopupButton" onactivate="popup.submit()">
        <Label text="#DOTA_Ok" />
      </Button>

      <Button class="PopupButton" onactivate="popup.close()">
        <Label text="#DOTA_Cancel" />
      </Button>
    </Panel>
  </Popup>
</root>
</layout>

<script lang="ts">
import { CustomEvent, PopupTextEntrySubmitEvent } from "../../scripts/lib/const/events";
import { CustomEvents } from "../../scripts/lib/custom_events";
import { Inputs as BaseInputs, Outputs as BaseOutputs, Popup } from "../../scripts/lib/popup";
import { ParallelSequence } from "../../scripts/lib/sequence";

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

export default class PopupTextEntry extends Popup<typeof ATTRIBUTES> {
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

global.popup = new PopupTextEntry();
</script>

<style lang="scss">
.type-simple.empty-description .title {
  margin-bottom: 0;
}

.body {
  flow-children: right;
  horizontal-align: center;
}

.type-simple.empty-description .body {
  visibility: collapse;
}

.icon-container {
  vertical-align: center;
}

.icon-image {
  width: 80px;
  margin-right: 15px;
  visibility: collapse;
}

.empty-description .icon-image {
  margin: 0;
}

.type-image #icon-image {
  visibility: visible;
}

.type-econ-item #econ-item-image {
  visibility: visible;
}

.type-hero #hero-image {
  visibility: visible;
}

.type-ability #ability-image {
  visibility: visible;
}

.type-item #item-image {
  visibility: visible;
}

.body .description {
  max-width: 400px;
  color: #fff;
  font-size: 24px;
  text-align: center;
  align: center center;
}

.type-econ-item .body .description {
  text-align: left;
}

#text-entry {
  width: 100%;
  margin-top: 24px;
  horizontal-align: center;
}

.Multiline #text-entry {
  height: 128px;
  white-space: normal;
}

.footer {
  margin-top: 15px;
}
</style>
