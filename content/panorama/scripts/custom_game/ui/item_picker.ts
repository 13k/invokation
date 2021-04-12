"use strict";

((global, context) => {
  const { Component } = context;
  const { lodash: _, L10n, NetTable } = global;
  const { LuaArrayDeep } = global.Util;
  const {
    Sequence,
    ParallelSequence,
    NoopAction,
    EnableAction,
    DisableAction,
    RemoveClassAction,
  } = global.Sequence;

  const { COMPONENTS, EVENTS, NET_TABLE, SHOP_CATEGORIES } = global.Const;

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

  const elementId = (prefix, name) => `${prefix}-${name}`;

  class ItemPicker extends Component {
    constructor() {
      const { outputs } = COMPONENTS.UI.ITEM_PICKER;

      super({
        elements: {
          search: "search-text-entry",
          groups: "groups",
        },
        outputs: Object.values(outputs),
        customEvents: {
          "!ITEM_PICKER_QUERY_RESPONSE": "onQueryResponse",
        },
      });

      this.netTable = new NetTable(NET_TABLE.MAIN);
      this.groupPanels = {};
      this.categoryPanels = {};
      this.itemPanels = {};

      this.loadItems();
      this.render();
      this.debug("init");
    }

    // ----- Event handlers -----

    onImageActivate(event) {
      this.debug("onImageActivate()", { event });
      this.select(event.panel);
    }

    onQueryResponse(payload) {
      this.debug("onQueryResponse()");
      this.highlight(payload.items);
    }

    // ----- Helpers -----

    loadItems() {
      this.shopItems = LuaArrayDeep(this.netTable.Get(NET_TABLE.KEYS.MAIN.SHOP_ITEMS));
    }

    addItemPanel(panel) {
      const { itemname } = panel;

      this.itemPanels[itemname] = this.itemPanels[itemname] || [];
      this.itemPanels[itemname].push(panel);

      return panel;
    }

    createGroup(parent, group) {
      const { idPrefix, snippet, dialogVarName } = DYN_ELEMS.GROUP;

      const id = elementId(idPrefix, group);
      const panel = this.createSnippet(parent, id, snippet, {
        dialogVars: {
          [dialogVarName]: L10n.LocalizeShopGroup(group),
        },
      });

      this.groupPanels[group] = panel;

      return panel;
    }

    createCategory(parent, category) {
      const { idPrefix, snippet, dialogVarName } = DYN_ELEMS.CATEGORY;
      const id = elementId(idPrefix, category);
      const panel = this.createSnippet(parent, id, snippet, {
        dialogVars: {
          [dialogVarName]: L10n.LocalizeShopCategory(category),
        },
      });

      this.categoryPanels[category] = panel;

      return panel;
    }

    createItem(parent, item) {
      const { idPrefix, cssClass } = DYN_ELEMS.ITEM;
      const id = elementId(idPrefix, item);
      const panel = this.createItemImage(parent, id, item, {
        classes: [cssClass],
        events: {
          onactivate: "onImageActivate",
        },
      });

      return this.addItemPanel(panel);
    }

    // ----- Actions -----

    createGroupAction(parent, group, categories) {
      return new Sequence()
        .RunFunction(() => this.createGroup(parent, group))
        .Action(_.map(categories, (category) => this.createCategoryAction(group, category)));
    }

    createCategoryAction(group, category) {
      const { categoryListId } = DYN_ELEMS.GROUP;
      const items = this.shopItems[category];

      return new Sequence()
        .RunFunction(() => {
          const groupPanel = this.groupPanels[group];
          const categoriesPanel = groupPanel.FindChild(categoryListId);

          return this.createCategory(categoriesPanel, category);
        })
        .Action(_.map(items, (item) => this.createItemAction(category, item)));
    }

    createItemAction(category, item) {
      const { itemListId } = DYN_ELEMS.CATEGORY;

      return new Sequence().RunFunction(() => {
        const categoryPanel = this.categoryPanels[category];
        const itemsPanel = categoryPanel.FindChild(itemListId);

        return this.createItem(itemsPanel, item);
      });
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

    highlightImagePanelAction(imagePanel) {
      const { highlightClass } = DYN_ELEMS.ITEM;
      const highlighted = this.$groups.FindChildrenWithClassTraverse(highlightClass);

      return new ParallelSequence()
        .Action(_.map(highlighted, (panel) => new RemoveClassAction(panel, highlightClass)))
        .AddClass(imagePanel, highlightClass);
    }

    // ----- Action runners -----

    highlight(items) {
      const seq = new Sequence()
        .Action(this.disableItemsAction())
        .Action(this.enableItemsAction(items));

      this.debugFn(() => ["highlight()", { actions: seq.length }]);

      return seq.Start();
    }

    select(panel) {
      const { outputs } = COMPONENTS.UI.ITEM_PICKER;

      const seq = new Sequence();

      // seq.Action(this.highlightImagePanelAction(panel));

      seq.RunFunction(() => {
        this.runOutput(outputs.ON_SELECT, { item: panel.itemname });
      });

      this.debugFn(() => ["select()", { item: panel.itemname, actions: seq.length }]);

      return seq.Start();
    }

    search(query) {
      const seq = new Sequence();

      if (_.isEmpty(query)) {
        seq.Action(this.enableItemsAction(this.itemPanels));
      } else {
        seq.RunFunction(() => {
          this.sendServer(EVENTS.ITEM_PICKER_QUERY, { query });
        });
      }

      this.debugFn(() => ["search()", { query, actions: seq.length }]);

      return seq.Start();
    }

    render() {
      const createGroupActions = _.map(SHOP_CATEGORIES, (categories, group) =>
        this.createGroupAction(this.$groups, group, categories)
      );

      const seq = new Sequence().Focus(this.$search).Action(createGroupActions);

      this.debugFn(() => ["render()", { actions: seq.length }]);

      return seq.Start();
    }

    // ----- UI methods -----

    Search() {
      this.debug("Search()", { text: this.$search.text });
      this.search(this.$search.text);
    }
  }

  context.component = new ItemPicker();
})(GameUI.CustomUIConfig(), this);
