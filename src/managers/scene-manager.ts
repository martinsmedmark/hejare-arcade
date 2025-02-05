import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { scene } from "../old/scene";

type Options = {
  useOrbitControls: boolean;
};

export class SceneManager {
  private controls?: OrbitControls;

  public camera: THREE.PerspectiveCamera;
  public scene: THREE.Scene;

  constructor() {
    this.scene = scene;
    this.camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.01,
      1000
    );
  }

  initialize({ useOrbitControls }: Options) {
    // Initialize lights, camera, and controls
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const directionalLight = new THREE.DirectionalLight(0xffffff, 5);
    this.scene.add(directionalLight);

    this.camera.position.set(0, 0, 50);

    if (useOrbitControls) {
      this.controls = new OrbitControls(
        this.camera,
        document.getElementById("canvas") as HTMLCanvasElement
      );
      this.controls.enableDamping = true;
      this.controls.target = new THREE.Vector3(0, 0, 0);
    }

    this.createFrustumBox();

    const sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    window.addEventListener("resize", () => {
      sizes.width = window.innerWidth;
      sizes.height = window.innerHeight;

      this.camera.aspect = sizes.width / sizes.height;
      this.camera.updateProjectionMatrix();
    });
  }

  private createFrustumBox() {
    // Create and add the frustum box here as before
  }

  render() {
    this.controls?.update();
  }
}
