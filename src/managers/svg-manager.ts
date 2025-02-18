import * as THREE from "three";
import { SVGLoader } from "three/addons/loaders/SVGLoader.js";

const randomColor = new THREE.Color(
  Math.random() + 0.2,
  Math.random() + 0.2,
  Math.random() + 0.2
);

const getRandomValue = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};

export class SVGManager {
  private svgPath: string;
  private material: THREE.MeshStandardMaterial;
  private targetSize: number;
  private depth: number = 2; // Keep a fixed depth
  private rotationSpeed = new THREE.Vector3(
    getRandomValue(-0.8, 0.8),
    getRandomValue(-0.8, 0.8),
    getRandomValue(-0.8, 0.8)
  );
  private randomColor = new THREE.Vector3(
    getRandomValue(0.2, 0.8),
    getRandomValue(0.2, 0.8),
    getRandomValue(0.2, 0.8)
  );

  public svgGroup: THREE.Group;
  public size: THREE.Vector3;

  constructor(svgPath: string) {
    this.svgPath = svgPath;
    this.svgGroup = new THREE.Group();
    this.svgGroup.scale.y *= -1;
    this.material = new THREE.MeshStandardMaterial({
      color: randomColor,
    });
    this.size = new THREE.Vector3();
    this.targetSize = 40;
  }

  async initialize(): Promise<void> {
    const loader = new SVGLoader();
    try {
      const data = await loader.loadAsync(this.svgPath);

      if (!data || data.paths.length === 0) {
        throw new Error("Loaded SVG contains no paths.");
      }

      const tempGroup = new THREE.Group(); // Temporary group to calculate bounding box

      // Create meshes from SVG paths
      data.paths.forEach((path) => {
        const shapes = SVGLoader.createShapes(path);
        shapes.forEach((shape) => {
          const geometry = new THREE.ExtrudeGeometry(shape, {
            depth: this.depth,
          }); // Fixed depth
          const mesh = new THREE.Mesh(geometry, this.material);
          tempGroup.add(mesh); // Add to temporary group for size calculation
        });
      });

      // Compute bounding box of the entire SVG before scaling
      const boundingBox = new THREE.Box3().setFromObject(tempGroup);
      const center = new THREE.Vector3();
      boundingBox.getCenter(center);

      // Move everything to the origin
      tempGroup.children.forEach((child) => {
        child.position.sub(center);
      });

      // Determine scaling factor for X and Y separately
      const originalWidth = boundingBox.max.x - boundingBox.min.x;
      const originalHeight = boundingBox.max.y - boundingBox.min.y;
      const scaleFactor =
        this.targetSize / Math.max(originalWidth, originalHeight);

      // Apply scaling to each individual mesh, keeping Z scale at 1
      tempGroup.children.forEach((child) => {
        if (child instanceof THREE.Mesh) {
          child.scale.set(scaleFactor, scaleFactor, 1);
        }
      });

      // Recompute the bounding box after scaling
      const scaledBoundingBox = new THREE.Box3().setFromObject(tempGroup);
      scaledBoundingBox.getSize(this.size);

      // Adjust the position of the entire group after scaling
      const scaledCenter = new THREE.Vector3();
      scaledBoundingBox.getCenter(scaledCenter);

      // Move the whole group to keep the visual center consistent
      tempGroup.position.sub(scaledCenter);
      this.svgGroup.add(tempGroup); // Now add the scaled group to the main svgGroup
    } catch (error) {
      console.error("Error loading SVG:", error);
    }
  }

  render(time: number): void {
    // Change SVG color dynamically
    this.svgGroup.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const r = Math.sin(time * this.randomColor.x) * 0.5 + 0.5;
        const g = Math.sin(time * this.randomColor.y) * 0.5 + 0.5;
        const b = Math.sin(time * this.randomColor.z) * 0.5 + 0.5;
        const color = new THREE.Color(r, g, b);
        child.material.color.set(color);
      }
    });

    // Rotate SVG objects
    this.svgGroup.rotation.x = time * this.rotationSpeed.x;
    this.svgGroup.rotation.y = time * this.rotationSpeed.y;
    this.svgGroup.rotation.z = time * this.rotationSpeed.z;
  }
}
