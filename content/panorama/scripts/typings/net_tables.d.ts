declare namespace invk.NetTables {
  type TableName = keyof CustomNetTableDeclarations;
  type TableKey<N extends TableName> = keyof CustomNetTableDeclarations[N];
  type TableValue<N extends TableName, K extends TableKey<N>> = CustomNetTableDeclarations[N][K];
  type TableEntries<N extends TableName> = {
    [K in TableKey<N>]: {
      key: K;
      value: NetworkedData<TableValue<N, K>>;
    };
  }[TableKey<N>][];

  type Listener<N extends TableName> = (
    table: N,
    key: TableKey<N>,
    value: NetworkedData<TableValue<N, TableKey<N>>>
  ) => void;

  interface ChangeEvent<N extends TableName, K extends TableKey<N>> {
    table: N;
    key: K;
    value: NetworkedData<TableValue<N, K>>;
  }

  type ChangeListener<N extends TableName, K extends TableKey<N>> = (
    event: ChangeEvent<N, K>
  ) => void;

  type Callbacks<N extends TableName> = {
    [K in TableKey<N>]: ChangeEvent<N, K>;
  };

  const enum Name {
    SELECTION = "selection",
    INVOKATION = "invokation",
  }

  interface Selection {
    __unused: never;
  }

  const enum InvokationKey {
    Combos = "combos",
    AbilitiesKeyValues = "abilities_kv",
    ShopItems = "shop_items",
  }

  interface Invokation {
    [InvokationKey.Combos]: { [comboId: string]: invk.Combo.ComboKeyValues };
    [InvokationKey.AbilitiesKeyValues]: dota.AbilitiesKeyValues;
    [InvokationKey.ShopItems]: boolean;
  }
}

interface CustomNetTableDeclarations {
  [invk.NetTables.Name.INVOKATION]: invk.NetTables.Invokation;
  [invk.NetTables.Name.SELECTION]: invk.NetTables.Selection;
}
