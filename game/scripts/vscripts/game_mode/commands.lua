local lfunc = require("lang.function")
local Logger = require("lib.logger")
local Invoker = require("dota2.invoker")

function GameMode:registerCommands()
  --[[
  Convars:RegisterCommand(
    "events_test",
    function()
      self:StartEventTest()
    end,
    "events test",
    0
  )
  ]]
  --[[
  Convars:RegisterCommand(
    "command_example",
    lfunc.bindbyname(GameMode, "ExampleConsoleCommand"),
    "A console command example",
    FCVAR_CHEAT
  )
  ]]
  Convars:RegisterCommand(
    "inv_debug",
    lfunc.bindbyname(self, "enableDebug"),
    "Enable Invokation debugging",
    FCVAR_CHEAT
  )

  Convars:RegisterCommand(
    "inv_debug_off",
    lfunc.bindbyname(self, "disableDebug"),
    "Disable Invokation debugging",
    FCVAR_CHEAT
  )

  Convars:RegisterCommand(
    "inv_debug_abilities",
    lfunc.bindbyname(self, "debugAbilities"),
    "Print debug information for current hero abilities",
    FCVAR_CHEAT
  )

  Convars:RegisterCommand(
    "inv_swap_abilities",
    lfunc.bindbyname(self, "swapAbilities"),
    "Swaps two abilities (given by name), disabling the one that was swapped out",
    FCVAR_CHEAT
  )

  Convars:RegisterCommand(
    "inv_invoke_ability",
    lfunc.bindbyname(self, "invokeAbility"),
    "Invoke an ability (given by name)",
    FCVAR_CHEAT
  )

  self:d("  register commands")
end

function GameMode:enableDebug()
  self.logger.level = Logger.DEBUG
end

function GameMode:disableDebug()
  self.logger.level = Logger.INFO
end

function GameMode:debugAbilities(...)
  local player = Convars:GetDOTACommandClient()
  local hero = player:GetAssignedHero()

  for i = 0, hero:GetAbilityCount() - 1 do
    local a = hero:GetAbilityByIndex(i)
    local t = nil

    if a ~= nil then
      t = {
        name = a:GetAbilityName(),
        index = a:GetAbilityIndex(),
        type = a:GetAbilityType(),
        level = a:GetLevel(),
        maxLevel = a:GetMaxLevel(),
        damage = a:GetAbilityDamage(),
        damageType = a:GetAbilityDamageType(),
        isCastable = a:IsFullyCastable(),
        isActivated = a:IsActivated(),
        isHidden = a:IsHidden(),
        isAttributeBonus = a:IsAttributeBonus(),
        isItem = a:IsItem(),
        isPassive = a:IsPassive(),
        procsMagicStick = a:ProcsMagicStick(),
        isTrained = a:IsTrained(),
        canBeUpgraded = a:CanAbilityBeUpgraded(),
        heroLevelToUpgrade = a:GetHeroLevelRequiredToUpgrade(),
        duration = a:GetDuration(),
        castRange = a:GetCastRange(),
        castPoint = a:GetCastPoint(),
        backswingTime = a:GetBackswingTime(),
        channelTime = a:GetChannelTime(),
      }
    end

    self:d(i, t)
  end
end

function GameMode:swapAbilities(_, left, right)
  self:d("swapAbilities()", left, right)

  local player = Convars:GetDOTACommandClient()
  local hero = player:GetAssignedHero()

  hero:SwapAbilities(left, right, true, true)
end

function GameMode:invokeAbility(_, ability)
  self:d("invokeAbility()", ability)

  local player = Convars:GetDOTACommandClient()
  local hero = player:GetAssignedHero()
  local invoker = Invoker(hero)

  invoker:Invoke(ability)
end
