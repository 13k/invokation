"use strict";

((global, context) => {
  const { Component } = context;
  const { lodash: _ } = global;
  const { COMPONENTS } = global.Const;
  const { Sequence, ParallelSequence, StopSequence, RunFunctionAction } = global.Sequence;

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

  const normalizeTag = (tag) => _.kebabCase(tag);
  const elementId = (prefix, name) => _.kebabCase(`${prefix}_${name}`);
  const tagId = (tag) => elementId(DYN_ELEMS.TAG.idPrefix, tag);
  const optionId = (option) => elementId(DYN_ELEMS.OPTION.idPrefix, option);

  class TagSelect extends Component {
    constructor() {
      const { inputs, outputs } = COMPONENTS.UI.TAG_SELECT;

      super({
        elements: {
          tags: "tags",
          options: "options",
        },
        inputs: {
          [inputs.SET_OPTIONS]: "setOptions",
          [inputs.CLEAR]: "clearTags",
        },
        outputs: Object.values(outputs),
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

      this.debugFn(() => ["onOptionSelect()", { id: _.get(selected, "id") }]);

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

    // ----- Properties -----

    get isTagsOverflow() {
      const { contentwidth, actuallayoutwidth } = this.$tags;

      return contentwidth >= actuallayoutwidth;
    }

    // ----- Helpers -----

    notifyChange() {
      const { outputs } = COMPONENTS.UI.TAG_SELECT;

      return this.runOutput(outputs.ON_CHANGE, { tags: this.tags });
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
          id = optionId(option);
          text = option;
      }

      return this.createLabel(this.$options, id, text, {
        classes: [cssClass],
        attrs: { value: option },
      });
    }

    createTag(tag) {
      const { snippet } = DYN_ELEMS.TAG;

      const id = tagId(tag);
      const panel = this.createSnippet(this.$tags, id, snippet, {
        dialogVars: { value: tag },
        events: {
          onactivate: _.bind(this.onTagRemove, this, tag),
        },
      });

      this.registerTagPanel(tag, panel);

      return panel;
    }

    // ----- Actions -----

    createOptionAction(option) {
      return new Sequence().AddOption(this.$options, _.bind(this.createOption, this, option));
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
      return new RunFunctionAction(() => this.createTag(tag));
    }

    addTagAction(tag) {
      return new Sequence()
        .Action(this.selectTagAction(tag))
        .Action(this.createTagAction(tag))
        .Action(this.updateTagsOverflowAction());
    }

    removeTagAction(tag, options) {
      options = _.assign({ immediate: false }, options);

      const delay = options.immediate ? 0 : DYN_ELEMS.TAG.deleteDelay;
      const panel = this.tagPanels[tag];
      const seq = new Sequence().Action(this.deselectTagAction(tag));

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

    updateTagsOverflowAction() {
      return new RunFunctionAction(() => {
        const isOverflow = this.isTagsOverflow;

        this.debug("updateTagsOverflow()", { isOverflow });
        this.debugTags();

        if (isOverflow) {
          this.$tags.AddClass(CLASSES.TAGS_OVERFLOW);
        } else {
          this.$tags.RemoveClass(CLASSES.TAGS_OVERFLOW);
        }
      });
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

      this.debugFn(() => ["renderOptions()", { options: this.options, actions: seq.length }]);

      return seq.Start();
    }

    addTag(tag) {
      tag = normalizeTag(tag);

      const seq = new Sequence()
        .Action(this.addTagAction(tag))
        .RunFunction(() => this.notifyChange());

      this.debugFn(() => ["addTag()", { tag, actions: seq.length }]);

      return seq.Start();
    }

    removeTag(tag) {
      tag = normalizeTag(tag);

      const seq = new Sequence()
        .Action(this.removeTagAction(tag))
        .RunFunction(() => this.notifyChange());

      this.debugFn(() => ["removeTag()", { tag, actions: seq.length }]);

      return seq.Start();
    }

    clearTags() {
      const seq = new Sequence()
        .Action(this.clearTagsAction())
        .RunFunction(() => this.notifyChange());

      this.debugFn(() => ["clearTags()", { tags: this.tags.length, actions: seq.length }]);

      return seq.Start();
    }

    showTagEntryPopup() {
      const { layout } = COMPONENTS.POPUPS.TEXT_ENTRY;
      const { id } = DYN_ELEMS.POPUP_TEXT_ENTRY;

      return this.showPopup(this.$options, id, layout, {
        channel: this.popupTextEntryChannel,
        title: $.Localize(L10N_KEYS.POPUP_TEXT_ENTRY_TITLE),
      });
    }

    debugTags() {
      const {
        contentwidth,
        desiredlayoutwidth,
        actuallayoutwidth,
        actualxoffset,
        scrolloffset_x,
        actualuiscale_x,
      } = this.$tags;

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

  context.component = new TagSelect();
})(GameUI.CustomUIConfig(), this);
