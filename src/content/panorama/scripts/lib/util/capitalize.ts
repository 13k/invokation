import { default as loCapitalize } from "lodash-es/capitalize";

export function capitalize<S extends string>(s: S): Capitalize<S> {
  return loCapitalize(s) as Capitalize<S>;
}
