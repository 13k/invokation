import kebabCase from "lodash-es/kebabCase";

import type { PopupTextEntrySubmit } from "@invokation/panorama-lib/custom_events";
import { GameEvent } from "@invokation/panorama-lib/custom_events";
import * as l10n from "@invokation/panorama-lib/l10n";
import { createLabel, createPanelSnippet } from "@invokation/panorama-lib/panorama";
import type { Action } from "@invokation/panorama-lib/sequence";
import {
  AddOptionAction,
  ParallelSequence,
  RunFunctionAction,
  Sequence,
  StopSequence,
} from "@invokation/panorama-lib/sequence";
import { pascalCase } from "@invokation/panorama-lib/util/pascalCase";
import { uniqueId } from "@invokation/panorama-lib/util/uniqueId";

import type { Elements, Inputs, Outputs } from "../component";
import { Component } from "../component";
import { LayoutId } from "../layout";

export interface TagSelectElements extends Elements {
  list: Panel;
  options: DropDown;
}

export interface TagSelectInputs extends Inputs {
  clear: undefined;
  setOptions: {
    options: Set<string>;
  };
}

export interface TagSelectOutputs extends Outputs {
  onChange: {
    tags: Set<string>;
  };
}

enum Snippet {
  Tag = "UITagSelectTag",
}

enum PanelId {
  PopupTextEntry = "TagSelectPopupTextEntry",
  TagRemoveButton = "UITagSelectTagRemoveButton",
  TagPrefix = "UITagSelectTag",
  OptionPrefix = "UITagSelectOption",
}

enum CssClass {
  Option = "UITagSelectOption",
}

enum OptionValue {
  Empty = "__empty__",
  TextEntry = "__text_entry__",
}

const OPTION_ID = {
  empty: `${PanelId.OptionPrefix}${OptionValue.Empty}`,
  textEntry: `${PanelId.OptionPrefix}${OptionValue.TextEntry}`,
};

enum Timing {
  TagDeleteDelay = 0.25,
}

const normalizeTag = (tag: string): string => kebabCase(tag);
const tagId = (tag: string): string => pascalCase(`${PanelId.TagPrefix}${tag}`);
const optionId = (option: string): string => pascalCase(`${PanelId.OptionPrefix}${option}`);

export type { TagSelect };

class TagSelect extends Component<TagSelectElements, TagSelectInputs, TagSelectOutputs> {
  options: Set<string> = new Set();
  tags: Set<string> = new Set();
  tagPanels: Map<string, Panel> = new Map();
  popupTextEntryChannel: string;

  constructor() {
    super({
      elements: {
        list: "UITagSelectTagList",
        options: "UITagSelectOptions",
      },
      inputs: {
        setOptions: (payload) => this.setOptions(payload),
        clear: (payload) => this.onClearTags(payload),
      },
      customEvents: {
        [GameEvent.PopupTextEntrySubmit]: (payload) => this.onPopupTextEntrySubmit(payload),
      },
      panelEvents: {
        options: {
          oninputsubmit: () => this.onOptionSelect(),
        },
      },
    });

    this.popupTextEntryChannel = uniqueId("popup_text_entry_");

    this.debug("init");
  }

  // ----- I/O -----

  setOptions(payload: TagSelectInputs["setOptions"]): void {
    this.debug("setOptions()", payload);
    this.options = payload.options;
    this.renderOptions();
  }

  onClearTags(_payload: TagSelectInputs["clear"]): void {
    this.clearTags();
  }

  // ----- Event handlers -----

  onTagRemove(tag: string): void {
    this.debug("onTagRemove()", tag);
    this.removeTag(tag);
  }

  onOptionSelect(): void {
    const selected = this.elements.options.GetSelected();

    this.debug("OnOptionSelect", { id: selected?.id });

    if (selected == null) {
      return;
    }

    const option = selected.GetAttributeString("value", "");

    switch (option) {
      case OptionValue.Empty:
        return;
      case OptionValue.TextEntry: {
        this.showTagEntryPopup();
        break;
      }
      default:
        this.addTag(option);
    }

    this.elements.options.SetSelected(OPTION_ID.empty);
  }

  onPopupTextEntrySubmit(payload: NetworkedData<PopupTextEntrySubmit>): void {
    if (payload.channel !== this.popupTextEntryChannel) {
      return;
    }

    this.debug("onPopupTextEntrySubmit()", payload);

    if ((payload.text?.length ?? 0) > 0) {
      this.addTag(payload.text);
    }
  }

  // ----- Helpers -----

  notifyChange(): void {
    this.sendOutputs({ onChange: { tags: this.tags } });
  }

  selectTag(rawTag: string): string | undefined {
    const tag = normalizeTag(rawTag);

    if (tag.length === 0) {
      return undefined;
    }

    this.tags.add(tag);

    return tag;
  }

  deselectTag(rawTag: string): string | undefined {
    const tag = normalizeTag(rawTag);

    return this.tags.delete(tag) ? tag : undefined;
  }

  isTagSelected(tag: string): boolean {
    return this.tags.has(normalizeTag(tag));
  }

  registerTagPanel(tag: string, panel: Panel): void {
    this.tagPanels.set(tag, panel);
  }

  getTagPanel(tag: string): Panel {
    const panel = this.tagPanels.get(tag);

    if (panel == null) {
      throw new Error(`Could not find panel for tag ${tag}`);
    }

    return panel;
  }

  unregisterTagPanel(tag: string): void {
    this.tagPanels.delete(tag);
  }

  createOption(option: string): LabelPanel {
    let id: string;
    let text: string;

    switch (option) {
      case OptionValue.Empty: {
        id = OPTION_ID.empty;
        text = "";
        break;
      }
      case OptionValue.TextEntry: {
        id = OPTION_ID.textEntry;
        text = l10n.l(l10n.Key.TagSelectOptionTextEntry);
        break;
      }
      default: {
        id = optionId(option);
        text = option;
      }
    }

    const panel = createLabel(this.elements.options, id, text);

    panel.SetAttributeString("value", option);
    panel.AddClass(CssClass.Option);

    return panel;
  }

  createTag(tag: string): Panel {
    const id = tagId(tag);

    const panel = createPanelSnippet(this.elements.list, id, Snippet.Tag);
    const removePanel = panel.FindChildTraverse(PanelId.TagRemoveButton);

    if (removePanel == null) {
      throw new Error(`Could not find child with id ${PanelId.TagRemoveButton}`);
    }

    panel.SetDialogVariable("value", tag);
    removePanel.SetPanelEvent("onactivate", this.onTagRemove.bind(this, tag));

    this.registerTagPanel(tag, panel);

    return panel;
  }

  // ----- Actions -----

  createOptionAction(option: string): Action {
    return new AddOptionAction(this.elements.options, this.createOption.bind(this, option));
  }

  renderOptionsAction(): Action {
    const actions = [OptionValue.Empty, ...this.options, OptionValue.TextEntry]
      .filter((opt) => !this.isTagSelected(opt))
      .map(this.createOptionAction.bind(this));

    return new Sequence().removeAllOptions(this.elements.options).add(...actions);
  }

  selectTagAction(tag: string): Action {
    return new RunFunctionAction(() => {
      if (this.selectTag(tag) == null) {
        throw new StopSequence();
      }
    });
  }

  deselectTagAction(tag: string): Action {
    return new RunFunctionAction(() => {
      if (this.deselectTag(tag) == null) {
        throw new StopSequence();
      }
    });
  }

  createTagAction(tag: string): Action {
    return new Sequence().runFn(this.createTag.bind(this), tag);
  }

  addTagAction(tag: string): Action {
    return new Sequence().add(this.selectTagAction(tag)).add(this.createTagAction(tag));
  }

  removeTagAction(tag: string, options: { immediate: boolean } = { immediate: false }): Action {
    const delay = options.immediate ? 0 : Timing.TagDeleteDelay;
    const seq = new Sequence();
    const panel = this.getTagPanel(tag);

    if (delay > 0) {
      seq.disable(panel);
    }

    return seq
      .add(this.deselectTagAction(tag))
      .runFn(this.unregisterTagPanel.bind(this), tag)
      .deleteAsync(panel, delay);
  }

  clearTagsAction(): Action {
    const actions = Array.from(this.tags).map((tag) =>
      this.removeTagAction(tag, { immediate: true }),
    );

    return new ParallelSequence().add(...actions);
  }

  // ----- Action runners -----

  renderOptions(): void {
    const seq = new Sequence().add(this.renderOptionsAction());

    this.debugFn(() => ["renderOptions()", { options: this.options, actions: seq.deepSize() }]);

    seq.run();
  }

  addTag(rawTag: string): void {
    const tag = normalizeTag(rawTag);
    const seq = new Sequence().add(this.addTagAction(tag)).runFn(this.notifyChange.bind(this));

    this.debugFn(() => ["addTag()", { tag, actions: seq.deepSize() }]);

    seq.run();
  }

  removeTag(rawTag: string): void {
    const tag = normalizeTag(rawTag);
    const seq = new Sequence().add(this.removeTagAction(tag)).runFn(this.notifyChange.bind(this));

    this.debugFn(() => ["removeTag()", { tag, actions: seq.deepSize() }]);

    seq.run();
  }

  clearTags(): void {
    const seq = new Sequence().add(this.clearTagsAction()).runFn(this.notifyChange.bind(this));

    this.debugFn(() => ["clearTags()", { tags: this.tags.size, actions: seq.deepSize() }]);

    seq.run();
  }

  showTagEntryPopup(): void {
    this.showPopup(this.elements.options, LayoutId.PopupTextEntry, PanelId.PopupTextEntry, {
      channel: this.popupTextEntryChannel,
      title: l10n.l(l10n.Key.TagSelectPopupTextEntryTitle),
    });
  }
}

(() => {
  new TagSelect();
})();
