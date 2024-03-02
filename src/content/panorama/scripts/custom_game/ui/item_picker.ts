namespace invk {
  export namespace Components {
    export namespace Ui {
      export namespace ItemPicker {
        const {
          CustomEvents: { CustomGameEvent },
          Sequence: { AddClassAction, ParallelSequence, RemoveClassAction, Sequence },
        } = GameUI.CustomUIConfig().invk;

        import Action = invk.Sequence.Action;
        import Component = invk.Component.Component;

        export interface Elements extends Component.Elements {
          table: Panel;
          search: LabelPanel;
        }

        export interface Outputs extends Component.Outputs {
          onSelect: {
            item: string;
          };
        }

        enum PanelId {
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
                [CustomGameEvent.ItemPickerQueryResponse]: (payload) =>
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

          onQueryResponse(payload: NetworkedData<CustomEvents.ItemPickerQueryResponse>): void {
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

          onSelect(item: string): void {
            this.outputs({ onSelect: { item } });
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
              const list = section.FindChildTraverse(PanelId.SectionList);

              if (list == null) {
                continue;
              }

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

          bindEvents(): void {
            for (const shopItem of this.shopItems.values()) {
              shopItem.panel.SetPanelEvent("onactivate", () => this.onSelect(shopItem.itemName));
            }
          }

          // ----- Actions -----

          setItemAction(shopItem: ShopItemPanel, enable: boolean): Action {
            if (enable) {
              return new AddClassAction(shopItem.panel, CssClass.ItemHighlight);
            }

            return new RemoveClassAction(shopItem.panel, CssClass.ItemHighlight);
          }

          setItemsAction(shopItems: ShopItemPanel[], enable: boolean): Action {
            return shopItems.reduce(
              (seq, shopItem) => seq.add(this.setItemAction(shopItem, enable)),
              new ParallelSequence(),
            );
          }

          clearItemsAction(): Action {
            return this.setItemsAction([...this.shopItems.values()], false);
          }

          highlightItemsAction(shopItems: ShopItemPanel[]): Action {
            return this.setItemsAction(shopItems, true);
          }

          // ----- Action runners -----

          search(): void {
            if (this.query.length === 0) {
              this.clear();
              return;
            }

            this.sendServer(CustomGameEvent.ItemPickerQueryRequest, { query: this.query });
          }

          clear(): void {
            this.query = "";

            new ParallelSequence()
              .removeClass(this.elements.table, CssClass.TableEnableHighlight)
              .add(this.clearItemsAction())
              .run();
          }

          highlight(shopItems: ShopItemPanel[]): void {
            const seq = new Sequence()
              .addClass(this.elements.table, CssClass.TableEnableHighlight)
              .add(this.clearItemsAction())
              .add(this.highlightItemsAction(shopItems));

            this.debugFn(() => ["highlight()", { actions: seq.deepSize() }]);

            seq.run();
          }
        }

        export const component = new ItemPicker();
      }
    }
  }
}
