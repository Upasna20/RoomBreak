import * as THREE from "three";

export class BasePlayer {
  public object: THREE.Mesh; // Player object
  public boundingBox: THREE.Box3; // Bounding box for collision
  public static playerHeight: number = 0.9;
  public serialNumber: number; // Unique identifier
  public username: string; // Player's name

  constructor(serialNumber: number, username: string, position: THREE.Vector3) {
    this.serialNumber = serialNumber;
    this.username = username;

    // Create a simple box to represent the player
    const geometry = new THREE.BoxGeometry(0.2, 0.4, BasePlayer.playerHeight);
    const material = new THREE.MeshBasicMaterial({ color: 0xDAF7A6 });
    this.object = new THREE.Mesh(geometry, material);

    // Set initial position
    this.object.position.copy(position);

    // Create a bounding box
    this.boundingBox = new THREE.Box3().setFromObject(this.object);
  }
}
