"use strict";

(function(global, context) {
  var _ = global.lodash;
  var Sequence = global.Sequence.Sequence;
  var ParallelSequence = global.Sequence.ParallelSequence;
  var RemoveClassAction = global.Sequence.RemoveClassAction;
  var RunFunctionAction = global.Sequence.RunFunctionAction;
  var CreatePanelWithLayout = global.Util.CreatePanelWithLayout;
  var CreateComponent = context.CreateComponent;

  var EVENTS = global.Const.EVENTS;
  var FREESTYLE_COMBO_ID = global.Const.FREESTYLE_COMBO_ID;

  var COMBO_SCORE_LAYOUT = "file://{resources}/layout/custom_game/combo_score.xml";
  var COMBO_SCORE_ID = "ComboScore";
  var COMBO_SCORE_CLASS = "Level2";

  var START_DELAY = 0.5;

  var SOUND_EVENTS = {
    start: "Invokation.Freestyle.Start",
  };

  var Freestyle = CreateComponent({
    constructor: function Freestyle() {
      Freestyle.super.call(this, {
        elements: {
          score: "FreestyleScore",
        },
        customEvents: {
          "!COMBO_STARTED": "onComboStarted",
          "!COMBO_STOPPED": "onComboStopped",
          "!COMBO_PROGRESS": "onComboProgress",
        },
      });

      this.$comboScore = this.createComboScorePanel(this.$score);
      this.debug("init");
    },

    // --- Event handlers -----

    onComboStarted: function(payload) {
      if (payload.id !== FREESTYLE_COMBO_ID) {
        return;
      }

      this.debug("onComboStarted()", payload);
      this.start();
    },

    onComboStopped: function(payload) {
      if (payload.id !== FREESTYLE_COMBO_ID) {
        return;
      }

      this.debug("onComboStopped()", payload);
      this.stop();
    },

    onComboProgress: function(payload) {
      if (payload.id !== FREESTYLE_COMBO_ID) {
        return;
      }

      this.debug("onComboProgress()", payload);
      this.progress(payload.metrics);
    },

    // ----- Helpers -----

    sendStop: function() {
      this.sendServer(EVENTS.COMBO_STOP);
    },

    sendRestart: function(isHardReset) {
      this.sendServer(EVENTS.COMBO_RESTART, { hardReset: isHardReset });
    },

    sendLevelUp: function(payload) {
      this.sendServer(EVENTS.FREESTYLE_HERO_LEVEL_UP, payload);
    },

    createComboScorePanel: function(parent) {
      var panel = CreatePanelWithLayout(parent, COMBO_SCORE_ID, COMBO_SCORE_LAYOUT);
      panel.AddClass(COMBO_SCORE_CLASS);
      return panel;
    },

    // ----- Component actions -----

    showAction: function() {
      return new RemoveClassAction(this.$ctx, "Hide");
    },

    hideAction: function() {
      return new ParallelSequence()
        .Action(this.hideScoreAction())
        .Action(this.hideShopAction())
        .AddClass(this.$ctx, "Hide");
    },

    // ----- Score actions -----

    updateScoreSummaryAction: function(options) {
      return new RunFunctionAction(
        this.$comboScore.component,
        this.$comboScore.component.Input,
        "UpdateSummary",
        options
      );
    },

    hideScoreAction: function() {
      return new Sequence().RunFunction(this.$comboScore.component, this.$comboScore.component.Input, "Hide");
    },

    // ----- HUD actions -----

    showShopAction: function() {
      return new RunFunctionAction(this, this.showInventoryShopUI);
    },

    hideShopAction: function() {
      return new RunFunctionAction(this, this.hideInventoryShopUI);
    },

    // ----- Action runners -----

    start: function() {
      var seq = new Sequence()
        .PlaySoundEffect(SOUND_EVENTS.start)
        .Action(this.hideScoreAction())
        .Action(this.showShopAction())
        .Wait(START_DELAY)
        .Action(this.showAction());

      this.debugFn(function() {
        return ["start()", { actions: seq.size() }];
      });

      return seq.Start();
    },

    stop: function() {
      var seq = new Sequence().Action(this.hideAction());

      this.debugFn(function() {
        return ["stop()", { actions: seq.size() }];
      });

      return seq.Start();
    },

    progress: function(metrics) {
      var options = {
        count: metrics.count || 0,
        endDamage: metrics.damage || 0,
      };

      var seq = new Sequence().Action(this.updateScoreSummaryAction(options));

      this.debugFn(function() {
        return ["progress()", _.assign({ actions: seq.size() }, options)];
      });

      return seq.Start();
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

    LevelUp: function() {
      this.sendLevelUp();
    },

    LevelMax: function() {
      this.sendLevelUp({ maxLevel: true });
    },
  });

  context.freestyle = new Freestyle();
})(GameUI.CustomUIConfig(), this);
