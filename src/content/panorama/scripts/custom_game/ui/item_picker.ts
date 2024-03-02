// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace invk {
  export namespace components {
    export namespace ui {
      export namespace item_picker {
        const {
          custom_events: { CustomGameEvent },
          sequence: { Sequence, ParallelSequence },
        } = GameUI.CustomUIConfig().invk;

        import Component = invk.component.Component;

        export interface Elements extends component.Elements {
          table: Panel;
          search: LabelPanel;
        }

        export interface Outputs extends component.Outputs {
          OnSelect: {
            item: string;
          };
        }

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

        type ShopItemPanels = Map<string, ShopItemPanel>;

        export class ItemPicker extends Component<Elements, never, Outputs> {
          shopItems: ShopItemPanels;

          constructor() {
            super({
              elements: {
                table: "GameItemTable",
                search: "UIItemPickerSearchTextEntry",
              },
              customEvents: {
                [CustomGameEvent.ITEM_PICKER_QUERY_RESPONSE]: (payload) =>
                  this.onQueryResponse(payload),
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

          // ----- Event handlers -----

          onQueryResponse(payload: NetworkedData<custom_events.ItemPickerQueryResponse>) {
            const itemNames = Object.keys(payload.items);

            this.debug("onQueryResponse()", itemNames);

            const shopItems = itemNames.map((itemName) => {
              const shopItem = this.shopItems.get(itemName);

              if (shopItem == null) {
                throw new Error(`Could not find shop item panel for item ${itemName}`);
              }

              return shopItem;
            });

            this.highlight(shopItems);
          }

          // ----- Helpers -----

          get query(): string {
            return this.elements.search.text ?? "";
          }

          set query(value: string) {
            this.elements.search.text = value;
          }

          findShopItemPanels(): ShopItemPanels {
            const panels: Panel[] = [];
            const sections = this.elements.table.FindChildrenWithClassTraverse(CssClass.Section);

            for (const section of sections) {
              const list = section.FindChildTraverse(PanelID.SectionList);

              if (list == null) continue;

              panels.push(...list.Children());
            }

            return panels.reduce((result, panel) => {
              const imagePanel = panel.FindChild("ItemImage");

              if (imagePanel == null) {
                throw new Error("Could not find item image for shop item");
              }

              const itemImage = imagePanel as ItemImage;
              const itemName = itemImage.itemname;

              result.set(itemImage.itemname, {
                panel,
                itemImage,
                itemName,
              });

              return result;
            }, new Map() as ShopItemPanels);
          }

          bindEvents() {
            for (const shopItem of this.shopItems.values()) {
              shopItem.panel.SetPanelEvent("onactivate", () => {
                this.select(shopItem.itemName);
              });
            }
          }

          // ----- Actions -----

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
            return this.setItemsAction([...this.shopItems.values()], false);
          }

          highlightItemsAction(shopItems: ShopItemPanel[]) {
            return this.setItemsAction(shopItems, true);
          }

          // ----- Action runners -----

          select(item: string) {
            this.output("OnSelect", { item });
          }

          search() {
            if (this.query.length === 0) {
              return this.clear();
            }

            this.sendServer(CustomGameEvent.ITEM_PICKER_QUERY, { query: this.query });
          }

          clear() {
            this.query = "";

            new ParallelSequence()
              .RemoveClass(this.elements.table, CssClass.TableEnableHighlight)
              .Action(this.clearItemsAction())
              .Run();
          }

          highlight(shopItems: ShopItemPanel[]) {
            const seq = new Sequence()
              .AddClass(this.elements.table, CssClass.TableEnableHighlight)
              .Action(this.clearItemsAction())
              .Action(this.highlightItemsAction(shopItems));

            this.debugFn(() => ["highlight()", { actions: seq.size() }]);

            return seq.Run();
          }
        }

        export const component = new ItemPicker();
      }
    }
  }
}
