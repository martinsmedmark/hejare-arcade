import * as THREE from "three";

const objectsGroup = new THREE.Group();
const material = new THREE.MeshNormalMaterial();

const randomizeAndAdd = (mesh: THREE.Mesh) => {
  mesh.position.x = (Math.random() - 0.5) * 350;
  mesh.position.y = (Math.random() - 0.5) * 350;
  mesh.position.z = Math.random() * -350 - 100;

  mesh.rotation.x = Math.random() * Math.PI;
  mesh.rotation.y = Math.random() * Math.PI;

  const scale = 0.3 + Math.random();
  mesh.scale.x = scale;
  mesh.scale.y = scale;
  mesh.scale.z = scale;

  objectsGroup.add(mesh);
};

const donutGeometry = new THREE.TorusGeometry(4, 3, 250, 500);
for (let i = 0; i < 30; i++) {
  const donut = new THREE.Mesh(donutGeometry, material);
  randomizeAndAdd(donut);
}

const boxGeometry = new THREE.BoxGeometry(10, 10, 10);
for (let i = 0; i < 30; i++) {
  const box = new THREE.Mesh(boxGeometry, material);
  randomizeAndAdd(box);
}

export { objectsGroup };
