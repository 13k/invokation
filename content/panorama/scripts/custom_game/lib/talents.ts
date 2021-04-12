export const TALENT_BRANCHES = {
  [dota.TalentTier.Tier1]: {
    [dota.TalentSide.RIGHT]: dota.Talent.TIER1_RIGHT,
    [dota.TalentSide.LEFT]: dota.Talent.TIER1_LEFT,
  },
  [dota.TalentTier.Tier2]: {
    [dota.TalentSide.RIGHT]: dota.Talent.TIER2_RIGHT,
    [dota.TalentSide.LEFT]: dota.Talent.TIER2_LEFT,
  },
  [dota.TalentTier.Tier3]: {
    [dota.TalentSide.RIGHT]: dota.Talent.TIER3_RIGHT,
    [dota.TalentSide.LEFT]: dota.Talent.TIER3_LEFT,
  },
  [dota.TalentTier.Tier4]: {
    [dota.TalentSide.RIGHT]: dota.Talent.TIER4_RIGHT,
    [dota.TalentSide.LEFT]: dota.Talent.TIER4_LEFT,
  },
};

export const TALENT_LEVELS = [10, 15, 20, 25];

export const isTalentSelected = (
  tier: dota.TalentTier,
  side: dota.TalentSide,
  selected: dota.Talent
): boolean => {
  const branch = TALENT_BRANCHES[tier][side];

  return (selected & branch) === branch;
};

export const talentArrayIndexToTier = (i: number): dota.TalentTier => (Math.floor(i / 2) + 2) * 5;

export const talentArrayIndexToSide = (i: number): dota.TalentSide =>
  i % 2 === 0 ? dota.TalentSide.RIGHT : dota.TalentSide.LEFT;
