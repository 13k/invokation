local class = require("middleclass")

local BaseCombo = require("invk.combo.base_combo")
local S = require("invk.combo.spec")
local talents = require("invk.dota2.talents")

--- FreestyleCombo is a Combo class that implements a freestyle sequence.
--- @class invk.combo.FreestyleCombo : invk.combo.BaseCombo
local M = class("invk.combo.FreestyleCombo", BaseCombo)

--- @type invk.combo.ComboSpec
local SPEC = {
  id = BaseCombo.FREESTYLE_COMBO_ID,
  specialty = S.Specialty.QuasExort,
  stance = S.Stance.Offensive,
  damage_rating = S.DamageRating.Brutal,
  difficulty_rating = S.DifficultyRating.LiterallyUnplayable,
  hero_level = 30,
  orbs = { 1, 1, 1 },
  talents = talents.Talents.NONE,
  gold = 99999,
  items = {},
  tags = { "freestyle" },
  sequence = {},
}

--- @class invk.combo.FreestyleComboOptions : invk.combo.BaseComboOptions

--- Constructor.
--- @param options? invk.combo.FreestyleComboOptions
function M:initialize(options)
  BaseCombo.initialize(self, SPEC, options)

  self.state = BaseCombo.State.Started
end

--- Freestyle combos have no steps.
--- @diagnostic disable-next-line: unused
function M:current_step()
  return nil
end

--- Freestyle combos have no steps.
--- @diagnostic disable-next-line: unused
function M:next_steps()
  return {}
end

--- Always progresses the combo with the given ability.
function M:progress(ability)
  if ability:is_invocation_ability() then
    return false
  end

  self.metrics.count = self.metrics.count + 1

  return true
end

--- Freestyle combos never fail.
--- @diagnostic disable-next-line: unused
function M:fail() end

--- Freestyle combos never pre finish.
--- @diagnostic disable-next-line: unused
function M:pre_finish()
  return false
end

--- Freestyle combos never finish.
--- @diagnostic disable-next-line: unused
function M:finish()
  return false
end

return M
