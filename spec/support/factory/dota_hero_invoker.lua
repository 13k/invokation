local m = require("moses")

local UNITS = require("invk.const.units")

--- @class F.dota_hero_invoker.Attributes : T.dota2.CDOTA_BaseNPC_Hero.Attributes
--- @field name? string

--- @class F.dota_hero_invoker.Options : F.dota_hero.Options

--- @param attributes? F.dota_hero_invoker.Attributes
--- @param options? F.dota_hero_invoker.Options
--- @return T.dota2.CDOTA_BaseNPC_Hero
return function(attributes, options)
  local F = require("support.factory")

  attributes = m.extend({}, { name = UNITS.INVOKER }, attributes or {})

  return F.dota_hero(attributes, options)
end
