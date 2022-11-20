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

function CreateUnitByName(name, location, _findClearSpace, npcOwner, unitOwner, teamNumber)
  return Factory.create("dota_unit", {
    name = name,
    origin = location,
    owner = unitOwner,
    playerOwner = npcOwner,
    team = teamNumber,
  })
end

function EmitGlobalSound(_event) end
function EmitSoundOnClient(_event, _player) end
function EmitSoundOn(_event, _entity) end
function EmitSoundOnLocationWithCaster(_location, _event, _entity) end
function EmitSoundOnLocationForAllies(_location, _event, _entity) end
function EmitAnnouncerSound(_event) end
function EmitAnnouncerSoundForPlayer(_event, _playerId) end
function EmitAnnouncerSoundForTeam(_event, _team) end
function EmitAnnouncerSoundForTeamOnLocation(_event, _team, _location) end
