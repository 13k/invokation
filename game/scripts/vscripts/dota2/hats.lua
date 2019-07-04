local M = {}

--[[Author: Noya
  Date: 09.08.2015.
  Hides all dem hats
]]
function M.HideWearables(unit)
  unit._hiddenWearables = {} -- Keep every wearable handle in a table to show them later

  local model = unit:FirstMoveChild()

  while model ~= nil do
    if model:GetClassname() == "dota_item_wearable" then
      model:AddEffects(EF_NODRAW) -- Set model hidden
      table.insert(unit._hiddenWearables, model)
    end

    model = model:NextMovePeer()
  end
end

function M.ShowWearables(unit)
  for _, v in pairs(unit._hiddenWearables) do
    v:RemoveEffects(EF_NODRAW)
  end
end

return M
