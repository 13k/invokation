--- Combo specifications.
-- @module invokation.const.combos

local M = {}

-------------------------------------------------------------------------------
-- Laning Phase
-- @section laning_phase

M.invokation_combo_lane_anti_gank1 = {
  specialty = "qw",
  category = "laning_phase",
  stance = "defensive",
  heroLevel = 2,
  damageRating = 0,
  difficultyRating = 1,
  items = {
    "item_null_talisman",
  },
  sequence = {
    [1] = {
      name = "invoker_cold_snap",
      required = true,
      next = {2},
    },
    [2] = {
      name = "invoker_tornado",
      required = true,
    },
  },
}

M.invokation_combo_lane_anti_gank2 = {
  specialty = "qw",
  category = "laning_phase",
  stance = "defensive",
  heroLevel = 2,
  damageRating = 0,
  difficultyRating = 1,
  items = {
    "item_null_talisman",
  },
  sequence = {
    [1] = {
      name = "invoker_tornado",
      required = true,
      next = {2},
    },
    [2] = {
      name = "invoker_quas",
      required = true,
      next = {3},
    },
    [3] = {
      name = "invoker_quas",
      required = true,
      next = {4},
    },
    [4] = {
      name = "invoker_wex",
      required = true,
      next = {5},
    },
    [5] = {
      name = "invoker_invoke",
      required = true,
      next = {6, 9},
    },
    [6] = {
      name = "invoker_wex",
      required = false,
      next = {7},
    },
    [7] = {
      name = "invoker_wex",
      required = false,
      next = {8},
    },
    [8] = {
      name = "invoker_wex",
      required = false,
      next = {9},
    },
    [9] = {
      name = "invoker_ghost_walk",
      required = true,
    },
  },
}

M.invokation_combo_lane_harass_emp = {
  specialty = "qw",
  category = "laning_phase",
  stance = "offensive",
  heroLevel = 2,
  damageRating = 1,
  difficultyRating = 1,
  items = {
    "item_null_talisman",
  },
  sequence = {
    [1] = {
      name = "invoker_emp",
      required = true,
      next = {2},
    },
    [2] = {
      name = "invoker_tornado",
      required = true,
    },
  },
}

M.invokation_combo_lane_harass_forge_spirit1 = {
  specialty = "qe",
  category = "laning_phase",
  stance = "offensive",
  heroLevel = 2,
  damageRating = 1,
  difficultyRating = 1,
  items = {
    "item_null_talisman",
  },
  sequence = {
    [1] = {
      name = "invoker_forge_spirit",
      required = true,
      next = {2},
    },
    [2] = {
      name = "invoker_cold_snap",
      required = true,
    },
  },
}

M.invokation_combo_lane_harass_forge_spirit2 = {
  specialty = "qe",
  category = "laning_phase",
  stance = "offensive",
  heroLevel = 3,
  damageRating = 1,
  difficultyRating = 1,
  items = {
    "item_null_talisman",
  },
  sequence = {
    [1] = {
      name = "invoker_forge_spirit",
      required = true,
      next = {2},
    },
    [2] = {
      name = "invoker_alacrity",
      required = true,
    },
  },
}

-------------------------------------------------------------------------------
-- Ganking / Solo Pick
-- @section ganking_solo_pick

M.invokation_combo_solo_control_magic_damage1 = {
  specialty = "qe",
  category = "ganking_solo_pick",
  stance = "offensive",
  heroLevel = 6,
  damageRating = 2,
  difficultyRating = 2,
  items = {
    "item_null_talisman",
    "item_null_talisman",
  },
  sequence = {
    [1] = {
      name = "invoker_tornado",
      required = true,
      next = {2},
    },
    [2] = {
      name = "invoker_chaos_meteor",
      required = true,
      next = {3},
    },
    [3] = {
      name = "invoker_deafening_blast",
      required = true,
    },
  },
}

M.invokation_combo_solo_control_magic_damage2 = {
  specialty = "qe",
  category = "ganking_solo_pick",
  stance = "offensive",
  heroLevel = 6,
  damageRating = 3,
  difficultyRating = 3,
  items = {
    "item_null_talisman",
    "item_null_talisman",
  },
  sequence = {
    [1] = {
      name = "invoker_tornado",
      required = true,
      next = {2},
    },
    [2] = {
      name = "invoker_sun_strike",
      required = true,
      next = {3},
    },
    [3] = {
      name = "invoker_deafening_blast",
      required = true,
    },
  },
}

M.invokation_combo_solo_control_magic_damage3 = {
  specialty = "qe",
  category = "ganking_solo_pick",
  stance = "offensive",
  heroLevel = 6,
  damageRating = 2,
  difficultyRating = 2,
  items = {
    "item_null_talisman",
    "item_null_talisman",
  },
  sequence = {
    [1] = {
      name = "invoker_deafening_blast",
      required = true,
      next = {2},
    },
    [2] = {
      name = "invoker_cold_snap",
      required = true,
      next = {3},
    },
    [3] = {
      name = "invoker_chaos_meteor",
      required = true,
    },
  },
}

M.invokation_combo_solo_control_magic_damage4 = {
  specialty = "qe",
  category = "ganking_solo_pick",
  stance = "offensive",
  heroLevel = 6,
  damageRating = 2,
  difficultyRating = 3,
  items = {
    "item_null_talisman",
    "item_null_talisman",
  },
  sequence = {
    [1] = {
      name = "invoker_ice_wall",
      required = true,
      next = {2},
    },
    [2] = {
      name = "invoker_chaos_meteor",
      required = true,
      next = {3},
    },
    [3] = {
      name = "invoker_cold_snap",
      required = true,
    },
  },
}

M.invokation_combo_solo_control_magic_damage5 = {
  specialty = "qe",
  category = "ganking_solo_pick",
  stance = "offensive",
  heroLevel = 6,
  damageRating = 2,
  difficultyRating = 3,
  items = {
    "item_null_talisman",
    "item_null_talisman",
    "item_null_talisman",
  },
  sequence = {
    [1] = {
      name = "invoker_ice_wall",
      required = true,
      next = {2},
    },
    [2] = {
      name = "invoker_chaos_meteor",
      required = true,
      next = {3},
    },
    [3] = {
      name = "invoker_deafening_blast",
      required = true,
    },
  },
}

M.invokation_combo_solo_control_magic_damage6 = {
  specialty = "qe",
  category = "ganking_solo_pick",
  stance = "offensive",
  heroLevel = 6,
  damageRating = 3,
  difficultyRating = 3,
  items = {
    "item_null_talisman",
    "item_null_talisman",
  },
  sequence = {
    [1] = {
      name = "invoker_ice_wall",
      required = true,
      next = {2},
    },
    [2] = {
      name = "invoker_chaos_meteor",
      required = true,
      next = {3},
    },
    [3] = {
      name = "invoker_sun_strike",
      required = true,
    },
  },
}

M.invokation_combo_solo_control_magic_damage7 = {
  specialty = "qe",
  category = "ganking_solo_pick",
  stance = "offensive",
  heroLevel = 6,
  damageRating = 2,
  difficultyRating = 3,
  items = {
    "item_null_talisman",
    "item_null_talisman",
  },
  sequence = {
    [1] = {
      name = "invoker_ice_wall",
      required = true,
      next = {2},
    },
    [2] = {
      name = "invoker_chaos_meteor",
      required = true,
      next = {3},
    },
    [3] = {
      name = "invoker_emp",
      required = true,
    },
  },
}

M.invokation_combo_solo_control_physical_damage1 = {
  specialty = "qe",
  category = "ganking_solo_pick",
  stance = "offensive",
  heroLevel = 6,
  damageRating = 2,
  difficultyRating = 2,
  items = {
    "item_null_talisman",
    "item_null_talisman",
  },
  sequence = {
    [1] = {
      name = "invoker_cold_snap",
      required = true,
      next = {2},
    },
    [2] = {
      name = "invoker_alacrity",
      required = true,
      next = {3},
    },
    [3] = {
      name = "invoker_deafening_blast",
      required = true,
    },
  },
}

M.invokation_combo_solo_control_physical_damage2 = {
  specialty = "qe",
  category = "ganking_solo_pick",
  stance = "offensive",
  heroLevel = 6,
  damageRating = 2,
  difficultyRating = 2,
  items = {
    "item_null_talisman",
    "item_null_talisman",
  },
  sequence = {
    [1] = {
      name = "invoker_ice_wall",
      required = true,
      next = {2},
    },
    [2] = {
      name = "invoker_alacrity",
      required = true,
      next = {3},
    },
    [3] = {
      name = "invoker_cold_snap",
      required = true,
    },
  },
}

M.invokation_combo_solo_control_physical_damage3 = {
  specialty = "qe",
  category = "ganking_solo_pick",
  stance = "offensive",
  heroLevel = 6,
  damageRating = 2,
  difficultyRating = 2,
  items = {
    "item_null_talisman",
    "item_null_talisman",
  },
  sequence = {
    [1] = {
      name = "invoker_ice_wall",
      required = true,
      next = {2},
    },
    [2] = {
      name = "invoker_alacrity",
      required = true,
      next = {3},
    },
    [3] = {
      name = "invoker_deafening_blast",
      required = true,
    },
  },
}

M.invokation_combo_solo_control_physical_damage4 = {
  specialty = "qe",
  category = "ganking_solo_pick",
  stance = "offensive",
  heroLevel = 6,
  damageRating = 2,
  difficultyRating = 2,
  items = {
    "item_null_talisman",
    "item_null_talisman",
  },
  sequence = {
    [1] = {
      name = "invoker_ice_wall",
      required = true,
      next = {2},
    },
    [2] = {
      name = "invoker_alacrity",
      required = true,
      next = {3},
    },
    [3] = {
      name = "invoker_sun_strike",
      required = true,
    },
  },
}

M.invokation_combo_solo_control_physical_damage5 = {
  specialty = "qe",
  category = "ganking_solo_pick",
  stance = "offensive",
  heroLevel = 6,
  damageRating = 2,
  difficultyRating = 2,
  items = {
    "item_null_talisman",
    "item_null_talisman",
  },
  sequence = {
    [1] = {
      name = "invoker_ice_wall",
      required = true,
      next = {2},
    },
    [2] = {
      name = "invoker_alacrity",
      required = true,
      next = {3},
    },
    [3] = {
      name = "invoker_emp",
      required = true,
    },
  },
}

-------------------------------------------------------------------------------
-- Teamfight
-- @section teamfight

M.invokation_combo_tf_control_magic_damage1 = {
  specialty = "qw",
  category = "teamfight",
  stance = "offensive",
  heroLevel = 12,
  damageRating = 2,
  difficultyRating = 3,
  items = {
    "item_boots",
    "item_null_talisman",
    "item_null_talisman",
    "item_ultimate_scepter",
  },
  sequence = {
    [1] = {
      name = "invoker_tornado",
      required = true,
      next = {2},
    },
    [2] = {
      name = "invoker_ice_wall",
      required = true,
      next = {3},
    },
    [3] = {
      name = "invoker_cold_snap",
      required = true,
      next = {4},
    },
    [4] = {
      name = "invoker_emp",
      required = true,
    },
  },
}

M.invokation_combo_tf_control_magic_damage2 = {
  specialty = "qe",
  category = "teamfight",
  stance = "offensive",
  heroLevel = 12,
  damageRating = 2,
  difficultyRating = 3,
  items = {
    "item_boots",
    "item_null_talisman",
    "item_null_talisman",
    "item_ultimate_scepter",
  },
  sequence = {
    [1] = {
      name = "invoker_tornado",
      required = true,
      next = {2},
    },
    [2] = {
      name = "invoker_chaos_meteor",
      required = true,
      next = {3},
    },
    [3] = {
      name = "invoker_deafening_blast",
      required = true,
      next = {4},
    },
    [4] = {
      name = "invoker_cold_snap",
      required = true,
      next = {5},
    },
    [5] = {
      name = "invoker_ice_wall",
      required = true,
    },
  },
}

M.invokation_combo_tf_control_magic_damage3 = {
  specialty = "qe",
  category = "teamfight",
  stance = "offensive",
  heroLevel = 12,
  damageRating = 3,
  difficultyRating = 3,
  items = {
    "item_boots",
    "item_null_talisman",
    "item_null_talisman",
    "item_ultimate_scepter",
    "item_cyclone",
  },
  sequence = {
    [1] = {
      name = "item_cyclone",
      required = true,
      next = {2},
    },
    [2] = {
      name = "invoker_sun_strike",
      required = true,
      next = {3},
    },
    [3] = {
      name = "invoker_emp",
      required = true,
      next = {4},
    },
    [4] = {
      name = "invoker_chaos_meteor",
      required = true,
      next = {5},
    },
    [5] = {
      name = "invoker_deafening_blast",
      required = true,
    },
  },
}

M.invokation_combo_tf_control_physical_damage1 = {
  specialty = "qe",
  category = "teamfight",
  stance = "offensive",
  heroLevel = 12,
  damageRating = 2,
  difficultyRating = 3,
  items = {
    "item_boots",
    "item_null_talisman",
    "item_null_talisman",
    "item_ultimate_scepter",
  },
  sequence = {
    [1] = {
      name = "invoker_forge_spirit",
      required = true,
      next = {2},
    },
    [2] = {
      name = "invoker_alacrity",
      required = true,
      next = {3},
    },
    [3] = {
      name = "invoker_ice_wall",
      required = true,
      next = {4},
    },
    [4] = {
      name = "invoker_cold_snap",
      required = true,
      next = {5},
    },
    [5] = {
      name = "invoker_sun_strike",
      required = true,
    },
  },
}

-------------------------------------------------------------------------------
-- Late Game
-- @section late_game

M.invokation_combo_late_control_magic_damage1 = {
  specialty = "qe",
  category = "late_game",
  stance = "offensive",
  damageRating = 4,
  difficultyRating = 4,
  heroLevel = 20,
  items = {
    "item_travel_boots",
    "item_null_talisman",
    "item_null_talisman",
    "item_null_talisman",
    "item_refresher",
    "item_ultimate_scepter",
  },
  sequence = {
    [1] = {
      name = "invoker_tornado",
      required = true,
      next = {2},
    },
    [2] = {
      name = "invoker_chaos_meteor",
      required = true,
      next = {3},
    },
    [3] = {
      name = "invoker_deafening_blast",
      required = true,
      next = {4},
    },
    [4] = {
      name = "item_refresher",
      required = true,
      next = {5},
    },
    [5] = {
      name = "invoker_chaos_meteor",
      required = true,
      next = {6},
    },
    [6] = {
      name = "invoker_deafening_blast",
      required = true,
      next = {7},
    },
    [7] = {
      name = "invoker_sun_strike",
      required = true,
    },
  },
}

M.invokation_combo_late_control_magic_damage2 = {
  specialty = "qe",
  category = "late_game",
  stance = "offensive",
  damageRating = 4,
  difficultyRating = 4,
  heroLevel = 20,
  items = {
    "item_travel_boots",
    "item_null_talisman",
    "item_null_talisman",
    "item_ultimate_scepter",
    "item_octarine_core",
    "item_refresher",
  },
  sequence = {
    [1] = {
      name = "invoker_tornado",
      required = true,
      next = {2},
    },
    [2] = {
      name = "invoker_emp",
      required = true,
      next = {3},
    },
    [3] = {
      name = "invoker_sun_strike",
      required = true,
      next = {4},
    },
    [4] = {
      name = "invoker_chaos_meteor",
      required = true,
      next = {5},
    },
    [5] = {
      name = "invoker_deafening_blast",
      required = true,
      next = {6},
    },
    [6] = {
      name = "item_refresher",
      required = true,
      next = {7},
    },
    [7] = {
      name = "invoker_chaos_meteor",
      required = true,
      next = {8},
    },
    [8] = {
      name = "invoker_deafening_blast",
      required = true,
      next = {9},
    },
    [9] = {
      name = "invoker_sun_strike",
      required = true,
    },
  },
}

M.invokation_combo_late_control_magic_damage3 = {
  specialty = "qe",
  category = "late_game",
  stance = "offensive",
  damageRating = 4,
  difficultyRating = 4,
  heroLevel = 20,
  items = {
    "item_travel_boots",
    "item_null_talisman",
    "item_refresher",
    "item_ultimate_scepter",
    "item_sheepstick",
    "item_black_king_bar",
  },
  sequence = {
    [1] = {
      name = "item_sheepstick",
      required = true,
      next = {2},
    },
    [2] = {
      name = "invoker_tornado",
      required = true,
      next = {3},
    },
    [3] = {
      name = "item_black_king_bar",
      required = true,
      next = {4},
    },
    [4] = {
      name = "invoker_chaos_meteor",
      required = true,
      next = {5},
    },
    [5] = {
      name = "invoker_deafening_blast",
      required = true,
      next = {6},
    },
    [6] = {
      name = "item_refresher",
      required = true,
      next = {7},
    },
    [7] = {
      name = "invoker_chaos_meteor",
      required = true,
      next = {8},
    },
    [8] = {
      name = "invoker_deafening_blast",
      required = true,
      next = {9},
    },
    [9] = {
      name = "invoker_sun_strike",
      required = true,
      next = {10},
    },
    [10] = {
      name = "item_black_king_bar",
      required = true,
      next = {11},
    },
    [11] = {
      name = "item_sheepstick",
      required = true,
    },
  },
}

M.invokation_combo_late_control_magic_damage4 = {
  specialty = "qe",
  category = "late_game",
  stance = "offensive",
  damageRating = 4,
  difficultyRating = 4,
  heroLevel = 20,
  items = {
    "item_travel_boots",
    "item_black_king_bar",
    "item_blink",
    "item_sheepstick",
    "item_refresher",
    "item_ultimate_scepter",
  },
  sequence = {
    [1] = {
      name = "item_black_king_bar",
      required = true,
      next = {2},
    },
    [2] = {
      name = "item_blink",
      required = true,
      next = {3},
    },
    [3] = {
      name = "item_sheepstick",
      required = true,
      next = {4},
    },
    [4] = {
      name = "invoker_tornado",
      required = true,
      next = {5},
    },
    [5] = {
      name = "invoker_chaos_meteor",
      required = true,
      next = {6},
    },
    [6] = {
      name = "invoker_deafening_blast",
      required = true,
      next = {7},
    },
    [7] = {
      name = "item_refresher",
      required = true,
      next = {8},
    },
    [8] = {
      name = "item_black_king_bar",
      required = true,
      next = {9},
    },
    [9] = {
      name = "invoker_chaos_meteor",
      required = true,
      next = {10},
    },
    [10] = {
      name = "invoker_deafening_blast",
      required = true,
      next = {11},
    },
    [11] = {
      name = "invoker_sun_strike",
      required = true,
      next = {12},
    },
    [12] = {
      name = "item_sheepstick",
      required = true,
    },
  },
}

M.invokation_combo_late_mixed_damage1 = {
  specialty = "qe",
  category = "late_game",
  stance = "offensive",
  damageRating = 5,
  difficultyRating = 5,
  heroLevel = 25,
  items = {
    "item_travel_boots",
    "item_black_king_bar",
    "item_shivas_guard",
    "item_refresher",
    "item_octarine_core",
    "item_ultimate_scepter",
  },
  sequence = {
    [1] = {
      name = "invoker_alacrity",
      required = true,
      next = {2},
    },
    [2] = {
      name = "invoker_forge_spirit",
      required = true,
      next = {3},
    },
    [3] = {
      name = "item_black_king_bar",
      required = true,
      next = {4},
    },
    [4] = {
      name = "invoker_tornado",
      required = true,
      next = {5},
    },
    [5] = {
      name = "invoker_emp",
      required = true,
      next = {6},
    },
    [6] = {
      name = "invoker_sun_strike",
      required = true,
      next = {7},
    },
    [7] = {
      name = "invoker_chaos_meteor",
      required = true,
      next = {8},
    },
    [8] = {
      name = "item_shivas_guard",
      required = true,
      next = {9},
    },
    [9] = {
      name = "invoker_deafening_blast",
      required = true,
      next = {10},
    },
    [10] = {
      name = "item_refresher",
      required = true,
      next = {11},
    },
    [11] = {
      name = "item_shivas_guard",
      required = true,
      next = {12},
    },
    [12] = {
      name = "invoker_chaos_meteor",
      required = true,
      next = {13},
    },
    [13] = {
      name = "invoker_deafening_blast",
      required = true,
      next = {14},
    },
    [14] = {
      name = "invoker_emp",
      required = true,
      next = {15},
    },
    [15] = {
      name = "invoker_sun_strike",
      required = true,
      next = {16},
    },
    [16] = {
      name = "invoker_ice_wall",
      required = true,
    },
  },
}

return M
