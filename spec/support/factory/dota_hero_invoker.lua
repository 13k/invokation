local m = require("moses")

local UNITS = require("invk.const.units")

--- @class support.factory.dota_hero_invoker.Attributes : support.dota2.CDOTA_BaseNPC_Hero_attributes
--- @field name? string

--- @param attributes? support.factory.dota_hero_invoker.Attributes
--- @param options? support.factory.dota_hero.Options
--- @return support.dota2.CDOTA_BaseNPC_Hero
return function(attributes, options)
  local F = require("support.factory")

  attributes = m.extend({}, { name = UNITS.INVOKER }, attributes or {})

  return F.dota_hero(attributes, options)
end
