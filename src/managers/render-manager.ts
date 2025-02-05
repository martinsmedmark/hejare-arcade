import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPixelatedPass } from "three/examples/jsm/Addons.js";
import { SceneManager } from "./scene-manager";

export class RendererManager {
  private renderer: THREE.WebGLRenderer;
  private composer: EffectComposer;
  private sceneManager: SceneManager;
  private pixelSize: number = 0.3;

  constructor(sceneManager: SceneManager) {
    this.renderer = new THREE.WebGLRenderer({
      canvas: document.getElementById("canvas") as HTMLCanvasElement,
    });
    this.composer = new EffectComposer(this.renderer);
    this.sceneManager = sceneManager;
  }

  initialize() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1));

    const renderPixelatedPass = new RenderPixelatedPass(
      this.pixelSize,
      this.sceneManager.scene,
      this.sceneManager.camera
    );
    this.composer.addPass(renderPixelatedPass);

    window.addEventListener("resize", this.onResize.bind(this));
  }

  private onResize() {
    const sizes = { width: window.innerWidth, height: window.innerHeight };
    this.renderer.setSize(sizes.width, sizes.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  render(time: number) {
    // this.renderer.render(this.sceneManager.scene, this.sceneManager.camera);
    this.composer.render();
  }
}
