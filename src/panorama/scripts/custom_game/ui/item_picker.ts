namespace invk {
  export namespace Components {
    export namespace UI {
      export namespace ItemPicker {
        export interface Elements extends Component.Elements {
          search: LabelPanel;
          groups: Panel;
        }

        export type Inputs = never;

        export interface Outputs extends Component.Outputs {
          OnSelect: {
            item: string;
          };
        }

        export type Params = never;

        const {
          CustomNetTables,
          L10n,
          Lua: { fromArrayDeep },
          NetTable: { NetTable },
          Panorama: { createItemImage, createPanelSnippet },
          Sequence: { Sequence, ParallelSequence, NoopAction, EnableAction, DisableAction },
          Util: { pascalCase },
          Vendor: { lodash: _ },
          Dota2: {
            Shop: { CATEGORIES },
          },
        } = GameUI.CustomUIConfig().invk;

        const GROUP_SNIPPET = "UIItemPickerGroup";
        const GROUP_ID_PREFIX = "UIItemPickerGroup";
        const GROUP_NAME_ATTR = "group_name";
        const GROUP_CATEGORY_LIST_ID = "CategoryList";

        const CATEGORY_SNIPPET = "UIItemPickerCategory";
        const CATEGORY_ID_PREFIX = "UIItemPickerCategory";
        const CATEGORY_NAME_ATTR = "category_name";
        const CATEGORY_ITEM_LIST_ID = "ItemList";

        const ITEM_ID_PREFIX = "UIItemPicker";
        const ITEM_CLASS = "UIItemPickerItem";
        const ITEM_HIGHLIGHT_CLASS = "Highlighted";

        const elementId = (prefix: string, name: string) => `${prefix}${pascalCase(name)}`;

        export class ItemPicker extends Component.Component<Elements, Inputs, Outputs> {
          netTable: NetTable.NetTable<CustomNetTables.Name.Invokation>;
          itemPanels: Record<string, ItemImage[]>;
          shopItems?: Record<Dota2.Shop.Category, string[]>;

          constructor() {
            super({
              elements: {
                search: "UIItemPickerSearchTextEntry",
                groups: "UIItemPickerGroups",
              },
              customEvents: {
                ITEM_PICKER_QUERY_RESPONSE: "onQueryResponse",
              },
            });

            this.netTable = new NetTable(CustomNetTables.Name.Invokation);
            this.itemPanels = {};

            this.loadItems();
            this.render();
            this.debug("init");
          }

          onImageActivate(imagePanel: ItemImage) {
            this.debug("onImageActivate()", imagePanel.id);
            this.select(imagePanel);
          }

          onQueryResponse(payload: CustomEvents.ItemPickerQueryResponse) {
            this.debug("onQueryResponse()");
            this.highlight(payload.items);
          }

          highlight(items: string[]) {
            return new Sequence()
              .Action(this.disableItemsAction())
              .Action(this.enableItemsAction(items))
              .Run();
          }

          disableItemsAction() {
            const actions = _.map(this.itemPanels, (_panel, item) => this.disableItemAction(item));

            return new ParallelSequence().Action(...actions);
          }

          disableItemAction(item: string) {
            const panels = this.itemPanels[item];

            if (!panels) {
              this.warn("Could not find panel for item", item);
              return new NoopAction();
            }

            const actions = _.map(panels, (panel) => new DisableAction(panel));

            return new ParallelSequence().Action(...actions);
          }

          enableItemsAction(items: string[]) {
            const actions = _.map(items, (item) => this.enableItemAction(item));

            return new ParallelSequence().Action(...actions);
          }

          enableItemAction(item: string) {
            const panels = this.itemPanels[item];

            if (!panels) {
              this.warn("Could not find panel for item", item);
              return new NoopAction();
            }

            const actions = _.map(panels, (panel) => new EnableAction(panel));

            return new ParallelSequence().Action(...actions);
          }

          loadItems() {
            this.shopItems = fromArrayDeep(
              this.netTable.get(CustomNetTables.Invokation.Key.ShopItems)
            );
          }

          select(imagePanel: ItemImage) {
            const highlighted =
              this.elements.groups.FindChildrenWithClassTraverse(ITEM_HIGHLIGHT_CLASS);

            _.each(highlighted, (panel) => panel.RemoveClass(ITEM_HIGHLIGHT_CLASS));

            imagePanel.AddClass(ITEM_HIGHLIGHT_CLASS);

            this.runOutput("OnSelect", { item: imagePanel.itemname });
          }

          search(query: string) {
            if (_.isEmpty(query)) {
              this.enableItemsAction(_.keys(this.itemPanels)).Run();
              return;
            }

            this.sendServer(CustomEvents.Name.ITEM_PICKER_QUERY, { query: query });
          }

          render() {
            if (!this.shopItems) return;

            this.elements.search.SetFocus();

            for (const [group, categories] of Object.entries(CATEGORIES)) {
              this.createGroup(this.elements.groups, group as Dota2.Shop.CategoryGroup, categories);
            }
          }

          createGroup(
            parent: Panel,
            group: Dota2.Shop.CategoryGroup,
            categories: Dota2.Shop.Category[]
          ) {
            if (!this.shopItems) return;

            const groupId = elementId(GROUP_ID_PREFIX, group);
            const panel = createPanelSnippet(parent, groupId, GROUP_SNIPPET);
            const categoriesPanel = panel.FindChild(GROUP_CATEGORY_LIST_ID);

            if (!categoriesPanel) {
              this.warn("Could not find categories panel for group", group);
              return;
            }

            panel.SetDialogVariable(GROUP_NAME_ATTR, L10n.shopGroup(group));

            for (const category of categories) {
              this.createCategory(categoriesPanel, category);
            }
          }

          createCategory(parent: Panel, category: Dota2.Shop.Category) {
            if (!this.shopItems) return;

            const items = this.shopItems[category];
            const categoryId = elementId(CATEGORY_ID_PREFIX, category);
            const panel = createPanelSnippet(parent, categoryId, CATEGORY_SNIPPET);
            const itemsPanel = panel.FindChild(CATEGORY_ITEM_LIST_ID);

            if (!itemsPanel) {
              this.warn("Could not find items panel for category", category);
              return;
            }

            panel.SetDialogVariable(CATEGORY_NAME_ATTR, L10n.shopCategory(category));

            for (const item of items) {
              this.createItemImage(itemsPanel, item);
            }
          }

          createItemImage(parent: Panel, item: string) {
            const itemId = elementId(ITEM_ID_PREFIX, item);
            const panel = createItemImage(parent, itemId, item);

            panel.AddClass(ITEM_CLASS);
            panel.SetPanelEvent("onactivate", () => this.onImageActivate(panel));

            (this.itemPanels[item] || (this.itemPanels[item] = [])).push(panel);
          }

          Search() {
            this.debug("Search()", this.elements.search.text.toString());
            this.search(this.elements.search.text);
          }
        }

        export const component = new ItemPicker();
      }
    }
  }
}
