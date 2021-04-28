import type { Combo, ComboID } from "./lib/combo";
import { ChangeEvent as CombosViewChangeEvent, CombosView } from "./lib/combos_view";
import { Component } from "./lib/component";
import { COMPONENTS } from "./lib/const/component";
import type { PanelWithComponent } from "./lib/const/panorama";
import { Action, ParallelSequence, SerialSequence } from "./lib/sequence";
import type {
  Inputs as ItemInputs,
  Outputs as ItemOutputs,
  PickerCombosItem,
} from "./picker_combos_item";

export type Inputs = {
  [INPUTS.SET_COMBOS]: { combos: CombosView };
  [INPUTS.SET_FINISHED]: { id: ComboID };
};

export type Outputs = {
  [OUTPUTS.ON_SELECT]: { id: ComboID };
};

interface Elements {
  combos: Panel;
}

type PickerCombosItemPanel = PanelWithComponent<PickerCombosItem>;

const { inputs: INPUTS, outputs: OUTPUTS } = COMPONENTS.PICKER_COMBOS;
const { inputs: ITEM_INPUTS, outputs: ITEM_OUTPUTS } = COMPONENTS.PICKER_COMBOS_ITEM;

const DYN_ELEMS = {
  COMBO_ITEM: {
    idPrefix: "combo",
    cssClass: "combo",
  },
};

const comboItemID = ({ id }: Combo) => `${DYN_ELEMS.COMBO_ITEM.idPrefix}-${id}`;

export class PickerCombos extends Component {
  #elements: Elements;
  #combos?: CombosView;
  #selected?: ComboID;
  #panels: Record<string, PickerCombosItemPanel> = {};
  #finished: Record<string, boolean> = {};

  constructor() {
    super();

    this.#elements = this.findAll<Elements>({
      combos: "combos",
    });

    this.registerInputs({
      [INPUTS.SET_COMBOS]: this.onSetCombos,
      [INPUTS.SET_FINISHED]: this.onSetFinished,
    });

    this.registerOutputs(Object.values(OUTPUTS));
  }

  // ----- Listeners -----

  onSetCombos(payload: Inputs[typeof INPUTS.SET_COMBOS]): void {
    this.debug("onSetCombos()", payload);
    this.combos = payload.combos;
  }

  onSetFinished(payload: Inputs[typeof INPUTS.SET_FINISHED]): void {
    this.debug("onSetFinished()", payload);
    this.setFinished(payload.id);
  }

  onSelect(payload: ItemOutputs[typeof ITEM_OUTPUTS.ON_ACTIVATE]): void {
    this.debug("onSelect()", payload);
    this.selected = payload.id;
  }

  onCombosChange(ev: CombosViewChangeEvent): void {
    this.debug("onCombosChange()", ev);
    this.update();
  }

  // ----- Properties -----

  set combos(combos: CombosView) {
    this.#combos = combos;

    this.#combos.onChange(this.onCombosChange.bind(this));

    this.render();
  }

  set selected(id: ComboID) {
    if (id === this.#selected) return;

    this.#selected = id;

    this.select();
  }

  // ----- Helpers -----

  resetPanels(): void {
    this.#panels = {};
  }

  notifySelection(): void {
    if (this.#selected == null) {
      this.warn("PickerCombos.notifySelection called with no combo selected");
      return;
    }

    const payload: Outputs["OnSelect"] = { id: this.#selected };

    this.output(OUTPUTS.ON_SELECT, payload);
  }

  getPanel(id: ComboID): PickerCombosItemPanel {
    return this.#panels[id];
  }

  setPanel(id: ComboID, panel: PickerCombosItemPanel): void {
    this.#panels[id] = panel;
  }

  getComponent(id: ComboID): Component {
    return this.getPanel(id).component;
  }

  isFinished(id: ComboID): boolean {
    return !!this.#finished[id];
  }

  setFinished(id: ComboID): void {
    this.#finished[id] = true;

    this.finish(id);
  }

  createItemPanel(parent: Panel, combo: Combo): void {
    const { layout } = COMPONENTS.PICKER_COMBOS_ITEM;
    const { cssClass } = DYN_ELEMS.COMBO_ITEM;

    const id = comboItemID(combo);
    const setComboPayload: ItemInputs[typeof ITEM_INPUTS.SET_COMBO] = { combo };
    const panel = this.createComponent(parent, id, layout, {
      classes: [cssClass],
      inputs: {
        [ITEM_INPUTS.SET_COMBO]: setComboPayload,
      },
      outputs: {
        [ITEM_OUTPUTS.ON_ACTIVATE]: this.onSelect,
      },
    });

    this.setPanel(combo.id, panel);
  }

  // ----- Actions -----

  resetAction(): Action {
    return new SerialSequence()
      .RemoveChildren(this.#elements.combos)
      .RunFunction(() => this.resetPanels());
  }

  renderAction(): Action {
    if (this.#combos == null) {
      throw Error("PickerCombos.renderAction called with no combos");
    }

    const actions = this.#combos.combos.map((combo) =>
      this.createItemPanelAction(this.#elements.combos, combo)
    );

    return new SerialSequence().Action(...actions);
  }

  createItemPanelAction(parent: Panel, combo: Combo): Action {
    return new SerialSequence().RunFunction(() => this.createItemPanel(parent, combo));
  }

  updateAction(): Action {
    if (this.#combos == null) {
      throw Error("PickerCombos.renderAction called with no combos");
    }

    const actions = this.#combos.combos.map(({ id }) => this.updatePanelAction(id));

    return new ParallelSequence().Action(...actions);
  }

  updatePanelAction(id: ComboID): Action {
    return new ParallelSequence()
      .Action(this.updatePanelSelectedAction(id))
      .Action(this.updatePanelFinishedAction(id))
      .Action(this.updatePanelVisibilityAction(id));
  }

  updatePanelSelectedAction(id: ComboID): Action {
    const { inputs } = COMPONENTS.PICKER_COMBOS_ITEM;

    return new SerialSequence().RunFunction(() => {
      const input = id === this.#selected ? inputs.SET_SELECTED : inputs.UNSET_SELECTED;

      this.getComponent(id).input(input);
    });
  }

  updatePanelFinishedAction(id: ComboID): Action {
    const { inputs } = COMPONENTS.PICKER_COMBOS_ITEM;

    return new SerialSequence().RunFunction(() => {
      const input = this.isFinished(id) ? inputs.SET_FINISHED : inputs.UNSET_FINISHED;

      this.getComponent(id).input(input);
    });
  }

  updatePanelVisibilityAction(id: ComboID): Action {
    return new SerialSequence().RunFunction(() => {
      if (this.#combos == null) {
        throw Error(
          "PickerCombos.updatePanelVisibilityAction function action called with no combos"
        );
      }

      const panel = this.getPanel(id);
      const seq = new SerialSequence();

      if (this.#combos.isVisible(id)) {
        seq.Show(panel);
      } else {
        seq.Hide(panel);
      }

      return seq;
    });
  }

  // ----- Action runners -----

  render(): void {
    const seq = new SerialSequence()
      .Action(this.resetAction())
      .Action(this.renderAction())
      .Action(this.updateAction());

    this.debugFn(() => ["render()", { combos: this.#combos?.length, actions: seq.length }]);

    seq.run();
  }

  update(): void {
    const seq = new SerialSequence().Action(this.updateAction());

    this.debugFn(() => ["update()", { combos: this.#combos?.length, actions: seq.length }]);

    seq.run();
  }

  select(): void {
    const seq = new SerialSequence()
      .Action(this.updateAction())
      .RunFunction(() => this.notifySelection());

    this.debugFn(() => ["select()", { id: this.#selected, actions: seq.length }]);

    seq.run();
  }

  finish(id: ComboID): void {
    const seq = new SerialSequence().Action(this.updatePanelAction(id));

    this.debugFn(() => ["finish()", { id, actions: seq.length }]);

    seq.run();
  }
}

//   context.combos = new PickerCombos();
// })(GameUI.CustomUIConfig(), this);
