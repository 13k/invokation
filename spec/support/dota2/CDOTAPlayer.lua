local class = require("pl.class")

-- selene: allow(incorrect_standard_library_use)
CDOTAPlayer = class(CBasePlayer)

function CDOTAPlayer:_init(attributes)
  self:super(attributes or {})
end

function CDOTAPlayer:GetPlayerID()
  return self.id
end

function CDOTAPlayer:GetAssignedHero()
  return self.hero
end

function CDOTAPlayer:SetMusicStatus(_status, _intensity) end
