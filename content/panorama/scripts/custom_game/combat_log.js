"use strict";

((global, context) => {
  const { Component } = context;
  const { Grid } = global;
  const { Sequence } = global.Sequence;
  const { IsInvocationAbility, CreateAbilityOrItemImage } = global.Util;
  const { EVENTS } = global.Const;

  const ROW_ID_PREFIX = "row";
  const ROW_CLASS = "row";

  const ICON_ID_PREFIX = "ability-icon";
  const ICON_CLASS = "ability-icon";
  const ICON_IMAGE_ID_SUFFIX = "image";
  const ICON_IMAGE_CLASS = "ability-image";
  const ICON_IMAGE_SCALING = "stretch-to-fit-y-preserve-aspect";

  const GRID_COLUMNS = 20;
  const CLOSED_CLASS = "closed";

  const rowId = (index) => `${ROW_ID_PREFIX}${index}`;
  const iconId = (row, col) => `${ICON_ID_PREFIX}_${row}_${col}`;
  const iconImageId = (iconId) => `${iconId}_${ICON_IMAGE_ID_SUFFIX}`;

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
      const id = rowId(this.grid.row);
      const panel = $.CreatePanel("Panel", this.$contents, id);

      panel.AddClass(ROW_CLASS);

      this.rowIdx = this.grid.row;
      this.$row = panel;

      this.debug("createRow()", { id, cell: this.grid.index });

      return panel;
    }

    createAbilityIcon(abilityName) {
      const id = iconId(this.grid.row, this.grid.col);
      const panel = $.CreatePanel("Panel", this.$row, id);

      panel.AddClass(ICON_CLASS);

      const imageId = iconImageId(id);
      const image = CreateAbilityOrItemImage(panel, imageId, abilityName);

      image.AddClass(ICON_IMAGE_CLASS);
      image.scaling = ICON_IMAGE_SCALING;

      this.debug("createAbilityIcon()", {
        cell: this.grid.index,
        ability: abilityName,
        iconId: panel.id,
        imageId: image.id,
        imageType: image.paneltype,
      });

      return panel;
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
        .RunFunction(() => this.createAbilityIcon(abilityName))
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

  context.combatLog = new CombatLog();
})(GameUI.CustomUIConfig(), this);
