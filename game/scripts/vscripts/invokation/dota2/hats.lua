--- Hats helpers.
-- @module invokation.dota2.hats
-- @author Noya (09.08.2015)
local M = {}

--- Hides all dem hats.
-- @tparam CDOTA_BaseNPC unit
function M.HideWearables(unit)
  -- Keep every wearable handle in a table to show them later
  unit._hiddenWearables = unit._hiddenWearables or {}

  local model = unit:FirstMoveChild()

  while model ~= nil do
    if model:GetClassname() == "dota_item_wearable" then
      model:AddEffects(EF_NODRAW) -- Set model hidden
      table.insert(unit._hiddenWearables, model)
    end

    model = model:NextMovePeer()
  end
end

--- Shows all dem hats.
-- @tparam CDOTA_BaseNPC unit
function M.ShowWearables(unit)
  for _, v in pairs(unit._hiddenWearables) do
    v:RemoveEffects(EF_NODRAW)
  end
end

return M
