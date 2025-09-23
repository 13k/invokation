--# selene: allow(global_usage)

require("support.dota2.CustomGameEventManager")
require("support.dota2.Entities")
require("support.dota2.EntityFramework")
require("support.dota2.GameRules")
require("support.dota2.PlayerResource")
require("support.dota2.Vector")

local m = require("moses")

local Factory = require("support.factory")
local Fixtures = require("support.fixtures")

function IsInToolsMode()
  return false
end

function UniqueString(base)
  return m.uniqueId((base or "") .. "%d")
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

--- @type { [EntityIndex]: T.dota2.CBaseEntity }
local ENTITIES = {}

--- @type EntityIndex
local __ent_index = 0

function __next_ent_idx()
  __ent_index = __ent_index + 1

  return __ent_index
end

--- @param index EntityIndex
--- @param ent T.dota2.CBaseEntity
function __set_ent(index, ent)
  ENTITIES[index] = ent
end

--- @param idx EntityIndex
--- @return CBaseEntity
function EntIndexToHScript(idx)
  return ENTITIES[idx]
end

function CreateUnitByName(name, location, _findClearSpace, npcOwner, unitOwner, teamNumber)
  return Factory.dota_unit({
    name = name,
    origin = location,
    owner = unitOwner,
    player_owner = npcOwner,
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

--- @param hero_ent T.dota2.CDOTA_BaseNPC_Hero
function HeroMaxLevel(hero_ent)
  hero_ent:max_level()
end
