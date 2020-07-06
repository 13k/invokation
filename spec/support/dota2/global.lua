local m = require("moses")
local Factory = require("support.factory")
local Fixtures = require("support.fixtures")

function IsInToolsMode()
  return false
end

function UniqueString(base)
  base = base or ""
  return m.uniqueId(base .. "%d")
end

function DoUniqueString(base)
  return UniqueString(base)
end

function RandomInt(min, max)
  return math.random(min, max)
end

function Time()
  return os.time()
end

function GetSystemDate()
  return os.date("%Y-%m-%d")
end

function GetSystemTime()
  return os.date("%H:%M:%S")
end

function LoadKeyValues(filename)
  return Fixtures.require(filename)
end

function CreateUnitByName(name, location, findClearSpace, npcOwner, unitOwner, teamNumber)
  return Factory.create("dota_unit", {
    name = name,
    origin = location,
    owner = unitOwner,
    playerOwner = npcOwner,
    team = teamNumber,
  })
end

function EmitGlobalSound(event)
end

function EmitSoundOnClient(event, player)
end

function EmitSoundOn(event, entity)
end

function EmitSoundOnLocationWithCaster(location, event, entity)
end

function EmitSoundOnLocationForAllies(location, event, entity)
end

function EmitAnnouncerSound(event)
end

function EmitAnnouncerSoundForPlayer(event, playerId)
end

function EmitAnnouncerSoundForTeam(event, team)
end

function EmitAnnouncerSoundForTeamOnLocation(event, team, location)
end
