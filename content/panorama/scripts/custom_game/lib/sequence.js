"use strict";

((global, context) => {
  const { lodash: _ } = global;
  const {
    BaseAction: Action,
    RunFunctionAction,
    AddClassAction,
    RemoveClassAction,
    SwitchClassAction,
    WaitAction,
    WaitOneFrameAction,
    WaitForEventAction: WaitEventAction,
    ActionWithTimeout: WaitActionAction,
    WaitForClassAction: WaitClassAction,
    SetDialogVariableIntAction,
    AnimateDialogVariableIntAction,
    SetProgressBarValueAction,
    AnimateProgressBarAction,
    AnimateProgressBarWithMiddleAction,
    PlaySoundEffectAction,
    RunParallelActions,
    RunStaggeredActions,
    RunUntilSingleActionFinishedAction,
    RunSingleAction,
  } = context;

  class NoopAction extends Action {
    constructor() {
      super();
    }

    update() {
      return false;
    }
  }

  class PrintAction extends Action {
    constructor() {
      super();

      this.args = arguments;
    }

    update() {
      $.Msg.apply($, this.args);
      return false;
    }
  }

  class BasePanelAction extends Action {
    constructor(panel) {
      super();

      this.panel = panel;
    }
  }

  class ReplaceClassAction extends BasePanelAction {
    constructor(panel, className, replacement) {
      super(panel);

      this.className = className;
      this.replacement = replacement;
    }

    update() {
      this.panel.RemoveClass(this.className);
      this.panel.AddClass(this.replacement);

      return false;
    }
  }

  class SetAttributeAction extends BasePanelAction {
    constructor(panel, attribute, value) {
      super(panel);

      this.attribute = attribute;
      this.value = value;
    }

    update() {
      this.panel[this.attribute] = this.value;
      return false;
    }
  }

  class EnableAction extends SetAttributeAction {
    constructor(panel) {
      super(panel, "enabled", true);
    }
  }

  class DisableAction extends SetAttributeAction {
    constructor(panel) {
      super(panel, "enabled", false);
    }
  }

  class SetDialogVariableAction extends BasePanelAction {
    constructor(panel, variable, value) {
      super(panel);

      this.variable = variable;
      this.value = value;
    }

    update() {
      this.panel.SetDialogVariable(this.variable, this.value);
      return false;
    }
  }

  class SetDialogVariableTimeAction extends SetDialogVariableAction {
    constructor(panel, variable, value) {
      super(panel, variable, value);
    }

    update() {
      this.panel.SetDialogVariableTime(this.variable, this.value);
      return false;
    }
  }

  class ScrollToTopAction extends BasePanelAction {
    constructor(panel) {
      super(panel);
    }

    update() {
      this.panel.ScrollToTop();
      return false;
    }
  }

  class ScrollToBottomAction extends BasePanelAction {
    constructor(panel) {
      super(panel);
    }

    update() {
      this.panel.ScrollToBottom();
      return false;
    }
  }

  class DeleteAsyncAction extends BasePanelAction {
    constructor(panel, delay) {
      super(panel);

      this.delay = delay;
    }

    update() {
      this.panel.DeleteAsync(this.delay);
      return false;
    }
  }

  class RemoveChildrenAction extends BasePanelAction {
    constructor(panel) {
      super(panel);
    }

    update() {
      this.panel.RemoveAndDeleteChildren();
      return false;
    }
  }

  class SelectOptionAction extends BasePanelAction {
    constructor(panel, optionId) {
      super(panel);

      this.optionId = optionId;
    }

    update() {
      this.panel.SetSelected(this.optionId);
      return false;
    }
  }

  class AddOptionAction extends BasePanelAction {
    constructor(panel, option) {
      super(panel);

      this.option = option;
    }

    update() {
      const optionPanel = typeof this.option === "function" ? this.option() : this.option;
      this.panel.AddOption(optionPanel);
      return false;
    }
  }

  class RemoveOptionAction extends BasePanelAction {
    constructor(panel, optionId) {
      super(panel);

      this.optionId = optionId;
    }

    update() {
      this.panel.RemoveOption(this.optionId);
      return false;
    }
  }

  class RemoveAllOptionsAction extends BasePanelAction {
    constructor(panel) {
      super(panel);
    }

    update() {
      this.panel.RemoveAllOptions();
      return false;
    }
  }

  class FocusAction extends BasePanelAction {
    constructor(panel) {
      super(panel);
    }

    update() {
      this.panel.SetFocus();
      return false;
    }
  }

  class FireEntityInputAction extends BasePanelAction {
    constructor(panel, entityName, inputName, inputArg) {
      super(panel);

      this.entityName = entityName;
      this.inputName = inputName;
      this.inputArg = inputArg;
    }

    update() {
      this.panel.FireEntityInput(this.entityName, this.inputName, this.inputArg);
      return false;
    }
  }

  const isSequence = (object) =>
    object instanceof Sequence ||
    object instanceof ParallelSequence ||
    object instanceof ParallelAnySequence ||
    object instanceof StaggeredSequence;

  const actionSize = (action) => (isSequence(action) ? action.size() : 1);

  const SequenceMixin = (Base) =>
    class extends Base {
      size() {
        const aggregate = _.overArgs(_.add, [_, actionSize]);

        return _.reduce(this.actions, aggregate, 1);
      }

      Start() {
        return RunSingleAction(this);
      }

      Action(action) {
        if (!_.isArray(action)) {
          action = [action];
        }

        this.actions.push.apply(this.actions, action);

        return this;
      }

      Noop() {
        this.Action(new NoopAction());
        return this;
      }

      RunFunction(...args) {
        this.Action(new RunFunctionAction(...args));
        return this;
      }

      Wait(seconds) {
        this.Action(new WaitAction(seconds));
        return this;
      }

      WaitOneFrame() {
        this.Action(new WaitOneFrameAction());
        return this;
      }

      WaitEvent(panel, eventName) {
        this.Action(new WaitEventAction(panel, eventName));
        return this;
      }

      WaitAction(action, timeoutDuration, continueAfterTimeout) {
        this.Action(new WaitActionAction(action, timeoutDuration, continueAfterTimeout));
        return this;
      }

      Print(...args) {
        this.Action(new PrintAction(...args));
        return this;
      }

      AddClass(panel, panelClass) {
        this.Action(new AddClassAction(panel, panelClass));
        return this;
      }

      RemoveClass(panel, panelClass) {
        this.Action(new RemoveClassAction(panel, panelClass));
        return this;
      }

      SwitchClass(panel, panelSlot, panelClass) {
        this.Action(new SwitchClassAction(panel, panelSlot, panelClass));
        return this;
      }

      ReplaceClass(panel, className, replacement) {
        this.Action(new ReplaceClassAction(panel, className, replacement));
        return this;
      }

      WaitClass(panel, panelClass) {
        this.Action(new WaitClassAction(panel, panelClass));
        return this;
      }

      DeleteAsync(panel, delay) {
        this.Action(new DeleteAsyncAction(panel, delay));
        return this;
      }

      RemoveChildren(panel) {
        this.Action(new RemoveChildrenAction(panel));
        return this;
      }

      ScrollToTop(panel) {
        this.Action(new ScrollToTopAction(panel));
        return this;
      }

      ScrollToBottom(panel) {
        this.Action(new ScrollToBottomAction(panel));
        return this;
      }

      Enable(panel) {
        this.Action(new EnableAction(panel));
        return this;
      }

      Disable(panel) {
        this.Action(new DisableAction(panel));
        return this;
      }

      Focus(panel) {
        this.Action(new FocusAction(panel));
        return this;
      }

      SetAttribute(panel, attribute, value) {
        this.Action(new SetAttributeAction(panel, attribute, value));
        return this;
      }

      SetDialogVariable(panel, dialogVariable, value) {
        this.Action(new SetDialogVariableAction(panel, dialogVariable, value));
        return this;
      }

      SetDialogVariableInt(panel, dialogVariable, value) {
        this.Action(new SetDialogVariableIntAction(panel, dialogVariable, value));
        return this;
      }

      AnimateDialogVariableInt(panel, dialogVariable, start, end, seconds) {
        this.Action(new AnimateDialogVariableIntAction(panel, dialogVariable, start, end, seconds));
        return this;
      }

      SetDialogVariableTime(panel, dialogVariable, value) {
        this.Action(new SetDialogVariableTimeAction(panel, dialogVariable, value));
        return this;
      }

      SetProgressBarValue(progressBar, value) {
        this.Action(new SetProgressBarValueAction(progressBar, value));
        return this;
      }

      AnimateProgressBar(progressBar, startValue, endValue, seconds) {
        this.Action(new AnimateProgressBarAction(progressBar, startValue, endValue, seconds));
        return this;
      }

      AnimateProgressBarWithMiddle(progressBar, startValue, endValue, seconds) {
        this.Action(
          new AnimateProgressBarWithMiddleAction(progressBar, startValue, endValue, seconds)
        );
        return this;
      }

      AddOption(panel, option) {
        this.Action(new AddOptionAction(panel, option));
        return this;
      }

      RemoveOption(panel, optionId) {
        this.Action(new RemoveOptionAction(panel, optionId));
        return this;
      }

      RemoveAllOptions(panel) {
        this.Action(new RemoveAllOptionsAction(panel));
        return this;
      }

      SelectOption(panel, optionId) {
        this.Action(new SelectOptionAction(panel, optionId));
        return this;
      }

      PlaySoundEffect(soundName) {
        this.Action(new PlaySoundEffectAction(soundName));
        return this;
      }

      FireEntityInput(panel, entityName, inputName, inputArg) {
        this.Action(new FireEntityInputAction(panel, entityName, inputName, inputArg));
        return this;
      }
    };

  class StopSequence {}

  class Sequence extends SequenceMixin(Action) {
    constructor() {
      super();
      this.actions = [];
    }

    start() {
      this.index = 0;
      this.running = false;
      this.stop = false;
    }

    update() {
      while (this.index < this.actions.length) {
        const action = this.actions[this.index];

        if (!this.running) {
          action.start();
          this.running = true;
        }

        let continueRunning;

        try {
          continueRunning = action.update();
        } catch (err) {
          if (err instanceof StopSequence) {
            const skipCount = this.actions.length - this.index + 1;
            $.Msg("StopSequence -- current: ", this.index, ", skipped: ", skipCount);
            this.stop = true;
            return false;
          }

          $.Msg(err.stack);
          throw err;
        }

        if (continueRunning) {
          return true;
        }

        action.finish();
        this.running = false;
        this.index++;
      }

      return false;
    }

    finish() {
      if (this.stop) {
        return;
      }

      while (this.index < this.actions.length) {
        const action = this.actions[this.index];

        if (!this.running) {
          action.start();
          this.running = true;
          action.update();
        }

        action.finish();

        this.index++;
        this.running = false;
      }
    }
  }

  class ParallelSequence extends SequenceMixin(RunParallelActions) {
    constructor() {
      super();
    }
  }

  class ParallelAnySequence extends SequenceMixin(RunUntilSingleActionFinishedAction) {
    constructor(continueOthers) {
      super(continueOthers);
    }
  }

  class StaggeredSequence extends SequenceMixin(RunStaggeredActions) {
    constructor(delay) {
      super(delay);
    }
  }

  global.Sequence = {
    // sequences
    Sequence,
    ParallelSequence,
    ParallelAnySequence,
    StaggeredSequence,
    // actions
    Action,
    BasePanelAction,
    NoopAction,
    PrintAction,
    RunFunctionAction,
    WaitAction,
    WaitOneFrameAction,
    WaitEventAction,
    WaitActionAction,
    AddClassAction,
    RemoveClassAction,
    SwitchClassAction,
    ReplaceClassAction,
    WaitClassAction,
    ScrollToTopAction,
    ScrollToBottomAction,
    DeleteAsyncAction,
    RemoveChildrenAction,
    EnableAction,
    DisableAction,
    FocusAction,
    SetAttributeAction,
    SetDialogVariableAction,
    SetDialogVariableIntAction,
    AnimateDialogVariableIntAction,
    SetDialogVariableTimeAction,
    SetProgressBarValueAction,
    AnimateProgressBarAction,
    AnimateProgressBarWithMiddleAction,
    AddOptionAction,
    RemoveOptionAction,
    RemoveAllOptionsAction,
    SelectOptionAction,
    PlaySoundEffectAction,
    FireEntityInputAction,
    // exceptions
    StopSequence,
  };
})(GameUI.CustomUIConfig(), this);
