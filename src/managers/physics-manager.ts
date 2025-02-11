import * as THREE from "three";

type Options = {
  velocity?: THREE.Vector3;
  nearPlaneOffset?: number;
  boxDepth?: number;
  renderFrustumBoxHelper?: boolean;
};

export class PhysicsManager {
  private velocity: THREE.Vector3;
  private nearPlaneOffset: number;
  private boxDepth: number;
  private camera: THREE.PerspectiveCamera;

  public frustumBox?: THREE.Mesh;

  constructor(camera: THREE.PerspectiveCamera, options: Options = {}) {
    const { velocity, nearPlaneOffset, boxDepth, renderFrustumBoxHelper } =
      options;

    this.camera = camera;
    this.velocity = velocity || new THREE.Vector3(-0.5, -0.5, -1); // Initial random velocity for the SVG
    this.nearPlaneOffset = nearPlaneOffset || 10; // Offset from the near plane
    this.boxDepth = boxDepth || 200; // Fixed depth for the bounding box

    if (renderFrustumBoxHelper) {
      this.createFrustumBox();
    }
  }

  createFrustumBox() {
    const fov = this.camera.fov * (Math.PI / 180); // Convert to radians
    const aspect = this.camera.aspect;

    const nearDist = this.camera.near + this.nearPlaneOffset;
    const farDist = nearDist + this.boxDepth;

    const nearHeight = 2 * nearDist * Math.tan(fov / 2);
    const nearWidth = nearHeight * aspect;
    const farHeight = 2 * farDist * Math.tan(fov / 2);
    const farWidth = farHeight * aspect;

    const vertices = new Float32Array([
      // Near face (small)
      -nearWidth / 2,
      -nearHeight / 2,
      -nearDist,
      nearWidth / 2,
      -nearHeight / 2,
      -nearDist,
      nearWidth / 2,
      nearHeight / 2,
      -nearDist,
      -nearWidth / 2,
      nearHeight / 2,
      -nearDist,

      // Far face (big)
      -farWidth / 2,
      -farHeight / 2,
      -farDist,
      farWidth / 2,
      -farHeight / 2,
      -farDist,
      farWidth / 2,
      farHeight / 2,
      -farDist,
      -farWidth / 2,
      farHeight / 2,
      -farDist,
    ]);

    const indices = [
      // Near face
      0, 1, 2, 2, 3, 0,

      // Far face
      4, 5, 6, 6, 7, 4,

      // Connecting edges
      0, 1, 5, 5, 4, 0, 1, 2, 6, 6, 5, 1, 2, 3, 7, 7, 6, 2, 3, 0, 4, 4, 7, 3,
    ];

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    const material = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      wireframe: true,
    });
    const mesh = new THREE.Mesh(geometry, material);

    this.frustumBox = mesh;
  }

  renderBouncingGroup(group: THREE.Group, size: THREE.Vector3) {
    // Frustum calculation for bounding box size
    const fov = this.camera.fov * (Math.PI / 180); // Convert to radians
    const aspect = this.camera.aspect;
    const nearDist = this.camera.near + this.nearPlaneOffset;
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

  public render(group: THREE.Group, size: THREE.Vector3): void {
    this.renderBouncingGroup(group, size);
  }
}
