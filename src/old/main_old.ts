import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { scene } from "./scene";
import SVGRenderer from "../svg-render";
import { objectsGroup } from "./objects";
import "./objects";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPixelatedPass } from "three/examples/jsm/Addons.js";

// Canvas
const canvas = document.getElementById("canvas") as HTMLCanvasElement;

if (!canvas) {
  throw new Error("Canvas not found");
}

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 5);
scene.add(directionalLight);

const cameraOffset = 50;

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(
  50,
  sizes.width / sizes.height,
  0.01,
  1000
);
camera.position.set(0, 0, cameraOffset);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.target = new THREE.Vector3(0, 0, -cameraOffset * 2);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
const composer = new EffectComposer(renderer);
const renderPixelatedPass = new RenderPixelatedPass(3, scene, camera);
composer.addPass(renderPixelatedPass);

// Function to create a trapezoidal frustum-like box
const nearPlaneOffset = 10;
const frustumDepth = 200;

// function createFrustumBox() {
//   const fov = camera.fov * (Math.PI / 180); // Convert to radians
//   const aspect = camera.aspect;

//   const nearDist = camera.near + nearPlaneOffset;
//   const farDist = nearDist + frustumDepth;

//   const nearHeight = 2 * nearDist * Math.tan(fov / 2);
//   const nearWidth = nearHeight * aspect;
//   const farHeight = 2 * farDist * Math.tan(fov / 2);
//   const farWidth = farHeight * aspect;

//   const vertices = new Float32Array([
//     // Near face (small)
//     -nearWidth / 2,
//     -nearHeight / 2,
//     -nearDist,
//     nearWidth / 2,
//     -nearHeight / 2,
//     -nearDist,
//     nearWidth / 2,
//     nearHeight / 2,
//     -nearDist,
//     -nearWidth / 2,
//     nearHeight / 2,
//     -nearDist,

//     // Far face (big)
//     -farWidth / 2,
//     -farHeight / 2,
//     -farDist,
//     farWidth / 2,
//     -farHeight / 2,
//     -farDist,
//     farWidth / 2,
//     farHeight / 2,
//     -farDist,
//     -farWidth / 2,
//     farHeight / 2,
//     -farDist,
//   ]);

//   const indices = [
//     // Near face
//     0, 1, 2, 2, 3, 0,

//     // Far face
//     4, 5, 6, 6, 7, 4,

//     // Connecting edges
//     0, 1, 5, 5, 4, 0, 1, 2, 6, 6, 5, 1, 2, 3, 7, 7, 6, 2, 3, 0, 4, 4, 7, 3,
//   ];

//   const geometry = new THREE.BufferGeometry();
//   geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
//   geometry.setIndex(indices);
//   geometry.computeVertexNormals();

//   const material = new THREE.MeshBasicMaterial({
//     color: 0xff0000,
//     wireframe: true,
//   });
//   const mesh = new THREE.Mesh(geometry, material);

//   return mesh;
// }

// Create frustum box and add to scene
// const frustumBox = createFrustumBox();
// scene.add(frustumBox);

// Add objects group to the scene
scene.add(objectsGroup);

// Add SVG group to the scene
const svgPath = "hejare.svg";
const svgRenderer = new SVGRenderer(svgPath);
const { svgGroup, size: svgSize } = svgRenderer;
svgGroup.position.z = -frustumDepth / 2; // FIX: Move the SVG group to the near plane
scene.add(svgGroup);

// Initial velocity in a random direction
const velocity = new THREE.Vector3(-0.5, -0.5, -1);

// Function to update position and check for bouncing
function updateSvgPosition() {
  const fov = camera.fov * (Math.PI / 180);
  const aspect = camera.aspect;
  const nearDist = camera.near + nearPlaneOffset;
  const farDist = nearDist + frustumDepth;

  // Height and width at near and far planes
  const nearHeight = 2 * nearDist * Math.tan(fov / 2);
  const nearWidth = nearHeight * aspect;
  const farHeight = 2 * farDist * Math.tan(fov / 2);
  const farWidth = farHeight * aspect;

  // Calculate the height and width of the SVG bounding box based on its Z position
  const svgZ = svgGroup.position.z;
  const t = (svgZ - nearDist) / (nearDist - farDist); // Normalized distance (0: near, 1: far)

  // Interpolate between the near and far dimensions for the SVG's size
  const boundingBoxHeight = THREE.MathUtils.lerp(nearHeight, farHeight, t);
  const boundingBoxWidth = THREE.MathUtils.lerp(nearWidth, farWidth, t);

  // Adjust the bounding box to keep the SVG within frustum limits
  const bounds = {
    left: -boundingBoxWidth / 2,
    right: boundingBoxWidth / 2,
    bottom: -boundingBoxHeight / 2,
    top: boundingBoxHeight / 2,
    near: -nearDist, // Far plane (further)
    far: -farDist, // Near plane (closer)
  };

  // First, apply the velocity to the position
  svgGroup.position.add(velocity);

  // Check for collision with each boundary and adjust position
  if (svgGroup.position.x - svgSize.x / 2 <= bounds.left) {
    svgGroup.position.x = bounds.left + svgSize.x / 2;
    velocity.x *= -1; // Reverse velocity on X axis
  }
  if (svgGroup.position.x + svgSize.x / 2 >= bounds.right) {
    svgGroup.position.x = bounds.right - svgSize.x / 2;
    velocity.x *= -1; // Reverse velocity on X axis
  }
  if (svgGroup.position.y - svgSize.y / 2 <= bounds.bottom) {
    svgGroup.position.y = bounds.bottom + svgSize.y / 2;
    velocity.y *= -1; // Reverse velocity on Y axis
  }
  if (svgGroup.position.y + svgSize.y / 2 >= bounds.top) {
    svgGroup.position.y = bounds.top - svgSize.y / 2;
    velocity.y *= -1; // Reverse velocity on Y axis
  }
  if (svgGroup.position.z - svgSize.z / 2 <= bounds.far) {
    svgGroup.position.z = bounds.far + svgSize.z / 2;
    velocity.z *= -1; // Reverse velocity on Z axis
  }
  if (svgGroup.position.z + svgSize.z / 2 >= bounds.near) {
    svgGroup.position.z = bounds.near - svgSize.z / 2;
    velocity.z *= -1; // Reverse velocity on Z axis
  }
}

/**
 * Animate
 */

const clock = new THREE.Clock();

// Store rotation speeds for each object
const objectRotationSpeeds = new Map();

objectsGroup.traverse((child) => {
  if (child instanceof THREE.Mesh) {
    objectRotationSpeeds.set(child, {
      x: (Math.random() - 0.5) * 2, // Random speed in range [-1, 1]
      y: (Math.random() - 0.5) * 2,
      z: (Math.random() - 0.5) * 2,
    });
  }
});

const tick = () => {
  controls.update();

  const elapsedTime = clock.getElapsedTime();

  // Change SVG color dynamically
  svgGroup.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      const r = Math.sin(elapsedTime * 0.5) * 0.5 + 0.5;
      const g = Math.sin(elapsedTime * 0.3) * 0.5 + 0.5;
      const b = Math.sin(elapsedTime * 0.7) * 0.5 + 0.5;
      const color = new THREE.Color(r, g, b);
      child.material.color.set(color);
    }
  });

  // Rotate SVG objects
  svgGroup.rotation.x = elapsedTime * 0.5;
  svgGroup.rotation.y = elapsedTime * 0.5;

  // Rotate all objects in objectsGroup with their unique speeds
  objectsGroup.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      const speed = objectRotationSpeeds.get(child);
      if (speed) {
        child.rotation.x += speed.x * 0.005;
        child.rotation.y += speed.y * 0.005;
        child.rotation.z += speed.z * 0.005;
      }
    }
  });

  // Make the frustum box follow the camera
  // moveFrustumBox();

  // Update SVG group movement
  updateSvgPosition();

  composer.render();
  //renderer.render(scene, camera);
  requestAnimationFrame(tick);
};

tick();
