--- Combo specifications.
--
-- Uses explicit integer keys in `sequence`s for readability since sequence
-- steps refer to other steps by index.
--
-- @module invokation.const.combos

local M = {}

--- Laning Phase
-- @section laning_phase

--- @table lane_anti_gank1
M.lane_anti_gank1 = {
  specialty = "qw",
  category = "laning_phase",
  stance = "defensive",
  hero_level = 2,
  damage_rating = 0,
  difficulty_rating = 1,
  items = {"item_null_talisman"},
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

--- @table lane_anti_gank2
M.lane_anti_gank2 = {
  specialty = "qw",
  category = "laning_phase",
  stance = "defensive",
  hero_level = 2,
  damage_rating = 0,
  difficulty_rating = 1,
  items = {"item_null_talisman"},
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

--- @table lane_harass_emp
M.lane_harass_emp = {
  specialty = "qw",
  category = "laning_phase",
  stance = "offensive",
  hero_level = 2,
  damage_rating = 1,
  difficulty_rating = 1,
  items = {"item_null_talisman"},
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

--- @table lane_harass_forge_spirit1
M.lane_harass_forge_spirit1 = {
  specialty = "qe",
  category = "laning_phase",
  stance = "offensive",
  hero_level = 2,
  damage_rating = 1,
  difficulty_rating = 1,
  items = {"item_null_talisman"},
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

--- @table lane_harass_forge_spirit2
M.lane_harass_forge_spirit2 = {
  specialty = "qe",
  category = "laning_phase",
  stance = "offensive",
  hero_level = 2,
  damage_rating = 1,
  difficulty_rating = 1,
  items = {"item_null_talisman"},
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

--- Ganking / Solo Pick
-- @section ganking_solo_pick

--- @table solo_control_magic_damage1
M.solo_control_magic_damage1 = {
  specialty = "qe",
  category = "ganking_solo_pick",
  stance = "offensive",
  hero_level = 6,
  damage_rating = 2,
  difficulty_rating = 2,
  items = {"item_null_talisman", "item_null_talisman"},
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

--- @table solo_control_magic_damage2
M.solo_control_magic_damage2 = {
  specialty = "qe",
  category = "ganking_solo_pick",
  stance = "offensive",
  hero_level = 6,
  damage_rating = 3,
  difficulty_rating = 3,
  items = {"item_null_talisman", "item_null_talisman"},
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

--- @table solo_control_magic_damage3
M.solo_control_magic_damage3 = {
  specialty = "qe",
  category = "ganking_solo_pick",
  stance = "offensive",
  hero_level = 6,
  damage_rating = 2,
  difficulty_rating = 2,
  items = {"item_null_talisman", "item_null_talisman"},
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

--- @table solo_control_magic_damage4
M.solo_control_magic_damage4 = {
  specialty = "qe",
  category = "ganking_solo_pick",
  stance = "offensive",
  hero_level = 6,
  damage_rating = 2,
  difficulty_rating = 3,
  items = {"item_null_talisman", "item_null_talisman"},
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

--- @table solo_control_magic_damage5
M.solo_control_magic_damage5 = {
  specialty = "qe",
  category = "ganking_solo_pick",
  stance = "offensive",
  hero_level = 6,
  damage_rating = 2,
  difficulty_rating = 3,
  items = {"item_null_talisman", "item_null_talisman"},
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

--- @table solo_control_magic_damage6
M.solo_control_magic_damage6 = {
  specialty = "qe",
  category = "ganking_solo_pick",
  stance = "offensive",
  hero_level = 6,
  damage_rating = 3,
  difficulty_rating = 3,
  items = {"item_null_talisman", "item_null_talisman"},
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

--- @table solo_control_magic_damage7
M.solo_control_magic_damage7 = {
  specialty = "qe",
  category = "ganking_solo_pick",
  stance = "offensive",
  hero_level = 6,
  damage_rating = 2,
  difficulty_rating = 3,
  items = {"item_null_talisman", "item_null_talisman"},
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

--- @table solo_control_physical_damage1
M.solo_control_physical_damage1 = {
  specialty = "qe",
  category = "ganking_solo_pick",
  stance = "offensive",
  hero_level = 6,
  damage_rating = 2,
  difficulty_rating = 2,
  items = {"item_null_talisman", "item_null_talisman"},
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

--- Teamfight
-- @section teamfight

--- @table tf_control_magic_damage1
M.tf_control_magic_damage1 = {
  specialty = "qw",
  category = "teamfight",
  stance = "offensive",
  hero_level = 12,
  damage_rating = 2,
  difficulty_rating = 3,
  items = {"item_null_talisman", "item_null_talisman", "item_ultimate_scepter"},
  sequence = {
    [1] = {
      name = "invoker_tornado",
      required = true,
      next = {2},
    },
    [2] = {
      name = "invoker_cold_snap",
      required = true,
      next = {3},
    },
    [3] = {
      name = "invoker_ice_wall",
      required = true,
      next = {4},
    },
    [4] = {
      name = "invoker_emp",
      required = true,
    },
  },
}

--- Late Game
-- @section late_game

--- @table late_control_magic_damage1
M.late_control_magic_damage1 = {
  specialty = "qe",
  category = "late_game",
  stance = "offensive",
  damage_rating = 4,
  difficulty_rating = 4,
  hero_level = 18,
  items = {
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

return M
