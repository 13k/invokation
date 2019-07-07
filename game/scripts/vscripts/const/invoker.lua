local M = {
  ABILITY_QUAS = "invoker_quas",
  ABILITY_WEX = "invoker_wex",
  ABILITY_EXORT = "invoker_exort",
  ABILITY_INVOKE = "invoker_invoke",
  ABILITY_COLD_SNAP = "invoker_cold_snap",
  ABILITY_GHOST_WALK = "invoker_ghost_walk",
  ABILITY_ICE_WALL = "invoker_ice_wall",
  ABILITY_EMP = "invoker_emp",
  ABILITY_TORNADO = "invoker_tornado",
  ABILITY_ALACRITTY = "invoker_alacritty",
  ABILITY_SUN_STRIKE = "invoker_sun_strike",
  ABILITY_FORGE_SPIRIT = "invoker_forge_spirit",
  ABILITY_METEOR = "invoker_meteor",
  ABILITY_DEAFENING_BLAST = "invoker_deafening_blast",
}

M.ORB_ABILITIES = {
  M.ABILITY_QUAS,
  M.ABILITY_WEX,
  M.ABILITY_EXORT,
}

M.SPELL_COMPOSITION = {
  [M.ABILITY_COLD_SNAP]       = {M.ABILITY_QUAS,  M.ABILITY_QUAS,  M.ABILITY_QUAS},
  [M.ABILITY_GHOST_WALK]      = {M.ABILITY_QUAS,  M.ABILITY_QUAS,  M.ABILITY_WEX},
  [M.ABILITY_ICE_WALL]        = {M.ABILITY_QUAS,  M.ABILITY_QUAS,  M.ABILITY_EXORT},
  [M.ABILITY_EMP]             = {M.ABILITY_WEX,   M.ABILITY_WEX,   M.ABILITY_WEX},
  [M.ABILITY_TORNADO]         = {M.ABILITY_WEX,   M.ABILITY_WEX,   M.ABILITY_QUAS},
  [M.ABILITY_ALACRITTY]       = {M.ABILITY_WEX,   M.ABILITY_WEX,   M.ABILITY_EXORT},
  [M.ABILITY_SUN_STRIKE]      = {M.ABILITY_EXORT, M.ABILITY_EXORT, M.ABILITY_EXORT},
  [M.ABILITY_FORGE_SPIRIT]    = {M.ABILITY_EXORT, M.ABILITY_EXORT, M.ABILITY_QUAS},
  [M.ABILITY_METEOR]          = {M.ABILITY_EXORT, M.ABILITY_EXORT, M.ABILITY_WEX},
  [M.ABILITY_DEAFENING_BLAST] = {M.ABILITY_QUAS,  M.ABILITY_WEX,   M.ABILITY_EXORT},
}

return M
