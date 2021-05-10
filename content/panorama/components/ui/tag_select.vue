<layout lang="xml">
<root>
  <scripts>
    <include src="file://{resources}/components/ui/tag_select.js" />
  </scripts>

  <styles>
    <include src="s2r://panorama/styles/dotastyles.css" />

    <include src="file://{resources}/components/ui/tag_select.css" />
  </styles>

  <snippets>
    <snippet name="tag">
      <Panel class="tag" onmouseover="UIShowTextTooltip(invokation_tag_select_remove_tag)" onmouseout="UIHideTextTooltip()">
        <Label class="tag-label" text="{s:value}" hittest="false" />
      </Panel>
    </snippet>
  </snippets>

  <Panel class="root" hittest="false">
    <DropDown id="options" />
    <Panel id="tags" />
  </Panel>
</root>
</layout>

<script lang="ts">
import { kebabCase, pull, uniqueId } from "lodash";

import { Component } from "../../scripts/lib/component";
import { ComponentLayout, COMPONENTS } from "../../scripts/lib/const/component";
import { CustomEvent, PopupTextEntrySubmitEvent } from "../../scripts/lib/const/events";
import {
  Action,
  ParallelSequence,
  RunFunctionAction,
  SerialSequence,
  StopSequence,
} from "../../scripts/lib/sequence";
import { UIEvents } from "../../scripts/lib/ui_events";

export interface Inputs {
  [INPUTS.SET_OPTIONS]: { options: string[] };
  [INPUTS.CLEAR]: never;
}

export interface Outputs {
  [OUTPUTS.ON_CHANGE]: { tags: string[] };
}

interface Elements {
  tags: Panel;
  options: DropDown;
}

const { inputs: INPUTS, outputs: OUTPUTS } = COMPONENTS.UI_TAG_SELECT;

const DYN_ELEMS = {
  POPUP_TEXT_ENTRY: {
    id: "popup-text-entry",
  },
  TAG: {
    snippet: "tag",
    idPrefix: "tag",
    deleteDelay: 0.25,
  },
  OPTION: {
    cssClass: "option",
    idPrefix: "option",
    emptyId: "option--empty",
    textEntryId: "option--text-entry",
  },
};

const OPTIONS = {
  EMPTY: "__empty__",
  TEXT_ENTRY: "__text_entry__",
};

const L10N_KEYS = {
  OPTION_TEXT_ENTRY: "invokation_tag_select_option_text_entry",
  POPUP_TEXT_ENTRY_TITLE: "invokation_tag_select_popup_text_entry_title",
};

const CLASSES = {
  TAGS_OVERFLOW: "overflow",
};

const normalizeTag = (tag: string) => kebabCase(tag);
const elementID = (prefix: string, name: string) => kebabCase(`${prefix}_${name}`);
const tagID = (tag: string) => elementID(DYN_ELEMS.TAG.idPrefix, tag);
const optionID = (option: string) => elementID(DYN_ELEMS.OPTION.idPrefix, option);

export default class UITagSelect extends Component {
  #elements: Elements;
  #tags: string[];
  #selected: string[];
  #tagPanels: Record<string, Panel>;
  #popupTextEntryChannel: string;

  constructor() {
    super();

    this.#elements = this.findAll<Elements>({
      tags: "tags",
      options: "options",
    });

    this.registerInputs({
      [INPUTS.SET_OPTIONS]: this.setOptions,
      [INPUTS.CLEAR]: this.clearTags,
    });

    this.registerOutputs(Object.values(OUTPUTS));

    this.onCustomEvent(CustomEvent.POPUP_TEXT_ENTRY_SUBMIT, this.onPopupTextEntrySubmit);
    this.onPanelEvent(this.#elements.options, "oninputsubmit", this.onOptionSelect);

    this.#tags = [];
    this.#selected = [];
    this.#tagPanels = {};
    this.#popupTextEntryChannel = uniqueId("popup_text_entry_");

    this.debug("init");
  }

  // ----- I/O -----

  setOptions(payload: Inputs[typeof INPUTS.SET_OPTIONS]): void {
    this.debug("setOptions()", payload);
    this.#tags = payload.options;
    this.renderOptions();
  }

  // ----- Event handlers -----

  onTagRemove(tag: string): void {
    this.debug("onTagRemove()", tag);
    this.removeTag(tag);
  }

  onOptionSelect(): void {
    const selected = this.#elements.options.GetSelected();

    this.debugFn(() => ["onOptionSelect()", { id: selected?.id }]);

    if (!selected) return;

    const option = selected.GetAttributeString("value", "");

    switch (option) {
      case OPTIONS.EMPTY:
        return;
      case OPTIONS.TEXT_ENTRY:
        this.showTagEntryPopup();
        break;
      default:
        this.addTag(option);
    }

    this.#elements.options.SetSelected(DYN_ELEMS.OPTION.emptyId);
  }

  onPopupTextEntrySubmit(payload: NetworkedData<PopupTextEntrySubmitEvent>): void {
    if (payload.channel !== this.#popupTextEntryChannel) return;

    this.debug("onPopupTextEntrySubmit()", payload);

    if (payload.text) {
      this.addTag(payload.text);
    }
  }

  // ----- Properties -----

  get isTagsOverflow(): boolean {
    const { contentwidth, actuallayoutwidth } = this.#elements.tags;

    return contentwidth >= actuallayoutwidth;
  }

  // ----- Helpers -----

  notifyChange(): void {
    const payload: Outputs[typeof OUTPUTS.ON_CHANGE] = { tags: this.#selected };

    this.output(OUTPUTS.ON_CHANGE, payload);
  }

  selectTag(tag: string): string | null {
    tag = normalizeTag(tag);

    if (!tag || this.isTagSelected(tag)) {
      return null;
    }

    this.#selected.push(tag);

    return tag;
  }

  deselectTag(tag: string): string | null {
    tag = normalizeTag(tag);

    if (!this.isTagSelected(tag)) {
      return null;
    }

    pull(this.#selected, tag);

    return tag;
  }

  isTagSelected(tag: string): boolean {
    return this.#selected.includes(normalizeTag(tag));
  }

  registerTagPanel(tag: string, panel: Panel): void {
    this.#tagPanels[tag] = panel;
  }

  unregisterTagPanel(tag: string): void {
    delete this.#tagPanels[tag];
  }

  createOption(option: string): LabelPanel {
    const { cssClass, emptyId, textEntryId } = DYN_ELEMS.OPTION;

    let id = null;
    let text = null;

    switch (option) {
      case OPTIONS.EMPTY:
        id = emptyId;
        text = "";
        break;
      case OPTIONS.TEXT_ENTRY:
        id = textEntryId;
        text = $.Localize(L10N_KEYS.OPTION_TEXT_ENTRY);
        break;
      default:
        id = optionID(option);
        text = option;
    }

    return this.createLabel(this.#elements.options, id, text, {
      classes: [cssClass],
      attrs: { value: option },
    });
  }

  createTag(tag: string): void {
    const { snippet } = DYN_ELEMS.TAG;

    const id = tagID(tag);
    const panel = this.createSnippet(this.#elements.tags, id, snippet, {
      dialogVars: { value: tag },
      events: {
        onactivate: this.onTagRemove.bind(this, tag),
      },
    });

    this.registerTagPanel(tag, panel);
  }

  // ----- Actions -----

  createOptionAction(option: string): Action {
    return new SerialSequence().AddOption(
      this.#elements.options,
      this.createOption.bind(this, option)
    );
  }

  renderOptionsAction(): Action {
    const options = [OPTIONS.EMPTY, ...this.#tags, OPTIONS.TEXT_ENTRY].filter(
      (tag) => !this.isTagSelected(tag)
    );

    const actions = options.map((tag) => this.createOptionAction(tag));

    return new SerialSequence().RemoveAllOptions(this.#elements.options).Action(...actions);
  }

  selectTagAction(tag: string): Action {
    return new RunFunctionAction(() => {
      if (!this.selectTag(tag)) {
        throw new StopSequence();
      }
    });
  }

  deselectTagAction(tag: string): Action {
    return new RunFunctionAction(() => {
      if (!this.deselectTag(tag)) {
        throw new StopSequence();
      }
    });
  }

  createTagAction(tag: string): Action {
    return new RunFunctionAction(() => this.createTag(tag));
  }

  addTagAction(tag: string): Action {
    return new SerialSequence()
      .Action(this.selectTagAction(tag))
      .Action(this.createTagAction(tag))
      .Action(this.updateTagsOverflowAction());
  }

  removeTagAction(tag: string, options: { immediate: boolean } = { immediate: false }): Action {
    const delay = options.immediate ? 0 : DYN_ELEMS.TAG.deleteDelay;
    const panel = this.#tagPanels[tag];
    const seq = new SerialSequence().Action(this.deselectTagAction(tag));

    if (delay) {
      seq.Disable(panel);
    }

    seq.RunFunction(() => this.unregisterTagPanel(tag)).DeleteAsync(panel, delay);

    if (delay) {
      seq.Wait(delay + 0.1);
    }

    seq.Action(this.updateTagsOverflowAction());

    return seq;
  }

  updateTagsOverflowAction(): Action {
    return new RunFunctionAction(() => {
      const isOverflow = this.isTagsOverflow;

      this.debug("updateTagsOverflow()", { isOverflow });
      this.debugTags();

      if (isOverflow) {
        this.#elements.tags.AddClass(CLASSES.TAGS_OVERFLOW);
      } else {
        this.#elements.tags.RemoveClass(CLASSES.TAGS_OVERFLOW);
      }
    });
  }

  clearTagsAction(): Action {
    const actions = this.#selected.map((tag) => this.removeTagAction(tag, { immediate: true }));

    return new ParallelSequence().Action(...actions);
  }

  // ----- Action runners -----

  renderOptions(): void {
    const seq = new SerialSequence().Action(this.renderOptionsAction());

    this.debugFn(() => ["renderOptions()", { options: this.#tags, actions: seq.length }]);

    seq.run();
  }

  addTag(tag: string): void {
    tag = normalizeTag(tag);

    const seq = new SerialSequence()
      .Action(this.addTagAction(tag))
      .RunFunction(() => this.notifyChange());

    this.debugFn(() => ["addTag()", { tag, actions: seq.length }]);

    seq.run();
  }

  removeTag(tag: string): void {
    tag = normalizeTag(tag);

    const seq = new SerialSequence()
      .Action(this.removeTagAction(tag))
      .RunFunction(() => this.notifyChange());

    this.debugFn(() => ["removeTag()", { tag, actions: seq.length }]);

    seq.run();
  }

  clearTags(): void {
    const seq = new SerialSequence()
      .Action(this.clearTagsAction())
      .RunFunction(() => this.notifyChange());

    this.debugFn(() => ["clearTags()", { tags: this.#selected.length, actions: seq.length }]);

    seq.run();
  }

  showTagEntryPopup(): void {
    const { id } = DYN_ELEMS.POPUP_TEXT_ENTRY;

    UIEvents.showPopup(id, ComponentLayout.PopupTextEntry, {
      channel: this.#popupTextEntryChannel,
      title: $.Localize(L10N_KEYS.POPUP_TEXT_ENTRY_TITLE),
    });
  }

  debugTags(): void {
    const {
      contentwidth,
      desiredlayoutwidth,
      actuallayoutwidth,
      actualxoffset,
      scrolloffset_x,
      actualuiscale_x,
    } = this.#elements.tags;

    this.debug("$tags attrs", {
      contentwidth,
      desiredlayoutwidth,
      actuallayoutwidth,
      actualxoffset,
      scrolloffset_x,
      actualuiscale_x,
    });
  }
}

global.component = new UITagSelect();
</script>

<style lang="scss">
@use "../../styles/variables";

$pill-height: 36px;

.root {
  flow-children: down;
  width: 100%;
  height: fit-children;
  margin-top: 0;
}

#options {
  width: 100%;
}

#options .option {
  width: 120px;
}

#tags {
  width: 100%;
  overflow: scroll clip;
  background-color: rgba(0, 0, 0, 0.25);
  border-bottom: 1px solid #000;
  flow-children: right;

  &.overflow {
    padding-bottom: 10px;
  }

  .tag {
    height: $pill-height;
    margin: 8px 4px;
    padding: 4px 6px 2px;
    background-color: variables.$color_selected_text_background;
    border: 1px solid variables.$color_base_border;
    border-radius: 6px;
    transition-duration: 0.2s;
    transition-property: opacity;
    flow-children: right;
    tooltip-position: bottom;

    &:disabled {
      opacity: 0;
    }

    &:hover {
      wash-color: #000a;
    }

    .tag-label {
      max-width: 120px;
      margin-left: 4px;
      color: color_text_blue_grey_bright;
      font-size: 16px;
      text-overflow: ellipsis;
      align: center center;
    }

    &:hover .tag-label {
      color: #bbb;
    }
  }
}
</style>
