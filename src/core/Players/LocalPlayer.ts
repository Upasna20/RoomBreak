import * as THREE from "three";
import { BasePlayer } from "./BasePlayer";
import { gameInstance, type Room } from "../Game";
import { MainScene } from "../../scenes/mainScene";

export class LocalPlayer extends BasePlayer {
  private camera: THREE.Camera; // Local player needs a camera

  constructor(serialNumber: number, username: string, camera: THREE.Camera) {
    super(serialNumber, username, camera.position);
    this.camera = camera;
  }

  // Sync position with the camera
  public syncPositionWithCamera(): void {
    this.object.position.set(
      this.camera.position.x,
      this.camera.position.y,
      this.camera.position.z
    );
    this.boundingBox.setFromObject(this.object);
  }

  // Collision handling
  public update(mainScene: MainScene, currentRoom: Room): void {
    const prevPlayerPos = this.object.position.clone();
    this.syncPositionWithCamera();

    if (!currentRoom || !currentRoom.boundingBoxes) {
      console.error("Error: Invalid room data");
      return;
    }

    // Merge bounding boxes
    const mergedBoundingBoxes: THREE.Box3[] = [
      ...(mainScene?.boundingBoxes || []),
      ...(currentRoom?.boundingBoxes.map(obj => obj.box || [])),
      ...(Array.from(gameInstance.foreignEntities.values()).map(entity => entity.boundingBox))

    ];

    for (const box of mergedBoundingBoxes) {
      if (this.boundingBox.intersectsBox(box)) {
        this.resetPosition(prevPlayerPos);
        return;
      }
    }
  }

  private resetPosition(prevPlayerPos: THREE.Vector3): void {
    this.object.position.copy(prevPlayerPos);
    this.camera.position.copy(prevPlayerPos);
    this.boundingBox.setFromObject(this.object);
  }
}
