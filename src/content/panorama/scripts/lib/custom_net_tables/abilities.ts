import { CustomNetTable } from "../custom_net_tables";
import type { KeyValues } from "../kv";

export const Name = CustomNetTable.Abilities;

export enum Key {
  KeyValues = "kv",
}

export interface Table {
  [Key.KeyValues]: KeyValues;
}
