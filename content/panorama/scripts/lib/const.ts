import type { Properties as ComboProperties } from "./combo";
import type { ShopCategory, ShopCategoryGroup } from "./dota2";

const { Combo, Dota2 } = CustomUIConfig;

const META = {
  VERSION: "v0.4.7",
  URL: "https://github.com/13k/invokation",
  CHANGELOG_URL: "https://github.com/13k/invokation/blob/master/CHANGELOG.md",
};

const INVOKER = {
  ORB_ABILITIES: {
    [Dota2.Ability.Quas]: Dota2.Ability.Quas,
    [Dota2.Ability.Wex]: Dota2.Ability.Wex,
    [Dota2.Ability.Exort]: Dota2.Ability.Exort,
  },
  SPELL_ABILITIES: {
    [Dota2.Ability.ColdSnap]: Dota2.Ability.ColdSnap,
    [Dota2.Ability.GhostWalk]: Dota2.Ability.GhostWalk,
    [Dota2.Ability.IceWall]: Dota2.Ability.IceWall,
    [Dota2.Ability.Emp]: Dota2.Ability.Emp,
    [Dota2.Ability.Tornado]: Dota2.Ability.Tornado,
    [Dota2.Ability.Alacrity]: Dota2.Ability.Alacrity,
    [Dota2.Ability.SunStrike]: Dota2.Ability.SunStrike,
    [Dota2.Ability.ForgeSpirit]: Dota2.Ability.ForgeSpirit,
    [Dota2.Ability.ChaosMeteor]: Dota2.Ability.ChaosMeteor,
    [Dota2.Ability.DeafeningBlast]: Dota2.Ability.DeafeningBlast,
  },
  TALENT_ABILITIES: [
    Dota2.Ability.Talent_L10_RIGHT,
    Dota2.Ability.Talent_L10_LEFT,
    Dota2.Ability.Talent_L15_RIGHT,
    Dota2.Ability.Talent_L15_LEFT,
    Dota2.Ability.Talent_L20_RIGHT,
    Dota2.Ability.Talent_L20_LEFT,
    Dota2.Ability.Talent_L25_RIGHT,
    Dota2.Ability.Talent_L25_LEFT,
  ],
};

const COMBO_PROPERTIES: { [K in keyof ComboProperties]: ComboProperties[K][] } = {
  [Combo.PropertyName.Specialty]: [Combo.Specialty.QuasWex, Combo.Specialty.QuasExort],
  [Combo.PropertyName.Stance]: [Combo.Stance.Defensive, Combo.Stance.Offensive],
  [Combo.PropertyName.DamageRating]: [
    Combo.DamageRating.None,
    Combo.DamageRating.Light,
    Combo.DamageRating.Considerable,
    Combo.DamageRating.Lethal,
    Combo.DamageRating.Exceptional,
    Combo.DamageRating.Brutal,
  ],
  [Combo.PropertyName.DifficultyRating]: [
    Combo.DifficultyRating.VeryEasy,
    Combo.DifficultyRating.Easy,
    Combo.DifficultyRating.Medium,
    Combo.DifficultyRating.Hard,
    Combo.DifficultyRating.LiterallyUnplayable,
  ],
};

const SHOP_CATEGORIES: Record<ShopCategoryGroup, ShopCategory[]> = {
  [Dota2.ShopCategoryGroup.Basics]: [
    Dota2.ShopCategory.Consumables,
    Dota2.ShopCategory.Attributes,
    Dota2.ShopCategory.WeaponsArmor,
    Dota2.ShopCategory.Misc,
    Dota2.ShopCategory.SecretShop,
  ],
  [Dota2.ShopCategoryGroup.Upgrades]: [
    Dota2.ShopCategory.Basics,
    Dota2.ShopCategory.Support,
    Dota2.ShopCategory.Magics,
    Dota2.ShopCategory.Defense,
    Dota2.ShopCategory.Weapons,
    Dota2.ShopCategory.Artifacts,
  ],
};

const module = {
  META,
  INVOKER,
  COMBO_PROPERTIES,
  SHOP_CATEGORIES,
};

export type Const = typeof module;

CustomUIConfig.Const = module;
