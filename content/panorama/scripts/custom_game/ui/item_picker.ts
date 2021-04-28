import { transform } from "lodash";
import { Component } from "../lib/component";
import { COMPONENTS } from "../lib/const/component";
import { CustomEvent, ItemPickerQueryResponseEvent } from "../lib/const/events";
import { InvokationShopItems, InvokationTableKey, Table } from "../lib/const/net_table";
import { CustomEvents } from "../lib/custom_events";
import { ShopCategories, ShopCategory, ShopGroup, SHOP_CATEGORIES } from "../lib/dota";
import { localizeShopCategory, localizeShopGroup } from "../lib/l10n";
import { fromSequence } from "../lib/lua";
import { NetTable } from "../lib/net_table";
import { PanelEvent } from "../lib/panel_events";
import {
  Action,
  DisableAction,
  EnableAction,
  NoopAction,
  ParallelSequence,
  RemoveClassAction,
  SerialSequence,
} from "../lib/sequence";

export type Inputs = never;

export interface Outputs {
  [OUTPUTS.ON_SELECT]: { item: string };
}

interface Elements {
  search: TextEntry;
  groups: Panel;
}

const { outputs: OUTPUTS } = COMPONENTS.UI_ITEM_PICKER;

const DYN_ELEMS = {
  GROUP: {
    snippet: "group",
    idPrefix: "group",
    dialogVarName: "group_name",
    categoryListID: "categories",
  },
  CATEGORY: {
    snippet: "category",
    idPrefix: "category",
    dialogVarName: "category_name",
    itemListID: "items",
  },
  ITEM: {
    idPrefix: "item",
    cssClass: "item",
    highlightClass: "highlighted",
  },
};

const elemID = (prefix: string, name: string) => `${prefix}-${name}`;

export class UIItemPicker extends Component {
  #elements: Elements;
  #table: NetTable<Table.Invokation>;
  #shopItems?: InvokationShopItems;
  #groupPanels: Record<string, Panel> = {};
  #categoryPanels: Record<string, Panel> = {};
  #itemPanels: Record<string, ItemImage[]> = {};

  constructor() {
    super();

    this.#elements = this.findAll<Elements>({
      search: "search-text-entry",
      groups: "groups",
    });

    this.#table = new NetTable(Table.Invokation);

    this.registerOutputs(Object.values(OUTPUTS));
    this.onCustomEvent(CustomEvent.ITEM_PICKER_QUERY_RESPONSE, this.onQueryResponse);

    this.loadItems();
    this.render();
    this.debug("init");
  }

  // ----- Event handlers -----

  onImageActivate(event: PanelEvent<ItemImage>): void {
    this.debug("onImageActivate()", { event });
    this.select(event.panel);
  }

  onQueryResponse(payload: NetworkedData<ItemPickerQueryResponseEvent>): void {
    this.debug("onQueryResponse()", payload);

    const items = fromSequence(payload.items);

    this.highlight(items);
  }

  // ----- Helpers -----

  loadItems(): void {
    const shopData = this.#table.get(InvokationTableKey.ShopItems);

    this.#shopItems = transform<NetworkedData<InvokationShopItems>, InvokationShopItems>(
      shopData,
      (shop, itemsSeq, category) => {
        shop[category] = fromSequence(itemsSeq);
      },
      {} as InvokationShopItems
    );
  }

  addItemPanel(panel: ItemImage): void {
    const { itemname } = panel;

    this.#itemPanels[itemname] ||= [];
    this.#itemPanels[itemname].push(panel);
  }

  createGroup(parent: Panel, group: ShopGroup): void {
    const { idPrefix, snippet, dialogVarName } = DYN_ELEMS.GROUP;

    const id = elemID(idPrefix, group);
    const panel = this.createSnippet(parent, id, snippet, {
      dialogVars: {
        [dialogVarName]: localizeShopGroup(group),
      },
    });

    this.#groupPanels[group] = panel;
  }

  createCategory(parent: Panel, category: ShopCategory): void {
    const { idPrefix, snippet, dialogVarName } = DYN_ELEMS.CATEGORY;
    const id = elemID(idPrefix, category);
    const panel = this.createSnippet(parent, id, snippet, {
      dialogVars: {
        [dialogVarName]: localizeShopCategory(category),
      },
    });

    this.#categoryPanels[category] = panel;
  }

  createItem(parent: Panel, itemName: string): void {
    const { idPrefix, cssClass } = DYN_ELEMS.ITEM;
    const id = elemID(idPrefix, itemName);
    const panel = this.createItemImage(parent, id, itemName, {
      classes: [cssClass],
      events: {
        onactivate: this.onImageActivate.bind(this),
      },
    });

    this.addItemPanel(panel);
  }

  // ----- Actions -----

  createGroupAction(parent: Panel, group: ShopGroup, categories: ShopCategory[]): Action {
    const actions = categories.map((category) => this.createCategoryAction(group, category));

    return new SerialSequence()
      .RunFunction(() => {
        this.createGroup(parent, group);
      })
      .Action(...actions);
  }

  createCategoryAction(group: ShopGroup, category: ShopCategory): Action {
    if (this.#shopItems == null) {
      throw Error(`UIItemPicker.createCategoryAction called without loaded shop items`);
    }

    const { categoryListID } = DYN_ELEMS.GROUP;
    const items = this.#shopItems[category];
    const createItemActions = items.map((item) => this.createItemAction(category, item));

    return new SerialSequence()
      .RunFunction(() => {
        const groupPanel = this.#groupPanels[group];
        const categoriesPanel = groupPanel.FindChild(categoryListID);

        if (categoriesPanel == null) {
          throw Error(`Unable to find categories panel ${categoryListID} for group ${group}`);
        }

        this.createCategory(categoriesPanel, category);
      })
      .Action(...createItemActions);
  }

  createItemAction(category: ShopCategory, itemName: string): Action {
    const { itemListID } = DYN_ELEMS.CATEGORY;

    return new SerialSequence().RunFunction(() => {
      const categoryPanel = this.#categoryPanels[category];
      const itemsPanel = categoryPanel.FindChild(itemListID);

      if (itemsPanel == null) {
        throw Error(`Unable to find items panel ${itemListID} for category ${category}`);
      }

      this.createItem(itemsPanel, itemName);
    });
  }

  disableItemsAction(): Action {
    const actions = Object.keys(this.#itemPanels).map((itemName) =>
      this.disableItemAction(itemName)
    );

    return new ParallelSequence().Action(...actions);
  }

  disableItemAction(itemName: string): Action {
    const panels = this.#itemPanels[itemName];

    if (!panels) {
      this.warn("Could not find panel for item", itemName);
      return new NoopAction();
    }

    const actions = panels.map((panel) => new DisableAction(panel));

    return new ParallelSequence().Action(...actions);
  }

  enableItemsAction(items: string[]): Action {
    const actions = items.map((item) => this.enableItemAction(item));

    return new ParallelSequence().Action(...actions);
  }

  enableItemAction(itemName: string): Action {
    const panels = this.#itemPanels[itemName];

    if (!panels) {
      this.warn("Could not find panel for item", itemName);
      return new NoopAction();
    }

    const actions = panels.map((panel) => new EnableAction(panel));

    return new ParallelSequence().Action(...actions);
  }

  highlightImagePanelAction(imagePanel: ItemImage): Action {
    const { highlightClass } = DYN_ELEMS.ITEM;
    const highlighted = this.#elements.groups.FindChildrenWithClassTraverse(highlightClass);
    const actions = highlighted.map((panel) => new RemoveClassAction(panel, highlightClass));

    return new ParallelSequence().Action(...actions).AddClass(imagePanel, highlightClass);
  }

  // ----- Action runners -----

  highlight(items: string[]): void {
    const seq = new SerialSequence()
      .Action(this.disableItemsAction())
      .Action(this.enableItemsAction(items));

    this.debugFn(() => ["highlight()", { actions: seq.length }]);

    seq.run();
  }

  select(panel: ItemImage): void {
    const seq = new SerialSequence();

    // seq.Action(this.highlightImagePanelAction(panel));

    seq.RunFunction(() => {
      this.output(OUTPUTS.ON_SELECT, { item: panel.itemname });
    });

    this.debugFn(() => ["select()", { item: panel.itemname, actions: seq.length }]);

    seq.run();
  }

  search(query: string): void {
    const seq = new SerialSequence();

    if (query) {
      seq.RunFunction(() => {
        CustomEvents.sendServer(CustomEvent.ITEM_PICKER_QUERY, { query });
      });
    } else {
      seq.Action(this.enableItemsAction(Object.keys(this.#itemPanels)));
    }

    this.debugFn(() => ["search()", { query, actions: seq.length }]);

    seq.run();
  }

  render(): void {
    const actions = transform<ShopCategories, Action[]>(
      SHOP_CATEGORIES,
      (actions, categories, group) => {
        actions.push(this.createGroupAction(this.#elements.groups, group, categories));
      },
      []
    );

    const seq = new SerialSequence().Focus(this.#elements.search).Action(...actions);

    this.debugFn(() => ["render()", { actions: seq.length }]);

    seq.run();
  }

  // ----- UI methods -----

  Search(): void {
    this.debug("Search()", { text: this.#elements.search.text });
    this.search(this.#elements.search.text);
  }
}

//   context.component = new ItemPicker();
// })(GameUI.CustomUIConfig(), this);
