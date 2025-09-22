--- @class t.Factory
--- @field ability fun(attributes: F.ability.Attributes, options?: F.ability.Options): invk.dota2.Ability
--- @field dota_ability fun(attributes: F.dota_ability.Attributes, options?: F.dota_ability.Options): T.dota2.CDOTABaseAbility
--- @field dota_buff fun(attributes: F.dota_buff.Attributes): T.dota2.CDOTA_Buff
--- @field dota_entity fun(attributes: F.dota_entity.Attributes): T.dota2.CBaseEntity
--- @field dota_hero fun(attributes: F.dota_hero.Attributes, options?: F.dota_hero.Options): T.dota2.CDOTA_BaseNPC_Hero
--- @field dota_hero_invoker fun(attributes?: F.dota_hero_invoker.Attributes, options?: F.dota_hero_invoker.Options): T.dota2.CDOTA_BaseNPC_Hero
--- @field dota_item fun(attributes: F.dota_item.Attributes): T.dota2.CDOTA_Item
--- @field dota_player fun(attributes?: F.dota_player.Attributes): T.dota2.CDOTAPlayerController
--- @field dota_unit fun(attributes: F.dota_unit.Attributes): T.dota2.CDOTA_BaseNPC
--- @field hero fun(attributes: F.hero.Attributes, options?: F.hero.Options): invk.dota2.Unit
--- @field hero_invoker fun(attributes?: F.hero_invoker.Attributes, options?: F.hero_invoker.Options): invk.dota2.Unit
--- @field item fun(attributes: F.item.Attributes): invk.dota2.Ability
--- @field player fun(attributes?: F.player.Attributes): invk.dota2.Player
--- @field unit fun(attributes: F.unit.Attributes): invk.dota2.Unit
--- @field vector fun(attributes: F.vector.Attributes): T.dota2.Vector
local M = setmetatable({}, {
  __index = function(t, name)
    local factory = require("support.factory." .. name)

    t[name] = factory

    return factory
  end,
})

return M
