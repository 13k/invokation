--- Combo specifications.
-- @module invokation.const.combos

local M = {
  [1] = {
    category = "laning_phase",
    specialty = "qw",
    stance = "defensive",
    heroLevel = 2,
    damageRating = 0,
    difficultyRating = 1,
    items = {
      "item_null_talisman"
    },
    sequence = {
      [1] = {
        name = "invoker_cold_snap",
        required = true,
        next = {2}
      },
      [2] = {
        name = "invoker_tornado",
        required = true
      }
    }
  },
  [2] = {
    category = "laning_phase",
    specialty = "qw",
    stance = "defensive",
    heroLevel = 2,
    damageRating = 0,
    difficultyRating = 1,
    items = {
      "item_null_talisman"
    },
    sequence = {
      [1] = {
        name = "invoker_tornado",
        required = true,
        next = {2}
      },
      [2] = {
        name = "invoker_quas",
        required = true,
        next = {3}
      },
      [3] = {
        name = "invoker_quas",
        required = true,
        next = {4}
      },
      [4] = {
        name = "invoker_wex",
        required = true,
        next = {5}
      },
      [5] = {
        name = "invoker_invoke",
        required = true,
        next = {6, 9}
      },
      [6] = {
        name = "invoker_wex",
        required = false,
        next = {7}
      },
      [7] = {
        name = "invoker_wex",
        required = false,
        next = {8}
      },
      [8] = {
        name = "invoker_wex",
        required = false,
        next = {9}
      },
      [9] = {
        name = "invoker_ghost_walk",
        required = true
      }
    }
  },
  [3] = {
    category = "laning_phase",
    specialty = "qw",
    stance = "offensive",
    heroLevel = 2,
    damageRating = 1,
    difficultyRating = 1,
    items = {
      "item_null_talisman"
    },
    sequence = {
      [1] = {
        name = "invoker_emp",
        required = true,
        next = {2}
      },
      [2] = {
        name = "invoker_tornado",
        required = true
      }
    }
  },
  [4] = {
    category = "laning_phase",
    specialty = "qe",
    stance = "offensive",
    heroLevel = 2,
    damageRating = 1,
    difficultyRating = 1,
    items = {
      "item_null_talisman"
    },
    sequence = {
      [1] = {
        name = "invoker_forge_spirit",
        required = true,
        next = {2}
      },
      [2] = {
        name = "invoker_cold_snap",
        required = true
      }
    }
  },
  [5] = {
    category = "laning_phase",
    specialty = "qe",
    stance = "offensive",
    heroLevel = 3,
    damageRating = 1,
    difficultyRating = 1,
    items = {
      "item_null_talisman"
    },
    sequence = {
      [1] = {
        name = "invoker_forge_spirit",
        required = true,
        next = {2}
      },
      [2] = {
        name = "invoker_alacrity",
        required = true
      }
    }
  },
  [6] = {
    category = "ganking_solo_pick",
    specialty = "qe",
    stance = "offensive",
    heroLevel = 6,
    damageRating = 2,
    difficultyRating = 2,
    items = {
      "item_null_talisman",
      "item_null_talisman"
    },
    sequence = {
      [1] = {
        name = "invoker_tornado",
        required = true,
        next = {2}
      },
      [2] = {
        name = "invoker_chaos_meteor",
        required = true,
        next = {3}
      },
      [3] = {
        name = "invoker_deafening_blast",
        required = true
      }
    }
  },
  [7] = {
    category = "ganking_solo_pick",
    specialty = "qe",
    stance = "offensive",
    heroLevel = 6,
    damageRating = 3,
    difficultyRating = 3,
    items = {
      "item_null_talisman",
      "item_null_talisman"
    },
    sequence = {
      [1] = {
        name = "invoker_tornado",
        required = true,
        next = {2}
      },
      [2] = {
        name = "invoker_sun_strike",
        required = true,
        next = {3}
      },
      [3] = {
        name = "invoker_deafening_blast",
        required = true
      }
    }
  },
  [8] = {
    category = "ganking_solo_pick",
    specialty = "qe",
    stance = "offensive",
    heroLevel = 6,
    damageRating = 2,
    difficultyRating = 2,
    items = {
      "item_null_talisman",
      "item_null_talisman"
    },
    sequence = {
      [1] = {
        name = "invoker_deafening_blast",
        required = true,
        next = {2}
      },
      [2] = {
        name = "invoker_cold_snap",
        required = true,
        next = {3}
      },
      [3] = {
        name = "invoker_chaos_meteor",
        required = true
      }
    }
  },
  [9] = {
    category = "ganking_solo_pick",
    specialty = "qe",
    stance = "offensive",
    heroLevel = 6,
    damageRating = 2,
    difficultyRating = 3,
    items = {
      "item_null_talisman",
      "item_null_talisman"
    },
    sequence = {
      [1] = {
        name = "invoker_ice_wall",
        required = true,
        next = {2}
      },
      [2] = {
        name = "invoker_chaos_meteor",
        required = true,
        next = {3}
      },
      [3] = {
        name = "invoker_cold_snap",
        required = true
      }
    }
  },
  [10] = {
    category = "ganking_solo_pick",
    specialty = "qe",
    stance = "offensive",
    heroLevel = 6,
    damageRating = 2,
    difficultyRating = 3,
    items = {
      "item_null_talisman",
      "item_null_talisman",
      "item_null_talisman"
    },
    sequence = {
      [1] = {
        name = "invoker_ice_wall",
        required = true,
        next = {2}
      },
      [2] = {
        name = "invoker_chaos_meteor",
        required = true,
        next = {3}
      },
      [3] = {
        name = "invoker_deafening_blast",
        required = true
      }
    }
  },
  [11] = {
    category = "ganking_solo_pick",
    specialty = "qe",
    stance = "offensive",
    heroLevel = 6,
    damageRating = 3,
    difficultyRating = 3,
    items = {
      "item_null_talisman",
      "item_null_talisman"
    },
    sequence = {
      [1] = {
        name = "invoker_ice_wall",
        required = true,
        next = {2}
      },
      [2] = {
        name = "invoker_chaos_meteor",
        required = true,
        next = {3}
      },
      [3] = {
        name = "invoker_sun_strike",
        required = true
      }
    }
  },
  [12] = {
    category = "ganking_solo_pick",
    specialty = "qe",
    stance = "offensive",
    heroLevel = 6,
    damageRating = 2,
    difficultyRating = 3,
    items = {
      "item_null_talisman",
      "item_null_talisman"
    },
    sequence = {
      [1] = {
        name = "invoker_ice_wall",
        required = true,
        next = {2}
      },
      [2] = {
        name = "invoker_chaos_meteor",
        required = true,
        next = {3}
      },
      [3] = {
        name = "invoker_emp",
        required = true
      }
    }
  },
  [13] = {
    category = "ganking_solo_pick",
    specialty = "qe",
    stance = "offensive",
    heroLevel = 6,
    damageRating = 2,
    difficultyRating = 2,
    items = {
      "item_null_talisman",
      "item_null_talisman"
    },
    sequence = {
      [1] = {
        name = "invoker_cold_snap",
        required = true,
        next = {2}
      },
      [2] = {
        name = "invoker_alacrity",
        required = true,
        next = {3}
      },
      [3] = {
        name = "invoker_deafening_blast",
        required = true
      }
    }
  },
  [14] = {
    category = "ganking_solo_pick",
    specialty = "qe",
    stance = "offensive",
    heroLevel = 6,
    damageRating = 2,
    difficultyRating = 2,
    items = {
      "item_null_talisman",
      "item_null_talisman"
    },
    sequence = {
      [1] = {
        name = "invoker_ice_wall",
        required = true,
        next = {2}
      },
      [2] = {
        name = "invoker_alacrity",
        required = true,
        next = {3}
      },
      [3] = {
        name = "invoker_cold_snap",
        required = true
      }
    }
  },
  [15] = {
    category = "ganking_solo_pick",
    specialty = "qe",
    stance = "offensive",
    heroLevel = 6,
    damageRating = 2,
    difficultyRating = 2,
    items = {
      "item_null_talisman",
      "item_null_talisman"
    },
    sequence = {
      [1] = {
        name = "invoker_ice_wall",
        required = true,
        next = {2}
      },
      [2] = {
        name = "invoker_alacrity",
        required = true,
        next = {3}
      },
      [3] = {
        name = "invoker_deafening_blast",
        required = true
      }
    }
  },
  [16] = {
    category = "ganking_solo_pick",
    specialty = "qe",
    stance = "offensive",
    heroLevel = 6,
    damageRating = 2,
    difficultyRating = 2,
    items = {
      "item_null_talisman",
      "item_null_talisman"
    },
    sequence = {
      [1] = {
        name = "invoker_ice_wall",
        required = true,
        next = {2}
      },
      [2] = {
        name = "invoker_alacrity",
        required = true,
        next = {3}
      },
      [3] = {
        name = "invoker_sun_strike",
        required = true
      }
    }
  },
  [17] = {
    category = "ganking_solo_pick",
    specialty = "qe",
    stance = "offensive",
    heroLevel = 6,
    damageRating = 2,
    difficultyRating = 2,
    items = {
      "item_null_talisman",
      "item_null_talisman"
    },
    sequence = {
      [1] = {
        name = "invoker_ice_wall",
        required = true,
        next = {2}
      },
      [2] = {
        name = "invoker_alacrity",
        required = true,
        next = {3}
      },
      [3] = {
        name = "invoker_emp",
        required = true
      }
    }
  },
  [18] = {
    category = "teamfight",
    specialty = "qw",
    stance = "offensive",
    heroLevel = 12,
    damageRating = 2,
    difficultyRating = 3,
    items = {
      "item_boots",
      "item_null_talisman",
      "item_null_talisman",
      "item_ultimate_scepter"
    },
    sequence = {
      [1] = {
        name = "invoker_tornado",
        required = true,
        next = {2}
      },
      [2] = {
        name = "invoker_ice_wall",
        required = true,
        next = {3}
      },
      [3] = {
        name = "invoker_cold_snap",
        required = true,
        next = {4}
      },
      [4] = {
        name = "invoker_emp",
        required = true
      }
    }
  },
  [19] = {
    category = "teamfight",
    specialty = "qe",
    stance = "offensive",
    heroLevel = 12,
    damageRating = 2,
    difficultyRating = 3,
    items = {
      "item_boots",
      "item_null_talisman",
      "item_null_talisman",
      "item_ultimate_scepter"
    },
    sequence = {
      [1] = {
        name = "invoker_tornado",
        required = true,
        next = {2}
      },
      [2] = {
        name = "invoker_chaos_meteor",
        required = true,
        next = {3}
      },
      [3] = {
        name = "invoker_deafening_blast",
        required = true,
        next = {4}
      },
      [4] = {
        name = "invoker_cold_snap",
        required = true,
        next = {5}
      },
      [5] = {
        name = "invoker_ice_wall",
        required = true
      }
    }
  },
  [20] = {
    category = "teamfight",
    specialty = "qe",
    stance = "offensive",
    heroLevel = 12,
    damageRating = 3,
    difficultyRating = 3,
    items = {
      "item_boots",
      "item_null_talisman",
      "item_null_talisman",
      "item_ultimate_scepter",
      "item_cyclone"
    },
    sequence = {
      [1] = {
        name = "item_cyclone",
        required = true,
        next = {2}
      },
      [2] = {
        name = "invoker_sun_strike",
        required = true,
        next = {3}
      },
      [3] = {
        name = "invoker_emp",
        required = true,
        next = {4}
      },
      [4] = {
        name = "invoker_chaos_meteor",
        required = true,
        next = {5}
      },
      [5] = {
        name = "invoker_deafening_blast",
        required = true
      }
    }
  },
  [21] = {
    category = "teamfight",
    specialty = "qe",
    stance = "offensive",
    heroLevel = 12,
    damageRating = 2,
    difficultyRating = 3,
    items = {
      "item_boots",
      "item_null_talisman",
      "item_null_talisman",
      "item_ultimate_scepter"
    },
    sequence = {
      [1] = {
        name = "invoker_forge_spirit",
        required = true,
        next = {2}
      },
      [2] = {
        name = "invoker_alacrity",
        required = true,
        next = {3}
      },
      [3] = {
        name = "invoker_ice_wall",
        required = true,
        next = {4}
      },
      [4] = {
        name = "invoker_cold_snap",
        required = true,
        next = {5}
      },
      [5] = {
        name = "invoker_sun_strike",
        required = true
      }
    }
  },
  [22] = {
    category = "late_game",
    specialty = "qe",
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
      "item_ultimate_scepter"
    },
    sequence = {
      [1] = {
        name = "invoker_tornado",
        required = true,
        next = {2}
      },
      [2] = {
        name = "invoker_chaos_meteor",
        required = true,
        next = {3}
      },
      [3] = {
        name = "invoker_deafening_blast",
        required = true,
        next = {4}
      },
      [4] = {
        name = "item_refresher",
        required = true,
        next = {5}
      },
      [5] = {
        name = "invoker_chaos_meteor",
        required = true,
        next = {6}
      },
      [6] = {
        name = "invoker_deafening_blast",
        required = true,
        next = {7}
      },
      [7] = {
        name = "invoker_sun_strike",
        required = true
      }
    }
  },
  [23] = {
    category = "late_game",
    specialty = "qe",
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
      "item_refresher"
    },
    sequence = {
      [1] = {
        name = "invoker_tornado",
        required = true,
        next = {2}
      },
      [2] = {
        name = "invoker_emp",
        required = true,
        next = {3}
      },
      [3] = {
        name = "invoker_sun_strike",
        required = true,
        next = {4}
      },
      [4] = {
        name = "invoker_chaos_meteor",
        required = true,
        next = {5}
      },
      [5] = {
        name = "invoker_deafening_blast",
        required = true,
        next = {6}
      },
      [6] = {
        name = "item_refresher",
        required = true,
        next = {7}
      },
      [7] = {
        name = "invoker_chaos_meteor",
        required = true,
        next = {8}
      },
      [8] = {
        name = "invoker_deafening_blast",
        required = true,
        next = {9}
      },
      [9] = {
        name = "invoker_sun_strike",
        required = true
      }
    }
  },
  [24] = {
    category = "late_game",
    specialty = "qe",
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
      "item_black_king_bar"
    },
    sequence = {
      [1] = {
        name = "item_sheepstick",
        required = true,
        next = {2}
      },
      [2] = {
        name = "invoker_tornado",
        required = true,
        next = {3}
      },
      [3] = {
        name = "item_black_king_bar",
        required = true,
        next = {4}
      },
      [4] = {
        name = "invoker_chaos_meteor",
        required = true,
        next = {5}
      },
      [5] = {
        name = "invoker_deafening_blast",
        required = true,
        next = {6}
      },
      [6] = {
        name = "item_refresher",
        required = true,
        next = {7}
      },
      [7] = {
        name = "invoker_chaos_meteor",
        required = true,
        next = {8}
      },
      [8] = {
        name = "invoker_deafening_blast",
        required = true,
        next = {9}
      },
      [9] = {
        name = "invoker_sun_strike",
        required = true,
        next = {10}
      },
      [10] = {
        name = "item_black_king_bar",
        required = true,
        next = {11}
      },
      [11] = {
        name = "item_sheepstick",
        required = true
      }
    }
  },
  [25] = {
    category = "late_game",
    specialty = "qe",
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
      "item_ultimate_scepter"
    },
    sequence = {
      [1] = {
        name = "item_black_king_bar",
        required = true,
        next = {2}
      },
      [2] = {
        name = "item_blink",
        required = true,
        next = {3}
      },
      [3] = {
        name = "item_sheepstick",
        required = true,
        next = {4}
      },
      [4] = {
        name = "invoker_tornado",
        required = true,
        next = {5}
      },
      [5] = {
        name = "invoker_chaos_meteor",
        required = true,
        next = {6}
      },
      [6] = {
        name = "invoker_deafening_blast",
        required = true,
        next = {7}
      },
      [7] = {
        name = "item_refresher",
        required = true,
        next = {8}
      },
      [8] = {
        name = "item_black_king_bar",
        required = true,
        next = {9}
      },
      [9] = {
        name = "invoker_chaos_meteor",
        required = true,
        next = {10}
      },
      [10] = {
        name = "invoker_deafening_blast",
        required = true,
        next = {11}
      },
      [11] = {
        name = "invoker_sun_strike",
        required = true,
        next = {12}
      },
      [12] = {
        name = "item_sheepstick",
        required = true
      }
    }
  },
  [26] = {
    category = "late_game",
    specialty = "qe",
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
      "item_ultimate_scepter"
    },
    sequence = {
      [1] = {
        name = "invoker_alacrity",
        required = true,
        next = {2}
      },
      [2] = {
        name = "invoker_forge_spirit",
        required = true,
        next = {3}
      },
      [3] = {
        name = "item_black_king_bar",
        required = true,
        next = {4}
      },
      [4] = {
        name = "invoker_tornado",
        required = true,
        next = {5}
      },
      [5] = {
        name = "invoker_emp",
        required = true,
        next = {6}
      },
      [6] = {
        name = "invoker_sun_strike",
        required = true,
        next = {7}
      },
      [7] = {
        name = "invoker_chaos_meteor",
        required = true,
        next = {8}
      },
      [8] = {
        name = "item_shivas_guard",
        required = true,
        next = {9}
      },
      [9] = {
        name = "invoker_deafening_blast",
        required = true,
        next = {10}
      },
      [10] = {
        name = "item_refresher",
        required = true,
        next = {11}
      },
      [11] = {
        name = "item_shivas_guard",
        required = true,
        next = {12}
      },
      [12] = {
        name = "invoker_chaos_meteor",
        required = true,
        next = {13}
      },
      [13] = {
        name = "invoker_deafening_blast",
        required = true,
        next = {14}
      },
      [14] = {
        name = "invoker_emp",
        required = true,
        next = {15}
      },
      [15] = {
        name = "invoker_sun_strike",
        required = true,
        next = {16}
      },
      [16] = {
        name = "invoker_ice_wall",
        required = true
      }
    }
  }
}

return M
