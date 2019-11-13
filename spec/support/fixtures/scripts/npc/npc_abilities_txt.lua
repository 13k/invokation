return {
  invoker_quas = {
    ID = 5370,
    AbilityBehavior = "DOTA_ABILITY_BEHAVIOR_NO_TARGET | DOTA_ABILITY_BEHAVIOR_IMMEDIATE",
    SpellDispellableType = "SPELL_DISPELLABLE_NO",
    MaxLevel = 7,
    AbilityCooldown = 0,
    AbilityManaCost = 0,
    AbilityCastAnimation = "ACT_INVALID",
    AbilitySpecial = {
      ["01"] = {
        var_type = "FIELD_FLOAT",
        health_regen_per_instance = "1 3 5 7 9 11 13",
      },
    },
  },
  invoker_wex = {
    ID = 5371,
    AbilityBehavior = "DOTA_ABILITY_BEHAVIOR_NO_TARGET | DOTA_ABILITY_BEHAVIOR_IMMEDIATE",
    SpellDispellableType = "SPELL_DISPELLABLE_NO",
    MaxLevel = 7,
    AbilityCooldown = 0,
    AbilityManaCost = 0,
    AbilityCastAnimation = "ACT_INVALID",
    AbilitySpecial = {
      ["01"] = {
        var_type = "FIELD_INTEGER",
        attack_speed_per_instance = "2 4 6 8 10 12 14",
      },
      ["02"] = {
        var_type = "FIELD_INTEGER",
        move_speed_per_instance = "1 2 3 4 5 6 7",
      },
    },
  },
  invoker_exort = {
    ID = 5372,
    AbilityBehavior = "DOTA_ABILITY_BEHAVIOR_NO_TARGET | DOTA_ABILITY_BEHAVIOR_IMMEDIATE",
    SpellDispellableType = "SPELL_DISPELLABLE_NO",
    MaxLevel = 7,
    AbilityCooldown = 0,
    AbilityManaCost = 0,
    AbilityCastAnimation = "ACT_INVALID",
    AbilitySpecial = {
      ["01"] = {
        var_type = "FIELD_INTEGER",
        bonus_damage_per_instance = "2 6 10 14 18 22 26",
      },
    },
  },
  invoker_empty1 = {
    ID = 5373,
    AbilityBehavior = "DOTA_ABILITY_BEHAVIOR_PASSIVE | DOTA_ABILITY_BEHAVIOR_NOT_LEARNABLE",
    MaxLevel = 0,
    AbilityCastAnimation = "ACT_INVALID",
  },
  invoker_empty2 = {
    ID = 5374,
    AbilityBehavior = "DOTA_ABILITY_BEHAVIOR_PASSIVE | DOTA_ABILITY_BEHAVIOR_NOT_LEARNABLE",
    MaxLevel = 0,
    AbilityCastAnimation = "ACT_INVALID",
  },
  invoker_invoke = {
    ID = 5375,
    AbilityBehavior = "DOTA_ABILITY_BEHAVIOR_NO_TARGET | DOTA_ABILITY_BEHAVIOR_IMMEDIATE | DOTA_ABILITY_BEHAVIOR_SHOW_IN_GUIDES",
    AbilityType = "DOTA_ABILITY_TYPE_ULTIMATE",
    MaxLevel = 1,
    RequiredLevel = 1,
    AbilitySound = "Hero_Invoker.Invoke",
    HasScepterUpgrade = 1,
    AbilityCooldown = 6,
    AbilityManaCost = 0,
    AbilityCastAnimation = "ACT_INVALID",
    AbilitySpecial = {
      ["01"] = {
        var_type = "FIELD_INTEGER",
        max_invoked_spells = 2,
      },
      ["02"] = {
        var_type = "FIELD_FLOAT",
        cooldown_scepter = 2,
        RequiresScepter = 1,
      },
      ["03"] = {
        var_type = "FIELD_INTEGER",
        mana_cost_scepter = 0,
      },
    },
  },
  invoker_cold_snap = {
    ID = 5376,
    AbilityBehavior = "DOTA_ABILITY_BEHAVIOR_UNIT_TARGET | DOTA_ABILITY_BEHAVIOR_HIDDEN | DOTA_ABILITY_BEHAVIOR_NOT_LEARNABLE | DOTA_ABILITY_BEHAVIOR_IGNORE_BACKSWING | DOTA_ABILITY_BEHAVIOR_SHOW_IN_GUIDES",
    SpellImmunityType = "SPELL_IMMUNITY_ENEMIES_NO",
    SpellDispellableType = "SPELL_DISPELLABLE_YES",
    MaxLevel = 1,
    HotKeyOverride = "Y",
    FightRecapLevel = 1,
    AbilitySound = "Hero_Invoker.ColdSnap",
    AbilityUnitTargetTeam = "DOTA_UNIT_TARGET_TEAM_ENEMY",
    AbilityUnitTargetType = "DOTA_UNIT_TARGET_HERO | DOTA_UNIT_TARGET_BASIC",
    AbilityUnitDamageType = "DAMAGE_TYPE_MAGICAL",
    AbilityCastRange = 1000,
    AbilityCastPoint = 0.05,
    AbilityCastAnimation = "ACT_INVALID",
    AbilityCooldown = 20,
    AbilityManaCost = 100,
    AbilityModifierSupportValue = 0.15,
    AbilitySpecial = {
      ["01"] = {
        var_type = "FIELD_FLOAT",
        duration = "3.0 3.5 4.0 4.5 5.0 5.5 6.0 6.5",
        levelkey = "quaslevel",
        LinkedSpecialBonus = "special_bonus_unique_invoker_7",
      },
      ["02"] = {
        var_type = "FIELD_FLOAT",
        freeze_duration = 0.4,
      },
      ["03"] = {
        var_type = "FIELD_FLOAT",
        freeze_cooldown = "0.77 0.74 0.71 0.69 0.66 0.63 0.60 0.57",
        levelkey = "quaslevel",
      },
      ["04"] = {
        var_type = "FIELD_FLOAT",
        freeze_damage = "8 16 24 32 40 48 56 64",
        levelkey = "quaslevel",
      },
      ["05"] = {
        var_type = "FIELD_FLOAT",
        damage_trigger = 10.0,
      },
    },
  },
  invoker_ghost_walk = {
    ID = 5381,
    AbilityBehavior = "DOTA_ABILITY_BEHAVIOR_NO_TARGET | DOTA_ABILITY_BEHAVIOR_IMMEDIATE | DOTA_ABILITY_BEHAVIOR_HIDDEN | DOTA_ABILITY_BEHAVIOR_NOT_LEARNABLE | DOTA_ABILITY_BEHAVIOR_IGNORE_CHANNEL | DOTA_ABILITY_BEHAVIOR_SHOW_IN_GUIDES",
    SpellImmunityType = "SPELL_IMMUNITY_ENEMIES_NO",
    SpellDispellableType = "SPELL_DISPELLABLE_NO",
    MaxLevel = 1,
    HotKeyOverride = "V",
    AbilitySound = "Hero_Invoker.GhostWalk",
    AbilityCooldown = 45,
    AbilityManaCost = 200,
    AbilityCastPoint = 0.05,
    AbilityCastAnimation = "ACT_INVALID",
    AbilitySpecial = {
      ["01"] = {
        var_type = "FIELD_FLOAT",
        duration = 100.0,
      },
      ["02"] = {
        var_type = "FIELD_INTEGER",
        area_of_effect = 400,
      },
      ["03"] = {
        var_type = "FIELD_INTEGER",
        enemy_slow = "-20 -25 -30 -35 -40 -45 -50 -55",
        levelkey = "quaslevel",
      },
      ["04"] = {
        var_type = "FIELD_INTEGER",
        self_slow = "-30 -20 -10 0 10 20 30 40",
        levelkey = "wexlevel",
      },
      ["05"] = {
        var_type = "FIELD_FLOAT",
        aura_fade_time = 2.0,
      },
    },
  },
  invoker_tornado = {
    ID = 5382,
    AbilityBehavior = "DOTA_ABILITY_BEHAVIOR_POINT | DOTA_ABILITY_BEHAVIOR_HIDDEN | DOTA_ABILITY_BEHAVIOR_NOT_LEARNABLE | DOTA_ABILITY_BEHAVIOR_IGNORE_BACKSWING | DOTA_ABILITY_BEHAVIOR_SHOW_IN_GUIDES",
    SpellImmunityType = "SPELL_IMMUNITY_ENEMIES_NO",
    SpellDispellableType = "SPELL_DISPELLABLE_YES",
    MaxLevel = 1,
    HotKeyOverride = "X",
    AbilityUnitDamageType = "DAMAGE_TYPE_MAGICAL",
    AbilitySound = "Hero_Invoker.Tornado",
    AbilityCastRange = 2000,
    AbilityCastPoint = 0.05,
    AbilityCastAnimation = "ACT_INVALID",
    AbilityCooldown = 30,
    AbilityManaCost = 150,
    AbilitySpecial = {
      ["01"] = {
        var_type = "FIELD_INTEGER",
        travel_distance = "800 1200 1600 2000 2400 2800 3200 3600",
        levelkey = "wexlevel",
      },
      ["02"] = {
        var_type = "FIELD_INTEGER",
        travel_speed = 1000,
      },
      ["03"] = {
        var_type = "FIELD_INTEGER",
        area_of_effect = 200,
      },
      ["04"] = {
        var_type = "FIELD_INTEGER",
        vision_distance = 200,
      },
      ["05"] = {
        var_type = "FIELD_FLOAT",
        end_vision_duration = 1.75,
      },
      ["06"] = {
        var_type = "FIELD_FLOAT",
        lift_duration = "0.8 1.1 1.4 1.7 2.0 2.3 2.6 2.9",
        LinkedSpecialBonus = "special_bonus_unique_invoker_8",
        levelkey = "quaslevel",
      },
      ["07"] = {
        var_type = "FIELD_FLOAT",
        base_damage = 70,
      },
      ["08"] = {
        var_type = "FIELD_FLOAT",
        quas_damage = "0 0 0 0 0 0 0",
        levelkey = "quaslevel",
      },
      ["09"] = {
        var_type = "FIELD_FLOAT",
        wex_damage = "45 90 135 180 225 270 315 360",
        levelkey = "wexlevel",
      },
    },
  },
  invoker_emp = {
    ID = 5383,
    AbilityBehavior = "DOTA_ABILITY_BEHAVIOR_POINT | DOTA_ABILITY_BEHAVIOR_HIDDEN | DOTA_ABILITY_BEHAVIOR_NOT_LEARNABLE | DOTA_ABILITY_BEHAVIOR_AOE | DOTA_ABILITY_BEHAVIOR_IGNORE_BACKSWING | DOTA_ABILITY_BEHAVIOR_SHOW_IN_GUIDES",
    SpellImmunityType = "SPELL_IMMUNITY_ENEMIES_NO",
    MaxLevel = 1,
    HotKeyOverride = "C",
    AbilityUnitDamageType = "DAMAGE_TYPE_MAGICAL",
    AbilitySound = "Hero_Invoker.EMP.Charge",
    AbilityCastRange = 950,
    AbilityCastPoint = 0.05,
    AbilityCastAnimation = "ACT_INVALID",
    AbilityCooldown = 30,
    AbilityManaCost = 125,
    AbilitySpecial = {
      ["01"] = {
        var_type = "FIELD_FLOAT",
        delay = 2.9,
        levelkey = "wexlevel",
      },
      ["02"] = {
        var_type = "FIELD_INTEGER",
        area_of_effect = 675,
      },
      ["03"] = {
        var_type = "FIELD_INTEGER",
        mana_burned = "100 175 250 325 400 475 550 625",
        levelkey = "wexlevel",
      },
      ["04"] = {
        var_type = "FIELD_INTEGER",
        damage_per_mana_pct = 60,
      },
    },
  },
  invoker_alacrity = {
    ID = 5384,
    AbilityBehavior = "DOTA_ABILITY_BEHAVIOR_UNIT_TARGET | DOTA_ABILITY_BEHAVIOR_HIDDEN | DOTA_ABILITY_BEHAVIOR_NOT_LEARNABLE | DOTA_ABILITY_BEHAVIOR_DONT_RESUME_ATTACK | DOTA_ABILITY_BEHAVIOR_IGNORE_BACKSWING | DOTA_ABILITY_BEHAVIOR_SHOW_IN_GUIDES",
    MaxLevel = 1,
    HotKeyOverride = "Z",
    AbilitySound = "Hero_Invoker.Alacrity",
    AbilityUnitTargetTeam = "DOTA_UNIT_TARGET_TEAM_FRIENDLY",
    AbilityUnitTargetType = "DOTA_UNIT_TARGET_HERO | DOTA_UNIT_TARGET_CREEP",
    SpellImmunityType = "SPELL_IMMUNITY_ALLIES_YES",
    SpellDispellableType = "SPELL_DISPELLABLE_YES",
    AbilityCastRange = 650,
    AbilityCastPoint = 0.05,
    AbilityCastAnimation = "ACT_INVALID",
    AbilityCooldown = 17,
    AbilityManaCost = 60,
    AbilitySpecial = {
      ["01"] = {
        var_type = "FIELD_INTEGER",
        bonus_attack_speed = "10 25 40 55 70 85 100 115",
        levelkey = "wexlevel",
        LinkedSpecialBonus = "special_bonus_unique_invoker_5",
      },
      ["02"] = {
        var_type = "FIELD_INTEGER",
        bonus_damage = "10 25 40 55 70 85 100 115",
        levelkey = "exortlevel",
        LinkedSpecialBonus = "special_bonus_unique_invoker_5",
      },
      ["03"] = {
        var_type = "FIELD_FLOAT",
        duration = 9,
      },
    },
  },
  invoker_chaos_meteor = {
    ID = 5385,
    AbilityBehavior = "DOTA_ABILITY_BEHAVIOR_POINT | DOTA_ABILITY_BEHAVIOR_HIDDEN | DOTA_ABILITY_BEHAVIOR_NOT_LEARNABLE | DOTA_ABILITY_BEHAVIOR_IGNORE_BACKSWING | DOTA_ABILITY_BEHAVIOR_SHOW_IN_GUIDES",
    MaxLevel = 1,
    HotKeyOverride = "D",
    AbilityUnitDamageType = "DAMAGE_TYPE_MAGICAL",
    SpellImmunityType = "SPELL_IMMUNITY_ENEMIES_NO",
    SpellDispellableType = "SPELL_DISPELLABLE_YES",
    FightRecapLevel = 1,
    AbilitySound = "Hero_Invoker.ChaosMeteor.Impact",
    AbilityCastRange = 700,
    AbilityCastPoint = 0.05,
    AbilityCastAnimation = "ACT_INVALID",
    AbilityCooldown = 55,
    AbilityManaCost = 200,
    AbilityModifierSupportValue = 0.0,
    AbilitySpecial = {
      ["01"] = {
        var_type = "FIELD_FLOAT",
        land_time = 1.3,
      },
      ["02"] = {
        var_type = "FIELD_INTEGER",
        area_of_effect = 275,
      },
      ["03"] = {
        var_type = "FIELD_INTEGER",
        travel_distance = "465 615 780 930 1095 1245 1410 1575",
        levelkey = "wexlevel",
      },
      ["04"] = {
        var_type = "FIELD_INTEGER",
        travel_speed = 300,
      },
      ["05"] = {
        var_type = "FIELD_FLOAT",
        damage_interval = 0.5,
        CalculateSpellDamageTooltip = 0,
      },
      ["06"] = {
        var_type = "FIELD_INTEGER",
        vision_distance = 500,
      },
      ["07"] = {
        var_type = "FIELD_FLOAT",
        end_vision_duration = 3.0,
      },
      ["08"] = {
        var_type = "FIELD_FLOAT",
        main_damage = "57.5 75 92.5 110 127.5 145 162.5 180",
        LinkedSpecialBonus = "special_bonus_unique_invoker_6",
        levelkey = "exortlevel",
      },
      ["09"] = {
        var_type = "FIELD_FLOAT",
        burn_duration = 3.0,
      },
      ["10"] = {
        var_type = "FIELD_FLOAT",
        burn_dps = "11.5 15 18.5 22 25.5 29 32.5 36",
        levelkey = "exortlevel",
        CalculateSpellDamageTooltip = 1,
      },
    },
  },
  invoker_sun_strike = {
    ID = 5386,
    AbilityBehavior = "DOTA_ABILITY_BEHAVIOR_POINT | DOTA_ABILITY_BEHAVIOR_HIDDEN | DOTA_ABILITY_BEHAVIOR_NOT_LEARNABLE | DOTA_ABILITY_BEHAVIOR_AOE | DOTA_ABILITY_BEHAVIOR_IGNORE_BACKSWING | DOTA_ABILITY_BEHAVIOR_SHOW_IN_GUIDES",
    MaxLevel = 1,
    HotKeyOverride = "T",
    AbilityUnitDamageType = "DAMAGE_TYPE_PURE",
    SpellImmunityType = "SPELL_IMMUNITY_ENEMIES_YES",
    FightRecapLevel = 1,
    AbilitySound = "Hero_Invoker.SunStrike.Charge",
    AbilityCastRange = 0,
    AbilityCastPoint = 0.05,
    AbilityCastAnimation = "ACT_INVALID",
    AbilityCooldown = 25,
    AbilityManaCost = 175,
    AbilitySpecial = {
      ["01"] = {
        var_type = "FIELD_FLOAT",
        delay = 1.7,
      },
      ["02"] = {
        var_type = "FIELD_INTEGER",
        area_of_effect = 175,
      },
      ["03"] = {
        var_type = "FIELD_FLOAT",
        damage = "100 162.5 225 287.5 350 412.5 475 537.5",
        levelkey = "exortlevel",
      },
      ["04"] = {
        var_type = "FIELD_INTEGER",
        vision_distance = 400,
      },
      ["05"] = {
        var_type = "FIELD_FLOAT",
        vision_duration = 4.0,
      },
    },
  },
  invoker_forge_spirit = {
    ID = 5387,
    AbilityBehavior = "DOTA_ABILITY_BEHAVIOR_NO_TARGET | DOTA_ABILITY_BEHAVIOR_HIDDEN | DOTA_ABILITY_BEHAVIOR_NOT_LEARNABLE | DOTA_ABILITY_BEHAVIOR_IGNORE_BACKSWING | DOTA_ABILITY_BEHAVIOR_SHOW_IN_GUIDES",
    SpellImmunityType = "SPELL_IMMUNITY_ENEMIES_NO",
    MaxLevel = 1,
    HotKeyOverride = "F",
    AbilitySound = "Hero_Invoker.ForgeSpirit",
    AbilityCooldown = 30,
    AbilityManaCost = 75,
    AbilityCastPoint = 0.05,
    AbilityCastAnimation = "ACT_INVALID",
    AbilitySpecial = {
      ["01"] = {
        var_type = "FIELD_FLOAT",
        spirit_damage = "22 32 42 52 62 72 82 92",
        levelkey = "exortlevel",
      },
      ["02"] = {
        var_type = "FIELD_INTEGER",
        spirit_mana = "100 150 200 250 300 350 400 450",
        levelkey = "exortlevel",
      },
      ["03"] = {
        var_type = "FIELD_INTEGER",
        spirit_armor = "0 1 2 3 4 5 6 7",
        levelkey = "exortlevel",
      },
      ["04"] = {
        var_type = "FIELD_FLOAT",
        spirit_attack_range = "300 365 430 495 560 625 690 755",
        levelkey = "quaslevel",
      },
      ["05"] = {
        var_type = "FIELD_INTEGER",
        spirit_hp = "300 400 500 600 700 800 900 1000",
        levelkey = "quaslevel",
      },
      ["06"] = {
        var_type = "FIELD_FLOAT",
        spirit_duration = "20 30 40 50 60 70 80 90",
        levelkey = "quaslevel",
      },
    },
  },
  invoker_ice_wall = {
    ID = 5389,
    AbilityBehavior = "DOTA_ABILITY_BEHAVIOR_NO_TARGET | DOTA_ABILITY_BEHAVIOR_HIDDEN | DOTA_ABILITY_BEHAVIOR_NOT_LEARNABLE | DOTA_ABILITY_BEHAVIOR_IGNORE_BACKSWING | DOTA_ABILITY_BEHAVIOR_SHOW_IN_GUIDES",
    SpellImmunityType = "SPELL_IMMUNITY_ENEMIES_NO",
    SpellDispellableType = "SPELL_DISPELLABLE_NO",
    MaxLevel = 1,
    HotKeyOverride = "G",
    AbilityUnitDamageType = "DAMAGE_TYPE_MAGICAL",
    FightRecapLevel = 1,
    AbilitySound = "Hero_Invoker.IceWall.Cast",
    AbilityCooldown = 25,
    AbilityManaCost = 175,
    AbilityCastPoint = 0.05,
    AbilityCastAnimation = "ACT_INVALID",
    AbilitySpecial = {
      ["01"] = {
        var_type = "FIELD_FLOAT",
        duration = "3.0 4.5 6.0 7.5 9.0 10.5 12.0 13.5",
        levelkey = "quaslevel",
      },
      ["02"] = {
        var_type = "FIELD_INTEGER",
        slow = "-20 -40 -60 -80 -100 -120 -140 -160",
        levelkey = "quaslevel",
      },
      ["03"] = {
        var_type = "FIELD_FLOAT",
        slow_duration = 2.0,
      },
      ["04"] = {
        var_type = "FIELD_FLOAT",
        damage_per_second = "6 12 18 24 30 36 42 48",
        levelkey = "exortlevel",
      },
      ["05"] = {
        var_type = "FIELD_INTEGER",
        wall_place_distance = 200,
      },
      ["06"] = {
        var_type = "FIELD_INTEGER",
        num_wall_elements = 15,
      },
      ["07"] = {
        var_type = "FIELD_INTEGER",
        wall_element_spacing = 80,
      },
      ["08"] = {
        var_type = "FIELD_INTEGER",
        wall_element_radius = 105,
      },
    },
  },
  invoker_deafening_blast = {
    ID = 5390,
    AbilityBehavior = "DOTA_ABILITY_BEHAVIOR_POINT | DOTA_ABILITY_BEHAVIOR_HIDDEN | DOTA_ABILITY_BEHAVIOR_NOT_LEARNABLE | DOTA_ABILITY_BEHAVIOR_IGNORE_BACKSWING | DOTA_ABILITY_BEHAVIOR_SHOW_IN_GUIDES",
    SpellImmunityType = "SPELL_IMMUNITY_ENEMIES_NO",
    SpellDispellableType = "SPELL_DISPELLABLE_NO",
    MaxLevel = 1,
    HotKeyOverride = "B",
    AbilityUnitDamageType = "DAMAGE_TYPE_MAGICAL",
    FightRecapLevel = 1,
    AbilitySound = "Hero_Invoker.DeafeningBlast",
    AbilityCastRange = 1000,
    AbilityCastPoint = 0.05,
    AbilityCastAnimation = "ACT_INVALID",
    AbilityCooldown = 40,
    AbilityManaCost = 300,
    AbilityModifierSupportValue = 0.5,
    AbilitySpecial = {
      ["01"] = {
        var_type = "FIELD_INTEGER",
        travel_distance = 1000,
      },
      ["02"] = {
        var_type = "FIELD_INTEGER",
        travel_speed = 1100,
      },
      ["03"] = {
        var_type = "FIELD_INTEGER",
        radius_start = 175,
      },
      ["04"] = {
        var_type = "FIELD_INTEGER",
        radius_end = 225,
      },
      ["05"] = {
        var_type = "FIELD_FLOAT",
        end_vision_duration = 1.75,
      },
      ["06"] = {
        var_type = "FIELD_FLOAT",
        damage = "40 80 120 160 200 240 280 320",
        levelkey = "exortlevel",
      },
      ["07"] = {
        var_type = "FIELD_FLOAT",
        knockback_duration = "0.25 0.5 0.75 1.0 1.25 1.5 1.75 2.0",
        levelkey = "quaslevel",
      },
      ["08"] = {
        var_type = "FIELD_FLOAT",
        disarm_duration = "1.25 2.0 2.75 3.5 4.25 5.0 5.75 6.5",
        levelkey = "wexlevel",
      },
    },
  },
  special_bonus_unique_invoker_1 = {
    ID = 6097,
    AbilityType = "DOTA_ABILITY_TYPE_ATTRIBUTES",
    AbilityBehavior = "DOTA_ABILITY_BEHAVIOR_PASSIVE",
    AbilitySpecial = {
      ["01"] = {
        var_type = "FIELD_INTEGER",
        value = 2,
      },
    },
  },
  special_bonus_unique_invoker_2 = {
    ID = 6098,
    AbilityType = "DOTA_ABILITY_TYPE_ATTRIBUTES",
    AbilityBehavior = "DOTA_ABILITY_BEHAVIOR_PASSIVE",
    AbilitySpecial = {
      ["01"] = {
        var_type = "FIELD_INTEGER",
        value = 0,
      },
    },
  },
  special_bonus_unique_invoker_3 = {
    ID = 6099,
    AbilityType = "DOTA_ABILITY_TYPE_ATTRIBUTES",
    AbilityBehavior = "DOTA_ABILITY_BEHAVIOR_PASSIVE",
    AbilitySpecial = {
      ["01"] = {
        var_type = "FIELD_INTEGER",
        value = 16,
      },
    },
  },
  special_bonus_unique_invoker_4 = {
    ID = 6656,
    AbilityType = "DOTA_ABILITY_TYPE_ATTRIBUTES",
    AbilityBehavior = "DOTA_ABILITY_BEHAVIOR_PASSIVE",
    AbilitySpecial = {
      ["01"] = {
        var_type = "FIELD_INTEGER",
        value = 2,
      },
      ["02"] = {
        var_type = "FIELD_INTEGER",
        cooldown = 90,
      },
      ["03"] = {
        var_type = "FIELD_INTEGER",
        min_range = 160,
      },
      ["04"] = {
        var_type = "FIELD_INTEGER",
        max_range = 200,
      },
    },
  },
  special_bonus_unique_invoker_5 = {
    ID = 6657,
    AbilityType = "DOTA_ABILITY_TYPE_ATTRIBUTES",
    AbilityBehavior = "DOTA_ABILITY_BEHAVIOR_PASSIVE",
    AbilitySpecial = {
      ["01"] = {
        var_type = "FIELD_INTEGER",
        value = 50,
      },
    },
  },
  special_bonus_unique_invoker_6 = {
    ID = 6811,
    AbilityType = "DOTA_ABILITY_TYPE_ATTRIBUTES",
    AbilityBehavior = "DOTA_ABILITY_BEHAVIOR_PASSIVE",
    AbilitySpecial = {
      ["01"] = {
        var_type = "FIELD_INTEGER",
        value = 40,
      },
    },
  },
  special_bonus_unique_invoker_7 = {
    ID = 7016,
    AbilityType = "DOTA_ABILITY_TYPE_ATTRIBUTES",
    AbilityBehavior = "DOTA_ABILITY_BEHAVIOR_PASSIVE",
    AbilitySpecial = {
      ["01"] = {
        var_type = "FIELD_FLOAT",
        value = 2.5,
      },
    },
  },
  special_bonus_unique_invoker_8 = {
    ID = 7017,
    AbilityType = "DOTA_ABILITY_TYPE_ATTRIBUTES",
    AbilityBehavior = "DOTA_ABILITY_BEHAVIOR_PASSIVE",
    AbilitySpecial = {
      ["01"] = {
        var_type = "FIELD_FLOAT",
        value = 1.25,
      },
    },
  },
  special_bonus_unique_invoker_9 = {
    ID = 7148,
    AbilityType = "DOTA_ABILITY_TYPE_ATTRIBUTES",
    AbilityBehavior = "DOTA_ABILITY_BEHAVIOR_PASSIVE",
    AbilitySpecial = {
      ["01"] = {
        var_type = "FIELD_INTEGER",
        value = 15,
      },
    },
  },
  special_bonus_unique_invoker_10 = {
    ID = 7390,
    AbilityType = "DOTA_ABILITY_TYPE_ATTRIBUTES",
    AbilityBehavior = "DOTA_ABILITY_BEHAVIOR_PASSIVE",
    AbilitySpecial = {
      ["01"] = {
        var_type = "FIELD_INTEGER",
        value = 30,
      },
    },
  },
}
