namespace invk {
  export namespace Dota2 {
    export enum TalentLevel {
      Tier1 = 10,
      Tier2 = 15,
      Tier3 = 20,
      Tier4 = 25,
    }

    export enum TalentSide {
      Left = "Left",
      Right = "Right",
    }

    export enum TalentSelection {
      None = 0,
      L10Right = 1 << 0,
      L10Left = 1 << 1,
      L15Right = 1 << 2,
      L15Left = 1 << 3,
      L20Right = 1 << 4,
      L20Left = 1 << 5,
      L25Right = 1 << 6,
      L25Left = 1 << 7,
    }

    export type TalentMap<T> = Map<TalentLevel, Map<TalentSide, T>>;

    const selectionKey = (level: TalentLevel, side: TalentSide): keyof typeof TalentSelection =>
      `L${level}${side}`;

    const selectionValue = (level: TalentLevel, side: TalentSide): TalentSelection =>
      TalentSelection[selectionKey(level, side)];

    export class Talents {
      static indexToLevel(i: number): TalentLevel {
        return ((Math.floor(i / 2) + 2) * 5) as TalentLevel;
      }

      static indexToSide(i: number): TalentSide {
        return i % 2 === 0 ? TalentSide.Right : TalentSide.Left;
      }

      value: TalentSelection;

      constructor(value: TalentSelection) {
        this.value = value;
      }

      isSelected(level: TalentLevel, side: TalentSide) {
        return (selectionValue(level, side) & this.value) > 0;
      }
    }
  }
}
