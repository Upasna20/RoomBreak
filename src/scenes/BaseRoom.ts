import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { Lobby } from "./Lobby";
import { createBoundingBoxes } from "../core/Collision";

export abstract class BaseRoom {
  protected renderer: THREE.WebGLRenderer;
  protected scene: THREE.Scene;
  protected clickableModels: THREE.Object3D[] = [];
  protected loader = new GLTFLoader();
  public roomGroup: THREE.Group;
  public boundingBoxes: { box: THREE.Box3, object: THREE.Object3D }[] = [];

  static DoorWidth: number = 19;
  static DoorHeight: number = 45;
  static wallHeight: number = 100;
  static wallLength: number = 200;
  static ceilingHeight: number = 100;
  static WallThickness: number = Lobby.WallThickness;

  constructor(scene: THREE.Scene, renderer: THREE.WebGLRenderer) {
    this.renderer = renderer;
    this.scene = scene;
    this.roomGroup = new THREE.Group();
    this.init();
  }

  protected loadTexture(path: string): Promise<THREE.Texture> {
    return new Promise((resolve, reject) => {
      const textureLoader = new THREE.TextureLoader();
      textureLoader.load(
        path,
        (texture) => resolve(texture),
        undefined,
        (error) => reject(error)
      );
    });
  }

  protected async init() {
    await this.loadEnvironment();
    this.initCeiling();
    this.initLighting();
    await this.loadModels();
    this.onAssetsLoaded();
  }

  protected async loadEnvironment() {
    this.initRoom();
  }

  protected initRoom() {
    Promise.all([
      this.loadTexture("/textures/musicRoom/PaintedPlaster013_1K-JPG_Color.jpg"),
      this.loadTexture("/textures/musicRoom/PaintedPlaster013_1K-JPG_NormalGL.jpg"),
      this.loadTexture("/textures/musicRoom/PaintedPlaster013_1K-JPG_Roughness.jpg"),
    ]).then(([brickColor, brickNormal, brickRoughness]) => {
      [brickColor, brickNormal, brickRoughness].forEach((map) => {
        map.wrapS = map.wrapT = THREE.RepeatWrapping;
        map.repeat.set(8, 4);
      });
      const roomMaterial = new THREE.MeshStandardMaterial({
        map: brickColor,
        normalMap: brickNormal,
        roughnessMap: brickRoughness,
        side: THREE.DoubleSide,
      });

      const floor = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), roomMaterial);
      floor.rotateX(-Math.PI / 2);
      floor.receiveShadow = true;
      this.roomGroup.add(floor);
      
      this.createWalls(roomMaterial);
    });
  }

  protected abstract createWalls(roomMaterial: THREE.MeshStandardMaterial): void;

  protected initCeiling(): void {
    const roomClass = this.constructor as typeof BaseRoom;
    const ceilingGeometry = new THREE.PlaneGeometry(
      roomClass.wallLength,
      roomClass.wallLength
    );
    const ceilingMaterial = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });

    const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
    ceiling.position.set(0, roomClass.ceilingHeight, 0);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.receiveShadow = false;
    this.roomGroup.add(ceiling);
  }

  protected abstract loadModels(): Promise<void>;

  protected initLighting() {
    this.loader.load("/models/lobby/low_poly_psx_wall_lamp.glb", (gltf) => {
      const model = gltf.scene;
      model.scale.set(30, 30, 30);
      
      const roomClass = this.constructor as typeof BaseRoom;
      
      const lampPositions = [
        {
          x: 0,
          y: (2 * roomClass.ceilingHeight) / 3,
          z: -roomClass.wallLength / 2,
          rotation: 0,
        }, // Back Wall
        {
          x: 0,
          y: (2 * roomClass.ceilingHeight) / 3,
          z: -roomClass.wallLength / 2,
          rotation: Math.PI,
        }, // Front Wall
        {
          x: -roomClass.wallLength / 2,
          y: (2 * roomClass.ceilingHeight) / 3,
          z: 0,
          rotation: Math.PI / 2,
        }, // Left Wall
        {
          x: roomClass.wallLength / 2,
          y: (2 * roomClass.ceilingHeight) / 3,
          z: 0,
          rotation: -Math.PI / 2,
        }, // Right Wall
      ];

      lampPositions.forEach((pos) => {
        const lamp = model.clone();
        lamp.position.set(pos.x, pos.y, pos.z);
        lamp.rotation.y = pos.rotation;

        const light = new THREE.PointLight(0xffa500, 500, 80);
        light.position.set(pos.x, pos.y, pos.z);
        light.castShadow = false;
        light.shadow.mapSize.set(1024, 1024);
        light.shadow.bias = -0.005;

        this.roomGroup.add(light);
        this.roomGroup.add(lamp);
      });
    });
  }

  protected onAssetsLoaded() {
    console.log(`${this.constructor.name} Loaded!`);
  }
}