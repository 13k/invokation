// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace invk {
  export namespace components {
    export namespace CombatLog {
      const {
        custom_events: { CustomGameEvent },
        grid: { Grid },
        panorama: { createAbilityOrItemImage },
        sequence: { Sequence },
        dota2: {
          invoker: { isInvocationAbility },
        },
      } = GameUI.CustomUIConfig().invk;

      import Component = invk.component.Component;

      export interface Elements extends component.Elements {
        contents: Panel;
        filterInvocations: Panel;
        btnToggle: ToggleButton;
        btnClear: Button;
      }

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

      export class CombatLog extends Component<Elements> {
        grid: grid.Grid<string>;
        row: Panel | undefined;

        constructor() {
          super({
            elements: {
              contents: "CombatLogContents",
              filterInvocations: "CombatLogFilterInvocations",
              btnToggle: "BtnToggle",
              btnClear: "BtnClear",
            },
            customEvents: {
              [CustomGameEvent.COMBAT_LOG_ABILITY_USED]: (payload) => this.onAbilityUsed(payload),
              [CustomGameEvent.COMBAT_LOG_CLEAR]: (payload) => this.onClear(payload),
            },
            panelEvents: {
              btnToggle: { onactivate: () => this.Toggle() },
              btnClear: { onactivate: () => this.Clear() },
            },
          });

          this.grid = new Grid(GRID_COLUMNS);

          this.bindEvents();
          this.start();
          this.debug("init");
        }

        // ----- Event handlers -----

        onClear(payload: NetworkedData<custom_events.CombatLogClear>) {
          this.debug("onClear()", payload);
          this.clear();
        }

        onAbilityUsed(payload: NetworkedData<custom_events.CombatLogAbilityUsed>) {
          this.debug("onAbilityUsed()", payload);

          if (this.isFilteringInvocations && isInvocationAbility(payload.ability)) return;

          this.addColumn(payload.ability);
        }

        onGridRowChange(i: number) {
          this.debug("onGridRowChange()", i);
          this.addRow(i);
        }

        // ----- Helpers -----

        bindEvents() {
          this.grid.onRowChange(this.onGridRowChange.bind(this));
        }

        startCapturing() {
          this.sendServer(CustomGameEvent.COMBAT_LOG_CAPTURE_START, {});
        }

        stopCapturing() {
          this.sendServer(CustomGameEvent.COMBAT_LOG_CAPTURE_STOP, {});
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
          this.row = undefined;
        }

        createRow(rowIndex: number) {
          const id = rowId(rowIndex);
          const panel = $.CreatePanel("Panel", this.elements.contents, id);

          panel.AddClass(CssClass.Row);

          this.row = panel;

          return panel;
        }

        createAbilityIcon(abilityName: string) {
          if (this.row == null) {
            throw new Error("Tried to create CombatLog ability icon without a row");
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
