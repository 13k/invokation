// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace invk {
  export namespace components {
    export namespace ui {
      export namespace talents_display {
        const {
          dota2: { Talents, TalentLevel, TalentSide },
          panorama: { UIEvent },
          sequence: { ParallelSequence },
        } = GameUI.CustomUIConfig().invk;

        import Component = invk.component.Component;
        import TalentSelection = invk.dota2.TalentSelection;

        type TTalentLevel = typeof dota2.TalentLevel;

        export type Elements = {
          [K in keyof TTalentLevel as `statRow${TTalentLevel[K]}`]: Panel;
        };

        export interface Inputs extends component.Inputs {
          Reset: undefined;
          Select: {
            heroID: HeroID;
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
          talents: dota2.Talents | undefined;
          heroID: HeroID | undefined;
          tooltipID: string | undefined;

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
                  onmouseover: () => this.ShowTooltip(),
                  onmouseout: () => this.HideTooltip(),
                },
              },
              inputs: {
                Select: (payload) => this.onSelect(payload),
                Reset: (payload) => this.onReset(payload),
              },
            });

            this.debug("init");
          }

          // ----- Helpers -----

          row(level: dota2.TalentLevel) {
            return this.elements[`statRow${level}`];
          }

          // ----- I/O -----

          onSelect(payload: Inputs["Select"]) {
            this.debug("onSelect()", payload);

            this.heroID = payload.heroID;
            this.talents = new Talents(payload.talents);

            this.render();
          }

          onReset(payload: Inputs["Reset"]) {
            this.debug("onReset()", payload);
            this.reset();
          }

          // ----- Actions -----

          selectLevelAction(level: dota2.TalentLevel) {
            return Object.values(TalentSide).reduce(
              (seq, side) =>
                this.talents?.isSelected(level, side)
                  ? seq.AddClass(this.row(level), BranchRowClass[side])
                  : seq.RemoveClass(this.row(level), BranchRowClass[side]),
              new ParallelSequence(),
            );
          }

          resetLevelAction(level: dota2.TalentLevel) {
            return Object.values(TalentSide).reduce(
              (seq, side) => seq.RemoveClass(this.row(level), BranchRowClass[side]),
              new ParallelSequence(),
            );
          }

          // ----- Action runners -----

          render() {
            if (this.heroID == null || this.talents == null) {
              this.warn("tried to render() without hero ID or selected talents");
              return;
            }

            const heroID = this.heroID;
            const actions = LEVELS.map((level) => this.selectLevelAction(level));
            const seq = new ParallelSequence().Action(...actions);

            this.debugFn(() => [
              "select()",
              { heroID, selected: this.talents?.value, actions: seq.size() },
            ]);

            seq.Run();
          }

          reset() {
            const actions = LEVELS.map((level) => this.resetLevelAction(level));
            const seq = new ParallelSequence().Action(...actions);

            this.debugFn(() => ["reset()", { actions: seq.size() }]);

            seq.Run();
          }

          // ----- UI methods -----

          ShowTooltip() {
            if (this.heroID == null || this.talents == null) {
              this.warn("tried to ShowTooltip() without hero ID or selected talents");
              return;
            }

            this.dispatch(this.panel, UIEvent.SHOW_HERO_STAT_BRANCH_TOOLTIP, this.heroID);
          }

          HideTooltip() {
            this.dispatch(this.panel, UIEvent.HIDE_HERO_STAT_BRANCH_TOOLTIP);
          }
        }

        export const component = new TalentsDisplay();
      }
    }
  }
}
