import * as THREE from "three";

// Define a class to manage the physics interactions (e.g., updating positions, collisions)
export class PhysicsManager {
  private velocity: THREE.Vector3;
  private nearPlaneOffset: number;
  private boxDepth: number;

  constructor(
    velocity?: THREE.Vector3,
    nearPlaneOffset?: number,
    boxDepth?: number
  ) {
    this.velocity = velocity || new THREE.Vector3(-0.5, -0.5, -1); // Initial random velocity for the SVG
    this.nearPlaneOffset = nearPlaneOffset || 10; // Offset from the near plane
    this.boxDepth = boxDepth || 200; // Fixed depth for the bounding box
  }

  /**
   * Updates the position of the SVG group based on velocity and handles collisions with frustum boundaries.
   */
  public render(
    camera: THREE.PerspectiveCamera,
    group: THREE.Group,
    size: THREE.Vector3
  ): void {
    // Frustum calculation for bounding box size
    const fov = camera.fov * (Math.PI / 180); // Convert to radians
    const aspect = camera.aspect;
    const nearDist = camera.near + this.nearPlaneOffset;
    const farDist = nearDist + this.boxDepth;

    const nearHeight = 2 * nearDist * Math.tan(fov / 2);
    const nearWidth = nearHeight * aspect;
    const farHeight = 2 * farDist * Math.tan(fov / 2);
    const farWidth = farHeight * aspect;

    const svgZ = group.position.z;
    const t = (svgZ - nearDist) / (nearDist - farDist); // Normalized distance (0: near, 1: far)

    const boundingBoxHeight = THREE.MathUtils.lerp(nearHeight, farHeight, t);
    const boundingBoxWidth = THREE.MathUtils.lerp(nearWidth, farWidth, t);

    const bounds = {
      left: -boundingBoxWidth / 2,
      right: boundingBoxWidth / 2,
      bottom: -boundingBoxHeight / 2,
      top: boundingBoxHeight / 2,
      near: -nearDist, // Far plane (further)
      far: -farDist, // Near plane (closer)
    };

    // First, apply velocity to the position
    group.position.add(this.velocity);

    // Check for collisions with the frustum boundaries and reverse velocity if needed
    if (group.position.x - size.x / 2 <= bounds.left) {
      group.position.x = bounds.left + size.x / 2;
      this.velocity.x *= -1; // Reverse velocity on X axis
    }
    if (group.position.x + size.x / 2 >= bounds.right) {
      group.position.x = bounds.right - size.x / 2;
      this.velocity.x *= -1; // Reverse velocity on X axis
    }
    if (group.position.y - size.y / 2 <= bounds.bottom) {
      group.position.y = bounds.bottom + size.y / 2;
      this.velocity.y *= -1; // Reverse velocity on Y axis
    }
    if (group.position.y + size.y / 2 >= bounds.top) {
      group.position.y = bounds.top - size.y / 2;
      this.velocity.y *= -1; // Reverse velocity on Y axis
    }
    if (group.position.z - size.z / 2 <= bounds.far) {
      group.position.z = bounds.far + size.z / 2;
      this.velocity.z *= -1; // Reverse velocity on Z axis
    }
    if (group.position.z + size.z / 2 >= bounds.near) {
      group.position.z = bounds.near - size.z / 2;
      this.velocity.z *= -1; // Reverse velocity on Z axis
    }
  }
}
