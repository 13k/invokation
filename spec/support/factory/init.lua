--- @class support.Factory
--- @field vector fun(attrs: support.factory.VectorAttributes): support.dota2.Vector
--- @field dota_entity fun(attributes: support.dota2.CBaseEntity_attributes): support.dota2.CBaseEntity
--- @field dota_player fun(attributes?: support.dota2.CDOTAPlayerController_attributes): support.dota2.CDOTAPlayerController
--- @field dota_ability fun(attributes: support.dota2.CDOTABaseAbility_attributes, options?: support.factory.dota_ability.Options): support.dota2.CDOTABaseAbility
--- @field dota_item fun(attributes: support.dota2.CDOTA_Item_attributes): support.dota2.CDOTA_Item
--- @field dota_unit fun(attributes: support.dota2.CDOTA_BaseNPC_attributes): support.dota2.CDOTA_BaseNPC
--- @field dota_hero fun(attributes: support.dota2.CDOTA_BaseNPC_Hero_attributes, options?: support.factory.dota_hero.Options): support.dota2.CDOTA_BaseNPC_Hero
--- @field dota_hero_invoker fun(attributes?: support.factory.dota_hero_invoker.Attributes, options?: support.factory.dota_hero.Options): support.dota2.CDOTA_BaseNPC_Hero
--- @field player fun(attributes?: support.dota2.CDOTAPlayerController_attributes): invk.dota2.Player
--- @field ability fun(attributes: support.dota2.CDOTABaseAbility_attributes, options?: support.factory.dota_ability.Options): invk.dota2.Ability
--- @field item fun(attributes: support.dota2.CDOTA_Item_attributes): invk.dota2.Ability
--- @field unit fun(attributes: support.dota2.CDOTA_BaseNPC_attributes): invk.dota2.Unit
--- @field hero fun(attributes: support.dota2.CDOTA_BaseNPC_Hero_attributes, options?: support.factory.dota_hero.Options): invk.dota2.Unit
--- @field hero_invoker fun(attributes?: support.factory.dota_hero_invoker.Attributes, options?: support.factory.dota_hero.Options): invk.dota2.Unit
local M = setmetatable({}, {
  __index = function(t, name)
    local factory = require("support.factory." .. name)

    t[name] = factory

    return factory
  end,
})

return M
