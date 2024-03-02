// Missing types from `@moddota/panorama-types`

// biome-ignore lint/style/useNamingConvention: builtin type
interface CScriptBindingPR_Game {
  /** Get the bool value of the specific convar. Asserts if invalid and returns false */
  // biome-ignore lint/style/useNamingConvention: builtin type
  GetConvarBool(cvar: string): boolean;
  /** Get the int value of the specific convar. Asserts if invalid and returns 0 */
  // biome-ignore lint/style/useNamingConvention: builtin type
  GetConvarInt(cvar: string): number;
  /** Get the float value of the specific convar. Asserts if invalid and returns 0.0 */
  // biome-ignore lint/style/useNamingConvention: builtin type
  GetConvarFloat(cvar: string): number;
}
