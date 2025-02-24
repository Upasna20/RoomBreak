import * as THREE from "three";
import { createWallWithDoorInRightCorner } from "../../utils";
import { Lobby } from "../Lobby";
import { BaseRoom } from "../BaseRoom";
import { createBoundingBoxes } from "../../core/Collision";

export class MusicRoom extends BaseRoom {
  public musicGroup: THREE.Group;
  
  constructor(scene: THREE.Scene, renderer: THREE.WebGLRenderer) {
    super(scene, renderer);
    this.musicGroup = this.roomGroup; // Alias for backward compatibility
    this.musicGroup.name = "MusicGroup";
  }

    protected async init() {
      await super.init(); // ✅ Calls parent init
      createBoundingBoxes(this, this.musicGroup); // ✅ Additional logic for PainterRoom
    }

  protected createWalls(roomMaterial: THREE.MeshStandardMaterial): void {
    const wallLength = MusicRoom.wallLength;
    const wallHeight = MusicRoom.wallHeight;

    const wallGeometry = new THREE.BoxGeometry(wallLength, wallHeight, MusicRoom.WallThickness);
    const wallPositions = [
      { x: 0, y: wallHeight / 2, z: -wallLength / 2 },
      { x: 0, y: wallHeight / 2, z: wallLength / 2 },
      { x: -wallLength / 2, y: wallHeight / 2, z: 0, rotation: Math.PI / 2 },
      { x: wallLength / 2, y: 0, z: 0, rotation: Math.PI / 2, scaleZ: 0.5 },
    ];

    wallPositions.forEach((pos) => {
      if (pos.scaleZ) {
        const wallGeometry = createWallWithDoorInRightCorner(wallLength, wallHeight, MusicRoom.DoorWidth, MusicRoom.DoorHeight);
        const wall = new THREE.Mesh(wallGeometry, roomMaterial);
        wall.name = "doorWall";
        wall.position.set(pos.x, pos.y, pos.z);
        if (pos.rotation) wall.rotateY(pos.rotation);
        wall.castShadow = true;
        this.roomGroup.add(wall);
      }
      else {
        const wall = new THREE.Mesh(wallGeometry, roomMaterial);
        wall.position.set(pos.x, pos.y, pos.z);
        if (pos.rotation) wall.rotateY(pos.rotation);
        wall.castShadow = true;
        this.roomGroup.add(wall);
      }
    });
  }

  protected async loadModels(): Promise<void> {
    const modelData = [
      { path: "models/musicRoom/electric_guitar_lowpoly_model.glb", scale: [6, 6, 6], position: [-20, 30, 100], rotation: [0, Math.PI, 3 * Math.PI / 8], name: "red_guitar" },
      { path: "models/musicRoom/piano_ukraine.glb", scale: [20, 20, 20], position: [86, 0, 10], rotation: [0, 3 * Math.PI / 2, 0], name: "piano" },
      { path: "models/musicRoom/harmonium.glb", scale: [1.8, 1.8, 1.8], position: [-80, 0, 50], rotation: [0, Math.PI / 2, 0], name: "harmonium" },
      { path: "models/musicRoom/guitar.glb", scale: [6, 6, 6], position: [-50, 40, 96], rotation: [-Math.PI / 2, Math.PI, Math.PI / 2], name: "guitar2" },
      { path: "models/musicRoom/guitar_hero_guitar.glb", scale: [6, 6, 6], position: [-20, 40, 90], rotation: [0, Math.PI, 0], name: "guitar_hero" },
      { path: "models/musicRoom/drum.glb", scale: [30, 30, 30], position: [-70, 0, -20], rotation: [0, 3 * Math.PI / 2, 0], name: "drum" },
      { path: "models/musicRoom/krishna.glb", scale: [20, 20, 20], position: [-66, -10, -66], rotation: [0, Math.PI / 2, 0], name: "krishna" },
      { path: "models/musicRoom/speaker.glb", scale: [0.12, 0.12, 0.12], position: [-70, 0, 80], rotation: [0, Math.PI, 0], name: "speaker" },
    ];

    await Promise.all(
      modelData.map(async (data) => {
        try {
          const gltf = await this.loader.loadAsync(data.path);
          const model = gltf.scene;
          model.scale.set(data.scale[0], data.scale[1], data.scale[2]);
          model.position.set(data.position[0],
            data.position[1],
            data.position[2]);
          if (data.rotation) model.rotation.set(data.rotation[0],
            data.rotation[1],
            data.rotation[2]);
          model.name = data.name;
          this.clickableModels.push(model);
          this.roomGroup.add(model);
        } catch (error) {
          console.error(`Error loading ${data.name}:`, error);
        }
      })
    );
  }
}