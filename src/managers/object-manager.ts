import * as THREE from "three";

export class ObjectManager {
  private objectRotationSpeeds: Map<
    THREE.Mesh,
    { x: number; y: number; z: number }
  >;
  private donutGeometry = new THREE.TorusGeometry(4, 3, 250, 500);
  private boxGeometry = new THREE.BoxGeometry(10, 10, 10);
  private material = new THREE.MeshNormalMaterial();

  public objectsGroup: THREE.Group = new THREE.Group();

  constructor() {
    this.objectRotationSpeeds = new Map();
  }

  initialize() {
    this.initializeObjects();
    this.setupObjectRotation();
  }

  private initializeObjects() {
    for (let i = 0; i < 30; i++) {
      const donut = new THREE.Mesh(this.donutGeometry, this.material);
      this.randomizeAndAdd(donut);
    }

    for (let i = 0; i < 30; i++) {
      const box = new THREE.Mesh(this.boxGeometry, this.material);
      this.randomizeAndAdd(box);
    }
  }

  private randomizeAndAdd(mesh: THREE.Mesh) {
    mesh.position.x = (Math.random() - 0.5) * 350;
    mesh.position.y = (Math.random() - 0.5) * 350;
    mesh.position.z = Math.random() * -350 - 100;

    mesh.rotation.x = Math.random() * Math.PI;
    mesh.rotation.y = Math.random() * Math.PI;

    const scale = 0.3 + Math.random();
    mesh.scale.x = scale;
    mesh.scale.y = scale;
    mesh.scale.z = scale;

    this.objectsGroup.add(mesh);
  }

  private setupObjectRotation() {
    this.objectsGroup.traverse((child) => {
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
    this.objectsGroup.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;

      const speed = this.objectRotationSpeeds.get(child);

      if (!speed) return;

      child.rotation.x += speed.x * 0.005;
      child.rotation.y += speed.y * 0.005;
      child.rotation.z += speed.z * 0.005;
    });
  }
}
