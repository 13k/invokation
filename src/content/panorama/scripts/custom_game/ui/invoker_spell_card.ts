namespace invk {
  export namespace Components {
    export namespace Ui {
      export namespace InvokerSpellCard {
        const {
          L10n,
          Panorama: { createPanelSnippet },
          Dota2: {
            Invoker: { Ability },
          },
        } = GameUI.CustomUIConfig().invk;

        import Component = invk.Component.Component;

        export interface Elements extends Component.Elements {
          rows: Panel;
        }

        export interface Outputs extends Component.Outputs {
          onSelect: {
            ability: string;
          };
        }

        enum Snippet {
          Ability = "ability",
        }

        enum PanelId {
          AbilityButton = "button",
          AbilityIcon = "icon",
        }

        enum CssClass {
          Row = "row",
          Column = "column",
          Quas = "quas",
          Wex = "wex",
          Exort = "exort",
          Qwe = "qwe",
        }

        type Row = Array<Column | undefined>;

        interface Column {
          color: CssClass;
          abilities: Dota2.Invoker.Ability[];
        }

        const GRID: Row[] = [
          [
            {
              color: CssClass.Quas,
              abilities: [Ability.ColdSnap, Ability.GhostWalk, Ability.IceWall],
            },
            {
              color: CssClass.Wex,
              abilities: [Ability.Emp, Ability.Tornado, Ability.Alacrity],
            },
            {
              color: CssClass.Exort,
              abilities: [Ability.SunStrike, Ability.ForgeSpirit, Ability.ChaosMeteor],
            },
          ],
          [undefined, { color: CssClass.Qwe, abilities: [Ability.DeafeningBlast] }, undefined],
        ];

        export class InvokerSpellCard extends Component<Elements, never, Outputs> {
          constructor() {
            super({
              elements: {
                rows: "rows",
              },
            });

            this.render();
            this.debug("init");
          }

          render(): void {
            for (let i = 0; i < GRID.length; i++) {
              const row = GRID[i];

              if (row == null) {
                throw "unreachable";
              }

              const rowId = `row${i}`;
              const rowPanel = $.CreatePanel("Panel", this.elements.rows, rowId);

              rowPanel.AddClass(CssClass.Row);

              for (let j = 0; j < row.length; j++) {
                const col = row[j];

                if (col == null) {
                  continue;
                }

                const colId = `row${i}-col${j}`;
                const colPanel = $.CreatePanel("Panel", rowPanel, colId);

                colPanel.AddClass(CssClass.Column);

                for (const ability of col.abilities) {
                  this.createAbilityPanel(colPanel, col, ability);
                }
              }
            }
          }

          createAbilityPanel(parent: Panel, col: Column, ability: string): Panel {
            const loc = L10n.abilityTooltip(ability);
            const panel = createPanelSnippet(parent, ability, Snippet.Ability);

            if (col.color) {
              panel.AddClass(col.color);
            }

            panel.SetDialogVariable("ability_name", loc);

            const button = panel.FindChild(PanelId.AbilityButton);

            if (button == null) {
              throw new Error(`Could not find Button for ability ${ability}`);
            }

            button.SetPanelEvent("onactivate", () => this.outputs({ onSelect: { ability } }));

            const iconPanel = panel.FindChildTraverse(PanelId.AbilityIcon);

            if (iconPanel == null) {
              throw new Error(`Could not find AbilityImage panel for ability ${ability}`);
            }

            (iconPanel as AbilityImage).abilityname = ability;

            return panel;
          }
        }

        export const component = new InvokerSpellCard();
      }
    }
  }
}
