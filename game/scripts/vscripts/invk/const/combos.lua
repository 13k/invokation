local S = require("invk.combo.spec")
local talents = require("invk.dota2.talents")

local T = talents.Talents

--- Combo specifications.
--- @type invk.combo.ComboSpec[]
local M = {}

M[#M + 1] = {
  id = 1,
  specialty = S.Specialty.QuasWex,
  stance = S.Stance.Defensive,
  damage_rating = S.DamageRating.None,
  difficulty_rating = S.DifficultyRating.Easy,
  hero_level = 2,
  orbs = { 1, 1, 0 },
  talents = T.NONE,
  gold = 0,
  items = {
    "item_null_talisman",
  },
  tags = { "laning-phase" },
  sequence = {
    { id = 1, name = "invoker_cold_snap", required = true, next = { 2 } },
    { id = 2, name = "invoker_tornado", required = true },
  },
}

M[#M + 1] = {
  id = 2,
  specialty = S.Specialty.QuasWex,
  stance = S.Stance.Defensive,
  damage_rating = S.DamageRating.None,
  difficulty_rating = S.DifficultyRating.Easy,
  hero_level = 2,
  orbs = { 1, 1, 0 },
  talents = T.NONE,
  gold = 0,
  items = {
    "item_null_talisman",
  },
  tags = { "laning-phase" },
  sequence = {
    { id = 1, name = "invoker_tornado", required = true, next = { 2 } },
    { id = 2, name = "invoker_quas", required = true, next = { 3 } },
    { id = 3, name = "invoker_quas", required = true, next = { 4 } },
    { id = 4, name = "invoker_wex", required = true, next = { 5 } },
    { id = 5, name = "invoker_invoke", required = true, next = { 6, 9 } },
    { id = 6, name = "invoker_wex", required = false, next = { 7 } },
    { id = 7, name = "invoker_wex", required = false, next = { 8 } },
    { id = 8, name = "invoker_wex", required = false, next = { 9 } },
    { id = 9, name = "invoker_ghost_walk", required = true },
  },
}

M[#M + 1] = {
  id = 3,
  specialty = S.Specialty.QuasWex,
  stance = S.Stance.Offensive,
  damage_rating = S.DamageRating.Light,
  difficulty_rating = S.DifficultyRating.Easy,
  hero_level = 2,
  orbs = { 1, 1, 0 },
  talents = T.NONE,
  gold = 0,
  items = {
    "item_null_talisman",
  },
  tags = { "laning-phase" },
  sequence = {
    { id = 1, name = "invoker_emp", required = true, next = { 2 } },
    { id = 2, name = "invoker_tornado", required = true },
  },
}

M[#M + 1] = {
  id = 4,
  specialty = S.Specialty.QuasExort,
  stance = S.Stance.Offensive,
  damage_rating = S.DamageRating.Light,
  difficulty_rating = S.DifficultyRating.Easy,
  hero_level = 2,
  orbs = { 1, 0, 1 },
  talents = T.NONE,
  gold = 0,
  items = {
    "item_null_talisman",
  },
  tags = { "laning-phase" },
  sequence = {
    { id = 1, name = "invoker_forge_spirit", required = true, next = { 2 } },
    { id = 2, name = "invoker_cold_snap", required = true },
  },
}

M[#M + 1] = {
  id = 5,
  specialty = S.Specialty.QuasExort,
  stance = S.Stance.Offensive,
  damage_rating = S.DamageRating.Light,
  difficulty_rating = S.DifficultyRating.Easy,
  hero_level = 3,
  orbs = { 1, 1, 1 },
  talents = T.NONE,
  gold = 0,
  items = {
    "item_null_talisman",
  },
  tags = { "laning-phase" },
  sequence = {
    { id = 1, name = "invoker_forge_spirit", required = true, next = { 2 } },
    { id = 2, name = "invoker_alacrity", required = true },
  },
}

M[#M + 1] = {
  id = 6,
  specialty = S.Specialty.QuasExort,
  stance = S.Stance.Offensive,
  damage_rating = S.DamageRating.Considerable,
  difficulty_rating = S.DifficultyRating.Normal,
  hero_level = 6,
  orbs = { 2, 1, 3 },
  talents = T.NONE,
  gold = 0,
  items = {
    "item_null_talisman",
    "item_null_talisman",
  },
  tags = { "solo-pick" },
  sequence = {
    { id = 1, name = "invoker_tornado", required = true, next = { 2 } },
    { id = 2, name = "invoker_chaos_meteor", required = true, next = { 3 } },
    { id = 3, name = "invoker_deafening_blast", required = true },
  },
}

M[#M + 1] = {
  id = 7,
  specialty = S.Specialty.QuasExort,
  stance = S.Stance.Offensive,
  damage_rating = S.DamageRating.Lethal,
  difficulty_rating = S.DifficultyRating.Hard,
  hero_level = 6,
  orbs = { 2, 1, 3 },
  talents = T.NONE,
  gold = 0,
  items = {
    "item_null_talisman",
    "item_null_talisman",
  },
  tags = { "solo-pick" },
  sequence = {
    { id = 1, name = "invoker_tornado", required = true, next = { 2 } },
    { id = 2, name = "invoker_sun_strike", required = true, next = { 3 } },
    { id = 3, name = "invoker_deafening_blast", required = true },
  },
}

M[#M + 1] = {
  id = 8,
  specialty = S.Specialty.QuasExort,
  stance = S.Stance.Offensive,
  damage_rating = S.DamageRating.Considerable,
  difficulty_rating = S.DifficultyRating.Normal,
  hero_level = 6,
  orbs = { 2, 1, 3 },
  talents = T.NONE,
  gold = 0,
  items = {
    "item_null_talisman",
    "item_null_talisman",
  },
  tags = { "solo-pick" },
  sequence = {
    { id = 1, name = "invoker_deafening_blast", required = true, next = { 2 } },
    { id = 2, name = "invoker_cold_snap", required = true, next = { 3 } },
    { id = 3, name = "invoker_chaos_meteor", required = true },
  },
}

M[#M + 1] = {
  id = 9,
  specialty = S.Specialty.QuasExort,
  stance = S.Stance.Offensive,
  damage_rating = S.DamageRating.Considerable,
  difficulty_rating = S.DifficultyRating.Hard,
  hero_level = 6,
  orbs = { 2, 1, 3 },
  talents = T.NONE,
  gold = 0,
  items = {
    "item_null_talisman",
    "item_null_talisman",
  },
  tags = { "solo-pick" },
  sequence = {
    { id = 1, name = "invoker_ice_wall", required = true, next = { 2 } },
    { id = 2, name = "invoker_chaos_meteor", required = true, next = { 3 } },
    { id = 3, name = "invoker_cold_snap", required = true },
  },
}

M[#M + 1] = {
  id = 10,
  specialty = S.Specialty.QuasExort,
  stance = S.Stance.Offensive,
  damage_rating = S.DamageRating.Considerable,
  difficulty_rating = S.DifficultyRating.Hard,
  hero_level = 6,
  orbs = { 2, 1, 3 },
  talents = T.NONE,
  gold = 0,
  items = {
    "item_null_talisman",
    "item_null_talisman",
    "item_null_talisman",
  },
  tags = { "solo-pick" },
  sequence = {
    { id = 1, name = "invoker_ice_wall", required = true, next = { 2 } },
    { id = 2, name = "invoker_chaos_meteor", required = true, next = { 3 } },
    { id = 3, name = "invoker_deafening_blast", required = true },
  },
}

M[#M + 1] = {
  id = 11,
  specialty = S.Specialty.QuasExort,
  stance = S.Stance.Offensive,
  damage_rating = S.DamageRating.Lethal,
  difficulty_rating = S.DifficultyRating.Hard,
  hero_level = 6,
  orbs = { 2, 1, 3 },
  talents = T.NONE,
  gold = 0,
  items = {
    "item_null_talisman",
    "item_null_talisman",
  },
  tags = { "solo-pick" },
  sequence = {
    { id = 1, name = "invoker_ice_wall", required = true, next = { 2 } },
    { id = 2, name = "invoker_chaos_meteor", required = true, next = { 3 } },
    { id = 3, name = "invoker_sun_strike", required = true },
  },
}

M[#M + 1] = {
  id = 12,
  specialty = S.Specialty.QuasExort,
  stance = S.Stance.Offensive,
  damage_rating = S.DamageRating.Considerable,
  difficulty_rating = S.DifficultyRating.Hard,
  hero_level = 6,
  orbs = { 2, 2, 2 },
  talents = T.NONE,
  gold = 0,
  items = {
    "item_null_talisman",
    "item_null_talisman",
  },
  tags = { "solo-pick" },
  sequence = {
    { id = 1, name = "invoker_ice_wall", required = true, next = { 2 } },
    { id = 2, name = "invoker_chaos_meteor", required = true, next = { 3 } },
    { id = 3, name = "invoker_emp", required = true },
  },
}

M[#M + 1] = {
  id = 13,
  specialty = S.Specialty.QuasWex,
  stance = S.Stance.Offensive,
  damage_rating = S.DamageRating.Considerable,
  difficulty_rating = S.DifficultyRating.Normal,
  hero_level = 6,
  orbs = { 3, 2, 1 },
  talents = T.NONE,
  gold = 0,
  items = {
    "item_null_talisman",
    "item_null_talisman",
  },
  tags = { "solo-pick" },
  sequence = {
    { id = 1, name = "invoker_cold_snap", required = true, next = { 2 } },
    { id = 2, name = "invoker_alacrity", required = true, next = { 3 } },
    { id = 3, name = "invoker_deafening_blast", required = true },
  },
}

M[#M + 1] = {
  id = 14,
  specialty = S.Specialty.QuasWex,
  stance = S.Stance.Offensive,
  damage_rating = S.DamageRating.Considerable,
  difficulty_rating = S.DifficultyRating.Normal,
  hero_level = 6,
  orbs = { 3, 2, 1 },
  talents = T.NONE,
  gold = 0,
  items = {
    "item_null_talisman",
    "item_null_talisman",
  },
  tags = { "solo-pick" },
  sequence = {
    { id = 1, name = "invoker_ice_wall", required = true, next = { 2 } },
    { id = 2, name = "invoker_alacrity", required = true, next = { 3 } },
    { id = 3, name = "invoker_cold_snap", required = true },
  },
}

M[#M + 1] = {
  id = 15,
  specialty = S.Specialty.QuasWex,
  stance = S.Stance.Offensive,
  damage_rating = S.DamageRating.Considerable,
  difficulty_rating = S.DifficultyRating.Normal,
  hero_level = 6,
  orbs = { 3, 2, 1 },
  talents = T.NONE,
  gold = 0,
  items = {
    "item_null_talisman",
    "item_null_talisman",
  },
  tags = { "solo-pick" },
  sequence = {
    { id = 1, name = "invoker_ice_wall", required = true, next = { 2 } },
    { id = 2, name = "invoker_alacrity", required = true, next = { 3 } },
    { id = 3, name = "invoker_deafening_blast", required = true },
  },
}

M[#M + 1] = {
  id = 16,
  specialty = S.Specialty.QuasExort,
  stance = S.Stance.Offensive,
  damage_rating = S.DamageRating.Considerable,
  difficulty_rating = S.DifficultyRating.Normal,
  hero_level = 6,
  orbs = { 2, 1, 3 },
  talents = T.NONE,
  gold = 0,
  items = {
    "item_null_talisman",
    "item_null_talisman",
  },
  tags = { "solo-pick" },
  sequence = {
    { id = 1, name = "invoker_ice_wall", required = true, next = { 2 } },
    { id = 2, name = "invoker_alacrity", required = true, next = { 3 } },
    { id = 3, name = "invoker_sun_strike", required = true },
  },
}

M[#M + 1] = {
  id = 17,
  specialty = S.Specialty.QuasExort,
  stance = S.Stance.Offensive,
  damage_rating = S.DamageRating.Considerable,
  difficulty_rating = S.DifficultyRating.Normal,
  hero_level = 6,
  orbs = { 2, 2, 2 },
  talents = T.NONE,
  gold = 0,
  items = {
    "item_null_talisman",
    "item_null_talisman",
  },
  tags = { "solo-pick" },
  sequence = {
    { id = 1, name = "invoker_ice_wall", required = true, next = { 2 } },
    { id = 2, name = "invoker_alacrity", required = true, next = { 3 } },
    { id = 3, name = "invoker_emp", required = true },
  },
}

M[#M + 1] = {
  id = 18,
  specialty = S.Specialty.QuasWex,
  stance = S.Stance.Offensive,
  damage_rating = S.DamageRating.Considerable,
  difficulty_rating = S.DifficultyRating.Hard,
  hero_level = 12,
  orbs = { 5, 5, 2 },
  talents = T.NONE,
  gold = 0,
  items = {
    "item_boots",
    "item_null_talisman",
    "item_null_talisman",
    "item_ultimate_scepter",
  },
  tags = { "teamfight" },
  sequence = {
    { id = 1, name = "invoker_tornado", required = true, next = { 2 } },
    { id = 2, name = "invoker_ice_wall", required = true, next = { 3 } },
    { id = 3, name = "invoker_cold_snap", required = true, next = { 4 } },
    { id = 4, name = "invoker_emp", required = true },
  },
}

M[#M + 1] = {
  id = 19,
  specialty = S.Specialty.QuasExort,
  stance = S.Stance.Offensive,
  damage_rating = S.DamageRating.Considerable,
  difficulty_rating = S.DifficultyRating.Hard,
  hero_level = 12,
  orbs = { 4, 3, 4 },
  talents = T.L10_LEFT,
  gold = 0,
  items = {
    "item_boots",
    "item_null_talisman",
    "item_null_talisman",
    "item_ultimate_scepter",
  },
  tags = { "teamfight" },
  sequence = {
    { id = 1, name = "invoker_tornado", required = true, next = { 2 } },
    { id = 2, name = "invoker_chaos_meteor", required = true, next = { 3 } },
    { id = 3, name = "invoker_deafening_blast", required = true, next = { 4 } },
    { id = 4, name = "invoker_cold_snap", required = true, next = { 5 } },
    { id = 5, name = "invoker_ice_wall", required = true },
  },
}

M[#M + 1] = {
  id = 20,
  specialty = S.Specialty.QuasExort,
  stance = S.Stance.Offensive,
  damage_rating = S.DamageRating.Lethal,
  difficulty_rating = S.DifficultyRating.Hard,
  hero_level = 12,
  orbs = { 4, 3, 4 },
  talents = T.L10_LEFT,
  gold = 0,
  items = {
    "item_boots",
    "item_null_talisman",
    "item_null_talisman",
    "item_ultimate_scepter",
    "item_cyclone",
  },
  tags = { "teamfight" },
  sequence = {
    { id = 1, name = "item_cyclone", required = true, next = { 2 } },
    { id = 2, name = "invoker_sun_strike", required = true, next = { 3 } },
    { id = 3, name = "invoker_emp", required = true, next = { 4 } },
    { id = 4, name = "invoker_chaos_meteor", required = true, next = { 5 } },
    { id = 5, name = "invoker_deafening_blast", required = true },
  },
}

M[#M + 1] = {
  id = 21,
  specialty = S.Specialty.QuasExort,
  stance = S.Stance.Offensive,
  damage_rating = S.DamageRating.Considerable,
  difficulty_rating = S.DifficultyRating.Hard,
  hero_level = 12,
  orbs = { 4, 3, 5 },
  talents = T.NONE,
  gold = 0,
  items = {
    "item_boots",
    "item_null_talisman",
    "item_null_talisman",
    "item_ultimate_scepter",
  },
  tags = { "teamfight" },
  sequence = {
    { id = 1, name = "invoker_forge_spirit", required = true, next = { 2 } },
    { id = 2, name = "invoker_alacrity", required = true, next = { 3 } },
    { id = 3, name = "invoker_ice_wall", required = true, next = { 4 } },
    { id = 4, name = "invoker_cold_snap", required = true, next = { 5 } },
    { id = 5, name = "invoker_sun_strike", required = true },
  },
}

M[#M + 1] = {
  id = 22,
  specialty = S.Specialty.QuasExort,
  stance = S.Stance.Offensive,
  damage_rating = S.DamageRating.Exceptional,
  difficulty_rating = S.DifficultyRating.VeryHard,
  hero_level = 20,
  orbs = { 5, 7, 7 },
  talents = T.L10_LEFT,
  gold = 0,
  items = {
    "item_travel_boots",
    "item_null_talisman",
    "item_null_talisman",
    "item_null_talisman",
    "item_refresher",
    "item_ultimate_scepter",
  },
  tags = { "late-game" },
  sequence = {
    { id = 1, name = "invoker_tornado", required = true, next = { 2 } },
    { id = 2, name = "invoker_chaos_meteor", required = true, next = { 3 } },
    { id = 3, name = "invoker_deafening_blast", required = true, next = { 4 } },
    { id = 4, name = "item_refresher", required = true, next = { 5 } },
    { id = 5, name = "invoker_chaos_meteor", required = true, next = { 6 } },
    { id = 6, name = "invoker_deafening_blast", required = true, next = { 7 } },
    { id = 7, name = "invoker_sun_strike", required = true },
  },
}

M[#M + 1] = {
  id = 23,
  specialty = S.Specialty.QuasExort,
  stance = S.Stance.Offensive,
  damage_rating = S.DamageRating.Exceptional,
  difficulty_rating = S.DifficultyRating.VeryHard,
  hero_level = 20,
  orbs = { 5, 7, 7 },
  talents = T.L10_LEFT,
  gold = 0,
  items = {
    "item_travel_boots",
    "item_null_talisman",
    "item_null_talisman",
    "item_ultimate_scepter",
    "item_octarine_core",
    "item_refresher",
  },
  tags = { "late-game" },
  sequence = {
    { id = 1, name = "invoker_tornado", required = true, next = { 2 } },
    { id = 2, name = "invoker_emp", required = true, next = { 3 } },
    { id = 3, name = "invoker_sun_strike", required = true, next = { 4 } },
    { id = 4, name = "invoker_chaos_meteor", required = true, next = { 5 } },
    { id = 5, name = "invoker_deafening_blast", required = true, next = { 6 } },
    { id = 6, name = "item_refresher", required = true, next = { 7 } },
    { id = 7, name = "invoker_chaos_meteor", required = true, next = { 8 } },
    { id = 8, name = "invoker_deafening_blast", required = true, next = { 9 } },
    { id = 9, name = "invoker_sun_strike", required = true },
  },
}

M[#M + 1] = {
  id = 24,
  specialty = S.Specialty.QuasExort,
  stance = S.Stance.Offensive,
  damage_rating = S.DamageRating.Exceptional,
  difficulty_rating = S.DifficultyRating.VeryHard,
  hero_level = 20,
  orbs = { 5, 7, 7 },
  talents = T.L10_LEFT,
  gold = 0,
  items = {
    "item_travel_boots",
    "item_null_talisman",
    "item_refresher",
    "item_ultimate_scepter",
    "item_sheepstick",
    "item_black_king_bar",
  },
  tags = { "late-game" },
  sequence = {
    { id = 1, name = "item_sheepstick", required = true, next = { 2 } },
    { id = 2, name = "invoker_tornado", required = true, next = { 3 } },
    { id = 3, name = "item_black_king_bar", required = true, next = { 4 } },
    { id = 4, name = "invoker_chaos_meteor", required = true, next = { 5 } },
    { id = 5, name = "invoker_deafening_blast", required = true, next = { 6 } },
    { id = 6, name = "item_refresher", required = true, next = { 7 } },
    { id = 7, name = "invoker_chaos_meteor", required = true, next = { 8 } },
    { id = 8, name = "invoker_deafening_blast", required = true, next = { 9 } },
    { id = 9, name = "invoker_sun_strike", required = true, next = { 10 } },
    { id = 10, name = "item_black_king_bar", required = true, next = { 11 } },
    { id = 11, name = "item_sheepstick", required = true },
  },
}

M[#M + 1] = {
  id = 25,
  specialty = S.Specialty.QuasExort,
  stance = S.Stance.Offensive,
  damage_rating = S.DamageRating.Exceptional,
  difficulty_rating = S.DifficultyRating.VeryHard,
  hero_level = 20,
  orbs = { 5, 7, 7 },
  talents = T.L10_LEFT,
  gold = 0,
  items = {
    "item_travel_boots",
    "item_black_king_bar",
    "item_blink",
    "item_sheepstick",
    "item_refresher",
    "item_ultimate_scepter",
  },
  tags = { "late-game" },
  sequence = {
    { id = 1, name = "item_black_king_bar", required = true, next = { 2 } },
    { id = 2, name = "item_blink", required = true, next = { 3 } },
    { id = 3, name = "item_sheepstick", required = true, next = { 4 } },
    { id = 4, name = "invoker_tornado", required = true, next = { 5 } },
    { id = 5, name = "invoker_chaos_meteor", required = true, next = { 6 } },
    { id = 6, name = "invoker_deafening_blast", required = true, next = { 7 } },
    { id = 7, name = "item_refresher", required = true, next = { 8 } },
    { id = 8, name = "item_black_king_bar", required = true, next = { 9 } },
    { id = 9, name = "invoker_chaos_meteor", required = true, next = { 10 } },
    { id = 10, name = "invoker_deafening_blast", required = true, next = { 11 } },
    { id = 11, name = "invoker_sun_strike", required = true, next = { 12 } },
    { id = 12, name = "item_sheepstick", required = true },
  },
}

M[#M + 1] = {
  id = 26,
  specialty = S.Specialty.QuasExort,
  stance = S.Stance.Offensive,
  damage_rating = S.DamageRating.Brutal,
  difficulty_rating = S.DifficultyRating.LiterallyUnplayable,
  hero_level = 25,
  orbs = { 7, 7, 7 },
  talents = talents.select(T.L10_LEFT, T.L15_RIGHT, T.L20_RIGHT, T.L25_RIGHT),
  gold = 0,
  items = {
    "item_travel_boots",
    "item_black_king_bar",
    "item_shivas_guard",
    "item_refresher",
    "item_octarine_core",
    "item_ultimate_scepter",
  },
  tags = { "late-game" },
  sequence = {
    { id = 1, name = "invoker_alacrity", required = true, next = { 2 } },
    { id = 2, name = "invoker_forge_spirit", required = true, next = { 3 } },
    { id = 3, name = "item_black_king_bar", required = true, next = { 4 } },
    { id = 4, name = "invoker_tornado", required = true, next = { 5 } },
    { id = 5, name = "invoker_emp", required = true, next = { 6 } },
    { id = 6, name = "invoker_sun_strike", required = true, next = { 7 } },
    { id = 7, name = "invoker_chaos_meteor", required = true, next = { 8 } },
    { id = 8, name = "item_shivas_guard", required = true, next = { 9 } },
    { id = 9, name = "invoker_deafening_blast", required = true, next = { 10 } },
    { id = 10, name = "item_refresher", required = true, next = { 11 } },
    { id = 11, name = "item_shivas_guard", required = true, next = { 12 } },
    { id = 12, name = "invoker_chaos_meteor", required = true, next = { 13 } },
    { id = 13, name = "invoker_deafening_blast", required = true, next = { 14 } },
    { id = 14, name = "invoker_emp", required = true, next = { 15 } },
    { id = 15, name = "invoker_sun_strike", required = true, next = { 16 } },
    { id = 16, name = "invoker_ice_wall", required = true },
  },
}

return M
