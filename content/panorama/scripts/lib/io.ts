import { Callbacks } from "./callbacks";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type InputsBinding = Record<string, (...args: any[]) => void>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type OutputsBinding = Record<string, (...args: any[]) => void>;
export type InputsTrigger = Record<string, unknown>;

type Inputs = Record<string, unknown>;
type Outputs = Record<string, unknown>;

interface Registration {
  inputs: Record<string, boolean>;
  outputs: Record<string, boolean>;
}

interface IOOptions {
  inputs?: InputsBinding;
  outputs?: string[];
}

export class IO {
  #inputs: Callbacks<Inputs>;
  #outputs: Callbacks<Outputs>;
  #registered: Registration;

  constructor(public options: IOOptions = {}) {
    this.#inputs = new Callbacks();
    this.#outputs = new Callbacks();
    this.#registered = { inputs: {}, outputs: {} } as Registration;

    this.registerInputs(options.inputs);
    this.registerOutputs(options.outputs);
  }

  registerInputs(inputs?: InputsBinding): void {
    if (inputs == null) return;

    Object.entries(inputs).forEach(([input, cb]) => {
      if (cb != null) this.registerInput(input, cb);
    });
  }

  registerInput(input: string, cb: (payload: unknown) => void): void {
    this.#inputs.on(input, cb);
    this.#registered.inputs[input] = true;
  }

  /** Triggers given input */
  input(input: string, payload: unknown): void {
    if (!(input in this.#registered.inputs)) {
      throw new Error(`${input}: invalid output name`);
    }

    this.#inputs.run(input, payload);
  }

  /** Triggers all given inputs */
  inputs(inputs: InputsTrigger): void {
    Object.entries(inputs).forEach(([input, payload]) => {
      this.input(input, payload);
    });
  }

  // ------------

  registerOutputs(outputs?: string[]): void {
    if (outputs == null) return;

    outputs.forEach((output) => this.registerOutput(output));
  }

  registerOutput(output: string): void {
    this.#registered.outputs[output] = true;
  }

  onOutput(output: string, cb: (payload: unknown) => void): void {
    if (!(output in this.#registered.outputs)) {
      throw new Error(`${output}: invalid output name`);
    }

    this.#outputs.on(output, cb);
  }

  onOutputs(outputs: OutputsBinding): void {
    Object.entries(outputs).forEach(([output, cb]) => {
      if (cb != null) this.onOutput(output, cb);
    });
  }

  /** Triggers given output */
  output(output: string, payload: unknown): void {
    if (!(output in this.#registered.outputs)) {
      throw new Error(`${output}: invalid output name`);
    }

    this.#outputs.run(output, payload);
  }
}
