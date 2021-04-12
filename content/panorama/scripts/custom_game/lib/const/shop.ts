export enum ShopGroup {
  Basics = "Basics",
  Upgrades = "Upgrades",
}

export enum ShopCategory {
  Consumables = "consumables",
  Attributes = "attributes",
  WeaponsArmor = "weapons_armor",
  Misc = "misc",
  SecretShop = "secret_shop",
  Basics = "basics",
  Support = "support",
  Magics = "magics",
  Defense = "defense",
  Weapons = "weapons",
  Artifacts = "artifacts",
}

type ShopCategories = {
  [Property in keyof typeof ShopGroup]: ShopCategory[];
};

export const SHOP_CATEGORIES: ShopCategories = {
  [ShopGroup.Basics]: [
    ShopCategory.Consumables,
    ShopCategory.Attributes,
    ShopCategory.WeaponsArmor,
    ShopCategory.Misc,
    ShopCategory.SecretShop,
  ],
  [ShopGroup.Upgrades]: [
    ShopCategory.Basics,
    ShopCategory.Support,
    ShopCategory.Magics,
    ShopCategory.Defense,
    ShopCategory.Weapons,
    ShopCategory.Artifacts,
  ],
};
