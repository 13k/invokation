--- NetTable constants.
--- @class invk.const.net_tables
local M = {}

--- @enum invk.net_table.Name
M.Name = {
  MAIN = "invokation",
  HERO = "hero",
  ABILITIES = "abilities",
}

--- @type { [invk.net_table.Name]: invk.net_table.Config }
M.Tables = {
  [M.Name.MAIN] = {
    name = M.Name.MAIN,
    keys = {
      COMBOS = "combos",
      HERO_DATA = "hero_data",
    },
  },

  [M.Name.HERO] = {
    name = M.Name.HERO,
    keys = {
      KEY_VALUES = "kv",
    },
  },

  [M.Name.ABILITIES] = {
    name = M.Name.ABILITIES,
    keys = {
      KEY_VALUES = "kv",
    },
  },
}

return M
