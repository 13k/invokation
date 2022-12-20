// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace invk {
  export namespace Components {
    export namespace Tooltips {
      export namespace TooltipStatBranch {
        export interface Elements extends Component.Elements {
          container: Panel;
        }

        export type Inputs = never;
        export type Outputs = never;

        export interface Params extends Component.Params {
          heroID: HeroID;
          selected: Dota2.Talent.Selection;
        }

        const {
          L10n,
          Lua,
          Panorama: { createPanelSnippet },
          Sequence: { Sequence, ParallelSequence },
          Static: { HERO_DATA },
          Vendor: { lodash: _ },
          Dota2: {
            Talent,
            Talent: { Level, Side },
          },
        } = GameUI.CustomUIConfig().invk;

        const { ParamType } = Component;

        const LEVELS = [Level.Tier4, Level.Tier3, Level.Tier2, Level.Tier1];
        const SIDES = [Side.Right, Side.Left];

        const BRANCH_ROW_SNIPPET = "TooltipStatBranchRow";
        const BRANCH_ROW_ID_PREFIX = "TooltipStatBranchRow";
        const BRANCH_ROW_VAR_LEVEL = "level";

        const CLASSES = {
          BRANCH_ROW_CHOICE_LABEL: "StatBonusLabel",
          BRANCH_ROW_SIDES: {
            [Side.Right]: "BranchRight",
            [Side.Left]: "BranchLeft",
          },
          BRANCH_SELECTED: {
            [Side.Right]: "BranchRightSelected",
            [Side.Left]: "BranchLeftSelected",
          },
        };

        const branchRowId = (level: Dota2.Talent.Level) => `${BRANCH_ROW_ID_PREFIX}${level}`;

        export class TooltipStatBranch extends Component.Component<
          Elements,
          Inputs,
          Outputs,
          Params
        > {
          selected?: Dota2.Talent.Selection;
          selectedSplit?: Dota2.Talent.Map<boolean>;
          talents?: Dota2.Talent.Map<Dota2.Invoker.Ability>;
          heroData?: CustomNetTables.Invokation.HeroData;
          rows: Record<Dota2.Talent.Level, Panel>;

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

            this.rows = {} as Record<Dota2.Talent.Level, Panel>;

            HERO_DATA.onChange(this.onHeroDataChange.bind(this));

            this.debug("init");
          }

          // ----- Event handlers -----

          override onLoad(): void {
            this.selected = this.params.selected;
            this.selectedSplit = Talent.splitSelection(this.selected);

            this.debug("onLoad()", { selected: this.selected, selectedSplit: this.selectedSplit });
            this.render();
          }

          onHeroDataChange(data: NetworkedData<CustomNetTables.Invokation.HeroData>) {
            this.heroData = Lua.fromArrayDeep(data);

            if (!this.heroData) return;

            this.talents = _.transform(
              this.heroData.TALENT_ABILITIES,
              (abilities, ability, i) => {
                const level = Talent.arrayIndexToLevel(i);
                const side = Talent.arrayIndexToSide(i);

                abilities[level] = abilities[level] || {};
                abilities[level][side] = ability;
              },
              {} as Dota2.Talent.Map<Dota2.Invoker.Ability>
            );

            this.debug("onHeroDataChange()");
            this.render();
          }

          // ----- Helpers -----

          resetRows() {
            this.rows = {} as Record<Dota2.Talent.Level, Panel>;
          }

          localizeBranch(panel: Panel, level: Dota2.Talent.Level, side: Dota2.Talent.Side) {
            this.debug("localizeBranch()", { level: level, side: side });

            if (!this.talents) return;

            const ability = this.talents[level][side];

            if (!ability) {
              this.error(`Could not find ability for talent [${level}, ${side}]`);
              return;
            }

            /*
      var abilitySpecial = _.get(this.heroData, [ability, "AbilitySpecial"]);

      if (abilitySpecial == null) {
        this.error("could not find AbilitySpecial for ability " + ability);
        return;
      }
      */

            this.debug("localizeBranch()", {
              ability: ability || "UNDEFINED!",
              // abilitySpecial: abilitySpecial || "UNDEFINED!",
            });

            const branchClass = CLASSES.BRANCH_ROW_SIDES[side];

            this.debug("localizeBranch() : FindChildrenWithClassTraverse [panel]", { branchClass });

            const branchPanel = panel.FindChildrenWithClassTraverse(branchClass)[0];

            this.debug("localizeBranch()", { branchPanel: branchPanel || "UNDEFINED!" });

            if (!branchPanel) {
              this.error(
                `Could not find branch panel with class ${branchClass} for talent [${level}, ${side}]`
              );

              return;
            }

            const branchLabelClass = CLASSES.BRANCH_ROW_CHOICE_LABEL;

            this.debug("localizeBranch() : FindChildrenWithClassTraverse [label]", {
              branchLabelClass,
            });

            const branchLabel = branchPanel.FindChildrenWithClassTraverse(
              branchLabelClass
            )[0] as LabelPanel;

            this.debug("localizeBranch()", { branchLabel: branchLabel || "UNDEFINED!" });

            if (!branchLabel) {
              this.error(
                `Could not find branch label with class ${branchLabelClass} for talent [${level}, ${side}]`
              );

              return;
            }

            /*
      _.each(abilitySpecial, function (special) {
        _.forOwn(special, function (value, key) {
          if (key === "var_type") return;

          this.debug("localizeBranch() : SetDialogVariable", { key: key, value: value });

          branchLabel.SetDialogVariable(key, value);
        });
      });
      */

            this.debug("localizeBranch() : L10n.LocalizeAbilityTooltip()", {
              ability: ability,
              branchLabel: branchLabel.id,
            });

            const labelText = L10n.abilityTooltip(ability, branchLabel);

            this.debug("localizeBranch() : set branchLabel.text", { labelText });

            branchLabel.text = labelText;

            this.debug("localizeBranch() ---");
          }

          createBranchRowPanel(level: Dota2.Talent.Level) {
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

            panel.SetDialogVariable(BRANCH_ROW_VAR_LEVEL, _.toString(level));

            _.each(SIDES, (side) => this.localizeBranch(panel, level, side));

            this.rows[level] = panel;

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

          createBranchRowPanelAction(level: Dota2.Talent.Level) {
            return new Sequence()
              .Function(() => this.debug("createBranchRowPanelAction()", { level: level }))
              .Function(() => this.createBranchRowPanel(level));
          }

          renderRowsAction() {
            return _.map(LEVELS, (level) => this.createBranchRowPanelAction(level));
          }

          selectBranchAction(level: Dota2.Talent.Level) {
            let seq = new Sequence();

            if (!this.selectedSplit) {
              return seq;
            }

            const side = _.find(SIDES, (side) =>
              this.selectedSplit ? this.selectedSplit[level][side] : false
            );

            seq = seq.Function(() =>
              this.debug("selectBranchAction()", { level: level, side: side })
            );

            if (side) {
              seq = seq.Function(() => this.selectBranchSide(level, side));
            }

            return seq;
          }

          selectBranchesAction() {
            const actions = _.map(LEVELS, (level) => this.selectBranchAction(level));

            return new ParallelSequence().Action(...actions);
          }

          // ----- Action runners -----

          render() {
            if (!this.selectedSplit) return;
            if (!this.talents) return;

            const seq = new Sequence()
              .Action(this.resetAction())
              .Action(...this.renderRowsAction())
              .Action(this.selectBranchesAction());

            this.debugFn(() => ["render()", { selected: this.selected, actions: seq.size() }]);

            seq.Run();
          }

          selectBranchSide(level: Dota2.Talent.Level, side: Dota2.Talent.Side) {
            const row = this.rows[level];
            const seq = new Sequence();

            _.each(SIDES, (s) => {
              seq.Function(() =>
                this.debug("selectBranchSide() : RemoveClass", {
                  level: level,
                  side: s,
                  class: CLASSES.BRANCH_SELECTED[s],
                })
              );

              seq.RemoveClass(row, CLASSES.BRANCH_SELECTED[s]);
            });

            seq.Function(() =>
              this.debug("selectBranchSide() : AddClass", {
                level: level,
                side: side,
                class: CLASSES.BRANCH_SELECTED[side],
              })
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
