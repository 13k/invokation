// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace invk {
  export namespace components {
    export namespace ui {
      export namespace invoker_spell_card {
        const {
          l10n,
          panorama: { createPanelSnippet },
          dota2: {
            invoker: { Ability },
          },
        } = GameUI.CustomUIConfig().invk;

        import Component = invk.component.Component;

        export interface Elements extends component.Elements {
          rows: Panel;
        }

        export interface Outputs extends component.Outputs {
          OnSelect: {
            ability: string;
          };
        }

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
          abilities: dota2.invoker.Ability[];
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

          render() {
            for (let i = 0; i < GRID.length; i++) {
              const row = GRID[i];

              if (row == null) throw "unreachable";

              const rowID = `row${i}`;
              const rowPanel = $.CreatePanel("Panel", this.elements.rows, rowID);

              rowPanel.AddClass(CssClass.Row);

              for (let j = 0; j < row.length; j++) {
                const col = row[j];

                if (col == null) continue;

                const colID = `row${i}-col${j}`;
                const colPanel = $.CreatePanel("Panel", rowPanel, colID);

                colPanel.AddClass(CssClass.Column);

                if (col.abilities == null) continue;

                for (let k = 0; k < col.abilities.length; k++) {
                  const ability = col.abilities[k];

                  if (ability == null) throw "unreachable";

                  this.createAbilityPanel(colPanel, col, ability);
                }
              }
            }
          }

          createAbilityPanel(parent: Panel, col: Column, ability: string) {
            const loc = l10n.abilityTooltip(ability);
            const panel = createPanelSnippet(parent, ability, Snippet.Ability);

            if (col.color) {
              panel.AddClass(col.color);
            }

            panel.SetDialogVariable("ability_name", loc);

            const button = panel.FindChild(PanelID.AbilityButton);

            if (button == null) {
              throw new Error(`Could not find Button for ability ${ability}`);
            }

            button.SetPanelEvent("onactivate", () => {
              this.output("OnSelect", { ability });
            });

            const iconPanel = panel.FindChildTraverse(PanelID.AbilityIcon);

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
