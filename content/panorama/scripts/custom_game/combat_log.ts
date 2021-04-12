// const { Component } = context;
// const { Grid } = global;
// const { Sequence } = global.Sequence;
// const { IsInvocationAbility } = global.Util;
// const { EVENTS } = global.Const;

import { Component } from "./lib/component";

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

const rowId = (index) => `${DYN_ELEMS.ROW.idPrefix}-${index}`;
const iconId = (row, col) => `${DYN_ELEMS.ICON.idPrefix}-${row}-${col}`;
const iconImageId = (iconId) => `${iconId}-${DYN_ELEMS.ICON_IMAGE.idSuffix}`;

class CombatLog extends Component {
  constructor() {
    super({
      elements: {
        contents: "contents",
        filterInvocations: "filter-invocations",
      },
      customEvents: {
        "!COMBAT_LOG_ABILITY_USED": "onAbilityUsed",
        "!COMBAT_LOG_CLEAR": "onClear",
      },
    });

    this.grid = new Grid(GRID_COLUMNS);

    this.resetRow();
    this.start();
    this.debug("init");
  }

  // ----- Event handlers -----

  onClear() {
    this.debug("onClear()");
    this.clear();
  }

  onAbilityUsed(payload) {
    this.debug("onAbilityUsed()", payload);

    const { ability } = payload;

    if (this.isFilteringInvocations() && IsInvocationAbility(ability)) {
      return;
    }

    this.addColumn(ability);
  }

  // ----- Helpers -----

  startCapturing() {
    this.sendServer(EVENTS.COMBAT_LOG_CAPTURE_START);
  }

  stopCapturing() {
    this.sendServer(EVENTS.COMBAT_LOG_CAPTURE_STOP);
  }

  isOpen() {
    return !this.$ctx.BHasClass(CLOSED_CLASS);
  }

  isFilteringInvocations() {
    return this.$filterInvocations.checked;
  }

  start() {
    this.startCapturing();
  }

  stop() {
    this.stopCapturing();
  }

  appendToGrid(abilityName) {
    this.grid.Add(abilityName);

    if (this.grid.row !== this.rowIdx) {
      this.addRow();
    }
  }

  clearGrid() {
    this.grid.Clear();
  }

  resetRow() {
    this.rowIdx = -1;
    this.$row = null;
  }

  createRow() {
    const { cssClass } = DYN_ELEMS.ROW;

    const id = rowId(this.grid.row);
    const panel = this.createPanel(this.$contents, id, {
      classes: [cssClass],
    });

    this.rowIdx = this.grid.row;
    this.$row = panel;

    this.debug("createRow()", { id, cell: this.grid.index });

    return panel;
  }

  createGridItem(abilityName) {
    const { cssClass } = DYN_ELEMS.ICON;

    const id = iconId(this.grid.row, this.grid.col);
    const panel = this.createPanel(this.$row, id, {
      classes: [cssClass],
    });

    const iconImage = this.createGridItemImage(panel, abilityName);

    this.debug("createAbility()", {
      cell: this.grid.index,
      ability: abilityName,
      iconId: panel.id,
      imageId: iconImage.id,
      imageType: iconImage.paneltype,
    });

    return panel;
  }

  createGridItemImage(parent, abilityName) {
    const { cssClass, scaling } = DYN_ELEMS.ICON_IMAGE;

    const id = iconImageId(parent.id);

    return this.createAbilityOrItemImage(parent, id, abilityName, {
      classes: [cssClass],
      props: { scaling },
    });
  }

  // ----- Action runners -----

  open() {
    return new Sequence().RemoveClass(this.$ctx, CLOSED_CLASS).Start();
  }

  close() {
    return new Sequence().AddClass(this.$ctx, CLOSED_CLASS).Start();
  }

  addRow() {
    return new Sequence()
      .RunFunction(() => this.createRow())
      .ScrollToBottom(this.$contents)
      .Start();
  }

  addColumn(abilityName) {
    return new Sequence()
      .RunFunction(() => this.appendToGrid(abilityName))
      .RunFunction(() => this.createGridItem(abilityName))
      .ScrollToBottom(this.$contents)
      .Start();
  }

  clear() {
    return new Sequence()
      .RunFunction(() => this.clearGrid())
      .RunFunction(() => this.resetRow())
      .RemoveChildren(this.$contents)
      .Start();
  }

  // ----- UI methods -----

  Toggle() {
    if (this.isOpen()) {
      return this.close();
    }

    return this.open();
  }

  Clear() {
    return this.clear();
  }
}

//   context.combatLog = new CombatLog();
// })(GameUI.CustomUIConfig(), this);
