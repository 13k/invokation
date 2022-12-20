// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace invk {
  export namespace Components {
    export namespace UI {
      export namespace TalentsDisplay {
        type TTalentLevel = typeof Dota2.Talent.Level;

        export type Elements = {
          [K in keyof TTalentLevel as `statRow${TTalentLevel[K]}`]: Panel;
        };

        export interface Inputs extends Component.Inputs {
          Reset: undefined;
          Select: {
            heroID: HeroID;
            talents: Dota2.Talent.Selection;
          };
        }

        export type Outputs = never;
        export type Params = never;

        const {
          Panorama: { UIEvent },
          Sequence: { ParallelSequence },
          Vendor: { lodash: _ },
          Dota2: {
            Talent: { Level, Side, isSelected },
          },
        } = GameUI.CustomUIConfig().invk;

        /*
        enum PanelID {
          Tooltip = "TalentDisplayTooltip",
        }
        */

        enum CssClass {
          BranchSelectedLeft = "LeftBranchSelected",
          BranchSelectedRight = "RightBranchSelected",
        }

        const LEVELS = [Level.Tier1, Level.Tier2, Level.Tier3, Level.Tier4];

        const BranchRowClass = {
          [Side.Left]: CssClass.BranchSelectedLeft,
          [Side.Right]: CssClass.BranchSelectedRight,
        };

        export class TalentsDisplay extends Component.Component<Elements, Inputs, Outputs, Params> {
          selected?: Dota2.Talent.Selection;
          heroID?: HeroID;
          tooltipID?: string;

          constructor() {
            super({
              elements: {
                statRow10: "StatRow10",
                statRow15: "StatRow15",
                statRow20: "StatRow20",
                statRow25: "StatRow25",
              },
              inputs: {
                Select: (payload: Inputs["Select"]) => this.onSelect(payload),
                Reset: (payload: Inputs["Reset"]) => this.onReset(payload),
              },
            });

            this.setPanelEvent("onmouseover", () => this.ShowTooltip());
            this.setPanelEvent("onmouseout", () => this.HideTooltip());
            this.debug("init");
          }

          // ----- I/O -----

          row(level: Dota2.Talent.Level) {
            return this.elements[`statRow${level}`];
          }

          // ----- I/O -----

          onSelect(payload: Inputs["Select"]) {
            this.debug("onSelect()", payload);

            this.heroID = payload.heroID;
            this.selected = payload.talents;

            this.render();
          }

          onReset(payload: Inputs["Reset"]) {
            this.debug("onReset()", payload);
            this.reset();
          }

          // ----- Actions -----

          selectLevelAction(level: Dota2.Talent.Level, selected: Dota2.Talent.Selection) {
            return _.reduce(
              Object.entries(Side),
              (seq, [, side]) =>
                isSelected(level, side, selected)
                  ? seq.AddClass(this.row(level), BranchRowClass[side])
                  : seq.RemoveClass(this.row(level), BranchRowClass[side]),
              new ParallelSequence()
            );
          }

          resetLevelAction(level: Dota2.Talent.Level) {
            return _.reduce(
              Object.entries(Side),
              (seq, [, side]) => seq.RemoveClass(this.row(level), BranchRowClass[side]),
              new ParallelSequence()
            );
          }

          // ----- Action runners -----

          render() {
            if (this.heroID == null || this.selected == null) {
              this.warn("tried to render() without hero ID or selected talents");
              return;
            }

            const { heroID, selected } = this;

            const actions = _.map(LEVELS, (level) => this.selectLevelAction(level, selected));
            const seq = new ParallelSequence().Action(...actions);

            this.debugFn(() => ["select()", { heroID, selected, actions: seq.size() }]);

            seq.Run();
          }

          reset() {
            const actions = _.map(LEVELS, (level) => this.resetLevelAction(level));
            const seq = new ParallelSequence().Action(...actions);

            this.debugFn(() => ["reset()", { actions: seq.size() }]);

            seq.Run();
          }

          // ----- UI methods -----

          ShowTooltip() {
            if (this.heroID == null || this.selected == null) {
              this.warn("tried to ShowTooltip() without hero ID or selected talents");
              return;
            }

            /*
            this.tooltipID = _.uniqueId(PanelID.Tooltip);

            const { heroID, selected, tooltipID } = this;
            const params = { heroID, selected };

            this.showTooltip(this.panel, Layout.ID.TooltipStatBranch, tooltipID, params);
            this.debugFn(() => ["ShowTooltip()", { tooltipID, params }]);
            */

            this.dispatch(this.panel, UIEvent.SHOW_HERO_STAT_BRANCH_TOOLTIP, this.heroID);
          }

          HideTooltip() {
            /*
            if (!this.tooltipID) return;

            const { tooltipID } = this;

            this.hideTooltip(this.panel, tooltipID);

            this.tooltipID = undefined;

            this.debugFn(() => ["HideTooltip()", { tooltipID }]);
            */

            this.dispatch(this.panel, UIEvent.HIDE_HERO_STAT_BRANCH_TOOLTIP);
          }
        }

        export const component = new TalentsDisplay();
      }
    }
  }
}
