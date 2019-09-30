"use strict";

(function(global, context) {
  var _ = global.lodash;
  var L10n = global.L10n;
  var NetTable = global.NetTable;
  var LuaListDeep = global.Util.LuaListDeep;
  var CreateItemImage = global.Util.CreateItemImage;
  var CreatePanelWithLayoutSnippet = global.Util.CreatePanelWithLayoutSnippet;
  var Sequence = global.Sequence.Sequence;
  var ParallelSequence = global.Sequence.ParallelSequence;
  var NoopAction = global.Sequence.NoopAction;
  var EnableAction = global.Sequence.EnableAction;
  var DisableAction = global.Sequence.DisableAction;
  var CreateComponent = context.CreateComponent;

  var EVENTS = global.Const.EVENTS;
  var NET_TABLE = global.Const.NET_TABLE;
  var CATEGORIES = global.Const.SHOP_CATEGORIES;

  var GROUP_SNIPPET = "UIItemPickerGroup";
  var GROUP_ID_PREFIX = "UIItemPickerGroup";
  var GROUP_NAME_ATTR = "group_name";
  var GROUP_CATEGORY_LIST_ID = "CategoryList";

  var CATEGORY_SNIPPET = "UIItemPickerCategory";
  var CATEGORY_ID_PREFIX = "UIItemPickerCategory";
  var CATEGORY_NAME_ATTR = "category_name";
  var CATEGORY_ITEM_LIST_ID = "ItemList";

  var ITEM_ID_PREFIX = "UIItemPicker";
  var ITEM_CLASS = "UIItemPickerItem";
  var ITEM_HIGHLIGHT_CLASS = "Highlighted";

  function elementId(prefix, name) {
    var suffix = _.chain(name)
      .camelCase()
      .upperFirst()
      .value();

    return prefix + suffix;
  }

  var UIItemPicker = CreateComponent({
    constructor: function UIItemPicker() {
      UIItemPicker.super.call(this, {
        elements: {
          search: "UIItemPickerSearchTextEntry",
          groups: "UIItemPickerGroups",
        },
        customEvents: {
          "!ITEM_PICKER_QUERY_RESPONSE": "onQueryResponse",
        },
      });

      this.netTable = new NetTable(NET_TABLE.MAIN);
      this.itemPanels = {};

      this.loadItems();
      this.render();
      this.debug("init");
    },

    onImageActivate: function(imagePanel) {
      this.debug("onImageActivate()", imagePanel.id);
      this.select(imagePanel);
    },

    onQueryResponse: function(payload) {
      this.debug("onQueryResponse()");
      this.highlight(payload.items);
    },

    highlight: function(items) {
      return new Sequence()
        .Action(this.disableItemsAction())
        .Action(this.enableItemsAction(items))
        .Start();
    },

    disableItemsAction: function() {
      var disableItemAction = _.chain(this.disableItemAction)
        .bind(this)
        .rearg([1, 0])
        .ary(2)
        .value();

      var actions = _.map(this.itemPanels, disableItemAction);

      return new ParallelSequence().Action(actions);
    },

    disableItemAction: function(itemName) {
      var panels = this.itemPanels[itemName];

      if (!panels) {
        this.warn("Could not find panel for item", itemName);
        return new NoopAction();
      }

      var actions = _.map(panels, function(panel) {
        return new DisableAction(panel);
      });

      return new ParallelSequence().Action(actions);
    },

    enableItemsAction: function(items) {
      var enableItemAction = _.chain(this.enableItemAction)
        .bind(this)
        .rearg([1, 0])
        .ary(2)
        .value();

      var actions = _.map(items, enableItemAction);

      return new ParallelSequence().Action(actions);
    },

    enableItemAction: function(itemName) {
      var panels = this.itemPanels[itemName];

      if (!panels) {
        this.warn("Could not find panel for item", itemName);
        return new NoopAction();
      }

      var actions = _.map(panels, function(panel) {
        return new EnableAction(panel);
      });

      return new ParallelSequence().Action(actions);
    },

    loadItems: function() {
      this.shopItems = LuaListDeep(this.netTable.Get(NET_TABLE.KEYS.MAIN.SHOP_ITEMS));
    },

    select: function(imagePanel) {
      var highlighted = this.$groups.FindChildrenWithClassTraverse(ITEM_HIGHLIGHT_CLASS);

      _.each(highlighted, function(panel) {
        panel.RemoveClass(ITEM_HIGHLIGHT_CLASS);
      });

      imagePanel.AddClass(ITEM_HIGHLIGHT_CLASS);

      this.runOutput("OnSelect", { item: imagePanel.itemname });
    },

    search: function(query) {
      if (_.isEmpty(query)) {
        return this.enableItemsAction(this.itemPanels).Start();
      }

      return this.sendServer(EVENTS.ITEM_PICKER_QUERY, { query: query });
    },

    render: function() {
      this.$search.SetFocus(true);

      var createGroup = _.chain(this.createGroup)
        .bind(this, this.$groups)
        .rearg([1, 0])
        .ary(2)
        .value();

      _.each(CATEGORIES, createGroup);
    },

    createGroup: function(parent, group, categories) {
      var groupId = elementId(GROUP_ID_PREFIX, group);
      var panel = CreatePanelWithLayoutSnippet(parent, groupId, GROUP_SNIPPET);
      var categoriesPanel = panel.FindChild(GROUP_CATEGORY_LIST_ID);
      var createCategory = _.chain(this.createCategory)
        .bind(this, categoriesPanel)
        .unary()
        .value();

      panel.SetDialogVariable(GROUP_NAME_ATTR, L10n.LocalizeShopGroup(group));

      _.each(categories, createCategory);

      return panel;
    },

    createCategory: function(parent, category) {
      var categoryId = elementId(CATEGORY_ID_PREFIX, category);
      var panel = CreatePanelWithLayoutSnippet(parent, categoryId, CATEGORY_SNIPPET);
      var itemsPanel = panel.FindChild(CATEGORY_ITEM_LIST_ID);
      var items = this.shopItems[category];
      var createItemImage = _.chain(this.createItemImage)
        .bind(this, itemsPanel)
        .unary()
        .value();

      panel.SetDialogVariable(CATEGORY_NAME_ATTR, L10n.LocalizeShopCategory(category));

      _.each(items, createItemImage);

      return panel;
    },

    createItemImage: function(parent, itemName) {
      var itemId = elementId(ITEM_ID_PREFIX, itemName);
      var panel = CreateItemImage(parent, itemId, itemName);

      panel.AddClass(ITEM_CLASS);
      panel.SetPanelEvent("onactivate", _.partial(this.handler("onImageActivate"), panel));

      if (itemName in this.itemPanels) {
        this.itemPanels[itemName].push(panel);
      } else {
        this.itemPanels[itemName] = [panel];
      }

      return panel;
    },

    Search: function() {
      this.debug("Search()", this.$search.text.toString());
      this.search(this.$search.text);
    },
  });

  context.picker = new UIItemPicker();
})(GameUI.CustomUIConfig(), this);
