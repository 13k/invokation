// const { Component } = context;
// const { lodash: _ } = global;
// const { COMPONENTS } = global.Const;
// const { Sequence, ParallelSequence } = global.Sequence;

import { Component } from "./lib/component";

const DYN_ELEMS = {
  COMBO_ITEM: {
    idPrefix: "combo",
    cssClass: "combo",
  },
};

const comboItemId = ({ id }) => `${DYN_ELEMS.COMBO_ITEM.idPrefix}-${id}`;

class PickerCombos extends Component {
  constructor() {
    const { inputs, outputs } = COMPONENTS.PICKER.COMBOS;

    super({
      elements: {
        combos: "combos",
      },
      inputs: {
        [inputs.SET_COMBOS]: "onSetCombos",
        [inputs.SET_FINISHED]: "onSetFinished",
      },
      outputs: Object.values(outputs),
    });

    this._combos = [];
    this._selected = null;
    this.panels = {};
    this.finished = {};
  }

  // ----- Listeners -----

  onSetCombos(payload) {
    this.debug("onSetCombos()", payload);
    this.combos = payload.combos;
  }

  onSetFinished(payload) {
    this.debug("onSetFinished()", payload);
    this.setFinished(payload.id);
  }

  onSelect(payload) {
    this.debug("onSelect()", payload);
    this.selected = payload.id;
  }

  onCombosChange(payload) {
    this.debug("onCombosChange()", payload);
    this.update();
  }

  // ----- Properties -----

  get combos() {
    return this._combos;
  }

  set combos(combos) {
    this._combos = combos;

    this.combos.onChange(this.handler("onCombosChange"));

    this.render();
  }

  get selected() {
    return this._selected;
  }

  set selected(id) {
    if (id === this.selected) return;

    this._selected = id;

    this.select();
  }

  get selectedPanel() {
    return this.panels[this.selected];
  }

  // ----- Helpers -----

  resetPanels() {
    this.panels = {};
  }

  notifySelection() {
    const { outputs } = COMPONENTS.PICKER.COMBOS;

    return this.runOutput(outputs.ON_SELECT, { id: this.selected });
  }

  getPanel(id) {
    return this.panels[id];
  }

  setPanel(id, panel) {
    this.panels[id] = panel;
  }

  isFinished(id) {
    return !!this.finished[id];
  }

  setFinished(id) {
    this.finished[id] = true;
    this.finish(id);
  }

  createItemPanel(parent, combo) {
    const { layout, inputs, outputs } = COMPONENTS.PICKER.COMBOS.COMBO_ITEM;
    const { cssClass } = DYN_ELEMS.COMBO_ITEM;

    const id = comboItemId(combo);
    const panel = this.createComponent(parent, id, layout, {
      classes: [cssClass],
      inputs: {
        [inputs.SET_COMBO]: combo,
      },
      outputs: {
        [outputs.ON_ACTIVATE]: "onSelect",
      },
    });

    this.setPanel(combo.id, panel);

    return panel;
  }

  // ----- Actions -----

  resetAction() {
    return new Sequence().RemoveChildren(this.$combos).RunFunction(() => this.resetPanels());
  }

  renderAction() {
    const actions = _.map(this.combos.all, (combo) =>
      this.createItemPanelAction(this.$combos, combo)
    );

    return new Sequence().Action(actions);
  }

  createItemPanelAction(parent, combo) {
    return new Sequence().RunFunction(() => this.createItemPanel(parent, combo));
  }

  updateAction() {
    const actions = _.map(this.combos.all, ({ id }) => this.updatePanelAction(id));

    return new ParallelSequence().Action(actions);
  }

  updatePanelAction(id) {
    return new ParallelSequence()
      .Action(this.updatePanelSelectedAction(id))
      .Action(this.updatePanelFinishedAction(id))
      .Action(this.updatePanelVisibilityAction(id));
  }

  updatePanelSelectedAction(id) {
    const { inputs } = COMPONENTS.PICKER.COMBOS.COMBO_ITEM;

    return new Sequence().RunFunction(() => {
      const input = id === this.selected ? inputs.SET_SELECTED : inputs.UNSET_SELECTED;

      this.getPanel(id).component.Input(input);
    });
  }

  updatePanelFinishedAction(id) {
    const { inputs } = COMPONENTS.PICKER.COMBOS.COMBO_ITEM;

    return new Sequence().RunFunction(() => {
      const input = this.isFinished(id) ? inputs.SET_FINISHED : inputs.UNSET_FINISHED;

      this.getPanel(id).component.Input(input);
    });
  }

  updatePanelVisibilityAction(id) {
    return new Sequence().RunFunction(() => {
      const panel = this.getPanel(id);
      const seq = new Sequence();

      if (this.combos.isVisible(id)) {
        seq.Show(panel);
      } else {
        seq.Hide(panel);
      }

      return seq;
    });
  }

  // ----- Action runners -----

  render() {
    const seq = new Sequence()
      .Action(this.resetAction())
      .Action(this.renderAction())
      .Action(this.updateAction());

    this.debugFn(() => ["render()", { combos: this.combos.all.length, actions: seq.length }]);

    return seq.Start();
  }

  update() {
    const seq = new Sequence().Action(this.updateAction());

    this.debugFn(() => ["update()", { combos: this.combos.all.length, actions: seq.length }]);

    return seq.Start();
  }

  select() {
    const seq = new Sequence()
      .Action(this.updateAction())
      .RunFunction(() => this.notifySelection());

    this.debugFn(() => ["select()", { id: this.selected, actions: seq.length }]);

    return seq.Start();
  }

  finish(id) {
    const seq = new Sequence().Action(this.updatePanelAction(id));

    this.debugFn(() => ["finish()", { id, actions: seq.length }]);

    return seq.Start();
  }
}

//   context.combos = new PickerCombos();
// })(GameUI.CustomUIConfig(), this);
