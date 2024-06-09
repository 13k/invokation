import camelCase from "lodash-es/camelCase";
import capitalize from "lodash-es/capitalize";

export function pascalCase(s: string): string {
  return capitalize(camelCase(s));
}
