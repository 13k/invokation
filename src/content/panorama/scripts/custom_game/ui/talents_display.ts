namespace invk {
  export namespace Components {
    export namespace Ui {
      export namespace TalentsDisplay {
        const {
          Dota2: { Talents, TalentLevel, TalentSide },
          Panorama: { UiEvent },
          Sequence: { ParallelSequence },
        } = GameUI.CustomUIConfig().invk;

        import Action = invk.Sequence.Action;
        import Component = invk.Component.Component;
        import TalentSelection = invk.Dota2.TalentSelection;

        type TalentLevelType = typeof Dota2.TalentLevel;

        export type Elements = {
          [K in keyof TalentLevelType as `statRow${TalentLevelType[K]}`]: Panel;
        };

        export interface Inputs extends Component.Inputs {
          reset: undefined;
          select: {
            heroId: HeroID;
            talents: TalentSelection;
          };
        }

        enum CssClass {
          BranchSelectedLeft = "LeftBranchSelected",
          BranchSelectedRight = "RightBranchSelected",
        }

        const LEVELS = [TalentLevel.Tier1, TalentLevel.Tier2, TalentLevel.Tier3, TalentLevel.Tier4];

        const BranchRowClass = {
          [TalentSide.Left]: CssClass.BranchSelectedLeft,
          [TalentSide.Right]: CssClass.BranchSelectedRight,
        };

        export class TalentsDisplay extends Component<Elements, Inputs> {
          talents: Dota2.Talents | undefined;
          heroId: HeroID | undefined;
          tooltipId: string | undefined;

          constructor() {
            super({
              elements: {
                statRow10: "StatRow10",
                statRow15: "StatRow15",
                statRow20: "StatRow20",
                statRow25: "StatRow25",
              },
              panelEvents: {
                $: {
                  onmouseover: () => this.onMouseOver(),
                  onmouseout: () => this.onMouseOut(),
                },
              },
              inputs: {
                select: (payload) => this.onSelect(payload),
                reset: (payload) => this.onReset(payload),
              },
            });

            this.debug("init");
          }

          // ----- I/O -----

          onSelect(payload: Inputs["select"]): void {
            this.debug("onSelect()", payload);

            this.heroId = payload.heroId;
            this.talents = new Talents(payload.talents);

            this.render();
          }

          onReset(payload: Inputs["reset"]): void {
            this.debug("onReset()", payload);
            this.reset();
          }

          // ----- Event handlers -----

          onMouseOver(): void {
            if (this.heroId == null || this.talents == null) {
              this.warn("tried to onMouseOver() without hero ID or selected talents");
              return;
            }

            this.dispatch(this.panel, UiEvent.ShowHeroStatBranchTooltip, this.heroId);
          }

          onMouseOut(): void {
            this.dispatch(this.panel, UiEvent.HideHeroStatBranchTooltip);
          }

          // ----- Helpers -----

          row(level: Dota2.TalentLevel): Panel {
            return this.elements[`statRow${level}`];
          }

          // ----- Actions -----

          selectLevelAction(level: Dota2.TalentLevel): Action {
            return Object.values(TalentSide).reduce(
              (seq, side) =>
                this.talents?.isSelected(level, side)
                  ? seq.addClass(this.row(level), BranchRowClass[side])
                  : seq.removeClass(this.row(level), BranchRowClass[side]),
              new ParallelSequence(),
            );
          }

          resetLevelAction(level: Dota2.TalentLevel): Action {
            return Object.values(TalentSide).reduce(
              (seq, side) => seq.removeClass(this.row(level), BranchRowClass[side]),
              new ParallelSequence(),
            );
          }

          // ----- Action runners -----

          render(): void {
            if (this.heroId == null || this.talents == null) {
              this.warn("tried to render() without hero ID or selected talents");
              return;
            }

            const seq = LEVELS.reduce(
              (seq, level) => seq.add(this.selectLevelAction(level)),
              new ParallelSequence(),
            );

            this.debugFn(() => [
              "select()",
              { heroId: this.heroId, selected: this.talents?.value, actions: seq.deepSize() },
            ]);

            seq.run();
          }

          reset(): void {
            const seq = LEVELS.reduce(
              (seq, level) => seq.add(this.resetLevelAction(level)),
              new ParallelSequence(),
            );

            this.debugFn(() => ["reset()", { actions: seq.deepSize() }]);

            seq.run();
          }

          // ----- UI methods -----
        }

        export const component = new TalentsDisplay();
      }
    }
  }
}
