// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace invk {
  export namespace components {
    export namespace tooltips {
      export namespace stat_branch {
        const {
          l10n,
          dota2: { Talents, TalentLevel, TalentSide },
          panorama: { createPanelSnippet },
          sequence: { Sequence, ParallelSequence },
          singleton: { HERO_DATA },
        } = GameUI.CustomUIConfig().invk;

        import Ability = invk.dota2.invoker.Ability;
        import Component = invk.component.Component;
        import HeroData = invk.net_table.invokation.HeroData;
        import ParamType = invk.component.ParamType;
        import TalentMap = invk.dota2.TalentMap;
        import TalentSelection = invk.dota2.TalentSelection;

        export interface Elements extends component.Elements {
          container: Panel;
        }

        export interface Params extends component.Params {
          heroID: HeroID;
          selected: TalentSelection;
        }

        const LEVELS = [TalentLevel.Tier4, TalentLevel.Tier3, TalentLevel.Tier2, TalentLevel.Tier1];
        const SIDES = [TalentSide.Right, TalentSide.Left];

        const BRANCH_ROW_SNIPPET = "TooltipStatBranchRow";
        const BRANCH_ROW_ID_PREFIX = "TooltipStatBranchRow";
        const BRANCH_ROW_VAR_LEVEL = "level";

        const CLASSES = {
          BRANCH_ROW_CHOICE_LABEL: "StatBonusLabel",
          BRANCH_ROW_SIDES: {
            [TalentSide.Right]: "BranchRight",
            [TalentSide.Left]: "BranchLeft",
          },
          BRANCH_SELECTED: {
            [TalentSide.Right]: "BranchRightSelected",
            [TalentSide.Left]: "BranchLeftSelected",
          },
        };

        const branchRowId = (level: dota2.TalentLevel) => `${BRANCH_ROW_ID_PREFIX}${level}`;

        export class TooltipStatBranch extends Component<Elements, never, never, Params> {
          selected: dota2.Talents | undefined;
          talents: TalentMap<Ability> | undefined;
          heroData: HeroData | undefined;
          rows: Map<dota2.TalentLevel, Panel> = new Map();

          constructor() {
            super({
              elements: {
                container: "TooltipStatBranchContainer",
              },
              params: {
                heroID: { type: ParamType.UInt32, default: 0 },
                selected: { type: ParamType.UInt32, default: 0 },
              },
            });

            HERO_DATA.onChange(this.onHeroDataChange.bind(this));

            this.debug("init");
          }

          // ----- Event handlers -----

          override onLoad(): void {
            this.selected = new Talents(this.params.selected);

            this.debug("onLoad()", { selected: this.selected.value });
            this.render();
          }

          onHeroDataChange(data: net_table.invokation.HeroData) {
            this.heroData = data;

            if (this.heroData == null) return;

            this.talents = this.heroData.TALENT_ABILITIES.reduce(
              (abilities, ability, i) => {
                const level = Talents.indexToLevel(i);
                const side = Talents.indexToSide(i);
                let sides = abilities.get(level);

                if (sides == null) {
                  sides = new Map();
                  abilities.set(level, sides);
                }

                sides.set(side, ability);

                return abilities;
              },
              new Map() as TalentMap<Ability>,
            );

            this.debug("onHeroDataChange()");
            this.render();
          }

          // ----- Helpers -----

          resetRows() {
            this.rows = new Map();
          }

          localizeBranch(panel: Panel, level: dota2.TalentLevel, side: dota2.TalentSide) {
            this.debug("localizeBranch()", { level, side });

            if (this.talents == null) return;

            const ability = this.talents.get(level)?.get(side);

            if (ability == null) {
              this.error(`Could not find ability for talent [${level}, ${side}]`);
              return;
            }

            this.debug("localizeBranch()", { ability });

            const branchClass = CLASSES.BRANCH_ROW_SIDES[side];

            this.debug("localizeBranch() : FindChildrenWithClassTraverse [panel]", { branchClass });

            const branchPanel = panel.FindChildrenWithClassTraverse(branchClass)[0];

            if (branchPanel == null) {
              this.error(
                `Could not find branch panel with class ${branchClass} for talent [${level}, ${side}]`,
              );

              return;
            }

            this.debug("localizeBranch()", { branchPanel });

            const branchLabelClass = CLASSES.BRANCH_ROW_CHOICE_LABEL;

            this.debug("localizeBranch() : FindChildrenWithClassTraverse [label]", {
              branchLabelClass,
            });

            const branchLabel = branchPanel.FindChildrenWithClassTraverse(
              branchLabelClass,
            )[0] as LabelPanel;

            if (branchLabel == null) {
              this.error(
                `Could not find branch label with class ${branchLabelClass} for talent [${level}, ${side}]`,
              );

              return;
            }

            this.debug("localizeBranch()", { branchLabel });

            this.debug("localizeBranch() : L10n.LocalizeAbilityTooltip()", {
              ability: ability,
              branchLabel: branchLabel.id,
            });

            const labelText = l10n.abilityTooltip(ability, branchLabel);

            this.debug("localizeBranch() : set branchLabel.text", { labelText });

            branchLabel.text = labelText;

            this.debug("localizeBranch() ---");
          }

          createBranchRowPanel(level: dota2.TalentLevel) {
            this.debug("createBranchRowPanel()", { level: level });

            const id = branchRowId(level);

            this.debug("createBranchRowPanel() : CreatePanelWithLayoutSnippet()", {
              id: id,
              snippet: BRANCH_ROW_SNIPPET,
            });

            const panel = createPanelSnippet(this.elements.container, id, BRANCH_ROW_SNIPPET);

            this.debug("createBranchRowPanel() : SetDialogVariable", {
              var_name: BRANCH_ROW_VAR_LEVEL,
              value: level,
            });

            panel.SetDialogVariable(BRANCH_ROW_VAR_LEVEL, level.toString());

            for (const side of SIDES) {
              this.localizeBranch(panel, level, side);
            }

            this.rows.set(level, panel);

            this.debug("createBranchRowPanel() : panel created");
          }

          // ----- Actions -----

          resetAction() {
            return new Sequence()
              .Function(() => this.debug("resetAction() : RemoveChildren"))
              .RemoveChildren(this.elements.container)
              .Function(() => this.debug("resetAction() : resetRows()"))
              .Function(() => this.resetRows());
          }

          createBranchRowPanelAction(level: dota2.TalentLevel) {
            return new Sequence()
              .Function(() => this.debug("createBranchRowPanelAction()", { level: level }))
              .Function(() => this.createBranchRowPanel(level));
          }

          renderRowsAction() {
            return LEVELS.map((level) => this.createBranchRowPanelAction(level));
          }

          selectBranchAction(level: dota2.TalentLevel) {
            const seq = new Sequence();

            if (this.selected == null) {
              return seq;
            }

            const sides = SIDES.filter((side) => this.selected?.isSelected(level, side));

            seq.Function(() => this.debug("selectBranchAction()", { level: level, sides: sides }));

            for (const side of sides) {
              seq.Function(() => this.selectBranchSide(level, side));
            }

            return seq;
          }

          selectBranchesAction() {
            const actions = LEVELS.map((level) => this.selectBranchAction(level));

            return new ParallelSequence().Action(...actions);
          }

          // ----- Action runners -----

          render() {
            if (this.selected == null || this.talents == null) {
              this.warn("Tried to render without selected or talents");
              return;
            }

            const seq = new Sequence()
              .Action(this.resetAction())
              .Action(...this.renderRowsAction())
              .Action(this.selectBranchesAction());

            this.debugFn(() => [
              "render()",
              { selected: this.selected?.value, actions: seq.size() },
            ]);

            seq.Run();
          }

          selectBranchSide(level: dota2.TalentLevel, side: dota2.TalentSide) {
            const row = this.rows.get(level);

            if (row == null) {
              throw new Error(`Could not find talent branch row for talent [${level}, ${side}]`);
            }

            const seq = new Sequence();

            for (const side of SIDES) {
              seq.Function(() =>
                this.debug("selectBranchSide() : RemoveClass", {
                  level,
                  side,
                  class: CLASSES.BRANCH_SELECTED[side],
                }),
              );

              seq.RemoveClass(row, CLASSES.BRANCH_SELECTED[side]);
            }

            seq.Function(() =>
              this.debug("selectBranchSide() : AddClass", {
                level,
                side,
                class: CLASSES.BRANCH_SELECTED[side],
              }),
            );

            seq.AddClass(row, CLASSES.BRANCH_SELECTED[side]);
            seq.Run();
          }
        }

        export const component = new TooltipStatBranch();
      }
    }
  }
}
