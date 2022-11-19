--- Registers C++ proxy classes.
-- @module invokation.dota2.classes
local ENTITY_CLASSES = { "CDOTABaseAbility", "CDOTA_Item", "CDOTA_BaseNPC", "CDOTA_BaseNPC_Hero" }

for _, className in ipairs(ENTITY_CLASSES) do
  EntityFramework:CreateCppClassProxy(className)
end
