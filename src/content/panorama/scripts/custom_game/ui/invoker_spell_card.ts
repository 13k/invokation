// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace invk {
  export namespace Components {
    export namespace UI {
      export namespace InvokerSpellCard {
        export interface Elements extends Component.Elements {
          rows: Panel;
        }

        export type Inputs = never;

        export interface Outputs extends Component.Outputs {
          OnSelect: {
            ability: string;
          };
        }

        export type Params = never;

        const {
          L10n,
          Panorama: { createPanelSnippet },
          Dota2: {
            Invoker: { Ability },
          },
        } = GameUI.CustomUIConfig().invk;

        enum Snippet {
          Ability = "ability",
        }

        enum PanelID {
          AbilityButton = "button",
          AbilityIcon = "icon",
        }

        enum CssClass {
          Row = "row",
          Column = "column",
          Quas = "quas",
          Wex = "wex",
          Exort = "exort",
          QWE = "qwe",
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
          [undefined, { color: CssClass.QWE, abilities: [Ability.DeafeningBlast] }, undefined],
        ];

        export class InvokerSpellCard extends Component.Component<
          Elements,
          Inputs,
          Outputs,
          Params
        > {
          constructor() {
            super({
              elements: {
                rows: "rows",
              },
            });

            this.render();
            this.debug("init");
          }

          render() {
            for (let i = 0; i < GRID.length; i++) {
              const row = GRID[i];

              if (!row) throw "unreachable";

              const rowID = `row${i}`;
              const rowPanel = $.CreatePanel("Panel", this.elements.rows, rowID);

              rowPanel.AddClass(CssClass.Row);

              for (let j = 0; j < row.length; j++) {
                const col = row[j];

                if (!col) continue;

                const colID = `row${i}-col${j}`;
                const colPanel = $.CreatePanel("Panel", rowPanel, colID);

                colPanel.AddClass(CssClass.Column);

                if (!col.abilities) continue;

                for (let k = 0; k < col.abilities.length; k++) {
                  const ability = col.abilities[k];

                  if (!ability) throw "unreachable";

                  this.createAbilityPanel(colPanel, col, ability);
                }
              }
            }
          }

          createAbilityPanel(parent: Panel, col: Column, ability: string) {
            const loc = L10n.abilityTooltip(ability);
            const panel = createPanelSnippet(parent, ability, Snippet.Ability);

            if (col.color) {
              panel.AddClass(col.color);
            }

            panel.SetDialogVariable("ability_name", loc);

            const button = panel.FindChild(PanelID.AbilityButton);

            if (!button) {
              throw new Error(`Could not find Button for ability ${ability}`);
            }

            button.SetPanelEvent("onactivate", () => {
              this.runOutput("OnSelect", { ability });
            });

            const iconPanel = panel.FindChildTraverse(PanelID.AbilityIcon);

            if (!iconPanel) {
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
