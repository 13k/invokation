"use strict";

((global, context) => {
  const { Component } = context;
  const { lodash: _ } = global;

  class Popup extends Component {
    constructor(options) {
      super(options);

      this._attributes = null;
    }

    get attributes() {
      if (this._attributes) return this._attributes;

      this._attributes = _.transform(
        this.options.attributes,
        (attrs, type, name) => {
          let value;

          switch (type) {
            case "string":
              value = this.$ctx.GetAttributeString(name, "");
              break;
            case "int":
              value = this.$ctx.GetAttributeInt(name, 0);
              break;
            case "uint32":
              value = this.$ctx.GetAttributeUInt32(name, 0);
              break;
            default:
              throw new Error(`Invalid attribute type ${type}`);
          }

          attrs[name] = value;
        },
        {}
      );

      return this._attributes;
    }

    load() {
      this.channel = this.$ctx.GetAttributeString("channel", "<invalid>");
      this.debugFn(() => ["load()", Object.assign({}, { channel: this.channel }, this.attributes)]);
      this.render();
    }

    render() {}

    close() {
      this.closePopup(this.$ctx);
    }
  }

  context.Popup = Popup;
})(GameUI.CustomUIConfig(), this);
