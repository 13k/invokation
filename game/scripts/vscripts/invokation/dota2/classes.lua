local ENTITY_CLASSES = {
  "CDOTABaseAbility",
  "CDOTA_Item",
  "CDOTA_BaseNPC",
  "CDOTA_BaseNPC_Hero",
}

for _, className in ipairs(ENTITY_CLASSES) do
  EntityFramework:CreateCppClassProxy(className)
end
