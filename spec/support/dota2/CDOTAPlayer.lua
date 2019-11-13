local class = require("pl.class")

CDOTAPlayer = class(CBasePlayer)

function CDOTAPlayer:_init(attributes)
  self:super(attributes)
end

function CDOTAPlayer:GetPlayerID()
  return self.id
end

function CDOTAPlayer:GetAssignedHero()
  return self.hero
end

function CDOTAPlayer:SetMusicStatus(status, intensity)
end
