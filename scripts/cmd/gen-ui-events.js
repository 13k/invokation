const path = require("path");

const fse = require("fs-extra");
const ts = require("typescript");
const pkgEventsDoc = require("@moddota/dota-data/files/panorama/events");

const $ = ts.factory;

/**
 * @typedef {Object} EventsDocFile
 * @property {string} path
 * @property {EventsDoc} doc
 */

/**
 * @typedef {Record<string, Event>} EventsDoc
 */

/**
 * @typedef {Object} Event
 * @property {string} description
 * @property {boolean} panelEvent
 * @property {EventArg[]} args
 */

/**
 * @typedef {Object} EventArg
 * @property {string} name
 * @property {string} type
 */

/**
 * @typedef {Object} AugmentedEvent
 * @property {string} name
 * @property {string} description
 * @property {boolean} panelEvent
 * @property {EventArg[]} args
 * @property {string} typeName
 * @property {string} enumName
 * @property {string} enumKey
 */

const DEFAULT_OUTPUT_RELPATH = path.join("custom_game", "lib", "const", "ui_events.ts");

/** @type EventsDocFile */
const PKG_DOC_FILE = {
  path: "@moddota/dota-data/files/panorama/events.json",
  doc: pkgEventsDoc,
};

// paths relative to "<root>/content/panorama/scripts"
const IMPORT_PATHS = {
  dota: path.join("custom_game", "lib", "dota"),
};

const GLOBAL_EVENTS_ENUM_DOC = "Global events";
const GLOBAL_EVENTS_ENUM_NAME = "UIEvent";
const PANEL_EVENTS_ENUM_DOC = "Panel events";
const PANEL_EVENTS_ENUM_NAME = "UIPanelEvent";
const EVENTS_INDEX_INTERFACE_DOC = "Mapping of event names to event types";
const EVENTS_INDEX_INTERFACE_NAME = "UIEventDeclarations";
const EVENT_NAME_TYPE_DOC = "Event names type";
const EVENT_NAME_TYPE_NAME = "UIEventName";

const DEFAULT_REJECT = [
  "AsyncEvent",
  "DOTAShowTI10EventGameTooltip",
  "DOTAHideTI10EventGameTooltip",
  "IfHasClassEvent",
  "IfHoverOtherEvent",
  "IfNotHasClassEvent",
  "IfNotHoverOtherEvent",
];

const defaultOutput = ({ sources }) =>
  path.resolve(sources.contentPath, "panorama", "scripts", DEFAULT_OUTPUT_RELPATH);

/** @type {(name: string) => string} */
const eventIdent = (name) => name.replace(/^(DOTA|UI)/, "");
/** @type {(name: string) => string} */
const eventInterfaceName = (name) => eventIdent(name);
/** @type {(ev: Event) => string} */
const eventEnumName = (ev) => (ev.panelEvent ? PANEL_EVENTS_ENUM_NAME : GLOBAL_EVENTS_ENUM_NAME);
/** @type {(name: string) => string} */
const eventEnumKeyName = (name) => eventIdent(name);

/**
 * @param {Object} options
 * @param {string[]} options.reject
 */
function filterBy({ reject = [] } = {}) {
  const rejectMap = Object.fromEntries(reject.map((name) => [name, true]));

  /** @type {(ev: AugmentedEvent) => boolean} */
  return (ev) => !rejectMap[ev.name];
}

/** @type {(a: AugmentedEvent, b: AugmentedEvent) => number} */
const sortByEnumKey = (a, b) => a.enumKey.localeCompare(b.enumKey);

class GenPanoramaEvents {
  static cliOptions(config) {
    return {
      usage: "gen-ui-events",
      description: "Generate UI events types",
      options: [
        {
          flags: "-m, --merge <path...>",
          description: "Merge event specs from other file(s)",
        },
        {
          flags: "-r, --reject <events...>",
          description: "Reject events with given names",
          default: [DEFAULT_REJECT, DEFAULT_REJECT.join(" ")],
        },
        {
          flags: "-o, --output <path>",
          description: "Path to output file",
          default: defaultOutput(config),
        },
      ],
    };
  }

  /**
   *
   * @param {any} _args
   * @param {Object} options
   * @param {string[]=} options.merge
   * @param {string[]=} options.reject
   * @param {string} options.output
   * @param {Object} config
   */
  constructor(_args, { merge, reject, output }, { log, sources }) {
    this.panoramaScriptsPath = path.resolve(sources.contentPath, "panorama", "scripts");
    /** @type {Record<string, Set<string>>} */
    this.imports = {};
    this.log = log;
    this.options = {
      merge: Array.isArray(merge) ? merge : [],
      reject: Array.isArray(reject) ? reject : [],
      output: path.resolve(output),
    };
  }

  async run() {
    const docFiles = await this.fetch();

    await this.write(this.transform(docFiles));

    this.log.fields("output", this.options.output).info("generated");

    return { output: this.options.output };
  }

  /**
   * @returns {EventsDocFile[]}
   */
  async fetch() {
    const parsePromises = this.options.merge.map((f) => this.parseFile(f));

    return Promise.all([PKG_DOC_FILE, ...parsePromises]);
  }

  /**
   * @param {EventsDocFile[]} docFiles
   * @returns {string}
   */
  transform(docFiles) {
    const doc = this.merge(docFiles);
    const events = this.normalize(doc, { reject: this.options.reject });
    const globalEvents = events.filter((ev) => !ev.panelEvent);
    const panelEvents = events.filter((ev) => ev.panelEvent);

    const globalEventsEnumWithDoc = this.createEventsEnumWithDoc(
      GLOBAL_EVENTS_ENUM_NAME,
      globalEvents,
      GLOBAL_EVENTS_ENUM_DOC
    );

    const panelEventsEnumWithDoc = this.createEventsEnumWithDoc(
      PANEL_EVENTS_ENUM_NAME,
      panelEvents,
      PANEL_EVENTS_ENUM_DOC
    );

    const eventNameTypeWithDoc = this.createEventNameTypeWithDoc(
      EVENT_NAME_TYPE_NAME,
      EVENTS_INDEX_INTERFACE_NAME,
      EVENT_NAME_TYPE_DOC
    );

    const eventsArgsIndexInterfaceWithDoc = this.createEventsArgsTypesIndexWithDoc(
      EVENTS_INDEX_INTERFACE_NAME,
      [...globalEvents, ...panelEvents],
      EVENTS_INDEX_INTERFACE_DOC
    );

    const eventsArgsTypes = events.map(this.createEventArgsTypeWithDoc.bind(this));

    const imports = this.createImports();

    const sections = [
      imports,
      globalEventsEnumWithDoc,
      panelEventsEnumWithDoc,
      eventsArgsIndexInterfaceWithDoc,
      eventNameTypeWithDoc,
      ...eventsArgsTypes,
    ];

    const resultFile = ts.createSourceFile(
      path.basename(this.options.output),
      "",
      ts.ScriptTarget.Latest,
      false,
      ts.ScriptKind.TS
    );

    const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });

    let data = this.disclaimerComment(docFiles);

    sections.forEach((section) => {
      let nodeData = "";

      section.forEach((node) => {
        nodeData += printer.printNode(ts.EmitHint.Unspecified, node, resultFile);
        nodeData += "\n";
      });

      data += `${nodeData}\n`;
    });

    // TODO: run prettier
    return data;
  }

  /**
   * @param {string} data
   */
  async write(data) {
    return fse.outputFile(this.options.output, data, { encoding: "utf-8" });
  }

  /**
   * @param {string} filename
   * @returns {EventsDocFile}
   */
  async parseFile(filename) {
    this.log.field("path", filename).debug("parse");

    const doc = await fse.readJSON(filename, { encoding: "utf-8" });

    return { path: filename, doc: doc };
  }

  /**
   * @param {EventsDocFile[]} docFiles
   * @returns {EventsDoc}
   */
  // TODO: check collisions
  merge(docFiles) {
    const docs = docFiles.map((f) => {
      this.log.field("path", f.path).debug("merge");
      return f.doc;
    });

    return Object.assign({}, ...docs);
  }

  /**
   * @param {EventsDoc} doc
   * @param {Object} options
   * @param {string[]} options.reject
   * @returns {AugmentedEvent[]}
   */
  // TODO: check duplicate typeName names
  // TODO: check duplicate [enumName, enumKey] pairs
  normalize(doc, { reject } = {}) {
    return Object.entries(doc)
      .map(([name, ev]) => ({
        name,
        typeName: eventInterfaceName(name),
        enumName: eventEnumName(ev),
        enumKey: eventEnumKeyName(name),
        ...ev,
      }))
      .filter(filterBy({ reject }))
      .sort(sortByEnumKey);
  }

  /**
   * @param {EventsDocFile[]} docFiles
   * @returns {string}
   */
  disclaimerComment(docFiles) {
    let data = `//\n// Generated from:`;

    for (const docFile of docFiles) {
      data += `\n//   - ${docFile.path}`;
    }

    data += "\n//\n\n";

    return data;
  }

  /**
   * @param {string} moduleName
   * @param {string[]} symbols
   */
  addImport(moduleName, ...symbols) {
    this.imports[moduleName] = this.imports[moduleName] || new Set();

    for (const sym of symbols) {
      this.imports[moduleName].add(sym);
    }
  }

  createImports() {
    return Object.entries(this.imports).map(([moduleName, symbols]) =>
      this.createImport(moduleName, symbols)
    );
  }

  /**
   * @param {string} moduleName
   * @param {Set<string>} symbols
   */
  createImport(moduleName, symbols) {
    if (!(moduleName in IMPORT_PATHS)) {
      throw Error(`Invalid module name ${moduleName}`);
    }

    const modPath = path.resolve(this.panoramaScriptsPath, IMPORT_PATHS[moduleName]);
    const modRelPath = path.relative(path.dirname(this.options.output), modPath);

    this.log
      .fields(
        "module",
        moduleName,
        "importPath",
        IMPORT_PATHS[moduleName],
        "modRelPath",
        modRelPath
      )
      .debug("import");

    const specs = Array.from(symbols).map((sym) =>
      $.createImportSpecifier(undefined, $.createIdentifier(sym))
    );

    return $.createImportDeclaration(
      undefined,
      undefined,
      $.createImportClause(true, undefined, $.createNamedImports(specs)),
      $.createStringLiteral(modRelPath)
    );
  }

  /**
   * @param {string} doc
   */
  createJSDoc(doc) {
    const comment = doc.split(". ").join(".\n");

    return $.createJSDocComment(comment);
  }

  //
  // @param {string} name
  // @param {ts.Statement[]} statements
  // @returns {ts.NamespaceDeclaration}
  //
  // createNamespaceDeclaration(name, statements) {
  //   const ident = $.createIdentifier(name);
  //   const body = $.createModuleBlock(statements);
  //   const mod = $.createModuleDeclaration(
  //     undefined,
  //     $.createModifiersFromModifierFlags(ts.ModifierFlags.Ambient),
  //     ident,
  //     undefined,
  //     ts.NodeFlags.Namespace
  //   );
  //   return { ...mod, name: ident, body };
  // }

  /**
   * @param {EventArg} arg
   * @returns {ts.Node}
   */
  createEventArgType(arg) {
    switch (arg.type) {
      case "bool":
        return $.createKeywordTypeNode(ts.SyntaxKind.BooleanKeyword);
      case "string":
        return $.createKeywordTypeNode(ts.SyntaxKind.StringKeyword);
      case "float":
      case "uint32":
      case "int32":
      case "uint64":
      case "item_definition_index_t":
      case "style_index_t":
        return $.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword);
      case "Panel":
      case "PanelBase":
        return $.createTypeReferenceNode(arg.type, undefined);
      case "enum":
        switch (arg.name) {
          case "edotaPlayerMmrType":
            this.addImport("dota", "PlayerMMRType");

            return $.createTypeReferenceNode("PlayerMMRType", undefined);
        }
    }

    throw Error(`Unknown argument type for argument name=${arg.name}, type=${arg.type}`);
  }

  /**
   * @param {AugmentedEvent} ev
   */
  createEventArgsDoc(ev) {
    const description = ev.description || ev.name;

    return this.createJSDoc(description);
  }

  /**
   * @param {AugmentedEvent} ev
   */
  createEventArgsType(ev) {
    const members = ev.args.map((arg) => {
      const name = arg.name === "class" ? "className" : arg.name;
      const ident = $.createIdentifier(name);
      const type = this.createEventArgType(arg);

      return $.createNamedTupleMember(undefined, ident, undefined, type);
    });

    const ident = $.createIdentifier(ev.typeName);
    const tuple = $.createTupleTypeNode(members);

    return $.createTypeAliasDeclaration(
      undefined,
      $.createModifiersFromModifierFlags(ts.ModifierFlags.Export),
      ident,
      undefined,
      tuple
    );
  }

  /**
   * @param {AugmentedEvent} ev
   */
  createEventArgsTypeWithDoc(ev) {
    return [this.createEventArgsDoc(ev), this.createEventArgsType(ev)];
  }

  /**
   * @param {AugmentedEvent} ev
   */
  createEventEnumMember(ev) {
    return $.createEnumMember(ev.enumKey, $.createStringLiteral(ev.name));
  }

  /**
   * @param {string} name
   * @param {AugmentedEvent[]} events
   */
  createEventsEnum(name, events) {
    const ident = $.createIdentifier(name);
    const members = events.map(this.createEventEnumMember.bind(this));

    return $.createEnumDeclaration(
      undefined,
      $.createModifiersFromModifierFlags(ts.ModifierFlags.Export),
      ident,
      members
    );
  }

  /**
   * @param {string} name
   * @param {AugmentedEvent[]} events
   * @param {string} doc
   */
  createEventsEnumWithDoc(name, events, doc) {
    return [this.createJSDoc(doc), this.createEventsEnum(name, events)];
  }

  /**
   * @param {AugmentedEvent} ev
   */
  createEventArgsTypeIndexMember(ev) {
    return $.createPropertySignature(
      undefined,
      $.createComputedPropertyName(
        $.createPropertyAccessExpression(
          $.createIdentifier(ev.enumName),
          $.createIdentifier(ev.enumKey)
        )
      ),
      undefined,
      $.createTypeReferenceNode($.createIdentifier(ev.typeName), undefined)
    );
  }

  /**
   * @param {string} name
   * @param {AugmentedEvent[]} events
   */
  createEventsArgsTypesIndex(name, events) {
    const ident = $.createIdentifier(name);
    const members = events.map(this.createEventArgsTypeIndexMember.bind(this));

    return $.createInterfaceDeclaration(
      undefined,
      $.createModifiersFromModifierFlags(ts.ModifierFlags.Export),
      ident,
      undefined,
      undefined,
      members
    );
  }

  /**
   * @param {string} name
   * @param {AugmentedEvent[]} events
   * @param {string} doc
   */
  createEventsArgsTypesIndexWithDoc(name, events, doc) {
    return [this.createJSDoc(doc), this.createEventsArgsTypesIndex(name, events)];
  }

  /**
   * @param {string} name
   * @param {string} indexName
   */
  createEventNameType(name, indexName) {
    const ident = $.createIdentifier(name);
    const keyofIndex = $.createTypeOperatorNode(
      ts.SyntaxKind.KeyOfKeyword,
      $.createTypeReferenceNode(indexName, undefined)
    );

    return $.createTypeAliasDeclaration(
      undefined,
      $.createModifiersFromModifierFlags(ts.ModifierFlags.Export),
      ident,
      undefined,
      keyofIndex
    );
  }

  /**
   * @param {string} name
   * @param {string} indexName
   * @param {string} doc
   */
  createEventNameTypeWithDoc(name, indexName, doc) {
    return [this.createJSDoc(doc), this.createEventNameType(name, indexName)];
  }
}

module.exports = GenPanoramaEvents;
