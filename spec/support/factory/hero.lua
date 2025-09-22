local Unit = require("invk.dota2.unit")

--- @class F.hero.Attributes : F.dota_hero.Attributes
--- @class F.hero.Options : F.dota_hero.Options

--- @param attributes F.hero.Attributes
--- @param options? F.hero.Options
--- @return invk.dota2.Unit
return function(attributes, options)
  local F = require("support.factory")

  return Unit:new(F.dota_hero(attributes, options))
end
