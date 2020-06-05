"use strict";

(function(global, context) {
  var _ = global.lodash;
  var Sequence = global.Sequence.Sequence;
  var StopSequence = global.Sequence.StopSequence;
  var ParallelSequence = global.Sequence.ParallelSequence;
  var AddOptionAction = global.Sequence.AddOptionAction;
  var RunFunctionAction = global.Sequence.RunFunctionAction;
  var CreatePanelWithLayoutSnippet = global.Util.CreatePanelWithLayoutSnippet;
  var CreateComponent = context.CreateComponent;

  var POPUP_TEXT_ENTRY_LAYOUT = "file://{resources}/layout/custom_game/popups/popup_text_entry.xml";
  var POPUP_TEXT_ENTRY_ID = "UITagSelectPopupTextEntry";

  var TAG_SNIPPET = "UITagSelectTag";
  var TAG_ID_PREFIX = "UITagSelectTag";
  var TAG_REMOVE_BUTTON_ID = "UITagSelectTagRemoveButton";
  var TAG_DELETE_DELAY = 0.25;

  var OPTION_CLASS = "UITagSelectOption";
  var OPTION_ID_PREFIX = "UITagSelectOption";
  var OPTION_EMPTY = "__empty__";
  var OPTION_ID_EMPTY = OPTION_ID_PREFIX + OPTION_EMPTY;
  var OPTION_TEXT_ENTRY = "__text_entry__";
  var OPTION_ID_TEXT_ENTRY = OPTION_ID_PREFIX + OPTION_TEXT_ENTRY;

  var L10N_KEYS = {
    OPTION_TEXT_ENTRY: "invokation_tag_select_option_text_entry",
    POPUP_TEXT_ENTRY_TITLE: "invokation_tag_select_popup_text_entry_title",
  };

  function normalizeTag(tag) {
    return _.kebabCase(tag);
  }

  function tagId(tag) {
    return (
      TAG_ID_PREFIX +
      _.chain(tag)
        .camelCase()
        .upperFirst()
        .value()
    );
  }

  function optionId(option) {
    return (
      OPTION_ID_PREFIX +
      _.chain(option)
        .camelCase()
        .upperFirst()
        .value()
    );
  }

  var UITagSelect = CreateComponent({
    constructor: function UITagSelect() {
      UITagSelect.super.call(this, {
        elements: {
          list: "UITagSelectTagList",
          options: "UITagSelectOptions",
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
    },

    // ----- I/O -----

    setOptions: function(payload) {
      this.debug("setOptions()", payload);
      this.options = payload.options;
      this.renderOptions();
    },

    // ----- Event handlers -----

    onTagRemove: function(tag) {
      this.debug("onTagRemove()", tag);
      this.removeTag(tag);
    },

    onOptionSelect: function() {
      var selected = this.$options.GetSelected();

      this.debug("OnOptionSelect", _.get(selected, "id"));

      if (!selected) {
        return;
      }

      var option = selected.GetAttributeString("value", "");

      switch (option) {
        case OPTION_EMPTY:
          return;
        case OPTION_TEXT_ENTRY:
          this.showTagEntryPopup();
          break;
        default:
          this.addTag(option);
      }

      this.$options.SetSelected(OPTION_ID_EMPTY);
    },

    onPopupTextEntrySubmit: function(payload) {
      if (payload.channel !== this.popupTextEntryChannel) {
        return;
      }

      this.debug("onPopupTextEntrySubmit()", payload);

      if (!_.isEmpty(payload.text)) {
        this.addTag(payload.text);
      }
    },

    // ----- Helpers -----

    notifyChange: function() {
      this.runOutput("OnChange", { tags: this.tags });
    },

    selectTag: function(tag) {
      tag = normalizeTag(tag);

      if (_.isEmpty(tag) || this.isTagSelected(tag)) {
        return null;
      }

      this.tags.push(tag);
      return tag;
    },

    deselectTag: function(tag) {
      tag = normalizeTag(tag);

      if (!this.isTagSelected(tag)) {
        return null;
      }

      _.pull(this.tags, tag);
      return tag;
    },

    isTagSelected: function(tag) {
      return _.includes(this.tags, normalizeTag(tag));
    },

    registerTagPanel: function(tag, panel) {
      this.tagPanels[tag] = panel;
    },

    unregisterTagPanel: function(tag) {
      delete this.tagPanels[tag];
    },

    createOption: function(option) {
      var id;
      var text;

      switch (option) {
        case OPTION_EMPTY:
          id = OPTION_ID_EMPTY;
          text = "";
          break;
        case OPTION_TEXT_ENTRY:
          id = OPTION_ID_TEXT_ENTRY;
          text = $.Localize(L10N_KEYS.OPTION_TEXT_ENTRY);
          break;
        default:
          id = optionId(option);
          text = option;
      }

      var panel = $.CreatePanel("Label", this.$options, id);

      panel.text = text;
      panel.SetAttributeString("value", option);
      panel.AddClass(OPTION_CLASS);

      return panel;
    },

    createTag: function(tag) {
      var id = tagId(tag);

      var panel = CreatePanelWithLayoutSnippet(this.$list, id, TAG_SNIPPET);
      var removePanel = panel.FindChildTraverse(TAG_REMOVE_BUTTON_ID);

      panel.SetDialogVariable("value", tag);
      removePanel.SetPanelEvent("onactivate", _.bind(this.onTagRemove, this, tag));

      this.registerTagPanel(tag, panel);

      return panel;
    },

    // ----- Actions -----

    createOptionAction: function(option) {
      return new AddOptionAction(this.$options, _.bind(this.createOption, this, option));
    },

    renderOptionsAction: function() {
      var actions = _.chain([OPTION_EMPTY])
        .concat(this.options, OPTION_TEXT_ENTRY)
        .reject(this.isTagSelected.bind(this))
        .map(this.createOptionAction.bind(this))
        .value();

      return new Sequence().RemoveAllOptions(this.$options).Action(actions);
    },

    selectTagAction: function(tag) {
      return new RunFunctionAction(this, function() {
        if (!this.selectTag(tag)) {
          throw new StopSequence();
        }
      });
    },

    deselectTagAction: function(tag) {
      return new RunFunctionAction(this, function() {
        if (!this.deselectTag(tag)) {
          throw new StopSequence();
        }
      });
    },

    createTagAction: function(tag) {
      return new Sequence().RunFunction(this, this.createTag, tag);
      // .RunFunction(this, this.moveOptionsAfterTag, tag);
    },

    addTagAction: function(tag) {
      return new Sequence().Action(this.selectTagAction(tag)).Action(this.createTagAction(tag));
    },

    removeTagAction: function(tag, options) {
      options = _.assign({ immediate: false }, options);

      var delay = options.immediate ? 0 : TAG_DELETE_DELAY;
      var seq = new Sequence();
      var panel = this.tagPanels[tag];

      if (delay) {
        seq.Disable(panel);
      }

      return seq
        .Action(this.deselectTagAction(tag))
        .RunFunction(this, this.unregisterTagPanel, tag)
        .DeleteAsync(panel, delay);
    },

    clearTagsAction: function() {
      var removeTagAction = _.chain(this.removeTagAction)
        .bind(this, _, { immediate: true })
        .unary()
        .value();

      var actions = _.map(this.tags, removeTagAction);

      return new ParallelSequence().Action(actions);
    },

    // ----- Action runners -----

    renderOptions: function() {
      var seq = new Sequence().Action(this.renderOptionsAction());

      this.debugFn(function() {
        return ["renderOptions()", { options: this.options, actions: seq.size() }];
      });

      return seq.Start();
    },

    addTag: function(tag) {
      tag = normalizeTag(tag);

      var seq = new Sequence().Action(this.addTagAction(tag)).RunFunction(this, this.notifyChange);

      this.debugFn(function() {
        return ["addTag()", { tag: tag, actions: seq.size() }];
      });

      return seq.Start();
    },

    removeTag: function(tag) {
      tag = normalizeTag(tag);

      var seq = new Sequence().Action(this.removeTagAction(tag)).RunFunction(this, this.notifyChange);

      this.debugFn(function() {
        return ["removeTag()", { tag: tag, actions: seq.size() }];
      });

      return seq.Start();
    },

    clearTags: function() {
      var seq = new Sequence().Action(this.clearTagsAction()).RunFunction(this, this.notifyChange);

      this.debugFn(function() {
        return ["clearTags()", { tags: this.tags.length, actions: seq.size() }];
      });

      return seq.Start();
    },

    showTagEntryPopup: function() {
      return this.showPopup(this.$options, POPUP_TEXT_ENTRY_ID, POPUP_TEXT_ENTRY_LAYOUT, {
        channel: this.popupTextEntryChannel,
        title: $.Localize(L10N_KEYS.POPUP_TEXT_ENTRY_TITLE),
      });
    },
  });

  context.select = new UITagSelect();
})(GameUI.CustomUIConfig(), this);
