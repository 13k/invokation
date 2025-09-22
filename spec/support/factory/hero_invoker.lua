local Unit = require("invk.dota2.unit")

--- @class F.hero_invoker.Attributes : F.dota_hero_invoker.Attributes
--- @class F.hero_invoker.Options : F.dota_hero_invoker.Options

--- @param attributes? F.hero_invoker.Attributes
--- @param options? F.hero_invoker.Options
--- @return invk.dota2.Unit
return function(attributes, options)
  local F = require("support.factory")

  return Unit:new(F.dota_hero_invoker(attributes, options))
end
