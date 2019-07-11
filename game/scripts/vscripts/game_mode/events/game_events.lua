local Unit = require("dota2.unit")
local Ability = require("dota2.ability")

-- The overall game state has changed
function GameMode:OnGameRulesStateChange(keys)
  self:d("GameRules State Changed", keys)

  --local newState = GameRules:State_Get()
end

--[[
  OnFirstPlayerLoaded() is called once and only once as soon as the first
  player (almost certain to be the server in local lobbies) loads in.

  It can be used to initialize state that isn't initializeable in
  InitGameMode() but needs to be done before everyone loads in.
]]
function GameMode:OnFirstPlayerLoaded()
  self:d("First Player has loaded")
end

--[[
  OnAllPlayersLoaded() is called once and only once after all players have
  loaded into the game, right as the hero selection time begins.

  It can be used to initialize non-hero player state or adjust the hero
  selection (i.e. force random etc)
]]
function GameMode:OnAllPlayersLoaded()
  self:d("All Players have loaded into the game")
end

-- Cleanup a player when they leave
function GameMode:OnDisconnect(keys)
  self:d("Player Disconnected " .. tostring(keys.userid), keys)

  --local name = keys.name
  --local networkid = keys.networkid
  --local reason = keys.reason
  --local userid = keys.userid
end

-- A player has reconnected to the game.  This function can be used to repaint Player-based particles or change
-- state as necessary
function GameMode:OnPlayerReconnect(keys)
  self:d("OnPlayerReconnect", keys)
end

--[[
  OnHeroInGame() is called once and only once for every player when they
  spawn into the game for the first time.

  It is also called if the player's hero is replaced with a new hero for any
  reason. This function is useful for initializing heroes, such as adding
  levels, changing the starting gold, removing/adding abilities, adding
  physics, etc.

  The hero parameter is the hero entity that just spawned in.
]]
function GameMode:OnHeroInGame(hero)
  self:d("Hero spawned in game for first time -- " .. hero:GetUnitName())

  -- Set the starting gold of every hero to 500 unreliable gold
  --[[
    hero:SetGold(500, false)
  ]]

  -- Create an item and add it to the player, effectively ensuring they start with the item
  --[[
    local item = CreateItem('item_example_item', hero, hero)
    hero:AddItem(item)
  ]]

  -- Replace the W ability of any hero that loads into the game with the 'example_ability' ability
  --[[
    local abil = hero:GetAbilityByIndex(1)
    hero:RemoveAbility(abil:GetAbilityName())
    hero:AddAbility('example_ability')
  ]]
end

--[[
  OnGameInProgress() is called once and only once when the game completely
  begins (about 0:00 on the clock).

  At this point, gold will begin to go up in ticks if configured, creeps will
  spawn, towers will become damageable, etc. This function is useful for
  starting any game logic timers/thinkers, beginning the first round, etc.
]]
function GameMode:OnGameInProgress()
  self:d("The game has officially begun")
  self.combos.ShowPicker()
end

-- An NPC has spawned somewhere in game.  This includes heroes
function GameMode:OnNPCSpawned(keys)
  self:d("NPC Spawned", keys)

  --local npc = EntIndexToHScript(keys.entindex)
end

-- An entity somewhere has been hurt.
function GameMode:OnEntityHurt(keys)
  self:d("OnEntityHurt", keys)

  --local damagebits = keys.damagebits -- This might always be 0 and therefore useless
  --if keys.entindex_attacker ~= nil and keys.entindex_killed ~= nil then
  --  local entCause = EntIndexToHScript(keys.entindex_attacker)
  --  local entVictim = EntIndexToHScript(keys.entindex_killed)

  --  -- The ability/item used to damage, or nil if not damaged by an item/ability
  --  local damagingAbility = nil

  --  if keys.entindex_inflictor ~= nil then
  --    damagingAbility = EntIndexToHScript(keys.entindex_inflictor)
  --  end
  --end
end

-- An item was picked up off the ground
function GameMode:OnItemPickedUp(keys)
  self:d("OnItemPickedUp", keys)

  --local unitEntity = nil
  --if keys.UnitEntitIndex then
  --  unitEntity = EntIndexToHScript(keys.UnitEntitIndex)
  --elseif keys.HeroEntityIndex then
  --  unitEntity = EntIndexToHScript(keys.HeroEntityIndex)
  --end

  --local itemEntity = EntIndexToHScript(keys.ItemEntityIndex)
  --local player = PlayerResource:GetPlayer(keys.PlayerID)
  --local itemname = keys.itemname
end

-- An item was purchased by a player
function GameMode:OnItemPurchased(keys)
  self:d("OnItemPurchased", keys)

  -- The playerID of the hero who is buying something
  --local plyID = keys.PlayerID
  --if not plyID then return end

  -- The name of the item purchased
  --local itemName = keys.itemname

  -- The cost of the item purchased
  --local itemcost = keys.itemcost
end

-- An ability was used by a player
function GameMode:OnAbilityUsed(keys)
  self:d("OnAbilityUsed", keys)

  local player = PlayerResource:GetPlayer(keys.PlayerID)
  local caster = Unit(EntIndexToHScript(keys.caster_entindex))
  local abilityEnt = caster:FindAbilityOrItem(keys.abilityname)

  local err = string.format("could not find ability or item '%q' on unit '%s'", keys.abilityname, caster.name)
  DoScriptAssert(abilityEnt ~= nil, err)

  local ability = Ability(abilityEnt)

  self.combos:OnAbilityUsed(player, caster, ability)
end

-- A non-player entity (necro-book, chen creep, etc) used an ability
function GameMode:OnNonPlayerUsedAbility(keys)
  self:d("OnNonPlayerUsedAbility", keys)

  --local abilityname = keys.abilityname
end

-- A player changed their name
function GameMode:OnPlayerChangedName(keys)
  self:d("OnPlayerChangedName", keys)

  --local newName = keys.newname
  --local oldName = keys.oldName
end

-- A player leveled up an ability
function GameMode:OnPlayerLearnedAbility(keys)
  self:d("OnPlayerLearnedAbility", keys)

  --local player = EntIndexToHScript(keys.player)
  --local abilityname = keys.abilityname
end

-- A channelled ability finished by either completing or being interrupted
function GameMode:OnAbilityChannelFinished(keys)
  self:d("OnAbilityChannelFinished", keys)

  --local abilityname = keys.abilityname
  --local interrupted = keys.interrupted == 1
end

-- A player leveled up
function GameMode:OnPlayerLevelUp(keys)
  self:d("OnPlayerLevelUp", keys)

  --local player = EntIndexToHScript(keys.player)
  --local level = keys.level
end

-- A player last hit a creep, a tower, or a hero
function GameMode:OnLastHit(keys)
  self:d("OnLastHit", keys)

  -- local isFirstBlood = keys.FirstBlood == 1
  -- local isHeroKill = keys.HeroKill == 1
  -- local isTowerKill = keys.TowerKill == 1
  -- local player = PlayerResource:GetPlayer(keys.PlayerID)
  -- local killedEnt = EntIndexToHScript(keys.EntKilled)
end

-- A tree was cut down by tango, quelling blade, etc
function GameMode:OnTreeCut(keys)
  self:d("OnTreeCut", keys)

  -- local treeX = keys.tree_x
  -- local treeY = keys.tree_y
end

-- A rune was activated by a player
function GameMode:OnRuneActivated(keys)
  self:d("OnRuneActivated", keys)

  -- local player = PlayerResource:GetPlayer(keys.PlayerID)
  -- local rune = keys.rune

  --[[ Rune Can be one of the following types
  DOTA_RUNE_DOUBLEDAMAGE
  DOTA_RUNE_HASTE
  DOTA_RUNE_HAUNTED
  DOTA_RUNE_ILLUSION
  DOTA_RUNE_INVISIBILITY
  DOTA_RUNE_BOUNTY
  DOTA_RUNE_MYSTERY
  DOTA_RUNE_RAPIER
  DOTA_RUNE_REGENERATION
  DOTA_RUNE_SPOOKY
  DOTA_RUNE_TURBO
  ]]
end

-- A player took damage from a tower
function GameMode:OnPlayerTakeTowerDamage(keys)
  self:d("OnPlayerTakeTowerDamage", keys)

  -- local player = PlayerResource:GetPlayer(keys.PlayerID)
  -- local damage = keys.damage
end

-- A player picked a hero
function GameMode:OnPlayerPickHero(keys)
  self:d("OnPlayerPickHero", keys)

  -- local heroClass = keys.hero
  -- local heroEntity = EntIndexToHScript(keys.heroindex)
  -- local player = EntIndexToHScript(keys.player)
end

-- A player killed another player in a multi-team context
function GameMode:OnTeamKillCredit(keys)
  self:d("OnTeamKillCredit", keys)

  -- local killerPlayer = PlayerResource:GetPlayer(keys.killer_userid)
  -- local victimPlayer = PlayerResource:GetPlayer(keys.victim_userid)
  -- local numKills = keys.herokills
  -- local killerTeamNumber = keys.teamnumber
end

-- An entity died
function GameMode:OnEntityKilled(keys)
  self:d("OnEntityKilled Called", keys)

  -- The Unit that was Killed
  -- local killedUnit = EntIndexToHScript(keys.entindex_killed)
  -- The Killing entity
  -- local killerEntity = nil

  -- if keys.entindex_attacker ~= nil then
  --   killerEntity = EntIndexToHScript(keys.entindex_attacker)
  -- end

  -- The ability/item used to kill, or nil if not killed by an item/ability
  -- local killerAbility = nil

  -- if keys.entindex_inflictor ~= nil then
  --   killerAbility = EntIndexToHScript(keys.entindex_inflictor)
  -- end

  -- local damagebits = keys.damagebits -- This might always be 0 and therefore useless

  -- Put code here to handle when an entity gets killed
end

-- This function is called 1 to 2 times as the player connects initially but before they
-- have completely connected
function GameMode:PlayerConnect(keys)
  self:d("PlayerConnect", keys)
end

-- This function is called once when the player fully connects and becomes "Ready" during Loading
function GameMode:OnConnectFull(keys)
  self:d("OnConnectFull", keys)

  -- local entIndex = keys.index+1
  -- The Player entity of the joining user
  -- local ply = EntIndexToHScript(entIndex)
  -- The Player ID of the joining player
  -- local playerID = ply:GetPlayerID()
end

-- This function is called whenever illusions are created and tells you which was/is the original entity
function GameMode:OnIllusionsCreated(keys)
  self:d("OnIllusionsCreated", keys)

  -- local originalEntity = EntIndexToHScript(keys.original_entindex)
end

-- This function is called whenever an item is combined to create a new item
function GameMode:OnItemCombined(keys)
  self:d("OnItemCombined", keys)

  -- The playerID of the hero who is buying something
  -- local plyID = keys.PlayerID
  -- if not plyID then return end
  -- local player = PlayerResource:GetPlayer(plyID)

  -- The name of the item purchased
  -- local itemName = keys.itemname

  -- The cost of the item purchased
  -- local itemcost = keys.itemcost
end

-- This function is called whenever an ability begins its PhaseStart phase (but before it is actually cast)
function GameMode:OnAbilityCastBegins(keys)
  self:d("OnAbilityCastBegins", keys)

  -- local player = PlayerResource:GetPlayer(keys.PlayerID)
  -- local abilityName = keys.abilityname
end

-- This function is called whenever a tower is killed
function GameMode:OnTowerKill(keys)
  self:d("OnTowerKill", keys)

  -- local gold = keys.gold
  -- local killerPlayer = PlayerResource:GetPlayer(keys.killer_userid)
  -- local team = keys.teamnumber
end

-- This function is called whenever a player changes there custom team selection during Game Setup
function GameMode:OnPlayerSelectedCustomTeam(keys)
  self:d("OnPlayerSelectedCustomTeam", keys)

  -- local player = PlayerResource:GetPlayer(keys.player_id)
  -- local success = (keys.success == 1)
  -- local team = keys.team_id
end

-- This function is called whenever an NPC reaches its goal position/target
function GameMode:OnNPCGoalReached(keys)
  self:d("OnNPCGoalReached", keys)

  -- local goalEntity = EntIndexToHScript(keys.goal_entindex)
  -- local nextGoalEntity = EntIndexToHScript(keys.next_goal_entindex)
  -- local npc = EntIndexToHScript(keys.npc_entindex)
end

-- This function is called whenever any player sends a chat message to team or All
function GameMode:OnPlayerChat(keys)
  self:d("OnPlayerChat", keys)

  -- local teamonly = keys.teamonly
  -- local userID = keys.userid
  -- local playerID = self.users[userID]:GetPlayerID()
  -- local text = keys.text
end
