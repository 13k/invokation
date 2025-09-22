import type {
  CombatLogAbilityUsed,
  CombatLogClear,
  CombatLogToggle,
} from "@invokation/panorama-lib/custom_events";
import { CustomGameEvent, GameEvent } from "@invokation/panorama-lib/custom_events";
import { isInvocationAbility } from "@invokation/panorama-lib/dota2/invoker";
import { Grid } from "@invokation/panorama-lib/grid";
import { createAbilityOrItemImage } from "@invokation/panorama-lib/panorama";
import { Sequence } from "@invokation/panorama-lib/sequence";

import type { Elements } from "./component";
import { Component } from "./component";

export interface CombatLogElements extends Elements {
  contents: Panel;
  skipInvocations: Panel;
  btnClose: Button;
  btnClear: Button;
}

enum PanelId {
  RowPrefix = "row",
  IconPrefix = "icon",
  IconImagePrefix = "image",
}

enum CssClass {
  Closed = "closed",
  Row = "row",
  Icon = "icon",
  IconImage = "icon-image",
}

const ICON_IMAGE_SCALING = "stretch-to-fit-y-preserve-aspect";
const GRID_COLUMNS = 20;

const rowId = (index: number) => `${PanelId.RowPrefix}-${index}`;
const iconId = (row: number, col: number) => [PanelId.IconPrefix, row, col].join("-");
const iconImageId = (iconId: string) => `${iconId}-${PanelId.IconImagePrefix}`;

export type { CombatLog };

class CombatLog extends Component<CombatLogElements> {
  grid: Grid<string>;
  row: Panel | undefined;

  constructor() {
    super({
      elements: {
        contents: "contents",
        skipInvocations: "filter-invocations",
        btnClose: "btn-close",
        btnClear: "btn-clear",
      },
      customEvents: {
        [GameEvent.CombatLogToggle]: (payload) => this.onToggle(payload),
        [CustomGameEvent.CombatLogAbilityUsed]: (payload) => this.onAbilityUsed(payload),
        [CustomGameEvent.CombatLogClear]: (payload) => this.onClear(payload),
      },
      panelEvents: {
        btnClose: { onactivate: () => this.onBtnClose() },
        btnClear: { onactivate: () => this.onBtnClear() },
      },
    });

    this.grid = new Grid(GRID_COLUMNS);

    this.bindEvents();
    this.start();
    this.debug("init");
  }

  onToggle(_payload: CombatLogToggle): void {
    this.toggle();
  }

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

  onBtnClose(): void {
    this.close();
  }

  onBtnClear(): void {
    this.clear();
  }

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

  open(): void {
    this.debug("open()");

    this.panel.RemoveClass(CssClass.Closed);
    this.sendClientSide(GameEvent.CombatLogState, { open: true });
  }

  close(): void {
    this.debug("close()");

    this.panel.AddClass(CssClass.Closed);
    this.sendClientSide(GameEvent.CombatLogState, { open: false });
  }

  toggle(): void {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
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
