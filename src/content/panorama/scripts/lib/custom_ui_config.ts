namespace invk {
  GameUI.CustomUIConfig().invk = invk;
}

// biome-ignore lint/style/useNamingConvention: builtin type
interface CustomUIConfig {
  invk: typeof invk;
}
