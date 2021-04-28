import { forOwn } from "lodash";
import { PANEL_TYPES } from "./const/panorama";
import { hasOwnProperty } from "./object";
import { PanelEventListener, PanelEvents } from "./panel_events";

export type Stringer = { toString: () => string };

export function prefixer(s: string, prefix: string): string {
  return s.startsWith(prefix) ? s : prefix + s;
}

export type QueryParams = Record<string, Stringer>;

export function queryString(params: QueryParams): string {
  return Object.entries(params)
    .map(([key, value]) => `${key}=${value.toString()}`)
    .join("&");
}

export function enumEntries<T extends string>(enumObj: {
  [key: string]: T;
}): IterableIterator<[string, T]>;
export function enumEntries<T extends string | number>(enumObj: {
  [key: string]: T;
}): IterableIterator<[string, Exclude<T, string>]>;
export function* enumEntries<T>(enumObj: { [key: string]: T }): IterableIterator<[string, T]> {
  let isStringEnum = true;

  for (const value of Object.values(enumObj)) {
    if (typeof value === "number") {
      isStringEnum = false;
      break;
    }
  }

  for (const [key, value] of Object.entries(enumObj)) {
    if (isStringEnum || typeof value === "number") {
      yield [key, value];
    }
  }
}

export function isItemAbility(abilityName: string): boolean {
  return abilityName.startsWith("item_");
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function isPanelBase(panel: object): panel is PanelBase {
  return panel != null && hasOwnProperty(panel, "paneltype");
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function isPanel(panel: object): panel is Panel {
  return isPanelBase(panel) && panel.paneltype in PANEL_TYPES;
}

export interface CreatePanelOptions<T> extends ApplyPanelOptions<T> {
  layout?: string;
  snippet?: string;
}

export function createPanel<K extends keyof PanoramaPanelNameMap>(
  type: K,
  parent: PanelBase,
  id: string,
  options: CreatePanelOptions<PanoramaPanelNameMap[K]> = {}
): PanoramaPanelNameMap[K] {
  if (!type) {
    throw new Error("Error creating panel: empty 'type'");
  }

  if (typeof type !== "string") {
    throw new Error(`Error creating panel: 'type' is not a string [${typeof type}]`);
  }

  if (!id) {
    throw new Error(`Error creating panel (type=${type}): empty id`);
  }

  if (typeof id !== "string") {
    throw new Error(`Error creating panel (type=${type}): id is not a string [${typeof id}]`);
  }

  if (!isPanelBase(parent)) {
    throw new Error(`Error creating panel (type=${type}, id=${id}): parent is not a panel`);
  }

  const panel = $.CreatePanel(type, parent, id);

  if (isPanel(panel)) {
    if (options.layout) {
      loadPanelLayout(panel, options.layout, options);
    } else if (options.snippet) {
      loadPanelSnippet(panel, options.snippet, options);
    }

    applyPanelOptions(panel, options);
  }

  return panel;
}

export function loadPanelLayout<T extends Panel>(
  panel: T,
  layout: string,
  options: ApplyPanelOptions<T> = {}
): T {
  if (!isPanel(panel)) {
    throw new Error(`Error loading layout (${layout}): 'panel' is not a panel`);
  }

  const { paneltype, id } = panel;

  if (typeof layout !== "string") {
    throw new Error(
      `Error loading layout (paneltype=${paneltype}, id=${id}, layout=${layout}): 'layout' is not a string`
    );
  }

  if (!layout.startsWith("file://")) {
    throw new Error(
      `Error loading layout (paneltype=${paneltype}, id=${id}, layout=${layout}): 'layout' is not a valid resource URI`
    );
  }

  if (!panel.BLoadLayout(layout, false, false)) {
    throw new Error(
      `Error loading layout (paneltype=${paneltype}, id=${id}, layout=${layout}): BLoadLayout() failed`
    );
  }

  return applyPanelOptions(panel, options);
}

export function loadPanelSnippet<T extends Panel>(
  panel: T,
  snippet: string,
  options: ApplyPanelOptions<T> = {}
): T {
  if (!isPanel(panel)) {
    throw new Error(`Error loading layout snippet (${snippet}): 'panel' is not a panel`);
  }

  const { paneltype, id } = panel;

  if (typeof snippet !== "string") {
    throw new Error(
      `Error loading layout snippet (paneltype=${paneltype}, id=${id}, snippet=${snippet}): 'snippet' is not a string`
    );
  }

  if (!panel.BLoadLayoutSnippet(snippet)) {
    throw new Error(
      `Error loading layout snippet (paneltype=${paneltype}, id=${id}, snippet=${snippet}): BLoadLayoutSnippet() failed`
    );
  }

  return applyPanelOptions(panel, options);
}

export interface ApplyPanelOptions<T> {
  props?: SetPanelPropertiesOptions;
  attrs?: SetPanelAttributesOptions;
  attrsInt?: SetPanelAttributesIntOptions;
  attrsUint32?: SetPanelAttributesUInt32Options;
  dialogVars?: SetPanelDialogVarsOptions;
  dialogVarsInt?: SetPanelDialogVarsIntOptions;
  dialogVarsTime?: SetPanelDialogVarsTimeOptions;
  dialogVarsL10n?: SetPanelDialogVarsL10nOptions;
  dialogVarsL10nPlural?: SetPanelDialogVarsL10nPluralOptions;
  events?: SetPanelEventsOptions<T>;
  classes?: string[];
}

export function applyPanelOptions<T extends Panel>(
  panel: T,
  options: ApplyPanelOptions<T> = {}
): T {
  if (!isPanel(panel)) {
    throw new Error(`Error applying panel options: 'panel' is not a panel`);
  }

  setPanelProperties(panel, options.props);
  setPanelAttributes(panel, options.attrs);
  setPanelAttributesInt(panel, options.attrsInt);
  setPanelAttributesUInt32(panel, options.attrsUint32);
  setPanelDialogVars(panel, options.dialogVars);
  setPanelDialogVarsInt(panel, options.dialogVarsInt);
  setPanelDialogVarsTime(panel, options.dialogVarsTime);
  setPanelDialogVarsL10n(panel, options.dialogVarsL10n);
  setPanelDialogVarsL10nPlural(panel, options.dialogVarsL10nPlural);
  setPanelEvents(panel, options.events);
  addPanelClasses(panel, options.classes);

  return panel;
}

export function addPanelClasses(panel: Panel, classes?: string[]): void {
  classes && classes.map((cls) => panel.AddClass(cls));
}

export interface SetPanelPropertiesOptions {
  [key: string]: string | number | boolean;
}

export function setPanelProperties(panel: Panel, props?: SetPanelPropertiesOptions): void {
  props && Object.assign(panel, props);
}

export interface SetPanelAttributesOptions {
  [key: string]: string;
}

export function setPanelAttributes(panel: Panel, attrs?: SetPanelAttributesOptions): void {
  forOwn(attrs, (value, key) => panel.SetAttributeString(key, value));
}

export interface SetPanelAttributesIntOptions {
  [key: string]: number;
}

export function setPanelAttributesInt(panel: Panel, attrs?: SetPanelAttributesIntOptions): void {
  forOwn(attrs, (value, key) => panel.SetAttributeInt(key, value));
}

export interface SetPanelAttributesUInt32Options {
  [key: string]: number;
}

export function setPanelAttributesUInt32(
  panel: Panel,
  attrs?: SetPanelAttributesUInt32Options
): void {
  forOwn(attrs, (value, key) => panel.SetAttributeUInt32(key, value));
}

export interface SetPanelDialogVarsOptions {
  [key: string]: string;
}

export function setPanelDialogVars(panel: Panel, vars?: SetPanelDialogVarsOptions): void {
  forOwn(vars, (value, key) => panel.SetDialogVariable(key, value));
}

export interface SetPanelDialogVarsIntOptions {
  [key: string]: number;
}

export function setPanelDialogVarsInt(panel: Panel, vars?: SetPanelDialogVarsIntOptions): void {
  forOwn(vars, (value, key) => panel.SetDialogVariableInt(key, value));
}

export interface SetPanelDialogVarsTimeOptions {
  [key: string]: number;
}

export function setPanelDialogVarsTime(panel: Panel, vars?: SetPanelDialogVarsTimeOptions): void {
  forOwn(vars, (value, key) => panel.SetDialogVariableTime(key, value));
}

export interface SetPanelDialogVarsL10nOptions {
  [key: string]: string;
}

export function setPanelDialogVarsL10n(panel: Panel, vars?: SetPanelDialogVarsL10nOptions): void {
  forOwn(vars, (value, key) => panel.SetDialogVariableLocString(key, value));
}

export interface SetPanelDialogVarsL10nPluralOptions {
  [key: string]: { value: string; count: number };
}

export function setPanelDialogVarsL10nPlural(
  panel: Panel,
  vars?: SetPanelDialogVarsL10nPluralOptions
): void {
  forOwn(vars, ({ value, count }, key) =>
    panel.SetDialogVariablePluralLocStringInt(key, value, count)
  );
}

export function setPanelEvent<T extends PanelBase>(
  panel: T,
  event: PanelEvent,
  listener: PanelEventListener<T>
): void {
  PanelEvents.listen(panel, event, listener);
}

export type SetPanelEventsOptions<T> = {
  [K in PanelEvent]?: PanelEventListener<T>;
};

export function setPanelEvents<T extends PanelBase>(
  panel: T,
  events?: SetPanelEventsOptions<T>
): void {
  forOwn(
    events,
    (listener, event) => listener && setPanelEvent(panel, event as PanelEvent, listener)
  );
}
