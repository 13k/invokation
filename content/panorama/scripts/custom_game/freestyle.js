"use strict";

(function(global, context) {
  var EVENTS = global.Const.EVENTS;
  var FREESTYLE_COMBO_ID = global.Const.FREESTYLE_COMBO_ID;
  var Sequence = global.Sequence.Sequence;
  var ParallelSequence = global.Sequence.ParallelSequence;
  var RemoveClassAction = global.Sequence.RemoveClassAction;
  var RunFunctionAction = global.Sequence.RunFunctionAction;
  var CreatePanelWithLayout = global.Util.CreatePanelWithLayout;
  var CreateComponent = context.CreateComponent;

  var COMBO_SCORE_LAYOUT = "file://{resources}/layout/custom_game/combo_score.xml";

  var START_DELAY = 0.5;

  var SOUND_EVENTS = {
    start: "kidvoker_takeover_stinger",
  };

  var Freestyle = CreateComponent({
    constructor: function Freestyle() {
      Freestyle.super.call(this, {
        elements: ["Score"],
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
      if (payload.combo !== FREESTYLE_COMBO_ID) {
        return;
      }

      this.debug("onComboStarted()", payload);
      this.start();
    },

    onComboStopped: function(payload) {
      if (payload.combo !== FREESTYLE_COMBO_ID) {
        return;
      }

      this.debug("onComboStopped()", payload);
      this.stop();
    },

    onComboProgress: function(payload) {
      if (payload.combo !== FREESTYLE_COMBO_ID) {
        return;
      }

      this.debug("onComboProgress()", payload);
      this.progress(payload.count, payload.damage);
    },

    // ----- Helpers -----

    sendStop: function() {
      this.sendServer(EVENTS.COMBO_STOP);
    },

    sendRestart: function(isHardReset) {
      this.sendServer(EVENTS.COMBO_RESTART, { hardReset: isHardReset });
    },

    createComboScorePanel: function(parent) {
      var panel = CreatePanelWithLayout(parent, "ComboScore", COMBO_SCORE_LAYOUT);
      panel.AddClass("Level2");
      return panel;
    },

    // ----- Component actions -----

    showAction: function() {
      return new RemoveClassAction(this.$ctx, "Hide");
    },

    hideAction: function() {
      return new ParallelSequence()
        .Action(this.hideScoreAction())
        .AddClass(this.$ctx, "Hide");
    },

    // ----- Score actions -----

    updateScoreSummaryAction: function(count, damage) {
      return new RunFunctionAction(
        this.$comboScore.component,
        this.$comboScore.component.Input,
        "UpdateSummary",
        { count: count, damage: damage }
      );
    },

    hideScoreAction: function() {
      return new Sequence().RunFunction(
        this.$comboScore.component,
        this.$comboScore.component.Input,
        "Hide"
      );
    },

    // ----- Action runners -----

    start: function() {
      var seq = new Sequence()
        .PlaySoundEffect(SOUND_EVENTS.start)
        .Action(this.hideScoreAction())
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

    progress: function(count, damage) {
      count = count || 0;
      damage = damage || 0;

      var seq = new Sequence().Action(this.updateScoreSummaryAction(count, damage));

      this.debugFn(function() {
        return ["progress()", { count: count, damage: damage, actions: seq.size() }];
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
  });

  context.freestyle = new Freestyle();
})(GameUI.CustomUIConfig(), this);
