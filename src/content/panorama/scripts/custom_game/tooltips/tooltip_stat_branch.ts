namespace invk {
  export namespace Components {
    export namespace Tooltips {
      export namespace StatBranch {
        const {
          L10n,
          Dota2: { Talents, TalentLevel, TalentSide },
          Panorama: { createPanelSnippet },
          Sequence: { Sequence, ParallelSequence },
          Singleton: { HERO_DATA },
        } = GameUI.CustomUIConfig().invk;

        import Action = invk.Sequence.Action;
        import Ability = invk.Dota2.Invoker.Ability;
        import Component = invk.Component.Component;
        import HeroData = invk.NetTable.Invokation.HeroData;
        import ParamType = invk.Component.ParamType;
        import TalentMap = invk.Dota2.TalentMap;
        import TalentSelection = invk.Dota2.TalentSelection;

        export interface Elements extends Component.Elements {
          container: Panel;
        }

        export interface Params extends Component.Params {
          heroId: HeroID;
          selected: TalentSelection;
        }

        const LEVELS = [TalentLevel.Tier4, TalentLevel.Tier3, TalentLevel.Tier2, TalentLevel.Tier1];
        const SIDES = [TalentSide.Right, TalentSide.Left];

        const BRANCH_ROW_SNIPPET = "TooltipStatBranchRow";
        const BRANCH_ROW_ID_PREFIX = "TooltipStatBranchRow";
        const BRANCH_ROW_VAR_LEVEL = "level";

        const CLASSES = {
          branchRowChoiceLabel: "StatBonusLabel",
          branchRowSides: {
            [TalentSide.Right]: "BranchRight",
            [TalentSide.Left]: "BranchLeft",
          },
          branchSelected: {
            [TalentSide.Right]: "BranchRightSelected",
            [TalentSide.Left]: "BranchLeftSelected",
          },
        };

        const branchRowId = (level: Dota2.TalentLevel) => `${BRANCH_ROW_ID_PREFIX}${level}`;

        export class TooltipStatBranch extends Component<Elements, never, never, Params> {
          selected: Dota2.Talents | undefined;
          talents: TalentMap<Ability> | undefined;
          heroData: HeroData | undefined;
          rows: Map<Dota2.TalentLevel, Panel> = new Map();

          constructor() {
            super({
              elements: {
                container: "TooltipStatBranchContainer",
              },
              params: {
                heroId: { type: ParamType.Uint32, default: 0 },
                selected: { type: ParamType.Uint32, default: 0 },
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

          onHeroDataChange(data: NetTable.Invokation.HeroData): void {
            this.heroData = data;

            if (this.heroData == null) {
              return;
            }

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

          resetRows(): void {
            this.rows.clear();
          }

          localizeBranch(panel: Panel, level: Dota2.TalentLevel, side: Dota2.TalentSide): void {
            this.debug("localizeBranch()", { level, side });

            if (this.talents == null) {
              return;
            }

            const ability = this.talents.get(level)?.get(side);

            if (ability == null) {
              this.error(`Could not find ability for talent [${level}, ${side}]`);
              return;
            }

            this.debug("localizeBranch()", { ability });

            const branchClass = CLASSES.branchRowSides[side];

            this.debug("localizeBranch() : FindChildrenWithClassTraverse [panel]", { branchClass });

            const branchPanel = panel.FindChildrenWithClassTraverse(branchClass)[0];

            if (branchPanel == null) {
              this.error(
                `Could not find branch panel with class ${branchClass} for talent [${level}, ${side}]`,
              );

              return;
            }

            this.debug("localizeBranch()", { branchPanel });

            const branchLabelClass = CLASSES.branchRowChoiceLabel;

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
              ability,
              branchLabel: branchLabel.id,
            });

            const labelText = L10n.abilityTooltip(ability, branchLabel);

            this.debug("localizeBranch() : set branchLabel.text", { labelText });

            branchLabel.text = labelText;

            this.debug("localizeBranch() ---");
          }

          createBranchRowPanel(level: Dota2.TalentLevel): void {
            this.debug("createBranchRowPanel()", { level });

            const id = branchRowId(level);

            this.debug("createBranchRowPanel() : CreatePanelWithLayoutSnippet()", {
              id,
              snippet: BRANCH_ROW_SNIPPET,
            });

            const panel = createPanelSnippet(this.elements.container, id, BRANCH_ROW_SNIPPET);

            this.debug("createBranchRowPanel() : SetDialogVariable", {
              var: BRANCH_ROW_VAR_LEVEL,
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

          resetAction(): Action {
            return new Sequence()
              .runFn(() => this.debug("resetAction() : RemoveChildren"))
              .removeChildren(this.elements.container)
              .runFn(() => this.debug("resetAction() : resetRows()"))
              .runFn(() => this.resetRows());
          }

          createBranchRowPanelAction(level: Dota2.TalentLevel): Action {
            return new Sequence()
              .runFn(() => this.debug("createBranchRowPanelAction()", { level }))
              .runFn(() => this.createBranchRowPanel(level));
          }

          renderRowsActions(): Action[] {
            return LEVELS.map((level) => this.createBranchRowPanelAction(level));
          }

          selectBranchAction(level: Dota2.TalentLevel): Action {
            const seq = new Sequence();

            if (this.selected == null) {
              return seq;
            }

            const sides = SIDES.filter((side) => this.selected?.isSelected(level, side));

            seq.runFn(() => this.debug("selectBranchAction()", { level, sides }));

            for (const side of sides) {
              seq.runFn(() => this.selectBranchSide(level, side));
            }

            return seq;
          }

          selectBranchesAction(): Action {
            const actions = LEVELS.map((level) => this.selectBranchAction(level));

            return new ParallelSequence().add(...actions);
          }

          // ----- Action runners -----

          render(): void {
            if (this.selected == null || this.talents == null) {
              this.warn("Tried to render without selected or talents");
              return;
            }

            const seq = new Sequence()
              .add(this.resetAction())
              .add(...this.renderRowsActions())
              .add(this.selectBranchesAction());

            this.debugFn(() => [
              "render()",
              { selected: this.selected?.value, actions: seq.deepSize() },
            ]);

            seq.run();
          }

          selectBranchSide(level: Dota2.TalentLevel, side: Dota2.TalentSide): void {
            const row = this.rows.get(level);

            if (row == null) {
              throw new Error(`Could not find talent branch row for talent [${level}, ${side}]`);
            }

            const seq = new Sequence();

            for (const side of SIDES) {
              seq.runFn(() =>
                this.debug("selectBranchSide() : RemoveClass", {
                  level,
                  side,
                  class: CLASSES.branchSelected[side],
                }),
              );

              seq.removeClass(row, CLASSES.branchSelected[side]);
            }

            seq.runFn(() =>
              this.debug("selectBranchSide() : AddClass", {
                level,
                side,
                class: CLASSES.branchSelected[side],
              }),
            );

            seq.addClass(row, CLASSES.branchSelected[side]);
            seq.run();
          }
        }

        export const component = new TooltipStatBranch();
      }
    }
  }
}
