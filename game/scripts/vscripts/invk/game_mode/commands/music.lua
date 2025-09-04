local M = {}

--- @param player CDOTAPlayerController
--- @param status string
--- @param intensity string
function M.set_status(player, status, intensity)
  local status_n = tonumber(status) --[[@as integer?]]

  if not status_n then
    errorf("Invalid status %q", status)
  end

  if not status_n then
    errorf("Invalid status %q", status)
  end

  local intensity_n = tonumber(intensity)

  if not intensity_n then
    errorf("Invalid intensity %q", intensity)
  end

  player:SetMusicStatus(status_n, intensity_n)
end

return M
