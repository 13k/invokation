export function prefixOnce(s: string, prefix: string): string {
  return s.startsWith(prefix) ? s : `${prefix}${s}`;
}
