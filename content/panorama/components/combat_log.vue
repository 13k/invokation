<layout lang="xml">
<root>
  <scripts>
    <include src="file://{resources}/components/combat_log.js" />
  </scripts>

  <styles>
    <include src="s2r://panorama/styles/dotastyles.css" />

    <include src="file://{resources}/components/combat_log.css" />
  </styles>

  <Panel class="root closed" hittest="false">
    <Panel id="combat-log" class="panel-transparent">
      <Panel id="contents" />

      <Panel class="bar">
        <ToggleButton class="thumb ExpandCollapseToggleButton" onactivate="combatLog.Toggle()">
          <Label class="title" text="#invokation_combat_log_title" hittest="false" />
        </ToggleButton>

        <Panel class="actions">
          <ToggleButton id="filter-invocations" class="action-item" text="#invokation_combat_log_filter_invocations" selected="true" />

          <Button class="action-item clear BlueButton" onactivate="combatLog.Clear()">
            <Label text="#invokation_combat_log_clear" hittest="false" />
          </Button>
        </Panel>
      </Panel>
    </Panel>
  </Panel>
</root>
</layout>

<script lang="ts">
import { Component } from "../scripts/lib/component";
import { CombatLogAbilityUsedEvent, CustomEvent } from "../scripts/lib/const/events";
import { CustomEvents } from "../scripts/lib/custom_events";
import { Grid } from "../scripts/lib/grid";
import { isInvocationAbility } from "../scripts/lib/invoker";
import { SerialSequence } from "../scripts/lib/sequence";

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

export default class CombatLog extends Component {
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

global.combatLog = new CombatLog();
</script>

<style lang="scss">
@use "../styles/variables";
@use "../styles/ui";

$cl-columns: 20;
$cl-height: 200px;
$cl-padding: 5px;
$cl-cell-size: 32px;
$cl-cell-margin: 2px;
$cl-scroll-width: 10px;
$cl-translate-y: -150px;
$cl-bar-height: 50px;
$cl-thumb-width: 19px;
$cl-thumb-height: 19px;
// $cl_width: 740px;
$cl-width: (($cl-cell-size + (2 * $cl-cell-margin)) * $cl-columns) + (2 * $cl-padding) +
  $cl-scroll-width;

.root {
  width: 100%;
  height: 100%;
}

#combat-log {
  flow-children: down;
  width: $cl-width;
  height: $cl-height;
  align: center top;
  transform: translateY(0);
  transition-delay: 0s;
  transition-timing-function: ease-in-out;
  transition-duration: 0.25s;
  transition-property: transform;
}

.root.closed #combat-log {
  transform: translateY($cl-translate-y);
}

#contents {
  width: 100%;
  height: fill-parent-flow(1);
  padding-top: $cl-padding;
  padding-right: $cl-padding;
  padding-left: $cl-padding;
  overflow: clip scroll;
  flow-children: down;
}

.row {
  flow-children: right;
}

.ability-icon {
  width: $cl-cell-size;
  height: $cl-cell-size;
  margin: $cl-cell-margin;
  background-color: #000d;
  box-shadow: #222 -2px -2px 4px 4px;
}

.ability-icon .ability-image {
  width: 100%;
  vertical-align: center;
}

.bar {
  width: 100%;
  height: $cl-bar-height;
  padding: 0 8px;
  background-color: #0003;
  border-top: 1px solid #222;
  flow-children: right;
}

.thumb {
  horizontal-align: left;
  vertical-align: center;
}

.thumb .TickBox {
  width: $cl-thumb-width;
  height: $cl-thumb-height;
  transform: rotateZ(180deg) translateY(-2px);
  wash-color: #d8d8d8;
}

.thumb:selected .TickBox {
  width: $cl-thumb-width;
  height: $cl-thumb-height;
  transform: rotateZ(0deg) translateY(2px);
  wash-color: #d8d8d8;
}

.thumb .TickBox:hover {
  wash-color: #fff;
}

.title {
  color: #fff;
  font-weight: bold;
  font-size: 16px;
  font-family: variables.$font-default;
  letter-spacing: 2px;
  text-transform: uppercase;
  text-overflow: shrink;
  text-shadow: 1px 1px 0 3 #0006;
  vertical-align: center;
  horizontal-align: left;
}

.actions {
  flow-children: right;
  height: 100%;
  horizontal-align: right;
}

.root.closed .actions {
  visibility: collapse;
}

.actions .action-item {
  margin-right: 8px;
  vertical-align: center;
}

.actions .button.clear {
  margin: 0;
}
</style>
