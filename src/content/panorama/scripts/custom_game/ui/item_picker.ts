// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace invk {
  export namespace Components {
    export namespace UI {
      export namespace ItemPicker {
        export interface Elements extends Component.Elements {
          table: Panel;
          search: LabelPanel;
        }

        export type Inputs = never;

        export interface Outputs extends Component.Outputs {
          OnSelect: {
            item: string;
          };
        }

        export type Params = never;

        const {
          CustomEvents: { Name: CustomEventName },
          Sequence: { Sequence, ParallelSequence },
          Vendor: { lodash: _ },
        } = GameUI.CustomUIConfig().invk;

        enum PanelID {
          SectionList = "ShopItemSectionItemList",
        }

        enum CssClass {
          Section = "ShopItemSection",
          TableEnableHighlight = "HighlightItemsMatchingName",
          ItemHighlight = "Highlighted",
        }

        interface ShopItemPanel {
          panel: Panel;
          itemImage: ItemImage;
          itemName: string;
        }

        type ShopItemPanels = Record<string, ShopItemPanel>;

        export class ItemPicker extends Component.Component<Elements, Inputs, Outputs, Params> {
          shopItems: ShopItemPanels;

          constructor() {
            super({
              elements: {
                table: "GameItemTable",
                search: "UIItemPickerSearchTextEntry",
              },
              customEvents: {
                ITEM_PICKER_QUERY_RESPONSE: (payload) => this.onQueryResponse(payload),
              },
              panelEvents: {
                search: {
                  oncancel: () => this.clear(),
                  oninputsubmit: () => this.search(),
                },
              },
            });

            this.shopItems = this.findShopItemPanels();

            this.bindEvents();
            this.elements.search.SetFocus();
            this.debug("init");
          }

          get query() {
            return this.elements.search.text.toString();
          }

          set query(value: string) {
            this.elements.search.text = value;
          }

          findShopItemPanels() {
            const panels: Panel[] = [];

            for (const section of this.elements.table.FindChildrenWithClassTraverse(
              CssClass.Section,
            )) {
              const list = section.FindChildTraverse(PanelID.SectionList);

              if (!list) {
                continue;
              }

              panels.push(...list.Children());
            }

            return _.transform(
              panels,
              (result, panel) => {
                const imagePanel = panel.FindChild("ItemImage");

                if (!imagePanel) {
                  throw new Error(`Could not find item image for shop item`);
                }

                const itemImage = imagePanel as ItemImage;
                const itemName = itemImage.itemname;

                result[itemImage.itemname] = {
                  panel,
                  itemImage,
                  itemName,
                };
              },
              {} as ShopItemPanels,
            );
          }

          bindEvents() {
            for (const shopItem of Object.values(this.shopItems)) {
              shopItem.panel.SetPanelEvent("onactivate", () => {
                this.select(shopItem.itemName);
              });
            }
          }

          select(item: string) {
            this.runOutput("OnSelect", { item });
          }

          search() {
            if (_.isEmpty(this.query)) {
              return this.clear();
            }

            this.sendServer(CustomEventName.ITEM_PICKER_QUERY, { query: this.query });
          }

          clear() {
            this.query = "";

            new ParallelSequence()
              .RemoveClass(this.elements.table, CssClass.TableEnableHighlight)
              .Action(this.clearItemsAction())
              .Run();
          }

          onQueryResponse(payload: CustomEvents.ItemPickerQueryResponse) {
            const itemNames = Object.keys(payload.items);

            this.debug("onQueryResponse()", itemNames);

            const shopItems = itemNames.map((itemName) => {
              const shopItem = this.shopItems[itemName];

              if (!shopItem) {
                this.warn(`Could not find shop item panel for item ${itemName}`);
              }

              return shopItem;
            });

            this.highlight(_.compact(shopItems));
          }

          highlight(shopItems: ShopItemPanel[]) {
            const seq = new Sequence()
              .AddClass(this.elements.table, CssClass.TableEnableHighlight)
              .Action(this.clearItemsAction())
              .Action(this.highlightItemsAction(shopItems));

            this.debugFn(() => ["highlight()", { actions: seq.size() }]);

            return seq.Run();
          }

          setItemAction(shopItem: ShopItemPanel, enable: boolean) {
            const seq = new ParallelSequence();

            if (enable) {
              seq.AddClass(shopItem.panel, CssClass.ItemHighlight);
            } else {
              seq.RemoveClass(shopItem.panel, CssClass.ItemHighlight);
            }

            return seq;
          }

          setItemsAction(shopItems: ShopItemPanel[], enable: boolean) {
            const actions = shopItems.map((shopItem) => this.setItemAction(shopItem, enable));

            return new ParallelSequence().Action(...actions);
          }

          clearItemsAction() {
            return this.setItemsAction(Object.values(this.shopItems), false);
          }

          highlightItemsAction(shopItems: ShopItemPanel[]) {
            return this.setItemsAction(shopItems, true);
          }
        }

        export const component = new ItemPicker();
      }
    }
  }
}
