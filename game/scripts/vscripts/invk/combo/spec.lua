--- @class invk.combo.spec
local M = {}

--- Combo specification.
--- @class invk.combo.ComboSpec
--- @field id invk.combo.ComboId # Combo id
--- @field specialty invk.combo.Specialty # Specialty
--- @field stance invk.combo.Stance # Stance
--- @field damage_rating invk.combo.DamageRating # Damage rating
--- @field difficulty_rating invk.combo.DifficultyRating # Difficulty rating
--- @field hero_level integer # Hero level
--- @field orbs [integer, integer, integer] # Array of recommended orb abilities levels (`{quas, wex, exort}`)
--- @field talents integer # Bitmap of recommended talent abilities
--- @field gold integer # Hero starting gold
--- @field items string[] # Array of required items names
--- @field tags string[] # Tags
--- @field sequence invk.combo.ComboStepSpec[] # Array of steps data

--- ComboStep specification.
--- @class invk.combo.ComboStepSpec
--- @field id integer # Step id
--- @field name string # Step name (ability or item name)
--- @field required? boolean # Is step required or optional? (default: `false`)
--- @field next? integer[] # Next steps ids (`nil` if it's the last step in the sequence)

--- @enum invk.combo.Specialty
M.Specialty = {
  QuasExort = "qe",
  QuasWex = "qw",
}

--- @enum invk.combo.Stance
M.Stance = {
  Defensive = "defensive",
  Offensive = "offensive",
}

--- @enum invk.combo.DamageRating
M.DamageRating = {
  None = 0,
  Light = 1,
  Considerable = 2,
  Lethal = 3,
  Exceptional = 4,
  Brutal = 5,
}

--- @enum invk.combo.DifficultyRating
M.DifficultyRating = {
  VeryEasy = 0,
  Easy = 1,
  Normal = 2,
  Hard = 3,
  VeryHard = 4,
  LiterallyUnplayable = 5,
}

return M
