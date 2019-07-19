"use strict";

(function(C) {
  function idxFloor(i) {
    return i < 0 ? 0 : i;
  }

  function idxMod(len, i) {
    if (len === 0) {
      return 0;
    }

    if (i < 0) {
      return len + i;
    }

    return i;
  }

  var module = function Grid(width, height) {
    this.width = width;
    this.height = height;

    this._grid = [];
    this._callbacks = { rowChange: [] };
  };

  module.prototype.addRow = function() {
    var row = [];
    this._grid.push(row);
    this.onRowChange();
    return row;
  };

  module.prototype.onRowChange = function() {
    var rowIdx = this.Row();

    $.Each(this._callbacks.rowChange, function(fn) {
      fn(rowIdx);
    });
  };

  module.prototype.OnRowChange = function(fn) {
    this._callbacks.rowChange.push(fn);
  };

  module.prototype.Row = function() {
    return idxFloor(this._grid.length - 1);
  };

  module.prototype.Column = function() {
    var row = this._grid[this.Row()];
    return !row ? 0 : idxFloor(row.length - 1);
  };

  module.prototype.Index = function() {
    return [this.Row(), this.Column()];
  };

  module.prototype.Count = function() {
    return this.Row() * this.width + this.Column() + 1;
  };

  module.prototype.Add = function(element) {
    var row = this.Get(-1);

    if (!row || row.length === this.width) {
      row = this.addRow();
    }

    row.push(element);
    return this;
  };

  module.prototype.Get = function(i, j) {
    var row = this._grid[idxMod(this._grid.length, i)];

    if (!row || !j) {
      return row;
    }

    return row[idxMod(row.length, j)];
  };

  module.prototype.Clear = function() {
    this._grid = [];
  };

  C.Grid = module;
})(GameUI.CustomUIConfig());
