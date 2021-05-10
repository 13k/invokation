import { nth } from "lodash";

import { Callbacks } from "./callbacks";

const idxFloor = (i: number): number => Math.max(0, i);

interface RowChangeEvent {
  row: number;
}

interface GridCallbacks {
  "row-change": RowChangeEvent;
}

export class Grid<T> {
  #grid: T[][];
  #cb: Callbacks<GridCallbacks>;

  constructor(public width: number) {
    this.#grid = [];
    this.#cb = new Callbacks();
  }

  private _addRow(): T[] {
    const row: T[] = [];

    this.#grid.push(row);
    this._onRowChange();

    return row;
  }

  private _onRowChange() {
    this.#cb.run("row-change", { row: this.row });
  }

  onRowChange(cb: (ev: RowChangeEvent) => void): void {
    this.#cb.on("row-change", cb);
  }

  get row(): number {
    return idxFloor(this.#grid.length - 1);
  }

  get col(): number {
    const row = this.#grid[this.row];

    return !row ? 0 : idxFloor(row.length - 1);
  }

  get index(): [number, number] {
    return [this.row, this.col];
  }

  get count(): number {
    return this.row * this.width + this.col + 1;
  }

  add(item: T): this {
    let row = this.getRow(-1);

    if (!row || row.length === this.width) {
      row = this._addRow();
    }

    row.push(item);

    return this;
  }

  getRow(i: number): T[] | undefined {
    return nth(this.#grid, i);
  }

  get(i: number, j: number): T | undefined {
    const row = this.getRow(i);

    if (!row) {
      return undefined;
    }

    return nth(row, j);
  }

  clear(): this {
    this.#grid = [];

    return this;
  }
}
