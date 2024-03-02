// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace invk {
  export namespace dota2 {
    export enum TalentLevel {
      Tier1 = 10,
      Tier2 = 15,
      Tier3 = 20,
      Tier4 = 25,
    }

    export enum TalentSide {
      Left = "LEFT",
      Right = "RIGHT",
    }

    export enum TalentSelection {
      NONE = 0,
      L10_RIGHT = 1 << 0,
      L10_LEFT = 1 << 1,
      L15_RIGHT = 1 << 2,
      L15_LEFT = 1 << 3,
      L20_RIGHT = 1 << 4,
      L20_LEFT = 1 << 5,
      L25_RIGHT = 1 << 6,
      L25_LEFT = 1 << 7,
    }

    export type TalentMap<T> = Map<TalentLevel, Map<TalentSide, T>>;

    const selectionKey = (level: TalentLevel, side: TalentSide): keyof typeof TalentSelection =>
      `L${level}_${side}`;

    const selectionValue = (level: TalentLevel, side: TalentSide): TalentSelection =>
      TalentSelection[selectionKey(level, side)];

    export class Talents {
      static indexToLevel(i: number): TalentLevel {
        return ((Math.floor(i / 2) + 2) * 5) as TalentLevel;
      }

      static indexToSide(i: number): TalentSide {
        return i % 2 === 0 ? TalentSide.Right : TalentSide.Left;
      }

      constructor(public value: TalentSelection) {}

      isSelected(level: TalentLevel, side: TalentSide) {
        return (selectionValue(level, side) & this.value) > 0;
      }
    }
  }
}
