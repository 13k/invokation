import type { CombatLogAbilityUsed, CombatLogClear } from "@invokation/panorama-lib/custom_events";
import { CustomGameEvent } from "@invokation/panorama-lib/custom_events";
import { isInvocationAbility } from "@invokation/panorama-lib/dota2/invoker";
import { Grid } from "@invokation/panorama-lib/grid";
import { createAbilityOrItemImage } from "@invokation/panorama-lib/panorama";
import { Sequence } from "@invokation/panorama-lib/sequence";

import type { Elements } from "./component";
import { Component } from "./component";

export interface CombatLogElements extends Elements {
  contents: Panel;
  skipInvocations: Panel;
  btnToggle: ToggleButton;
  btnClear: Button;
}

enum PanelId {
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

const rowId = (index: number) => `${PanelId.RowPrefix}${index}`;
const iconId = (row: number, col: number) => [PanelId.IconPrefix, row, col].join("_");
const iconImageId = (iconId: string) => `${iconId}_${PanelId.IconImagePrefix}`;

export type { CombatLog };

class CombatLog extends Component<CombatLogElements> {
  grid: Grid<string>;
  row: Panel | undefined;

  constructor() {
    super({
      elements: {
        contents: "CombatLogContents",
        skipInvocations: "CombatLogFilterInvocations",
        btnToggle: "BtnToggle",
        btnClear: "BtnClear",
      },
      customEvents: {
        [CustomGameEvent.CombatLogAbilityUsed]: (payload) => this.onAbilityUsed(payload),
        [CustomGameEvent.CombatLogClear]: (payload) => this.onClear(payload),
      },
      panelEvents: {
        btnToggle: { onactivate: () => this.onBtnToggle() },
        btnClear: { onactivate: () => this.onBtnClear() },
      },
    });

    this.grid = new Grid(GRID_COLUMNS);

    this.bindEvents();
    this.start();
    this.debug("init");
  }

  // ----- Event handlers -----

  onClear(payload: NetworkedData<CombatLogClear>): void {
    this.debug("onClear()", payload);
    this.clear();
  }

  onAbilityUsed(payload: NetworkedData<CombatLogAbilityUsed>): void {
    this.debug("onAbilityUsed()", payload);

    if (this.skipInvocations && isInvocationAbility(payload.ability)) {
      return;
    }

    this.addColumn(payload.ability);
  }

  onGridRowChange(i: number): void {
    this.debug("onGridRowChange()", i);
    this.addRow(i);
  }

  onBtnToggle(): void {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  onBtnClear(): void {
    this.clear();
  }

  // ----- Helpers -----

  bindEvents(): void {
    this.grid.onRowChange(this.onGridRowChange.bind(this));
  }

  startCapturing(): void {
    this.sendServer(CustomGameEvent.CombatLogCaptureStart, {});
  }

  stopCapturing(): void {
    this.sendServer(CustomGameEvent.CombatLogCaptureStop, {});
  }

  get isOpen(): boolean {
    return !this.panel.BHasClass(CssClass.Closed);
  }

  get skipInvocations(): boolean {
    return this.elements.skipInvocations.checked;
  }

  start(): void {
    this.startCapturing();
  }

  stop(): void {
    this.stopCapturing();
  }

  appendToGrid(abilityName: string): void {
    this.grid.add(abilityName);
  }

  clearGrid(): void {
    this.grid.clear();
  }

  resetRow(): void {
    this.row = undefined;
  }

  createRow(rowIndex: number): Panel {
    const id = rowId(rowIndex);
    const panel = $.CreatePanel("Panel", this.elements.contents, id);

    panel.AddClass(CssClass.Row);

    this.row = panel;

    return panel;
  }

  createAbilityIcon(abilityName: string): Panel {
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

  open(): void {
    new Sequence().removeClass(this.panel, CssClass.Closed).run();
  }

  close(): void {
    new Sequence().addClass(this.panel, CssClass.Closed).run();
  }

  addRow(rowIndex: number): void {
    new Sequence()
      .runFn(() => this.createRow(rowIndex))
      .scrollToBottom(this.elements.contents)
      .run();
  }

  addColumn(abilityName: string): void {
    new Sequence()
      .runFn(() => this.appendToGrid(abilityName))
      .runFn(() => this.createAbilityIcon(abilityName))
      .scrollToBottom(this.elements.contents)
      .run();
  }

  clear(): void {
    new Sequence()
      .runFn(() => this.clearGrid())
      .runFn(() => this.resetRow())
      .removeChildren(this.elements.contents)
      .run();
  }
}

(() => {
  new CombatLog();
})();
