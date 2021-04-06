"use strict";

((global, context) => {
  const { Component } = context;
  const { lodash: _, L10n, NetTable } = global;
  const { LuaArrayDeep } = global.Util;
  const { Sequence, ParallelSequence, NoopAction, EnableAction, DisableAction } = global.Sequence;
  const { EVENTS, NET_TABLE, SHOP_CATEGORIES } = global.Const;

  const DYN_ELEMS = {
    GROUP: {
      snippet: "group",
      idPrefix: "group",
      dialogVarName: "group_name",
      categoryListId: "categories",
    },
    CATEGORY: {
      snippet: "category",
      idPrefix: "category",
      dialogVarName: "category_name",
      itemListId: "items",
    },
    ITEM: {
      idPrefix: "item",
      cssClass: "item",
      highlightClass: "highlighted",
    },
  };

  const elementId = (prefix, name) => _.chain(`${prefix}_${name}`).camelCase().upperFirst().value();

  class UIItemPicker extends Component {
    constructor() {
      super({
        elements: {
          search: "search-text-entry",
          groups: "groups",
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
    }

    onImageActivate(imagePanel) {
      this.debug("onImageActivate()", imagePanel.id);
      this.select(imagePanel);
    }

    onQueryResponse(payload) {
      this.debug("onQueryResponse()");
      this.highlight(payload.items);
    }

    highlight(items) {
      return new Sequence()
        .Action(this.disableItemsAction())
        .Action(this.enableItemsAction(items))
        .Start();
    }

    disableItemsAction() {
      const disableItemAction = _.chain(this.disableItemAction)
        .bind(this)
        .rearg([1, 0])
        .ary(2)
        .value();

      const actions = _.map(this.itemPanels, disableItemAction);

      return new ParallelSequence().Action(actions);
    }

    disableItemAction(itemName) {
      const panels = this.itemPanels[itemName];

      if (!panels) {
        this.warn("Could not find panel for item", itemName);
        return new NoopAction();
      }

      const actions = _.map(panels, (panel) => new DisableAction(panel));

      return new ParallelSequence().Action(actions);
    }

    enableItemsAction(items) {
      const enableItemAction = _.chain(this.enableItemAction)
        .bind(this)
        .rearg([1, 0])
        .ary(2)
        .value();

      const actions = _.map(items, enableItemAction);

      return new ParallelSequence().Action(actions);
    }

    enableItemAction(itemName) {
      const panels = this.itemPanels[itemName];

      if (!panels) {
        this.warn("Could not find panel for item", itemName);
        return new NoopAction();
      }

      const actions = _.map(panels, (panel) => new EnableAction(panel));

      return new ParallelSequence().Action(actions);
    }

    loadItems() {
      this.shopItems = LuaArrayDeep(this.netTable.Get(NET_TABLE.KEYS.MAIN.SHOP_ITEMS));
    }

    select(imagePanel) {
      const { highlightClass } = DYN_ELEMS.ITEM;
      const highlighted = this.$groups.FindChildrenWithClassTraverse(highlightClass);

      _.each(highlighted, (panel) => panel.RemoveClass(highlightClass));

      imagePanel.AddClass(highlightClass);

      this.runOutput("OnSelect", { item: imagePanel.itemname });
    }

    search(query) {
      if (_.isEmpty(query)) {
        return this.enableItemsAction(this.itemPanels).Start();
      }

      return this.sendServer(EVENTS.ITEM_PICKER_QUERY, { query });
    }

    render() {
      this.$search.SetFocus(true);

      const createGroup = _.chain(this.createGroup)
        .bind(this, this.$groups)
        .rearg([1, 0])
        .ary(2)
        .value();

      _.each(SHOP_CATEGORIES, createGroup);
    }

    createGroup(parent, group, categories) {
      const { idPrefix, snippet, dialogVarName, categoryListId } = DYN_ELEMS.GROUP;
      const id = elementId(idPrefix, group);
      const panel = this.renderSnippet(parent, id, snippet, {
        dialogVars: {
          [dialogVarName]: L10n.LocalizeShopGroup(group),
        },
      });

      const categoriesPanel = panel.FindChild(categoryListId);
      const createCategory = _.chain(this.createCategory)
        .bind(this, categoriesPanel)
        .unary()
        .value();

      _.each(categories, createCategory);

      return panel;
    }

    createCategory(parent, category) {
      const { idPrefix, snippet, dialogVarName, itemListId } = DYN_ELEMS.CATEGORY;
      const id = elementId(idPrefix, category);
      const panel = this.renderSnippet(parent, id, snippet, {
        dialogVars: {
          [dialogVarName]: L10n.LocalizeShopCategory(category),
        },
      });

      const itemsPanel = panel.FindChild(itemListId);
      const items = this.shopItems[category];
      const createItemImage = _.chain(this.createItem).bind(this, itemsPanel).unary().value();

      _.each(items, createItemImage);

      return panel;
    }

    createItem(parent, itemName) {
      const { idPrefix, cssClass } = DYN_ELEMS.ITEM;
      const id = elementId(idPrefix, itemName);
      const panel = this.createItemImage(parent, id, itemName, {
        classes: [cssClass],
        events: {
          onactivate: _.partial(this.handler("onImageActivate"), panel),
        },
      });

      if (itemName in this.itemPanels) {
        this.itemPanels[itemName].push(panel);
      } else {
        this.itemPanels[itemName] = [panel];
      }

      return panel;
    }

    Search() {
      this.debug("Search()", this.$search.text.toString());
      this.search(this.$search.text);
    }
  }

  context.picker = new UIItemPicker();
})(GameUI.CustomUIConfig(), this);
