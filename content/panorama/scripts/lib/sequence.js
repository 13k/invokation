"use strict";

(function(global, context) {
  var _ = global.lodash;
  var Class = global.Class;

  var Action = context.BaseAction;
  var WaitAction = context.WaitAction;
  var WaitOneFrameAction = context.WaitOneFrameAction;
  var WaitEventAction = context.WaitForEventAction;
  var WaitActionAction = context.ActionWithTimeout;
  var AddClassAction = context.AddClassAction;
  var RemoveClassAction = context.RemoveClassAction;
  var SwitchClassAction = context.SwitchClassAction;
  var WaitClassAction = context.WaitForClassAction;
  var SetDialogVariableIntAction = context.SetDialogVariableIntAction;
  var AnimateDialogVariableIntAction = context.AnimateDialogVariableIntAction;
  var SetProgressBarValueAction = context.SetProgressBarValueAction;
  var AnimateProgressBarAction = context.AnimateProgressBarAction;
  var AnimateProgressBarWithMiddleAction = context.AnimateProgressBarWithMiddleAction;
  var PlaySoundEffectAction = context.PlaySoundEffectAction;

  var RunSequentialActions = context.RunSequentialActions;
  var RunParallelActions = context.RunParallelActions;
  var RunStaggeredActions = context.RunStaggeredActions;
  var RunUntilSingleActionFinishedAction = context.RunUntilSingleActionFinishedAction;

  var RunSingleAction = context.RunSingleAction;

  var createAction = function(klass, args) {
    function A() {
      return klass.apply(this, args);
    }

    A.prototype = klass.prototype;

    return new A();
  };

  var NoopAction = Class(Action, {
    constructor: function NoopAction() {
      NoopAction.super.call(this);
    },

    update: function() {
      return false;
    },
  });

  var PrintAction = Class(Action, {
    constructor: function PrintAction() {
      PrintAction.super.call(this);
      this.args = arguments;
    },

    update: function() {
      $.Msg.apply($, this.args);
      return false;
    },
  });

  var RunFunctionAction = Class(context.RunFunctionAction, {
    constructor: function() {
      var args, ctx;

      args = _.toArray(arguments);

      if (!_.isFunction(args[0])) {
        ctx = args[0];
        args = _.drop(args);
      }

      if (ctx) {
        args[0] = args[0].bind(ctx);
      }

      RunFunctionAction.super.apply(this, args);
    },
  });

  var ReplaceClassAction = Class(Action, {
    constructor: function ReplaceClassAction(panel, className, replacement) {
      ReplaceClassAction.super.call(this);

      this.panel = panel;
      this.className = className;
      this.replacement = replacement;
    },

    update: function() {
      this.panel.RemoveClass(this.className);
      this.panel.AddClass(this.replacement);
      return false;
    },
  });

  var SetAttributeAction = Class(Action, {
    constructor: function SetAttributeAction(panel, attribute, value) {
      SetAttributeAction.super.call(this);

      this.panel = panel;
      this.attribute = attribute;
      this.value = value;
    },

    update: function() {
      this.panel[this.attribute] = this.value;
      return false;
    },
  });

  var EnableAction = Class(SetAttributeAction, {
    constructor: function EnableAction(panel) {
      EnableAction.super.call(this, panel, "enabled", true);
    },
  });

  var DisableAction = Class(SetAttributeAction, {
    constructor: function DisableAction(panel) {
      DisableAction.super.call(this, panel, "enabled", false);
    },
  });

  var SetDialogVariableAction = Class(Action, {
    constructor: function SetDialogVariableAction(panel, variable, value) {
      SetDialogVariableAction.super.call(this);

      this.panel = panel;
      this.variable = variable;
      this.value = value;
    },

    update: function() {
      this.panel.SetDialogVariable(this.variable, this.value);
      return false;
    },
  });

  var SetDialogVariableTimeAction = Class(SetDialogVariableAction, {
    constructor: function SetDialogVariableTimeAction(panel, variable, value) {
      SetDialogVariableTimeAction.super.call(this, panel, variable, value);
    },

    update: function() {
      this.panel.SetDialogVariableTime(this.variable, this.value);
      return false;
    },
  });

  var ScrollToTopAction = Class(Action, {
    constructor: function ScrollToTopAction(panel) {
      ScrollToTopAction.super.call(this);

      this.panel = panel;
    },

    update: function() {
      this.panel.ScrollToTop();
      return false;
    },
  });

  var RemoveChildrenAction = Class(Action, {
    constructor: function RemoveChildrenAction(panel) {
      RemoveChildrenAction.super.call(this);

      this.panel = panel;
    },

    update: function() {
      this.panel.RemoveAndDeleteChildren();
      return false;
    },
  });

  var SelectOptionAction = Class(Action, {
    constructor: function SelectOptionAction(panel, optionId) {
      SelectOptionAction.super.call(this);

      this.panel = panel;
      this.optionId = optionId;
    },

    update: function() {
      this.panel.SetSelected(this.optionId);
      return false;
    },
  });

  var isSequence = function(object) {
    return (
      object instanceof Sequence ||
      object instanceof ParallelSequence ||
      object instanceof ParallelAnySequence ||
      object instanceof StaggeredSequence
    );
  };

  var actionSize = function(action) {
    return isSequence(action) ? action.size() : 1;
  };

  var SequenceMixin = {
    size: function() {
      var aggregate = _.overArgs(_.add, [_, actionSize]);
      return _.reduce(this.actions, aggregate, 1);
    },

    Start: function() {
      return RunSingleAction(this);
    },

    Action: function(action) {
      if (!_.isArray(action)) {
        action = [action];
      }

      this.actions.push.apply(this.actions, action);
      return this;
    },

    Noop: function() {
      this.Action(new NoopAction());
      return this;
    },

    RunFunction: function() {
      this.Action(createAction(RunFunctionAction, arguments));
      return this;
    },

    Wait: function(seconds) {
      this.Action(new WaitAction(seconds));
      return this;
    },

    WaitOneFrame: function() {
      this.Action(new WaitOneFrameAction());
      return this;
    },

    WaitEvent: function(panel, eventName) {
      this.Action(new WaitEventAction(panel, eventName));
      return this;
    },

    WaitAction: function(action, timeoutDuration, continueAfterTimeout) {
      this.Action(new WaitActionAction(action, timeoutDuration, continueAfterTimeout));
      return this;
    },

    Print: function() {
      this.Action(createAction(PrintAction, arguments));
      return this;
    },

    AddClass: function(panel, panelClass) {
      this.Action(new AddClassAction(panel, panelClass));
      return this;
    },

    RemoveClass: function(panel, panelClass) {
      this.Action(new RemoveClassAction(panel, panelClass));
      return this;
    },

    SwitchClass: function(panel, panelSlot, panelClass) {
      this.Action(new SwitchClassAction(panel, panelSlot, panelClass));
      return this;
    },

    ReplaceClass: function(panel, className, replacement) {
      this.Action(new ReplaceClassAction(panel, className, replacement));
      return this;
    },

    WaitClass: function(panel, panelClass) {
      this.Action(new WaitClassAction(panel, panelClass));
      return this;
    },

    RemoveChildren: function(panel) {
      this.Action(new RemoveChildrenAction(panel));
      return this;
    },

    ScrollToTop: function(panel) {
      this.Action(new ScrollToTopAction(panel));
      return this;
    },

    Enable: function(panel) {
      this.Action(new EnableAction(panel));
      return this;
    },

    Disable: function(panel) {
      this.Action(new DisableAction(panel));
      return this;
    },

    SetAttribute: function(panel, attribute, value) {
      this.Action(new SetAttributeAction(panel, attribute, value));
      return this;
    },

    SetDialogVariable: function(panel, dialogVariable, value) {
      this.Action(new SetDialogVariableAction(panel, dialogVariable, value));
      return this;
    },

    SetDialogVariableInt: function(panel, dialogVariable, value) {
      this.Action(new SetDialogVariableIntAction(panel, dialogVariable, value));
      return this;
    },

    AnimateDialogVariableInt: function(panel, dialogVariable, start, end, seconds) {
      this.Action(new AnimateDialogVariableIntAction(panel, dialogVariable, start, end, seconds));
      return this;
    },

    SetDialogVariableTime: function(panel, dialogVariable, value) {
      this.Action(new SetDialogVariableTimeAction(panel, dialogVariable, value));
      return this;
    },

    SelectOption: function(panel, optionId) {
      this.Action(new SelectOptionAction(panel, optionId));
      return this;
    },

    SetProgressBarValue: function(progressBar, value) {
      this.Action(new SetProgressBarValueAction(progressBar, value));
      return this;
    },

    AnimateProgressBar: function(progressBar, startValue, endValue, seconds) {
      this.Action(new AnimateProgressBarAction(progressBar, startValue, endValue, seconds));
      return this;
    },

    AnimateProgressBarWithMiddle: function(progressBar, startValue, endValue, seconds) {
      this.Action(
        new AnimateProgressBarWithMiddleAction(progressBar, startValue, endValue, seconds)
      );
      return this;
    },

    PlaySoundEffect: function(soundName) {
      this.Action(new PlaySoundEffectAction(soundName));
      return this;
    },
  };

  var Sequence = Class(RunSequentialActions, SequenceMixin, {
    constructor: function Sequence() {
      Sequence.super.call(this);
    },
  });

  var ParallelSequence = Class(RunParallelActions, SequenceMixin, {
    constructor: function ParallelActions() {
      ParallelActions.super.call(this);
    },
  });

  var ParallelAnySequence = Class(RunUntilSingleActionFinishedAction, SequenceMixin, {
    constructor: function ParallelAnySequence(continueOthers) {
      ParallelAnySequence.super.call(this, continueOthers);
    },
  });

  var StaggeredSequence = Class(RunStaggeredActions, SequenceMixin, {
    constructor: function StaggeredSequence(delay) {
      StaggeredSequence.super.call(this, delay);
    },
  });

  global.Sequence = {
    // sequences
    Sequence: Sequence,
    ParallelSequence: ParallelSequence,
    ParallelAnySequence: ParallelAnySequence,
    StaggeredSequence: StaggeredSequence,
    // actions
    Action: Action,
    NoopAction: NoopAction,
    PrintAction: PrintAction,
    RunFunctionAction: RunFunctionAction,
    WaitAction: WaitAction,
    WaitOneFrameAction: WaitOneFrameAction,
    WaitEventAction: WaitEventAction,
    WaitActionAction: WaitActionAction,
    AddClassAction: AddClassAction,
    RemoveClassAction: RemoveClassAction,
    SwitchClassAction: SwitchClassAction,
    ReplaceClassAction: ReplaceClassAction,
    WaitClassAction: WaitClassAction,
    ScrollToTopAction: ScrollToTopAction,
    RemoveChildrenAction: RemoveChildrenAction,
    EnableAction: EnableAction,
    DisableAction: DisableAction,
    SetAttributeAction: SetAttributeAction,
    SetDialogVariableAction: SetDialogVariableAction,
    SetDialogVariableIntAction: SetDialogVariableIntAction,
    AnimateDialogVariableIntAction: AnimateDialogVariableIntAction,
    SetDialogVariableTimeAction: SetDialogVariableTimeAction,
    SelectOptionAction: SelectOptionAction,
    SetProgressBarValueAction: SetProgressBarValueAction,
    AnimateProgressBarAction: AnimateProgressBarAction,
    AnimateProgressBarWithMiddleAction: AnimateProgressBarWithMiddleAction,
    PlaySoundEffectAction: PlaySoundEffectAction,
  };
})(GameUI.CustomUIConfig(), this);
