-- globals

-- selene: allow(incorrect_standard_library_use)
bit = require("bit32")

require("support.dota2.enum")
require("support.dota2.global")

-- models

require("support.dota2.Vector")

require("support.dota2.CBaseEntity")
require("support.dota2.CBaseAnimating")
require("support.dota2.CBaseFlex")
require("support.dota2.CDOTABaseGameMode")
require("support.dota2.CDOTA_BaseNPC")
require("support.dota2.CDOTA_BaseNPC_Hero")
require("support.dota2.CDOTABaseAbility")
require("support.dota2.CDOTA_Item")
require("support.dota2.CBasePlayer")
require("support.dota2.CDOTAPlayer")

-- controllers

require("support.dota2.CustomGameEventManager")
require("support.dota2.Entities")
require("support.dota2.GameRules")
require("support.dota2.PlayerResource")

-- core libs

require("support.dota2.EntityFramework")
