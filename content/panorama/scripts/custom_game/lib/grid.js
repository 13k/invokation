"use strict";

((global /*, context */) => {
  const { lodash: _ } = global;

  const idxFloor = _.partial(Math.max, 0);

  class Grid {
    constructor(width, height) {
      this.width = width;
      this.height = height;
      this._grid = [];
      this._callbacks = { rowChange: [] };
    }

    addRow() {
      const row = [];
      this._grid.push(row);
      this.onRowChange();

      return row;
    }

    onRowChange() {
      _.over(this._callbacks.rowChange)(this.row);
    }

    OnRowChange(fn) {
      this._callbacks.rowChange.push(fn);
    }

    get row() {
      return idxFloor(this._grid.length - 1);
    }

    get col() {
      const row = this._grid[this.row];

      return !row ? 0 : idxFloor(row.length - 1);
    }

    get index() {
      return [this.row, this.col];
    }

    get count() {
      return this.row * this.width + this.col + 1;
    }

    Add(item) {
      let row = this.Get(-1);

      if (!row || row.length === this.width) {
        row = this.addRow();
      }

      row.push(item);

      return this;
    }

    Get(i, j) {
      const row = _.nth(this._grid, i);

      if (!row || !j) {
        return row;
      }

      return _.nth(row, j);
    }

    Clear() {
      this._grid = [];
    }
  }

  global.Grid = Grid;
})(GameUI.CustomUIConfig(), this);
