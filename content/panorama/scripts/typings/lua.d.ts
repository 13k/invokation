declare namespace invk.Lua {
  interface Table {
    [key: string]: string | number | boolean | null | Sequence<Table> | Table;
  }

  /**
   * {@link https://www.lua.org/manual/5.4/manual.html#3.4.7}.
   */
  interface Sequence<Item> {
    [key: number]: Item;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Sequence<Item> {
    n?: number;
  }
}
