import { Component } from "./lib/component";
import { CombatLogAbilityUsedEvent, CustomEvent } from "./lib/const/events";
import { CustomEvents } from "./lib/custom_events";
import { Grid } from "./lib/grid";
import { isInvocationAbility } from "./lib/invoker";
import { SerialSequence } from "./lib/sequence";

export type Inputs = never;
export type Outputs = never;

interface Elements {
  contents: Panel;
  filterInvocations: ToggleButton;
}

const DYN_ELEMS = {
  ROW: {
    idPrefix: "row",
    cssClass: "row",
  },
  ICON: {
    idPrefix: "ability-icon",
    cssClass: "ability-icon",
  },
  ICON_IMAGE: {
    idSuffix: "image",
    cssClass: "ability-image",
    scaling: "stretch-to-fit-y-preserve-aspect",
  },
};

const GRID_COLUMNS = 20;
const CLOSED_CLASS = "closed";

const rowID = (index: number) => `${DYN_ELEMS.ROW.idPrefix}-${index}`;
const iconID = (row: number, col: number) => `${DYN_ELEMS.ICON.idPrefix}-${row}-${col}`;
const iconImageID = (iconID: string) => `${iconID}-${DYN_ELEMS.ICON_IMAGE.idSuffix}`;

export class CombatLog extends Component {
  #elements: Elements;
  #grid: Grid<string>;
  #rowIdx = -1;
  #row: Panel | null = null;

  constructor() {
    super();

    this.#elements = this.findAll<Elements>({
      contents: "contents",
      filterInvocations: "filter-invocations",
    });

    this.onCustomEvent(CustomEvent.COMBAT_LOG_CLEAR, this.onClear);
    this.onCustomEvent(CustomEvent.COMBAT_LOG_ABILITY_USED, this.onAbilityUsed);

    this.#grid = new Grid(GRID_COLUMNS);

    this.resetRow();
    this.start();
    this.debug("init");
  }

  // ----- Event handlers -----

  onClear(): void {
    this.debug("onClear()");
    this.clear();
  }

  onAbilityUsed(payload: NetworkedData<CombatLogAbilityUsedEvent>): void {
    this.debug("onAbilityUsed()", payload);

    const { ability } = payload;

    if (this.isFilteringInvocations() && isInvocationAbility(ability)) {
      return;
    }

    this.addColumn(ability);
  }

  // ----- Helpers -----

  startCapturing(): void {
    CustomEvents.sendServer(CustomEvent.COMBAT_LOG_CAPTURE_START);
  }

  stopCapturing(): void {
    CustomEvents.sendServer(CustomEvent.COMBAT_LOG_CAPTURE_STOP);
  }

  isOpen(): boolean {
    return !this.ctx.BHasClass(CLOSED_CLASS);
  }

  isFilteringInvocations(): boolean {
    return this.#elements.filterInvocations.checked;
  }

  start(): void {
    this.startCapturing();
  }

  stop(): void {
    this.stopCapturing();
  }

  appendToGrid(abilityName: string): void {
    this.#grid.add(abilityName);

    if (this.#grid.row !== this.#rowIdx) {
      this.addRow();
    }
  }

  clearGrid(): void {
    this.#grid.clear();
  }

  resetRow(): void {
    this.#rowIdx = -1;
    this.#row = null;
  }

  createRow(): void {
    const { cssClass } = DYN_ELEMS.ROW;

    const id = rowID(this.#grid.row);
    const panel = this.createPanel(this.#elements.contents, id, {
      classes: [cssClass],
    });

    this.#rowIdx = this.#grid.row;
    this.#row = panel;

    this.debug("createRow()", { id, cell: this.#grid.index });
  }

  createGridItem(abilityName: string): void {
    if (this.#row == null) {
      throw Error(`Tried to create grid item without a row`);
    }

    const { cssClass } = DYN_ELEMS.ICON;

    const id = iconID(this.#grid.row, this.#grid.col);
    const panel = this.createPanel(this.#row, id, {
      classes: [cssClass],
    });

    const iconImage = this.createGridItemImage(panel, abilityName);

    this.debug("createAbility()", {
      cell: this.#grid.index,
      ability: abilityName,
      iconId: panel.id,
      imageId: iconImage.id,
      imageType: iconImage.paneltype,
    });
  }

  createGridItemImage(parent: Panel, abilityName: string): ItemImage | AbilityImage {
    const { cssClass, scaling } = DYN_ELEMS.ICON_IMAGE;

    const id = iconImageID(parent.id);

    return this.createAbilityOrItemImage(parent, id, abilityName, {
      classes: [cssClass],
      props: { scaling },
    });
  }

  // ----- Action runners -----

  open(): void {
    new SerialSequence().RemoveClass(this.ctx, CLOSED_CLASS).run();
  }

  close(): void {
    new SerialSequence().AddClass(this.ctx, CLOSED_CLASS).run();
  }

  addRow(): void {
    new SerialSequence()
      .RunFunction(() => this.createRow())
      .ScrollToBottom(this.#elements.contents)
      .run();
  }

  addColumn(abilityName: string): void {
    new SerialSequence()
      .RunFunction(() => this.appendToGrid(abilityName))
      .RunFunction(() => this.createGridItem(abilityName))
      .ScrollToBottom(this.#elements.contents)
      .run();
  }

  clear(): void {
    new SerialSequence()
      .RunFunction(() => this.clearGrid())
      .RunFunction(() => this.resetRow())
      .RemoveChildren(this.#elements.contents)
      .run();
  }

  toggle(): void {
    if (this.isOpen()) {
      return this.close();
    }

    this.open();
  }
}

//   context.combatLog = new CombatLog();
// })(GameUI.CustomUIConfig(), this);
