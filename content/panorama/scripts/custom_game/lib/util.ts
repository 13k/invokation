import { forEach } from "lodash";
import { INVOKER } from "./const/invoker";
import { PANEL_TYPES } from "./const/panorama";
import { hasOwnProperty } from "./object";
import { PanelEvent, PanelEventListener } from "./panel_event";

export const prefixer = (s: string, prefix: string): string =>
  s.startsWith(prefix) ? s : prefix + s;

export const isOrbAbility = (abilityName: string): boolean => abilityName in INVOKER.ORB_ABILITIES;

export const isInvocationAbility = (abilityName: string): boolean =>
  isOrbAbility(abilityName) || abilityName === INVOKER.ABILITY_INVOKE;

export const isItemAbility = (abilityName: string): boolean => abilityName.startsWith("item_");

// eslint-disable-next-line @typescript-eslint/ban-types
export const isPanelBase = (panel: object): panel is PanelBase =>
  panel != null && hasOwnProperty(panel, "paneltype");

// eslint-disable-next-line @typescript-eslint/ban-types
export const isPanel = (panel: object): panel is Panel =>
  isPanelBase(panel) && panel.paneltype in PANEL_TYPES;

export interface CreatePanelOptions extends ApplyPanelOptions {
  layout?: string;
  snippet?: string;
}

export function createPanel<K extends keyof PanoramaPanelNameMap>(
  type: K,
  parent: PanelBase,
  id: string,
  options: CreatePanelOptions = {}
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

export const loadPanelLayout = <T extends Panel>(
  panel: T,
  layout: string,
  options: ApplyPanelOptions = {}
): T => {
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
};

export const loadPanelSnippet = <T extends Panel>(
  panel: T,
  snippet: string,
  options: ApplyPanelOptions = {}
): T => {
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
};

export interface ApplyPanelOptions {
  props?: SetPanelPropertiesOptions;
  attrs?: SetPanelAttributesOptions;
  attrsInt?: SetPanelAttributesIntOptions;
  attrsUint32?: SetPanelAttributesUInt32Options;
  dialogVars?: SetPanelDialogVarsOptions;
  dialogVarsInt?: SetPanelDialogVarsIntOptions;
  dialogVarsTime?: SetPanelDialogVarsTimeOptions;
  dialogVarsL10n?: SetPanelDialogVarsL10nOptions;
  dialogVarsL10nPlural?: SetPanelDialogVarsL10nPluralOptions;
  events?: SetPanelEventsOptions;
  classes?: string[];
}

export const applyPanelOptions = <T extends Panel>(
  panel: T,
  options: ApplyPanelOptions = {}
): T => {
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
};

export const addPanelClasses = (panel: Panel, classes?: string[]): void => {
  classes && classes.map((cls) => panel.AddClass(cls));
};

export interface SetPanelPropertiesOptions {
  [key: string]: string | number;
}

export const setPanelProperties = (panel: Panel, props?: SetPanelPropertiesOptions): void => {
  props && Object.assign(panel, props);
};

export interface SetPanelAttributesOptions {
  [key: string]: string;
}

export const setPanelAttributes = (panel: Panel, attrs?: SetPanelAttributesOptions): void => {
  forEach(attrs, (value, key) => panel.SetAttributeString(key, value));
};

export interface SetPanelAttributesIntOptions {
  [key: string]: number;
}

export const setPanelAttributesInt = (panel: Panel, attrs?: SetPanelAttributesIntOptions): void => {
  forEach(attrs, (value, key) => panel.SetAttributeInt(key, value));
};

export interface SetPanelAttributesUInt32Options {
  [key: string]: number;
}

export const setPanelAttributesUInt32 = (
  panel: Panel,
  attrs?: SetPanelAttributesUInt32Options
): void => {
  forEach(attrs, (value, key) => panel.SetAttributeUInt32(key, value));
};

export interface SetPanelDialogVarsOptions {
  [key: string]: string;
}

export const setPanelDialogVars = (panel: Panel, vars?: SetPanelDialogVarsOptions): void => {
  forEach(vars, (value, key) => panel.SetDialogVariable(key, value));
};

export interface SetPanelDialogVarsIntOptions {
  [key: string]: number;
}

export const setPanelDialogVarsInt = (panel: Panel, vars?: SetPanelDialogVarsIntOptions): void => {
  forEach(vars, (value, key) => panel.SetDialogVariableInt(key, value));
};

export interface SetPanelDialogVarsTimeOptions {
  [key: string]: number;
}

export const setPanelDialogVarsTime = (
  panel: Panel,
  vars?: SetPanelDialogVarsTimeOptions
): void => {
  forEach(vars, (value, key) => panel.SetDialogVariableTime(key, value));
};

export interface SetPanelDialogVarsL10nOptions {
  [key: string]: string;
}

export const setPanelDialogVarsL10n = (
  panel: Panel,
  vars?: SetPanelDialogVarsL10nOptions
): void => {
  forEach(vars, (value, key) => panel.SetDialogVariableLocString(key, value));
};

export interface SetPanelDialogVarsL10nPluralOptions {
  [key: string]: { value: string; count: number };
}

export const setPanelDialogVarsL10nPlural = (
  panel: Panel,
  vars?: SetPanelDialogVarsL10nPluralOptions
): void => {
  forEach(vars, ({ value, count }, key) =>
    panel.SetDialogVariablePluralLocStringInt(key, value, count)
  );
};

export const setPanelEvent = (
  panel: Panel,
  eventName: globalThis.PanelEvent,
  listener: PanelEventListener
): void => panel.SetPanelEvent(eventName, () => listener(new PanelEvent(eventName, panel)));

export type SetPanelEventsOptions = {
  [eventName in globalThis.PanelEvent]?: PanelEventListener;
};

export const setPanelEvents = (panel: Panel, events?: SetPanelEventsOptions): void => {
  forEach(
    events,
    (listener, eventName) =>
      listener && setPanelEvent(panel, eventName as globalThis.PanelEvent, listener)
  );
};

export const toParams = (params: { [key: string]: unknown }): string =>
  Object.entries(params)
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
