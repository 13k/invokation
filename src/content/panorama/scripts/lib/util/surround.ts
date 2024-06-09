export function surround(s: string, left: string, right?: string): string {
  return `${left}${s}${right ?? left}`;
}
