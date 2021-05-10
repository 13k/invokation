import type { ComboKeyValues } from "../combo";
import type { AbilitiesKeyValues, ShopCategory } from "../dota";

export enum Table {
  Invokation = "invokation",
}

// --------------------------------------------------
// Global augmentation
// --------------------------------------------------

declare global {
  interface CustomNetTableDeclarations {
    [Table.Invokation]: InvokationTable;
  }
}

// --------------------------------------------------
// Helper types
// --------------------------------------------------

export type TableName = keyof CustomNetTableDeclarations;
export type TableKey<N extends TableName> = keyof CustomNetTableDeclarations[N];
export type TableValue<
  N extends TableName,
  K extends TableKey<N>
> = CustomNetTableDeclarations[N][K];
export type TableEntries<N extends TableName> = {
  [K in TableKey<N>]: {
    key: K;
    value: NetworkedData<TableValue<N, K>>;
  };
}[TableKey<N>][];

export type Listener<N extends TableName> = (
  table: N,
  key: TableKey<N>,
  value: NetworkedData<TableValue<N, TableKey<N>>>
) => void;

export interface ChangeEvent<N extends TableName, K extends TableKey<N>> {
  table: N;
  key: K;
  value: NetworkedData<TableValue<N, K>>;
}

export type ChangeListener<N extends TableName, K extends TableKey<N>> = (
  event: ChangeEvent<N, K>
) => void;

export type Callbacks<N extends TableName> = {
  [K in TableKey<N>]: ChangeEvent<N, K>;
};

// --------------------------------------------------
// Invokation table
// --------------------------------------------------

export enum InvokationTableKey {
  Combos = "combos",
  AbilitiesKeyValues = "abilities_kv",
  ShopItems = "shop_items",
}

export interface InvokationCombos {
  [comboId: string]: ComboKeyValues;
}

export type InvokationShopItems = {
  [Category in ShopCategory]: string[];
};

export interface InvokationTable {
  [InvokationTableKey.Combos]: InvokationCombos;
  [InvokationTableKey.AbilitiesKeyValues]: AbilitiesKeyValues;
  [InvokationTableKey.ShopItems]: InvokationShopItems;
}
