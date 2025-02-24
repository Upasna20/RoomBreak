import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { createWallWithDoorInRightCorner } from "../../utils";
import { Lobby } from "../Lobby";
import { BaseRoom } from "../BaseRoom";
import { createBoundingBoxes } from "../../core/Collision";


export class PainterRoom extends BaseRoom {
  public painterGroup: THREE.Group;

  constructor(scene: THREE.Scene, renderer: THREE.WebGLRenderer) {
    super(scene, renderer);
    this.painterGroup = this.roomGroup; // Alias for backward compatibility
    this.painterGroup.name = "PainterGroup";
  }

  protected async init() {
    await super.init(); // ✅ Calls parent init
    createBoundingBoxes(this, this.painterGroup); // ✅ Additional logic for PainterRoom
  }

  protected createWalls(roomMaterial: THREE.MeshStandardMaterial): void {
    const wallLength = PainterRoom.wallLength;
    const wallHeight = PainterRoom.wallHeight;

    const wallGeometry = new THREE.BoxGeometry(wallLength, wallHeight, PainterRoom.WallThickness);
    const wallPositions = [
      { x: 0, y: wallHeight / 2, z: -wallLength / 2 },
      { x: 0, y: wallHeight / 2, z: wallLength / 2 },
      { x: wallLength / 2, y: wallHeight / 2, z: 0, rotation: Math.PI / 2 },
      { x: -wallLength / 2, y: 0, z: 0, rotation: Math.PI / 2, scaleZ: 0.5 },
    ];

    wallPositions.forEach((pos) => {
      if (pos.scaleZ) {
        const wallGeometry = createWallWithDoorInRightCorner(wallLength, wallHeight, PainterRoom.DoorWidth, PainterRoom.DoorHeight);
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
      { path: "models/painterRoom/my_desk.glb", scale: [32, 32, 32], position: [86, 30, 10], rotation: [0, 3 * Math.PI / 2, 0], name: "mydesk" },
      { path: "models/painterRoom/paintcan.glb", scale: [4, 4, 4], position: [40, 0, 0], rotation: [0, 0, 0], name: "paintcan" },
      { path: "models/painterRoom/colorspot.glb", scale: [2000, 2000, 2000], position: [40, 0, 0], name: "colorspot" },
      { path: "models/painterRoom/caterpillar.glb", scale: [80, 80, 80], position: [-90, 48, 90], name: "caterpillar" },
      { path: "models/painterRoom/Lantern.glb", scale: [2, 2, 2], position: [-90, 0, 90], name: "lantern" },
      { path: "models/painterRoom/canvas.glb", scale: [20, 20, 20], position: [-90, 40, 60], name: "canvas" },
      { path: "models/painterRoom/collage_wall.glb", scale: [80, 80, 80], position: [0, 50, 94], rotation: [-Math.PI/2, 0, 0], name: "collage_wall" },
      { path: "models/painterRoom/SheenWoodLeatherSofa.glb", scale: [40, 40, 40], position: [-20, 0, -84], name: "sheenwood" },
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