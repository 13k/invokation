<layout lang="xml">
<root>
  <scripts>
    <include src="file://{resources}/components/ui/item_picker.js" />
  </scripts>

  <styles>
    <include src="s2r://panorama/styles/dotastyles.css" />

    <include src="file://{resources}/components/ui/item_picker.css" />
  </styles>

  <snippets>
    <snippet name="group">
      <Panel class="group">
        <Label class="group-name" text="{s:group_name}" />
        <Panel id="categories" class="group-categories" />
      </Panel>
    </snippet>

    <snippet name="category">
      <Panel class="category">
        <Label class="category-name" text="{s:category_name}" />
        <Panel id="items" class="category-items" />
      </Panel>
    </snippet>
  </snippets>

  <Panel class="root">
    <Panel class="header">
      <Label class="choice-label" text="#invokation_item_picker_choose" />
      <Panel class="FillWidth" />
      <Panel id="search" class="search-box">
        <TextEntry id="search-text-entry" class="search-text-entry" placeholder="#DOTA_Shop_Search_Field_Default" oninputsubmit="component.Search()" />
        <Button class="search-button" />
      </Panel>
    </Panel>

    <Panel id="groups" />
  </Panel>
</root>
</layout>

<script lang="ts">
import { transform } from "lodash";

import { Component } from "../../scripts/lib/component";
import { COMPONENTS } from "../../scripts/lib/const/component";
import { CustomEvent, ItemPickerQueryResponseEvent } from "../../scripts/lib/const/events";
import { InvokationShopItems, InvokationTableKey, Table } from "../../scripts/lib/const/net_table";
import { CustomEvents } from "../../scripts/lib/custom_events";
import { SHOP_CATEGORIES, ShopCategories, ShopCategory, ShopGroup } from "../../scripts/lib/dota";
import { localizeShopCategory, localizeShopGroup } from "../../scripts/lib/l10n";
import { fromSequence } from "../../scripts/lib/lua";
import { NetTable } from "../../scripts/lib/net_table";
import { PanelEvent } from "../../scripts/lib/panel_events";
import {
  Action,
  DisableAction,
  EnableAction,
  NoopAction,
  ParallelSequence,
  RemoveClassAction,
  SerialSequence,
} from "../../scripts/lib/sequence";

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

export default class UIItemPicker extends Component {
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

global.component = new UIItemPicker();
</script>

<style lang="scss">
@use "../../styles/variables";

$item-width: 50px;
$item-h-margin: 6px;
// $category-width: 232px;
$category-width: 4 * ($item-width + $item-h-margin + 2);
$category-h-margin: 8px;
// $group-width: 500px;
$group-width: 2 * ($category-width + $category-h-margin) + 20;
$group-h-margin: 8px;
$groups-padding-right: 8px;
$groups-padding-left: 8px;
$groups-padding: 16px $groups-padding-right 0 $groups-padding-left;
// $total-width: 1032px;
$total-width: 2 * ($group-width + $group-h-margin) + $groups-padding-right + $groups-padding-left;
$total-height: 760px;

.root {
  flow-children: down;
  width: $total-width;
  height: $total-height;
}

.header {
  flow-children: right;
  width: 100%;
  padding: 16px 16px 12px;
}

.choice-label {
  color: #bfd2ee;
  font-size: 22px;
  letter-spacing: 2px;
  text-align: left;
  text-transform: uppercase;
  text-overflow: shrink;
  vertical-align: center;
}

.search-box {
  flow-children: right;
  width: 300px;
  background-color: #000;

  .search-text-entry {
    width: fill-parent-flow(1);
    background-color: none;
    border: 0;

    #PlaceholderText {
      margin-top: 2px;
      color: #8a8a8a;
    }
  }

  .search-button {
    width: 27px;
    height: 27px;
    margin: 0 8px;
    vertical-align: center;
    wash-color: #4f4f4f;
    background-image: variables.$control_icon_search;
    background-repeat: no-repeat;
    background-size: contain;
    transition-duration: 0.1s;
    transition-property: wash-color;

    &:hover {
      wash-color: #ccc;
    }

    &:active {
      wash-color: #fff;
    }
  }
}

#groups {
  width: 100%;
  height: fill-parent-flow(1);
  padding: $groups-padding;
  overflow: squish scroll;
  flow-children: right;
}

.group-name {
  width: 100%;
  padding-bottom: 8px;
  text-align: center;
  border-bottom: 1px solid #444;
}

.group-name,
.category-name {
  margin-bottom: 8px;
  color: #fff;
  font-weight: bold;
  font-size: 14px;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.group {
  flow-children: down;
  width: $group-width;
  margin-left: $group-h-margin;
}

.group-categories {
  flow-children: right-wrap;
  width: 100%;
  margin-top: 16px;
  horizontal-align: center;
}

.category {
  flow-children: down;
  width: $category-width;
  margin-bottom: 8px;
  margin-left: $category-h-margin;
}

.category-items {
  flow-children: right-wrap;
  width: 100%;

  .item {
    width: $item-width;
    height: width-percentage(72.7%);
    margin-right: $item-h-margin;
    margin-bottom: 6px;
    border: 2px solid #6ad4;

    &:disabled {
      opacity: 0.2;
      saturation: 0;
    }

    &:enabled:hover {
      brightness: 2;
      contrast: 0.95;
      saturation: 1;
    }

    &.highlighted {
      border: 2px solid #0ff;
    }
  }
}
</style>
