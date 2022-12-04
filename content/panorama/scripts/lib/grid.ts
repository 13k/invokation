import type { Callbacks as TCallbacks } from "./callbacks";

export type Callback = (rowIdx: number) => void;

const {
  lodash: _,

  Callbacks,
} = CustomUIConfig;

enum Event {
  RowChange = "rowChange",
}

class Grid<T> {
  private data: T[][] = [];
  private callbacks: TCallbacks;

  constructor(private width: number) {
    this.callbacks = new Callbacks();
  }

  private addRow(): T[] {
    const row: T[] = [];

    this.data.push(row);
    this.callbacks.run(Event.RowChange, this.row);

    return row;
  }

  get row(): number {
    return Math.max(0, this.data.length - 1);
  }

  get column(): number {
    const row = this.data[this.row];

    return !row ? 0 : Math.max(0, row.length - 1);
  }

  get index(): [number, number] {
    return [this.row, this.column];
  }

  get count(): number {
    return this.row * this.width + this.column + 1;
  }

  onRowChange(cb: Callback): void {
    this.callbacks.on(Event.RowChange, cb);
  }

  add(element: T): this {
    let row = this.getRow(-1);

    if (!row || row.length === this.width) {
      row = this.addRow();
    }

    row.push(element);

    return this;
  }

  getRow(i: number): T[] | undefined {
    return _.nth(this.data, i);
  }

  get(i: number, j: number): T | undefined {
    const row = this.getRow(i);

    if (!row) {
      return row;
    }

    return _.nth(row, j);
  }

  clear(): void {
    this.data = [];
  }
}

export type { Grid };

CustomUIConfig.Grid = Grid;
