import * as THREE from "three";
import { BasePlayer } from "./BasePlayer";

export class ForeignPlayer extends BasePlayer {
  constructor(serialNumber: number, username: string, initialPosition: THREE.Vector3) {
    super(serialNumber, username, initialPosition);
  }

  // Update position (for remote players)
  private updatePosition(newPosition: THREE.Vector3): void {
    this.object.position.copy(newPosition);
    this.boundingBox.setFromObject(this.object);
    // changes made to the bounding box will also be reflected in the foreign entity map as well because we store the bounding box there as a reference
    
  }

  // Receive position updates from the server
  public updateFromServer(newPosition: {x: number, y: number, z: number}): void {
    const vecPosition = new THREE.Vector3(newPosition.x, newPosition.y, newPosition.z)
    this.updatePosition(vecPosition);
  }
}
