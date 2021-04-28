import { transform } from "lodash";
import { Component } from "../lib/component";
import { UIEvents } from "../lib/ui_events";

export type Inputs = never;
export type Outputs = never;

interface AttributeTypes {
  string: string;
  int: number;
  uint32: number;
  boolean: boolean;
  heroID: HeroID;
  heroImageStyle: HeroImage["heroimagestyle"];
}

type AttributeOptions = Record<string, keyof AttributeTypes>;

type Attributes<T extends AttributeOptions> = {
  [K in keyof T]: AttributeTypes[T[K]];
};

export interface PopupComponentOptions<AttrOpts> {
  attributes?: AttrOpts;
}

const CHAN_ATTR = "channel";
const DEFAULT_CHAN = "__channel__";

export abstract class Popup<AttrOpts extends AttributeOptions> extends Component {
  #attrOptions: AttrOpts;
  #attributes?: Attributes<AttrOpts>;
  channel: string = DEFAULT_CHAN;

  constructor({ attributes }: PopupComponentOptions<AttrOpts> = {}) {
    super();

    this.#attrOptions = attributes ?? ({} as AttrOpts);
  }

  get attributes(): Attributes<AttrOpts> {
    if (this.#attributes == null) {
      this.#attributes = getAttributes(this.ctx, this.#attrOptions);
    }

    return this.#attributes;
  }

  load(): void {
    this.channel = this.ctx.GetAttributeString(CHAN_ATTR, this.channel);
    this.debugFn(() => ["load()", { channel: this.channel, ...this.attributes }]);
    this.render();
  }

  abstract render(): void;

  close(): void {
    UIEvents.closePopup(this.ctx);
  }
}

//   context.Popup = Popup;
// })(GameUI.CustomUIConfig(), this);

function getAttribute<T extends AttributeOptions, K extends keyof T>(
  panel: Panel,
  options: T,
  attrName: K
): AttributeTypes[T[K]] {
  const sAttrName = String(attrName);
  const typeName: keyof AttributeTypes = options[attrName];
  let _exhaustiveCheck: never;

  // typescript bug?

  switch (typeName) {
    case "string":
    case "heroImageStyle":
      return panel.GetAttributeString(sAttrName, "") as AttributeTypes[T[K]];
    case "int":
    case "heroID":
      return panel.GetAttributeInt(sAttrName, 0) as AttributeTypes[T[K]];
    case "uint32":
      return panel.GetAttributeUInt32(sAttrName, 0) as AttributeTypes[T[K]];
    case "boolean":
      return (panel.GetAttributeInt(sAttrName, 0) == 1) as AttributeTypes[T[K]];
    default:
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      _exhaustiveCheck = typeName;
  }

  throw new Error(`Invalid attribute type ${typeName}`);
}

function getAttributes<T extends AttributeOptions>(panel: Panel, options: T): Attributes<T> {
  return transform<T, Attributes<T>>(
    options,
    (attributes, _typeName, attrName) => {
      attributes[attrName] = getAttribute(panel, options, attrName);
    },
    {} as Attributes<T>
  );
}
