export const ITEM_NAME_PREFIX = "item_";

export function isItemAbility(name: string): boolean {
  return name.startsWith(ITEM_NAME_PREFIX);
}
