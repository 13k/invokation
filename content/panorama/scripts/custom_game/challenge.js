"use strict";

(function(global, context) {
  var _ = global.lodash;
  var L10n = global.L10n;
  var Sequence = global.Sequence.Sequence;
  var ParallelSequence = global.Sequence.ParallelSequence;
  var StaggeredSequence = global.Sequence.StaggeredSequence;
  var RunFunctionAction = global.Sequence.RunFunctionAction;
  var AddClassAction = global.Sequence.AddClassAction;
  var RemoveClassAction = global.Sequence.RemoveClassAction;
  var SetDialogVariableAction = global.Sequence.SetDialogVariableAction;
  var LuaList = global.Util.LuaList;
  var CreatePanelWithLayout = global.Util.CreatePanelWithLayout;
  var CreateComponent = context.CreateComponent;

  var COMBOS = global.COMBOS;
  var EVENTS = global.Const.EVENTS;
  var FREESTYLE_COMBO_ID = global.Const.FREESTYLE_COMBO_ID;

  var COMBO_STEP_LAYOUT = "file://{resources}/layout/custom_game/challenge_combo_step.xml";
  var COMBO_SCORE_LAYOUT = "file://{resources}/layout/custom_game/combo_score.xml";
  var COMBO_SCORE_ID = "ComboScore";
  var COMBO_SCORE_CLASS = "Level2";

  var START_DELAY = 0.5;
  var BUMP_DELAY = 0.2;

  var L10N_PREFIXES = {
    HUD_VISIBILITY: "invokation_combo_hud_visibility",
    SPLASH: "invokation_combo_splash",
  };

  var SOUND_EVENTS = {
    success: "kidvoker_takeover_stinger",
    failure: "ui.death_stinger",
  };

  var SPLASH_MAX_INDICES = {
    start: { title: 1, help: 1 },
    success: { title: 2, help: 7 },
    failure: { title: 3, help: 9 },
  };

  var HUD_VISIBILITY_CLASSES = {
    visible: "HudVisible",
    hide_sequence: "HudHideSequence",
    no_hands: "HudNoHands",
  };

  var Challenge = CreateComponent({
    constructor: function Challenge() {
      Challenge.super.call(this, {
        elements: {
          sequence: "ChallengeSequence",
          splash: "ChallengeSplash",
          splashTitle: "ChallengeSplashTitle",
          splashHelp: "ChallengeSplashHelp",
          score: "ChallengeScore",
          timer: "ChallengeTimer",
          timerLabel: "ChallengeTimerLabel",
        },
        customEvents: {
          "!COMBO_STARTED": "onComboStarted",
          "!COMBO_STOPPED": "onComboStopped",
          "!COMBO_IN_PROGRESS": "onComboInProgress",
          "!COMBO_PROGRESS": "onComboProgress",
          "!COMBO_STEP_ERROR": "onComboStepError",
          "!COMBO_FINISHED": "onComboFinished",
        },
      });

      this.hudMode = "visible";
      this.timer = {
        start: null,
        update: false,
        schedule: null,
      };

      this.$comboScore = this.createComboScorePanel(this.$score);

      this.initHudVisibility(this.hudMode);
      this.debug("init");
    },

    // --- Event handlers -----

    onComboStarted: function(payload) {
      if (payload.combo === FREESTYLE_COMBO_ID) {
        return;
      }

      this.debug("onComboStarted()", payload);
      this.start(payload.combo, payload.next);
    },

    onComboStopped: function(payload) {
      if (payload.combo === FREESTYLE_COMBO_ID) {
        return;
      }

      this.debug("onComboStopped()", payload);
      this.stop(payload.combo);
    },

    onComboInProgress: function(payload) {
      if (payload.combo === FREESTYLE_COMBO_ID) {
        return;
      }

      this.debug("onComboInProgress()", payload);
      this.inProgress(payload.combo);
    },

    onComboProgress: function(payload) {
      if (payload.combo === FREESTYLE_COMBO_ID) {
        return;
      }

      this.debug("onComboProgress()", payload);
      this.progress(payload.combo, payload.count, payload.next);
    },

    onComboStepError: function(payload) {
      if (payload.combo === FREESTYLE_COMBO_ID) {
        return;
      }

      this.debug("onComboStepError()", payload);
      this.fail(payload.combo, payload.expected, payload.ability);
    },

    onComboFinished: function(payload) {
      if (payload.combo === FREESTYLE_COMBO_ID) {
        return;
      }

      this.debug("onComboFinished()", payload);
      this.finish(payload.combo, payload.count, payload.damage);
    },

    // ----- Helpers -----

    sendStop: function() {
      this.sendServer(EVENTS.COMBO_STOP);
    },

    sendRestart: function(isHardReset) {
      this.sendServer(EVENTS.COMBO_RESTART, { hardReset: isHardReset });
    },

    sendRenderViewer: function(combo) {
      this.sendClientSide(EVENTS.VIEWER_RENDER, { combo: combo });
    },

    createComboScorePanel: function(parent) {
      var panel = CreatePanelWithLayout(parent, COMBO_SCORE_ID, COMBO_SCORE_LAYOUT);
      panel.AddClass(COMBO_SCORE_CLASS);
      return panel;
    },

    createStepPanel: function(parent, step) {
      var id = "combo_step_" + step.name + "_" + step.id.toString();
      var panel = CreatePanelWithLayout(parent, id, COMBO_STEP_LAYOUT);

      this.stepsPanels[step.id] = panel;

      panel.component.Input("SetStep", { combo: this.combo, step: step });

      return panel;
    },

    scrollToStepPanel: function(step) {
      var panel = this.stepsPanels[step.id];
      panel.ScrollParentToMakePanelFit(1, false);
    },

    stepPanelInput: function(step, input) {
      var panel = this.stepsPanels[step.id];
      panel.component.Input(input);
    },

    bumpStepPanel: function(step) {
      return this.stepPanelInput(step, "StepBump");
    },

    activateStepPanel: function(step) {
      return this.stepPanelInput(step, "SetStepActive");
    },

    deactivateStepPanel: function(step) {
      return this.stepPanelInput(step, "UnsetStepActive");
    },

    failStepPanel: function(step) {
      return this.stepPanelInput(step, "SetStepError");
    },

    clearFailedStepPanel: function(step) {
      return this.stepPanelInput(step, "UnsetStepError");
    },

    startTimer: function() {
      this.timer.start = Date.now();
      this.timer.update = true;
      this.debug("startTimer()", this.timer);
      this.updateTimer();
    },

    stopTimer: function() {
      this.timer.start = null;
      this.timer.update = false;
    },

    // ----- Component actions -----

    showAction: function() {
      return new RemoveClassAction(this.$ctx, "Hide");
    },

    hideAction: function() {
      return new ParallelSequence()
        .Action(this.hideSplashAction())
        .Action(this.hideScoreAction())
        .AddClass(this.$ctx, "Hide");
    },

    // ----- Sequence actions -----

    renderSequenceAction: function() {
      this.stepsPanels = {};

      var bumpSeq = this.staggeredSequenceOnStepPanels(
        BUMP_DELAY,
        this.combo.sequence,
        "bumpStepPanel"
      );

      return new Sequence()
        .Action(this.resetSequenceAction())
        .Action(this.createStepPanelsAction())
        .Action(bumpSeq);
    },

    resetSequenceAction: function() {
      return new Sequence().ScrollToTop(this.$sequence).RemoveChildren(this.$sequence);
    },

    createStepPanelsAction: function() {
      var createActions = _.map(
        this.combo.sequence,
        _.bind(this.createStepPanelAction, this, this.$sequence)
      );

      return new Sequence().Action(createActions);
    },

    createStepPanelAction: function(parent, step) {
      return new RunFunctionAction(this, this.createStepPanel, parent, step);
    },

    sequenceActionsOnStepPanels: function(steps, fn) {
      fn = this.handler(fn);

      return _.map(steps, function(step) {
        return new RunFunctionAction(fn, step);
      });
    },

    parallelSequenceOnStepPanels: function(steps, fn) {
      return new ParallelSequence().Action(this.sequenceActionsOnStepPanels(steps, fn));
    },

    staggeredSequenceOnStepPanels: function(delay, steps, fn) {
      return new StaggeredSequence(delay).Action(this.sequenceActionsOnStepPanels(steps, fn));
    },

    activateStepPanelsAction: function(steps) {
      var seq = new Sequence();

      if (_.isEmpty(steps)) {
        return seq;
      }

      var activateSeq = this.parallelSequenceOnStepPanels(steps, "activateStepPanel");

      return seq.RunFunction(this, this.scrollToStepPanel, steps[0]).Action(activateSeq);
    },

    deactivateStepPanelsAction: function(steps) {
      return this.parallelSequenceOnStepPanels(steps, "deactivateStepPanel");
    },

    bumpStepPanelsAction: function(steps) {
      return this.parallelSequenceOnStepPanels(steps, "bumpStepPanel");
    },

    failStepPanelsAction: function(steps) {
      return this.parallelSequenceOnStepPanels(steps, "failStepPanel");
    },

    clearFailedStepPanelsAction: function(steps) {
      return this.parallelSequenceOnStepPanels(steps, "clearFailedStepPanel");
    },

    // ----- HUD actions -----

    resetHudVisibilityActions: function() {
      return _.map(
        HUD_VISIBILITY_CLASSES,
        function(cls) {
          return new RemoveClassAction(this.$ctx, cls);
        }.bind(this)
      );
    },

    updateHudVisibilityTooltipAction: function(mode) {
      var hudVisibilityTooltip = L10n.LocalizeParameterized(L10N_PREFIXES.HUD_VISIBILITY, mode);
      return new SetDialogVariableAction(this.$ctx, "hud_visibility", hudVisibilityTooltip);
    },

    switchHudAction: function(prevMode, nextMode) {
      var prevClass = HUD_VISIBILITY_CLASSES[prevMode];
      var nextClass = HUD_VISIBILITY_CLASSES[nextMode];
      var heroHudFn = nextMode === "no_hands" ? this.hideActionPanelUI : this.showActionPanelUI;

      return new Sequence()
        .Action(this.updateHudVisibilityTooltipAction(nextMode))
        .ReplaceClass(this.$ctx, prevClass, nextClass)
        .RunFunction(this, heroHudFn);
    },

    // ----- Splash actions -----

    clearSplashAction: function() {
      return new ParallelSequence()
        .RemoveClass(this.$splash, "start")
        .RemoveClass(this.$splash, "success")
        .RemoveClass(this.$splash, "failure");
    },

    showSplashAction: function(state) {
      var titleIndex = _.random(1, _.get(SPLASH_MAX_INDICES, [state, "title"], 1));
      var helpIndex = _.random(1, _.get(SPLASH_MAX_INDICES, [state, "help"], 1));
      var title = L10n.LocalizeParameterized(L10N_PREFIXES.SPLASH, [state, "title", titleIndex]);
      var help = L10n.LocalizeParameterized(L10N_PREFIXES.SPLASH, [state, "help", helpIndex]);

      var actions = new ParallelSequence()
        .Action(this.clearSplashAction())
        .SetAttribute(this.$splashTitle, "text", title)
        .SetAttribute(this.$splashHelp, "text", help)
        .AddClass(this.$splash, state);

      return new Sequence().Action(actions).AddClass(this.$splash, "Show");
    },

    hideSplashAction: function() {
      return new ParallelSequence()
        .Action(this.clearSplashAction())
        .RemoveClass(this.$splash, "Show");
    },

    // ----- Score actions -----

    updateScoreCounterAction: function(count) {
      return new RunFunctionAction(
        this.$comboScore.component,
        this.$comboScore.component.Input,
        "UpdateCounter",
        { count: count }
      );
    },

    updateScoreSummaryAction: function(options) {
      return new RunFunctionAction(
        this.$comboScore.component,
        this.$comboScore.component.Input,
        "UpdateSummary",
        options
      );
    },

    hideScoreAction: function() {
      return new Sequence()
        .RemoveClass(this.$score, "Failed")
        .RunFunction(this.$comboScore.component, this.$comboScore.component.Input, "Hide");
    },

    showTimerAction: function() {
      return new RemoveClassAction(this.$timer, "Hide");
    },

    hideTimerAction: function() {
      return new AddClassAction(this.$timer, "Hide");
    },

    // ----- Action runners -----

    initHudVisibility: function(mode) {
      return new Sequence()
        .Action(this.updateHudVisibilityTooltipAction(mode))
        .Action(this.resetHudVisibilityActions())
        .AddClass(this.$ctx, HUD_VISIBILITY_CLASSES[mode])
        .Start();
    },

    start: function(id, next) {
      this.combo = COMBOS.Get(id);

      var seq = new Sequence()
        .Action(this.hideScoreAction())
        .Action(this.hideSplashAction())
        .Action(this.hideTimerAction())
        .Wait(START_DELAY)
        .Action(this.showAction())
        .Action(this.renderSequenceAction())
        .Action(this.showSplashAction("start"))
        .Wait(0.25)
        .RunFunction(this, this.progress, this.combo.id, 0, next);

      this.debugFn(function() {
        return ["start()", { id: this.combo.id, actions: seq.size() }];
      });

      return seq.Start();
    },

    stop: function(id) {
      this.stopTimer();
      this.combo = null;

      var seq = new Sequence().Action(this.hideAction()).Action(this.hideTimerAction());

      this.debugFn(function() {
        return ["stop()", { id: id, actions: seq.size() }];
      });

      return seq.Start();
    },

    inProgress: function(id) {
      var seq = new Sequence().Action(this.showTimerAction()).Action(this.hideSplashAction());

      this.debugFn(function() {
        return ["inProgress()", { id: id }];
      });

      this.startTimer();

      return seq.Start();
    },

    progress: function(id, count, next) {
      count = count || 0;
      next = LuaList(next);

      var seq = new Sequence();

      seq
        .Action(this.clearFailedStepPanelsAction(this.combo.sequence))
        .Action(this.deactivateStepPanelsAction(this.combo.sequence))
        .Action(this.activateStepPanelsAction(next))
        .Action(this.updateScoreCounterAction(count));

      this.debugFn(function() {
        return ["progress()", { id: id, count: count, next: next, actions: seq.size() }];
      });

      return seq.Start();
    },

    finish: function(id, count, damage) {
      this.stopTimer();

      var options = {
        count: count || 0,
        startDamage: 0,
        endDamage: damage || 0,
      };

      var seq = new Sequence()
        .PlaySoundEffect(SOUND_EVENTS.success)
        .Action(this.showSplashAction("success"))
        .Action(this.deactivateStepPanelsAction(this.combo.sequence))
        .Action(this.bumpStepPanelsAction(this.combo.sequence))
        .Action(this.updateScoreSummaryAction(options));

      this.debugFn(function() {
        return ["finish()", _.assign({ id: id, actions: seq.size() }, options)];
      });

      return seq.Start();
    },

    fail: function(id, expected, ability) {
      this.stopTimer();

      expected = LuaList(expected);

      var seq = new Sequence()
        .PlaySoundEffect(SOUND_EVENTS.failure)
        .Action(this.showSplashAction("failure"))
        .AddClass(this.$score, "Failed")
        .Action(this.failStepPanelsAction(expected))
        .Action(this.bumpStepPanelsAction(expected))
        .Action(this.hideTimerAction());

      this.debugFn(function() {
        return ["fail()", { id: id, ability: ability, expected: expected, actions: seq.size() }];
      });

      return seq.Start();
    },

    toggleHUD: function() {
      var prevMode = this.hudMode;
      var nextMode;

      switch (prevMode) {
        case "visible":
          nextMode = "hide_sequence";
          break;
        case "hide_sequence":
          nextMode = "no_hands";
          break;
        case "no_hands":
          nextMode = "visible";
          break;
      }

      this.hudMode = nextMode;
      var seq = this.switchHudAction(prevMode, nextMode);

      this.debugFn(function() {
        return ["toggleHUD()", { prev: prevMode, next: nextMode, actions: seq.size() }];
      });

      return seq.Start();
    },

    updateTimer: function() {
      if (!this.timer.update) {
        return;
      }

      this.$timerLabel.text = ((Date.now() - this.timer.start) / 1000).toFixed(1);

      $.Schedule(0.1, this.updateTimer.bind(this));
    },

    // ----- UI methods -----

    Restart: function(isHardReset) {
      this.debugFn(function() {
        return ["Restart()", { isHardReset: isHardReset }];
      });

      this.sendRestart(!!isHardReset);
    },

    Stop: function() {
      this.debug("Stop()");
      this.sendStop();
    },

    ShowDetails: function() {
      this.debug("ShowDetails()");
      this.sendRenderViewer(this.combo);
    },

    ToggleHUD: function() {
      this.toggleHUD();
    },
  });

  context.challenge = new Challenge();
})(GameUI.CustomUIConfig(), this);
