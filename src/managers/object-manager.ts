import { objectsGroup } from "../old/objects";
import * as THREE from "three";

export class ObjectManager {
  private objectRotationSpeeds: Map<
    THREE.Mesh,
    { x: number; y: number; z: number }
  >;

  constructor() {
    this.objectRotationSpeeds = new Map();
  }

  initialize(scene: THREE.Scene) {
    this.setupObjectRotation();
    scene.add(objectsGroup);
  }

  private setupObjectRotation() {
    objectsGroup.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        this.objectRotationSpeeds.set(child, {
          x: (Math.random() - 0.5) * 2,
          y: (Math.random() - 0.5) * 2,
          z: (Math.random() - 0.5) * 2,
        });
      }
    });
  }

  render() {
    // Rotate all objects
    objectsGroup.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;

      const speed = this.objectRotationSpeeds.get(child);

      if (!speed) return;

      child.rotation.x += speed.x * 0.005;
      child.rotation.y += speed.y * 0.005;
      child.rotation.z += speed.z * 0.005;
    });
  }
}
