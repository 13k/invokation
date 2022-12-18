namespace invk {
  export namespace Components {
    export namespace CombatLog {
      export interface Elements extends Component.Elements {
        contents: Panel;
        filterInvocations: Panel;
      }

      export type Inputs = never;
      export type Outputs = never;
      export type Params = never;

      const {
        CustomEvents: { Name: CustomEventName },
        Grid: { Grid },
        Panorama: { createAbilityOrItemImage },
        Sequence: { Sequence },
        Dota2: {
          Invoker: { isInvocationAbility },
        },
      } = GameUI.CustomUIConfig().invk;

      enum PanelID {
        RowPrefix = "CombatLogRow",
        IconPrefix = "CombatLogIcon",
        IconImagePrefix = "Image",
      }

      enum CssClass {
        Closed = "Closed",
        Row = "CombatLogRow",
        Icon = "CombatLogIcon",
        IconImage = "CombatLogIconImage",
      }

      const ICON_IMAGE_SCALING = "stretch-to-fit-y-preserve-aspect";
      const GRID_COLUMNS = 20;

      const rowId = (index: number) => `${PanelID.RowPrefix}${index}`;
      const iconId = (row: number, col: number) => [PanelID.IconPrefix, row, col].join("_");
      const iconImageId = (iconId: string) => `${iconId}_${PanelID.IconImagePrefix}`;

      export class CombatLog extends Component.Component<Elements, Inputs, Outputs, Params> {
        grid: Grid.Grid<string>;
        row?: Panel | null;

        constructor() {
          super({
            elements: {
              contents: "CombatLogContents",
              filterInvocations: "CombatLogFilterInvocations",
            },
            customEvents: {
              COMBAT_LOG_ABILITY_USED: "onAbilityUsed",
              COMBAT_LOG_CLEAR: "onClear",
            },
          });

          this.grid = new Grid(GRID_COLUMNS);

          this.bindEvents();
          this.start();
          this.debug("init");
        }

        // ----- Event handlers -----

        onClear() {
          this.debug("onClear()");
          this.clear();
        }

        onGridRowChange(i: number) {
          this.debug("onGridRowChange()", i);
          this.addRow(i);
        }

        onAbilityUsed(payload: CustomEvents.CombatLogAbilityUsed) {
          this.debug("onAbilityUsed()", payload);

          if (this.isFilteringInvocations && isInvocationAbility(payload.ability)) return;

          this.addColumn(payload.ability);
        }

        // ----- Helpers -----

        bindEvents() {
          this.grid.onRowChange(this.onGridRowChange.bind(this));
        }

        startCapturing() {
          this.sendServer(CustomEventName.COMBAT_LOG_CAPTURE_START, {});
        }

        stopCapturing() {
          this.sendServer(CustomEventName.COMBAT_LOG_CAPTURE_STOP, {});
        }

        get isOpen() {
          return !this.panel.BHasClass(CssClass.Closed);
        }

        get isFilteringInvocations() {
          return this.elements.filterInvocations.checked;
        }

        start() {
          this.startCapturing();
        }

        stop() {
          this.stopCapturing();
        }

        appendToGrid(abilityName: string) {
          this.grid.add(abilityName);
        }

        clearGrid() {
          this.grid.clear();
        }

        resetRow() {
          this.row = null;
        }

        createRow(rowIndex: number) {
          const id = rowId(rowIndex);
          const panel = $.CreatePanel("Panel", this.elements.contents, id);

          panel.AddClass(CssClass.Row);

          this.row = panel;

          return panel;
        }

        createAbilityIcon(abilityName: string) {
          if (!this.row) {
            throw new Error(`tried to create CombatLog ability icon without a row`);
          }

          const id = iconId(this.grid.row, this.grid.column);
          const panel = $.CreatePanel("Panel", this.row, id);

          panel.AddClass(CssClass.Icon);

          const imageId = iconImageId(id);
          const image = createAbilityOrItemImage(panel, imageId, abilityName);

          image.AddClass(CssClass.IconImage);
          image.SetScaling(ICON_IMAGE_SCALING);

          this.debug("createAbilityIcon()", {
            ability: abilityName,
            iconId: panel.id,
            imageId: image.id,
            imageType: image.paneltype,
          });

          return panel;
        }

        // ----- Action runners -----

        open() {
          return new Sequence().RemoveClass(this.panel, CssClass.Closed).Run();
        }

        close() {
          return new Sequence().AddClass(this.panel, CssClass.Closed).Run();
        }

        addRow(rowIndex: number) {
          return new Sequence()
            .Function(() => this.createRow(rowIndex))
            .ScrollToBottom(this.elements.contents)
            .Run();
        }

        addColumn(abilityName: string) {
          return new Sequence()
            .Function(() => this.appendToGrid(abilityName))
            .Function(() => this.createAbilityIcon(abilityName))
            .ScrollToBottom(this.elements.contents)
            .Run();
        }

        clear() {
          return new Sequence()
            .Function(() => this.clearGrid())
            .Function(() => this.resetRow())
            .RemoveChildren(this.elements.contents)
            .Run();
        }

        // ----- UI methods -----

        Toggle() {
          if (this.isOpen) {
            return this.close();
          }

          return this.open();
        }

        Clear() {
          return this.clear();
        }
      }

      export const component = new CombatLog();
    }
  }
}
