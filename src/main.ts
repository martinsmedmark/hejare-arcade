import * as THREE from "three";
import { SceneManager } from "./managers/scene-manager";
import { RendererManager } from "./managers/render-manager";
import { SVGManager } from "./managers/svg-manager";
import { ObjectManager } from "./managers/object-manager";
import { PhysicsManager } from "./managers/physics-manager";
import { UIManager } from "./managers/ui-manager";

async function main() {
  // Create instances of each manager
  const sceneManager = new SceneManager();
  const rendererManager = new RendererManager(sceneManager);
  const hejareSvgManager = new SVGManager("hejare.svg");
  const arcadeSvgManager = new SVGManager("arcade.svg");
  const objectManager = new ObjectManager();
  const physicsManager = new PhysicsManager();

  new UIManager();

  // Initialize all managers
  sceneManager.initialize({ useOrbitControls: true });
  rendererManager.initialize();
  await Promise.all([
    hejareSvgManager.initialize(),
    arcadeSvgManager.initialize(),
  ]);
  objectManager.initialize();

  sceneManager.scene.add(hejareSvgManager.svgGroup);
  sceneManager.scene.add(arcadeSvgManager.svgGroup);
  sceneManager.scene.add(objectManager.objectsGroup);

  // Set up a clock for the animation loop
  const clock = new THREE.Clock();

  // Animation loop (tick function)
  const tick = () => {
    const elapsedTime = clock.getElapsedTime();

    // Render and update each manager
    sceneManager.render(); // Update scene (controls, camera, etc.)
    rendererManager.render(); // Handle renderer and post-processing
    hejareSvgManager.render(elapsedTime); // Render SVG-related logic (if any)
    arcadeSvgManager.render(elapsedTime); // Render SVG-related logic (if any)
    objectManager.render(); // Update object rotations and other logic
    physicsManager.render(
      sceneManager.camera,
      hejareSvgManager.svgGroup,
      hejareSvgManager.size
    ); // Update physics (e.g., SVG position)

    // Request the next animation frame
    requestAnimationFrame(tick);
  };

  // Start the animation loop
  tick();
}

main();
