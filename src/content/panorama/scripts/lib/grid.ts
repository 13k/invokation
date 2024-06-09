import type { Listeners as GenericListeners } from "./callbacks";
import { Callbacks } from "./callbacks";

enum Event {
  RowChange = "rowChange",
}

interface Payloads {
  [Event.RowChange]: number;
}

type Listeners = GenericListeners<Payloads>;

export class Grid<T> {
  #width: number;
  #data: T[][] = [];
  #cb: Callbacks<Payloads>;

  constructor(width: number) {
    this.#width = width;
    this.#cb = new Callbacks();
  }

  #addRow(): T[] {
    const row: T[] = [];

    this.#data.push(row);
    this.#cb.run(Event.RowChange, this.row);

    return row;
  }

  get row(): number {
    return Math.max(0, this.#data.length - 1);
  }

  get column(): number {
    const row = this.#data[this.row];

    return row ? Math.max(0, row.length - 1) : 0;
  }

  get index(): [number, number] {
    return [this.row, this.column];
  }

  get count(): number {
    return this.row * this.#width + this.column + 1;
  }

  onRowChange(cb: Listeners[Event.RowChange]): void {
    this.#cb.on(Event.RowChange, cb);
  }

  add(element: T): this {
    let row = this.getRow(-1);

    if (row == null || row.length === this.#width) {
      row = this.#addRow();
    }

    row.push(element);

    return this;
  }

  getRow(i: number): T[] | undefined {
    return this.#data.at(i);
  }

  get(i: number, j: number): T | undefined {
    const row = this.getRow(i);

    if (row == null) {
      return row;
    }

    return row.at(j);
  }

  clear(): void {
    this.#data = [];
  }
}
