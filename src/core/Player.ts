import * as THREE from "three";
import type {Room} from "../core/Game"
import { MainScene } from "../scenes/mainScene";
export class Player {
  public object: THREE.Mesh; // Player object
  public boundingBox: THREE.Box3; // Bounding box for collision
  private camera: THREE.Camera; // Reference to the camera

  constructor(camera: THREE.Camera) {
    this.camera = camera;

    // Create a simple box to represent the player
    const geometry = new THREE.BoxGeometry(0.2, 0.4, 0.1);
    const material = new THREE.MeshBasicMaterial({ color: 0xDAF7A6 });
    this.object = new THREE.Mesh(geometry, material);

    // Start player at the same position as the camera
    this.object.position.copy(this.camera.position);

    // Create a bounding box
    this.boundingBox = new THREE.Box3().setFromObject(this.object);
  }

  update(mainScene: MainScene): void {
    const prevPlayerPos = this.object.position.clone();
    this.syncPositionWithCamera();
    // checking collision with the wall
    for (const {box} of mainScene.boundingBoxes) {
        if (this.boundingBox.intersectsBox(box)) {
            this.resetPosition(prevPlayerPos);
            return;
        }
    }
}

private syncPositionWithCamera(): void {
    this.object.position.set(
        this.camera.position.x,
        this.camera.position.y, // Adjust Y for player height
        this.camera.position.z
    );
    // this.boundingBox.applyMatrix4(this.object.matrixWorld);
     this.boundingBox.setFromObject(this.object);
}


private resetPosition(prevPlayerPos: THREE.Vector3): void {
    this.object.position.copy(prevPlayerPos);
    this.camera.position.copy(prevPlayerPos);
    this.boundingBox.setFromObject(this.object);
}


}
