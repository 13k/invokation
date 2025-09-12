import "@invokation/panorama-lib/api";

import type { FacetSelect } from "@invokation/panorama-lib/custom_events";
import { GameEvent } from "@invokation/panorama-lib/custom_events";
import { FacetId } from "@invokation/panorama-lib/dota2/invoker";
import { createScene, SoundEvent, UiEvent } from "@invokation/panorama-lib/panorama";
import {
  ConditionalSequence,
  EmitSoundAction,
  ParallelSequence,
  Sequence,
} from "@invokation/panorama-lib/sequence";
import type { Elements } from "./component";
import { Component } from "./component";

enum PanelId {
  InvokerScene = "scene",
  FacetScene = "facet-scene",
  LoadingScreenContainer = "LoadingScreen",
  Preload = "PreLoadingScreenContainer",
  Sidebar = "SidebarAndBattleCupLayoutContainer",
  Chat = "LoadingScreenChat",
}

const HIDE_DEFAULT_UI_IDS = [
  PanelId.Preload,
  PanelId.Sidebar,
  PanelId.Chat,
];

enum CssClass {
  Splash = "splash",
  SplashInit = "splash-init",
  FacetQuas = "facet-quas",
  FacetWex = "facet-wex",
  FacetExort = "facet-exort",
}

const CLEAR_SPLASH_CLASSES = [
  CssClass.SplashInit,
  CssClass.FacetQuas,
  CssClass.FacetWex,
  CssClass.FacetExort,
];

enum SceneEntityId {
  KidInvoker = "kid",
  Emp = "emp",
  TornadoMain = "tornado",
  Tornado1 = "tornado_child1",
  Tornado2 = "tornado_child2",
  Tornado3 = "tornado_child3",
  Sunstrike1 = "sunstrike1",
  Sunstrike2 = "sunstrike2",
  SunstrikeBlast1 = "sunstrike_blast1",
  SunstrikeBlast2 = "sunstrike_blast2",
  ExortGeyser1 = "exort_geyser1",
  ExortGeyser2 = "exort_geyser2",
  ExortFire1 = "exort_fire1",
  ExortFire2 = "exort_fire2",
  ExortFire3 = "exort_fire3",
}

enum Timing {
  Splash = 1.90,
  SplashSoundEnd = 8.20,
  EmpStart = 0.15,
  TornadosStart = 0.25,
  TornadosDelay = 0.25,
  TornadoMainStart = 1.15,
  TornadoMainDuration = 2.00,
  SunstrikesStart = 0.15,
  SunstrikeBlastDelay = 1.80,
  ExortGeyserDelay = 0.17,
  ExortFireStart = 2.00,
  ExortFireDelay = 0.15,
  AmbientSound = 2.50,
}

const FACET_SCENE_MAP = {
  [FacetId.Quas]: "facet_quas",
  [FacetId.Wex]: "facet_wex",
  [FacetId.Exort]: "facet_exort",
};

const TORNADO_POS = {
  start: { x: 32, y: 512, z: 0 },
  end: { x: 32, y: -512, z: 0 },
};

interface FacetState {
  id: FacetId | null;
  scene: ScenePanel | null;
  sounds: number[];
}

interface CustomLoadingScreenElements extends Elements {
  scene: ScenePanel;
}

export type { CustomLoadingScreen };

class CustomLoadingScreen extends Component<CustomLoadingScreenElements> {
  facetState: FacetState;

  constructor() {
    super({
      elements: {
        scene: PanelId.InvokerScene,
      },
      uiEvents: {
        scene: {
          [UiEvent.ScenePanelLoaded]: () => this.onInvokerSceneLoad(),
        },
      },
      customEvents: {
        [GameEvent.FacetSelect]: (payload) => this.onFacetSelect(payload),
      },
    });

    this.facetState = {
      id: null,
      scene: null,
      sounds: [],
    };

    this.hideDefaultUi();
    this.debug("init");
  }

  hideDefaultUi() {
    const container = this.findParent(PanelId.LoadingScreenContainer);

    if (container == null) {
      return;
    }

    for (const id of HIDE_DEFAULT_UI_IDS) {
      const panel = container.FindChildTraverse(id);

      if (panel != null) {
        panel.visible = false;
      }
    }
  }

  onInvokerSceneLoad() {
    new Sequence()
      .waitSceneLoad(this.elements.scene)
      .playSoundEffect(SoundEvent.InvokerKidTakeoverStinger)
      .playSoundEffect(SoundEvent.InvokerKidTakeoverSfx)
      .wait(Timing.Splash)
      .addClass(this.panel, CssClass.SplashInit)
      .addClass(this.panel, CssClass.Splash)
      .wait(Timing.SplashSoundEnd)
      .setEntityAnimation(this.elements.scene, SceneEntityId.KidInvoker, "debut_end")
      .run();
  }

  pushFacetSceneSound(id: number) {
    this.debug(`facet scene: push sound ${id}`);
    this.facetState.sounds.push(id);
  }

  stopFacetSceneSounds() {
    let id = this.facetState.sounds.pop();

    while (id != null) {
      this.debug(`facet scene: stop sound ${id}`);

      Game.StopSound(id);

      id = this.facetState.sounds.pop();
    }
  }

  deleteFacetScene() {
    if (this.facetState.scene) {
      this.debug("facet scene: delete");
      this.facetState.scene.DeleteAsync(0.05);
    }
  }

  setupFacetUi(id: FacetId) {
    const clearCssClasses = CLEAR_SPLASH_CLASSES.reduce(
      (seq, cssClass) => seq.removeClass(this.panel, cssClass),
      new ParallelSequence(),
    );

    let cssClass: CssClass;

    switch (id) {
      case FacetId.Quas:
        cssClass = CssClass.FacetQuas;
        break;
      case FacetId.Wex:
        cssClass = CssClass.FacetWex;
        break;
      case FacetId.Exort:
        cssClass = CssClass.FacetExort;
        break;
      default:
        return;
    }

    new Sequence().add(clearCssClasses).addClass(this.panel, cssClass).run();
  }

  onFacetSelect(payload: FacetSelect) {
    this.debug("onFacetSelect", payload);

    const { id } = payload;

    if (id === this.facetState.id) {
      return;
    }

    this.debug("facet scene : reset");

    this.stopFacetSceneSounds();
    this.deleteFacetScene();
    this.setupFacetUi(id);

    const map = `custom_game/scenes/${FACET_SCENE_MAP[id]}`;

    this.debug("facet scene : create", { map });

    const scene = createScene(this.panel, PanelId.FacetScene, {
      map,
      light: "light",
      camera: "camera",
      particleonly: "false",
      "require-composition-layer": "true",
      hittest: "false",
    });

    scene.ReloadScene();

    const seq = new ConditionalSequence(() => scene.IsValid()).waitSceneLoad(scene);

    switch (id) {
      case FacetId.Quas:
        seq
          .add(this.emitSoundAction(SoundEvent.InvokerCastGlacier))
          .seqAfter(Timing.AmbientSound, (seqAmbient) => {
            seqAmbient
              .add(this.emitSoundAction(SoundEvent.InvokationFacetAmbientQuas));
          });

        break;
      case FacetId.Wex:
        seq.parallel((seqWex) => {
          seqWex
            .seqAfter(Timing.EmpStart, (seqEmp) => {
              seqEmp.startEntity(scene, SceneEntityId.Emp);
            })
            .stagger(Timing.TornadosDelay, Timing.TornadosStart, (seqTornados) => {
              seqTornados.startEntity(scene, SceneEntityId.Tornado1);
              seqTornados.startEntity(scene, SceneEntityId.Tornado2);
              seqTornados.startEntity(scene, SceneEntityId.Tornado3);
            })
            .seqAfter(Timing.TornadoMainStart, (seqTornado) => {
              seqTornado
                .add(this.emitSoundAction(SoundEvent.InvokerCastTornado))
                .setEntityControlPoint(scene, SceneEntityId.TornadoMain, 0, TORNADO_POS.start)
                .setEntityControlPoint(scene, SceneEntityId.TornadoMain, 1, TORNADO_POS.end)
                .startEntity(scene, SceneEntityId.TornadoMain)
                .wait(Timing.TornadoMainDuration)
                .stopEntityEndcap(scene, SceneEntityId.TornadoMain);
            })
            .seqAfter(Timing.AmbientSound, (seqAmbient) => {
              seqAmbient
                .add(this.emitSoundAction(SoundEvent.InvokationFacetAmbientWex));
            });
        });

        break;
      case FacetId.Exort:
        seq.parallel((seqExort) => {
          seqExort
            .parallelAfter(Timing.SunstrikesStart, (seqStrikes) => {
              seqStrikes
                .add(this.emitSoundAction(SoundEvent.InvokerCastCataclysm))
                .startEntity(scene, SceneEntityId.Sunstrike1)
                .startEntity(scene, SceneEntityId.Sunstrike2)
                .seqAfter(Timing.SunstrikeBlastDelay, (seqBlast) => {
                  seqBlast
                    .add(this.emitSoundAction(SoundEvent.InvokerCastCataclysmIgnite))
                    .startEntity(scene, SceneEntityId.SunstrikeBlast1)
                    .startEntity(scene, SceneEntityId.SunstrikeBlast2)
                    .wait(Timing.ExortGeyserDelay)
                    .startEntity(scene, SceneEntityId.ExortGeyser1)
                    .startEntity(scene, SceneEntityId.ExortGeyser2)
                });
            })
            .stagger(Timing.ExortFireDelay, Timing.ExortFireStart, (seqFire) => {
              seqFire
                .startEntity(scene, SceneEntityId.ExortFire1)
                .startEntity(scene, SceneEntityId.ExortFire2)
                .startEntity(scene, SceneEntityId.ExortFire3);
            })
            .seqAfter(Timing.AmbientSound, (seqAmbient) => {
              seqAmbient.add(this.emitSoundAction(SoundEvent.InvokationFacetAmbientExort));
            });
        });

        break;
      default:
        this.error(`Invalid facet id ${id}`);
        return;
    }

    this.debug("facet scene : run");
    seq.run();

    this.facetState.id = id;
    this.facetState.scene = scene;
  }

  emitSoundAction(sound: string): EmitSoundAction {
    return new EmitSoundAction(sound, this.pushFacetSceneSound.bind(this));
  }
}

(() => {
  new CustomLoadingScreen();
})();
