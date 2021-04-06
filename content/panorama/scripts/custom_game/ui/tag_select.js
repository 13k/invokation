"use strict";

((global, context) => {
  const { Component } = context;
  const { lodash: _ } = global;
  const { LAYOUTS } = global.Const;
  const {
    Sequence,
    ParallelSequence,
    StopSequence,
    AddOptionAction,
    RunFunctionAction,
  } = global.Sequence;

  const DYN_ELEMS = {
    POPUP_TEXT_ENTRY: {
      id: "popup-text-entry",
    },
    TAG: {
      snippet: "tag",
      idPrefix: "tag",
      removeButtonId: "remove-button",
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

  const normalizeTag = (tag) => _.kebabCase(tag);
  const elementId = (prefix, name) => _.kebabCase(`${prefix}_${name}`);
  const tagId = (tag) => elementId(DYN_ELEMS.TAG.idPrefix, tag);
  const optionId = (option) => elementId(DYN_ELEMS.OPTION.idPrefix, option);

  class UITagSelect extends Component {
    constructor() {
      super({
        elements: {
          list: "tags",
          options: "options",
        },
        inputs: {
          SetOptions: "setOptions",
          Clear: "clearTags",
        },
        customEvents: {
          "!POPUP_TEXT_ENTRY_SUBMIT": "onPopupTextEntrySubmit",
        },
      });

      this.options = [];
      this.tags = [];
      this.tagPanels = {};
      this.popupTextEntryChannel = _.uniqueId("popup_text_entry_");
      this.debug("init");
    }

    // ----- I/O -----

    setOptions(payload) {
      this.debug("setOptions()", payload);
      this.options = payload.options;
      this.renderOptions();
    }

    // ----- Event handlers -----

    onTagRemove(tag) {
      this.debug("onTagRemove()", tag);
      this.removeTag(tag);
    }

    onOptionSelect() {
      const selected = this.$options.GetSelected();

      this.debug("OnOptionSelect", _.get(selected, "id"));

      if (!selected) {
        return;
      }

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

      this.$options.SetSelected(DYN_ELEMS.OPTION.emptyId);
    }

    onPopupTextEntrySubmit(payload) {
      if (payload.channel !== this.popupTextEntryChannel) {
        return;
      }

      this.debug("onPopupTextEntrySubmit()", payload);

      if (!_.isEmpty(payload.text)) {
        this.addTag(payload.text);
      }
    }

    // ----- Helpers -----

    notifyChange() {
      this.runOutput("OnChange", { tags: this.tags });
    }

    selectTag(tag) {
      tag = normalizeTag(tag);

      if (_.isEmpty(tag) || this.isTagSelected(tag)) {
        return null;
      }

      this.tags.push(tag);

      return tag;
    }

    deselectTag(tag) {
      tag = normalizeTag(tag);

      if (!this.isTagSelected(tag)) {
        return null;
      }

      _.pull(this.tags, tag);

      return tag;
    }

    isTagSelected(tag) {
      return _.includes(this.tags, normalizeTag(tag));
    }

    registerTagPanel(tag, panel) {
      this.tagPanels[tag] = panel;
    }

    unregisterTagPanel(tag) {
      delete this.tagPanels[tag];
    }

    createOption(option) {
      let id = null;
      let text = null;
      const { cssClass, emptyId, textEntryId } = DYN_ELEMS.OPTION;

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
          id = optionId(option);
          text = option;
      }

      return this.createLabel(this.$options, id, text, {
        classes: [cssClass],
        attrs: { value: option },
      });
    }

    createTag(tag) {
      const { snippet, removeButtonId } = DYN_ELEMS.TAG;
      const id = tagId(tag);
      const panel = this.renderSnippet(this.$list, id, snippet, {
        dialogVars: { value: tag },
      });

      const removePanel = panel.FindChildTraverse(removeButtonId);

      removePanel.SetPanelEvent("onactivate", _.bind(this.onTagRemove, this, tag));

      this.registerTagPanel(tag, panel);

      return panel;
    }

    // ----- Actions -----

    createOptionAction(option) {
      return new AddOptionAction(this.$options, _.bind(this.createOption, this, option));
    }

    renderOptionsAction() {
      const actions = _.chain([OPTIONS.EMPTY])
        .concat(this.options, OPTIONS.TEXT_ENTRY)
        .reject(this.isTagSelected.bind(this))
        .map(this.createOptionAction.bind(this))
        .value();

      return new Sequence().RemoveAllOptions(this.$options).Action(actions);
    }

    selectTagAction(tag) {
      return new RunFunctionAction(() => {
        if (!this.selectTag(tag)) {
          throw new StopSequence();
        }
      });
    }

    deselectTagAction(tag) {
      return new RunFunctionAction(() => {
        if (!this.deselectTag(tag)) {
          throw new StopSequence();
        }
      });
    }

    createTagAction(tag) {
      return new Sequence().RunFunction(() => this.createTag(tag));
    }

    addTagAction(tag) {
      return new Sequence().Action(this.selectTagAction(tag)).Action(this.createTagAction(tag));
    }

    removeTagAction(tag, options) {
      options = _.assign({ immediate: false }, options);

      const delay = options.immediate ? 0 : DYN_ELEMS.TAG.deleteDelay;
      const seq = new Sequence();
      const panel = this.tagPanels[tag];

      if (delay) {
        seq.Disable(panel);
      }

      return seq
        .Action(this.deselectTagAction(tag))
        .RunFunction(() => this.unregisterTagPanel(tag))
        .DeleteAsync(panel, delay);
    }

    clearTagsAction() {
      const removeTagAction = _.chain(this.removeTagAction)
        .bind(this, _, { immediate: true })
        .unary()
        .value();

      const actions = _.map(this.tags, removeTagAction);

      return new ParallelSequence().Action(actions);
    }

    // ----- Action runners -----

    renderOptions() {
      const seq = new Sequence().Action(this.renderOptionsAction());

      this.debugFn(() => ["renderOptions()", { options: this.options, actions: seq.size() }]);

      return seq.Start();
    }

    addTag(tag) {
      tag = normalizeTag(tag);

      const seq = new Sequence()
        .Action(this.addTagAction(tag))
        .RunFunction(() => this.notifyChange());

      this.debugFn(() => ["addTag()", { tag, actions: seq.size() }]);

      return seq.Start();
    }

    removeTag(tag) {
      tag = normalizeTag(tag);

      const seq = new Sequence()
        .Action(this.removeTagAction(tag))
        .RunFunction(() => this.notifyChange());

      this.debugFn(() => ["removeTag()", { tag, actions: seq.size() }]);

      return seq.Start();
    }

    clearTags() {
      const seq = new Sequence()
        .Action(this.clearTagsAction())
        .RunFunction(() => this.notifyChange());

      this.debugFn(() => ["clearTags()", { tags: this.tags.length, actions: seq.size() }]);

      return seq.Start();
    }

    showTagEntryPopup() {
      const { id } = DYN_ELEMS.POPUP_TEXT_ENTRY;

      return this.showPopup(this.$options, id, LAYOUTS.POPUPS.TEXT_ENTRY, {
        channel: this.popupTextEntryChannel,
        title: $.Localize(L10N_KEYS.POPUP_TEXT_ENTRY_TITLE),
      });
    }
  }

  context.select = new UITagSelect();
})(GameUI.CustomUIConfig(), this);
